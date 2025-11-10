"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";

import { TrustScoreTrackerAddresses } from "@/abi/TrustScoreTrackerAddresses";
import { TrustScoreTrackerABI } from "@/abi/TrustScoreTrackerABI";

export type ClearValueType = {
  handle: string;
  clear: string | bigint | boolean;
};

type TrustScoreTrackerInfoType = {
  abi: typeof TrustScoreTrackerABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

function getTrustScoreTrackerByChainId(
  chainId: number | undefined
): TrustScoreTrackerInfoType {
  if (!chainId) {
    return { abi: TrustScoreTrackerABI.abi };
  }

  const entry =
    TrustScoreTrackerAddresses[chainId.toString() as keyof typeof TrustScoreTrackerAddresses];

  if (!("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: TrustScoreTrackerABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: TrustScoreTrackerABI.abi,
  };
}

export const useTrustScoreTracker = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  eip1193Provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  const [totalScoreHandle, setTotalScoreHandle] = useState<string | undefined>(undefined);
  const [eventCount, setEventCount] = useState<number>(0);
  const [averageScoreHandle, setAverageScoreHandle] = useState<string | undefined>(undefined);
  const [clearTotal, setClearTotal] = useState<ClearValueType | undefined>(undefined);
  const [clearAverage, setClearAverage] = useState<ClearValueType | undefined>(undefined);
  const [trustScores, setTrustScores] = useState<Array<{ index: number; handle: string; clear?: bigint }>>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const trustScoreTrackerRef = useRef<TrustScoreTrackerInfoType | undefined>(undefined);
  const isRefreshingRef = useRef<boolean>(isRefreshing);
  const isDecryptingRef = useRef<boolean>(isDecrypting);
  const isRecordingRef = useRef<boolean>(isRecording);
  const clearTotalRef = useRef<ClearValueType | undefined>(undefined);
  const clearAverageRef = useRef<ClearValueType | undefined>(undefined);

  const trustScoreTracker = useMemo(() => {
    const c = getTrustScoreTrackerByChainId(chainId);
    trustScoreTrackerRef.current = c;

    if (!c.address) {
      if (typeof chainId === "number") {
        setMessage(`TrustScoreTracker deployment not found for chainId=${chainId}.`);
      } else {
        setMessage("");
      }
    } else {
      setMessage("");
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!trustScoreTracker) {
      return undefined;
    }
    return (Boolean(trustScoreTracker.address) && trustScoreTracker.address !== ethers.ZeroAddress);
  }, [trustScoreTracker]);

  const canGetScores = useMemo(() => {
    return trustScoreTracker.address && ethersReadonlyProvider && !isRefreshing;
  }, [trustScoreTracker.address, ethersReadonlyProvider, isRefreshing]);

  const refreshScores = useCallback(() => {
    console.log("[useTrustScoreTracker] call refreshScores()");
    if (isRefreshingRef.current) {
      return Promise.resolve();
    }

    if (
      !trustScoreTrackerRef.current ||
      !trustScoreTrackerRef.current?.chainId ||
      !trustScoreTrackerRef.current?.address ||
      !ethersReadonlyProvider ||
      !ethersSigner
    ) {
      setTotalScoreHandle(undefined);
      setAverageScoreHandle(undefined);
      return Promise.resolve();
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = trustScoreTrackerRef.current.chainId;
    const thisContractAddress = trustScoreTrackerRef.current.address;
    const userAddress = ethersSigner.address;

    const contract = new ethers.Contract(
      thisContractAddress,
      trustScoreTrackerRef.current.abi,
      ethersReadonlyProvider
    );

    return Promise.all([
      contract.getTotalTrustScore(userAddress),
      contract.getTrustEventCount(userAddress),
      contract.getAverageTrustScore(userAddress),
      contract.getTrustEventArrayLength(userAddress),
    ])
      .then(([total, count, average, arrayLength]) => {
        console.log("[useTrustScoreTracker] getTotalTrustScore()=" + total);
        console.log("[useTrustScoreTracker] getTrustEventCount()=" + count);
        console.log("[useTrustScoreTracker] getAverageTrustScore()=" + average);
        console.log("[useTrustScoreTracker] getTrustEventArrayLength()=" + arrayLength);

        if (
          sameChain.current(thisChainId) &&
          thisContractAddress === trustScoreTrackerRef.current?.address
        ) {
          setTotalScoreHandle(total);
          setEventCount(Number(count)); // count is now plaintext
          setAverageScoreHandle(average);

          // Fetch all individual trust scores
          const scorePromises = [];
          for (let i = 0; i < Number(arrayLength); i++) {
            scorePromises.push(contract.getTrustScoreByIndex(userAddress, i));
          }
          return Promise.all(scorePromises).then((scores) => {
            if (
              sameChain.current(thisChainId) &&
              thisContractAddress === trustScoreTrackerRef.current?.address
            ) {
              setTrustScores(
                scores.map((score, index) => ({
                  index,
                  handle: score,
                }))
              );
            }
          });
        }
      })
      .catch((e) => {
        setMessage("TrustScoreTracker calls failed! error=" + e);
      })
      .finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [ethersReadonlyProvider, ethersSigner, sameChain]);

  useEffect(() => {
    refreshScores();
  }, [refreshScores]);

  const canDecrypt = useMemo(() => {
    return (
      trustScoreTracker.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      (totalScoreHandle || averageScoreHandle) &&
      totalScoreHandle !== ethers.ZeroHash
    );
  }, [
    trustScoreTracker.address,
    instance,
    ethersSigner,
    isRefreshing,
    isDecrypting,
    totalScoreHandle,
    averageScoreHandle,
  ]);

  const decryptScores = useCallback(() => {
    if (isRefreshingRef.current || isDecryptingRef.current) {
      return;
    }

    if (!trustScoreTracker.address || !instance || !ethersSigner) {
      return;
    }

    if (!totalScoreHandle || totalScoreHandle === ethers.ZeroHash) {
      return;
    }

    const thisChainId = chainId;
    const thisContractAddress = trustScoreTracker.address;
    const thisTotalHandle = totalScoreHandle;
    const thisAverageHandle = averageScoreHandle;
    const thisEthersSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Start decrypting trust scores...");

    const run = async () => {
      const isStale = () =>
        thisContractAddress !== trustScoreTrackerRef.current?.address ||
        !sameChain.current(thisChainId) ||
        !sameSigner.current(thisEthersSigner);

      try {
        setMessage("Loading decryption signature...");

        const sig: FhevmDecryptionSignature | null =
          await FhevmDecryptionSignature.loadOrSign(
            instance,
            [trustScoreTracker.address as `0x${string}`],
            ethersSigner,
            fhevmDecryptionSignatureStorage
          );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        setMessage("Calling FHEVM userDecrypt... This may take a moment...");

        const handlesToDecrypt: Array<{ handle: string; contractAddress: string }> = [];
        if (thisTotalHandle && thisTotalHandle !== ethers.ZeroHash) {
          handlesToDecrypt.push({ handle: thisTotalHandle, contractAddress: thisContractAddress });
        }
        if (thisAverageHandle && thisAverageHandle !== ethers.ZeroHash) {
          handlesToDecrypt.push({ handle: thisAverageHandle, contractAddress: thisContractAddress });
        }

        // Decrypt individual trust scores
        for (const score of trustScores) {
          if (score.handle && score.handle !== ethers.ZeroHash) {
            handlesToDecrypt.push({ handle: score.handle, contractAddress: thisContractAddress });
          }
        }

        // Add timeout for decryption operations (60 seconds for local development)
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Decryption timeout: The operation took too long. Please try again or check your network connection.')), 60000)
        );

        const decryptPromise = instance.userDecrypt(
          handlesToDecrypt,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const res = await Promise.race([decryptPromise, timeoutPromise]);

        setMessage("FHEVM userDecrypt completed!");

        if (isStale()) {
          setMessage("Ignore FHEVM decryption");
          return;
        }

        if (thisTotalHandle && res[thisTotalHandle] !== undefined) {
          setClearTotal({ handle: thisTotalHandle, clear: res[thisTotalHandle] });
          clearTotalRef.current = { handle: thisTotalHandle, clear: res[thisTotalHandle] };
        }
        if (thisAverageHandle && res[thisAverageHandle] !== undefined) {
          setClearAverage({ handle: thisAverageHandle, clear: res[thisAverageHandle] });
          clearAverageRef.current = { handle: thisAverageHandle, clear: res[thisAverageHandle] };
        }

        // Update individual scores
        const updatedScores = trustScores.map((score) => {
          const decryptedValue = res[score.handle];
          return {
            ...score,
            clear: decryptedValue !== undefined && typeof decryptedValue === 'bigint' 
              ? decryptedValue 
              : score.clear,
          };
        });
        setTrustScores(updatedScores);

        setMessage("Trust scores decrypted successfully!");
      } catch (error: any) {
        console.error("Decryption error:", error);
        if (error?.message?.includes("timeout")) {
          setMessage("Decryption timeout: The operation took too long. This may happen if the relayer service is slow. Please try again.");
        } else if (error?.message) {
          setMessage(`Decryption failed: ${error.message}`);
        } else {
          setMessage("Decryption failed: An unknown error occurred. Please try again.");
        }
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };

    run();
  }, [
    fhevmDecryptionSignatureStorage,
    ethersSigner,
    trustScoreTracker.address,
    instance,
    totalScoreHandle,
    averageScoreHandle,
    trustScores,
    chainId,
    sameChain,
    sameSigner,
  ]);

  const canRecord = useMemo(() => {
    return (
      trustScoreTracker.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isRecording
    );
  }, [trustScoreTracker.address, instance, ethersSigner, isRefreshing, isRecording]);

  const recordTrustEvent = useCallback(
    (score: number) => {
      if (isRefreshingRef.current || isRecordingRef.current) {
        return;
      }

      if (!trustScoreTracker.address || !instance || !ethersSigner || score < 1 || score > 10) {
        setMessage("Invalid score. Please enter a value between 1 and 10.");
        return;
      }

      const thisChainId = chainId;
      const thisContractAddress = trustScoreTracker.address;
      const thisEthersSigner = ethersSigner;
      const contract = new ethers.Contract(
        thisContractAddress,
        trustScoreTracker.abi,
        thisEthersSigner
      );

      isRecordingRef.current = true;
      setIsRecording(true);
      setMessage(`Recording trust event with score ${score}...`);

      const run = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisContractAddress !== trustScoreTrackerRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        try {
          const input = instance.createEncryptedInput(
            thisContractAddress,
            thisEthersSigner.address
          );
          input.add32(score);

          const enc = await input.encrypt();

          if (isStale()) {
            setMessage("Ignore recordTrustEvent");
            return;
          }

          setMessage(`Calling recordTrustEvent(${score})...`);

          const tx: ethers.TransactionResponse = await contract.recordTrustEvent(
            enc.handles[0],
            enc.inputProof
          );

          setMessage(`Waiting for tx:${tx.hash}...`);

          const receipt = await tx.wait();

          setMessage(`Trust event recorded! Status=${receipt?.status}`);

          if (isStale()) {
            setMessage("Ignore recordTrustEvent");
            return;
          }

          refreshScores();
        } catch (e: any) {
          console.error("Record trust event error:", e);
          let errorMessage = "Record trust event failed!";
          if (e.message?.includes("user rejected")) {
            errorMessage = "Transaction was cancelled by user.";
          } else if (e.message?.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for transaction.";
          } else if (e.message?.includes("network")) {
            errorMessage = "Network error. Please check your connection.";
          } else if (e.message) {
            errorMessage += ` ${e.message}`;
          }
          setMessage(errorMessage);
        } finally {
          isRecordingRef.current = false;
          setIsRecording(false);
        }
      };

      run();
    },
    [
      ethersSigner,
      trustScoreTracker.address,
      trustScoreTracker.abi,
      instance,
      chainId,
      refreshScores,
      sameChain,
      sameSigner,
    ]
  );

  return {
    contractAddress: trustScoreTracker.address,
    canDecrypt,
    canGetScores,
    canRecord,
    recordTrustEvent,
    decryptScores,
    refreshScores,
    message,
    clearTotal: clearTotal?.clear,
    clearAverage: clearAverage?.clear,
    totalScoreHandle,
    averageScoreHandle,
    trustScores,
    eventCount,
    isDecrypting,
    isRefreshing,
    isRecording,
    isDeployed,
  };
};

