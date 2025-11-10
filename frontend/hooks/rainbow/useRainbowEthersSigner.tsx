import { ethers } from "ethers";
import { useRainbow } from "./useRainbowProvider";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseRainbowEthersSignerState {
  provider: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  accounts: string[] | undefined;
  isConnected: boolean;
  error: Error | undefined;
  connect: () => void;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
  ethersBrowserProvider: ethers.BrowserProvider | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  initialMockChains: Readonly<Record<number, string>> | undefined;
}

function useRainbowEthersSignerInternal(parameters: { initialMockChains?: Readonly<Record<number, string>> }): UseRainbowEthersSignerState {
  const { initialMockChains } = parameters;
  const { provider, chainId, accounts, isConnected, connect, error } = useRainbow();
  const [ethersSigner, setEthersSigner] = useState<
    ethers.JsonRpcSigner | undefined
  >(undefined);
  const [ethersBrowserProvider, setEthersBrowserProvider] = useState<
    ethers.BrowserProvider | undefined
  >(undefined);
  const [ethersReadonlyProvider, setEthersReadonlyProvider] = useState<
    ethers.ContractRunner | undefined
  >(undefined);

  const chainIdRef = useRef<number | undefined>(chainId);
  const ethersSignerRef = useRef<ethers.JsonRpcSigner | undefined>(undefined);

  const sameChain = useRef((chainId: number | undefined) => {
    return chainId === chainIdRef.current;
  });

  const sameSigner = useRef(
    (ethersSigner: ethers.JsonRpcSigner | undefined) => {
      return ethersSigner === ethersSignerRef.current;
    }
  );

  useEffect(() => {
    chainIdRef.current = chainId;
  }, [chainId]);

  useEffect(() => {
    if (
      !provider ||
      !chainId ||
      !isConnected ||
      !accounts ||
      accounts.length === 0
    ) {
      ethersSignerRef.current = undefined;
      setEthersSigner(undefined);
      setEthersBrowserProvider(undefined);
      setEthersReadonlyProvider(undefined);
      return;
    }

    console.warn(`[useRainbowEthersSignerInternal] create new ethers.BrowserProvider(), chainId=${chainId}`);

    const bp: ethers.BrowserProvider = new ethers.BrowserProvider(provider);
    let rop: ethers.ContractRunner = bp;
    const rpcUrl: string | undefined = initialMockChains?.[chainId];
    if (rpcUrl) {
      rop = new ethers.JsonRpcProvider(rpcUrl);
      console.warn(`[useRainbowEthersSignerInternal] create new readonly provider ethers.JsonRpcProvider(${rpcUrl}), chainId=${chainId}`);
    } else {
      console.warn(`[useRainbowEthersSignerInternal] use ethers.BrowserProvider() as readonly provider, chainId=${chainId}`);
    }

    const s = new ethers.JsonRpcSigner(bp, accounts[0]);
    ethersSignerRef.current = s;
    setEthersSigner(s);
    setEthersBrowserProvider(bp);
    setEthersReadonlyProvider(rop);
  }, [provider, chainId, isConnected, accounts, initialMockChains]);

  return {
    sameChain,
    sameSigner,
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersBrowserProvider,
    ethersReadonlyProvider,
    ethersSigner,
    error,
    initialMockChains
  };
}

const RainbowEthersSignerContext = createContext<UseRainbowEthersSignerState | undefined>(
  undefined
);

interface RainbowEthersSignerProviderProps {
  children: ReactNode;
  initialMockChains: Readonly<Record<number, string>>;
}

export const RainbowEthersSignerProvider: React.FC<RainbowEthersSignerProviderProps> = ({
  children, initialMockChains
}) => {
  const props = useRainbowEthersSignerInternal({ initialMockChains });
  return (
    <RainbowEthersSignerContext.Provider value={props}>
      {children}
    </RainbowEthersSignerContext.Provider>
  );
};

export function useRainbowEthersSigner() {
  const context = useContext(RainbowEthersSignerContext);
  if (context === undefined) {
    throw new Error("useRainbowEthersSigner must be used within a RainbowEthersSignerProvider");
  }
  return context;
}

