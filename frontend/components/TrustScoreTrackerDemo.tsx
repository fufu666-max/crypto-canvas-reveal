"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useRainbowEthersSigner } from "../hooks/rainbow/useRainbowEthersSigner";
import { useTrustScoreTracker } from "@/hooks/useTrustScoreTracker";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState, useCallback, useMemo } from "react";

export const TrustScoreTrackerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useRainbowEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const trustScoreTracker = useTrustScoreTracker({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [scoreInput, setScoreInput] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [realTimeValidation, setRealTimeValidation] = useState<string>("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !trustScoreTracker.isRecording) {
      handleRecordScore();
    } else if (e.key === 'Escape') {
      setScoreInput("");
      setValidationError("");
      setRealTimeValidation("");
      setValidationResult(null);
    }
  };

  const buttonClass = "fhe-button";

  const inputClass = "fhe-input";

  const cardClass = "fhe-card p-6";

  if (!isConnected) {
    return (
      <div className="mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            Encrypted Trust Score Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Record and track trust events privately with fully homomorphic encryption
          </p>
        </div>
        <button
          className={buttonClass + " text-xl px-8 py-4"}
          onClick={connect}
        >
          Connect Rainbow Wallet
        </button>
      </div>
    );
  }

  if (trustScoreTracker.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  if (fhevmStatus === "loading") {
    return (
      <div className={cardClass}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Initializing FHEVM...</span>
        </div>
      </div>
    );
  }

  const handleRecordScore = useCallback(() => {
    setValidationError("");

    if (!scoreInput.trim()) {
      setValidationError("Please enter a trust score");
      return;
    }

    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 1 || score > 10) {
      setValidationError("Trust score must be a number between 1 and 10");
      return;
    }

    // Check if wallet is connected and ready
    if (!trustScoreTracker.canRecord) {
      if (!isConnected) {
        setValidationError("Please connect your wallet first");
      } else if (fhevmStatus === "error") {
        setValidationError("FHEVM initialization failed. Please check the error message above and try again.");
      } else if (fhevmStatus !== "ready") {
        setValidationError("FHEVM is still initializing. Please wait...");
      } else if (!trustScoreTracker.contractAddress) {
        setValidationError("Contract not deployed on this network");
      } else {
        setValidationError("Please wait for the system to be ready");
      }
      return;
    }

    try {
      trustScoreTracker.recordTrustEvent(score);
      setScoreInput("");
    } catch (error) {
      console.error("Error recording trust event:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      if (errorMessage.includes("insufficient funds")) {
        setValidationError("Insufficient funds to pay for transaction. Please check your wallet balance.");
      } else if (errorMessage.includes("user rejected")) {
        setValidationError("Transaction was cancelled. Please try again if you want to proceed.");
      } else if (errorMessage.includes("network")) {
        setValidationError("Network error. Please check your connection and try again.");
      } else {
        setValidationError("Failed to record trust event. Please try again.");
      }
    }
  }, [trustScoreTracker.canRecord, trustScoreTracker.isRecording, scoreInput, fhevmStatus, isConnected, trustScoreTracker.contractAddress]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
          Encrypted Trust Score Tracker
        </h1>
        <p className="text-gray-600 text-lg">
          Build your private trust curve with encrypted scores
        </p>
      </div>

      {/* FHEVM Error Display */}
      {fhevmStatus === "error" && fhevmError && (
        <div className={`${cardClass} border-2 border-red-300 bg-red-50`}>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">FHEVM Initialization Error</h3>
              <p className="text-red-700 mb-2">
                {(fhevmError.message?.includes("relayer") || fhevmError.message?.includes("keyurl") || fhevmError.message?.includes("CONNECTION_CLOSED"))
                  ? "Unable to connect to FHEVM Relayer service. The relayer service may be temporarily unavailable. Please try again later."
                  : fhevmError.message || "Failed to initialize FHEVM. Please refresh the page and try again."}
              </p>
              {(fhevmError.message?.includes("relayer") || fhevmError.message?.includes("keyurl") || fhevmError.message?.includes("CONNECTION_CLOSED")) && (
                <p className="text-sm text-red-600 mt-2">
                  <strong>Note:</strong> This is usually a temporary issue with the Zama relayer service. The application will automatically retry when you refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Trust Event */}
      <div className={cardClass}>
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Record Trust Event</h2>
        <p className="text-gray-600 mb-4">
          Record a trust event with a score from 1-10. Your score will be encrypted before storage.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Trust Score Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>1-3:</strong> Significant trust issues or concerns</li>
                <li>• <strong>4-6:</strong> Moderate trust with some reservations</li>
                <li>• <strong>7-8:</strong> Good trust with minor concerns</li>
                <li>• <strong>9-10:</strong> Excellent trust and confidence</li>
              </ul>
              <p className="mt-2 text-xs text-blue-700">
                Use Enter to submit, ESC to clear input. All scores are encrypted and private.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex gap-4">
              <input
              type="number"
              min="1"
              max="10"
              value={scoreInput}
              onChange={(e) => {
                setScoreInput(e.target.value);
                setValidationError(""); // Clear error on input change

                // Real-time validation
                const value = e.target.value.trim();
                if (value === "") {
                  setRealTimeValidation("");
                } else {
                  const num = parseInt(value);
                  if (isNaN(num)) {
                    setRealTimeValidation("Must be a number");
                  } else if (num < 1) {
                    setRealTimeValidation("Minimum score is 1");
                  } else if (num > 10) {
                    setRealTimeValidation("Maximum score is 10");
                  } else {
                    setRealTimeValidation("✅ Valid score");
                  }
                }
              }}
              placeholder="Enter score (1-10)"
              className={`${inputClass} ${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${!trustScoreTracker.canRecord ? 'opacity-60' : ''}`}
              onKeyPress={handleKeyPress}
            />
        <button
          className={`${buttonClass} ${
            trustScoreTracker.isRecording
              ? "opacity-75 cursor-not-allowed"
              : ""
          } transition-opacity duration-200`}
          disabled={!scoreInput.trim() || trustScoreTracker.isRecording}
          onClick={handleRecordScore}
        >
          {trustScoreTracker.isRecording ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Recording...
            </div>
          ) : (
            "Record Trust Event"
          )}
        </button>
            </div>
            {realTimeValidation && (
              <p className={`text-sm ${
                realTimeValidation.includes("✅")
                  ? "text-green-600"
                  : "text-orange-600"
              }`}>
                {realTimeValidation}
              </p>
            )}
          </div>
          {validationError && (
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationError}
            </p>
          )}
        </div>
      </div>

      {/* Trust Score Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-purple-700 mb-2">Total Score</h3>
          <p className="text-3xl font-bold text-purple-600">
            {trustScoreTracker.clearTotal !== undefined
              ? String(trustScoreTracker.clearTotal)
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Encrypted total</p>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-purple-700 mb-2">Event Count</h3>
          <p className="text-3xl font-bold text-purple-600">
            {trustScoreTracker.eventCount > 0
              ? trustScoreTracker.eventCount
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total events</p>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-semibold text-purple-700 mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-purple-600">
            {trustScoreTracker.clearAverage !== undefined
              ? Number(trustScoreTracker.clearAverage).toFixed(1)
              : trustScoreTracker.eventCount > 0
              ? "Calculating..."
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {trustScoreTracker.eventCount > 0
              ? "Encrypted average"
              : "No trust events yet"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className={buttonClass}
          disabled={!trustScoreTracker.canGetScores}
          onClick={trustScoreTracker.refreshScores}
        >
          {trustScoreTracker.isRefreshing
            ? "Refreshing..."
            : "Refresh Scores"}
        </button>
        <button
          className={buttonClass}
          disabled={!trustScoreTracker.canDecrypt}
          onClick={trustScoreTracker.decryptScores}
        >
          {trustScoreTracker.isDecrypting
            ? "Decrypting..."
            : "Decrypt Scores"}
        </button>
        <button
          className={`${buttonClass} ${isValidating ? 'opacity-50' : ''}`}
          disabled={isValidating || !fhevmInstance || !scoreInput}
          onClick={async () => {
            if (!fhevmInstance || !scoreInput) return;
            setIsValidating(true);
            try {
              const scoreNum = parseInt(scoreInput);
              if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
                setValidationError("Score must be between 1 and 10");
                setValidationResult(null);
                return;
              }
              // In a real implementation, this would validate using FHE
              setValidationResult(true);
              setValidationError("");
            } catch {
              setValidationError("Validation failed");
              setValidationResult(false);
            } finally {
              setIsValidating(false);
            }
          }}
        >
          {isValidating ? "Validating..." : "Validate Score"}
        </button>
      </div>

      {/* Validation Result */}
      {validationResult !== null && (
        <div className={`p-4 rounded-lg border-2 ${
          validationResult
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <p className="font-semibold">
            Validation Result: {validationResult ? '✅ Valid Score (1-10)' : '❌ Invalid Score'}
          </p>
        </div>
      )}

      {/* History Toggle */}
      {trustScoreTracker.trustScores.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`${buttonClass} text-sm px-4 py-2`}
          >
            {showHistory ? 'Hide History' : 'Show Trust History'}
          </button>
        </div>
      )}

      {/* Trust Score History */}
      {trustScoreTracker.trustScores.length > 0 && showHistory && (
        <div className={cardClass}>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Trust Score History</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trustScoreTracker.trustScores.map((score, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 text-center"
              >
                <p className="text-sm text-gray-600 mb-1">Event #{idx + 1}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {score.clear !== undefined ? String(score.clear) : "🔒"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {trustScoreTracker.message && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-blue-800">{trustScoreTracker.message}</p>
        </div>
      )}

      {/* Debug section removed per user request */}
    </div>
  );
};

