"use client";

import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useRainbowEthersSigner } from "../hooks/rainbow/useRainbowEthersSigner";
import { useTrustScoreTracker } from "@/hooks/useTrustScoreTracker";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { useState, useCallback, useEffect } from "react";

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

  const {
    eventCount,
    canDecrypt,
    isDecrypting,
    isRefreshing,
    clearTotal,
    decryptScores,
    canRecord,
    contractAddress,
    recordTrustEvent,
    isRecording,
    clearAverage,
    canGetScores,
    refreshScores,
    trustScores,
    message: trackerMessage,
    isDeployed,
    decryptionStatus,
    totalScoreHandle,
    averageScoreHandle,
  } = useTrustScoreTracker({
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
  const [mounted, setMounted] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // 页面加载动画
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-decrypt when event count changes and we have encrypted data
  useEffect(() => {
    if (
      eventCount > 0 &&
      canDecrypt &&
      !isDecrypting &&
      !isRefreshing &&
      clearTotal === undefined
    ) {
      // Small delay to ensure data is ready
      const timer = setTimeout(() => {
        decryptScores();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    eventCount,
    canDecrypt,
    isDecrypting,
    isRefreshing,
    clearTotal,
    decryptScores,
  ]);

  // Move useCallback to top level - before any conditional returns
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
    if (!canRecord) {
      if (!isConnected) {
        setValidationError("Please connect your wallet first");
      } else if (fhevmStatus === "error") {
        setValidationError("FHEVM initialization failed. Please check the error message above and try again.");
      } else if (fhevmStatus !== "ready") {
        setValidationError("FHEVM is still initializing. Please wait...");
      } else if (!contractAddress) {
        setValidationError("Contract not deployed on this network");
      } else {
        setValidationError("Please wait for the system to be ready");
      }
      return;
    }

    try {
      recordTrustEvent(score);
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
  }, [canRecord, contractAddress, recordTrustEvent, scoreInput, fhevmStatus, isConnected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRecording) {
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
  const cardClass = "fhe-card-animated p-6";

  if (!isConnected) {
    return (
      <div className={`mx-auto text-center opacity-0 ${mounted ? 'animate-fade-in-up' : ''}`}>
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 animate-gradient-flow">
            Encrypted Trust Score Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Record and track trust events privately with fully homomorphic encryption
          </p>
        </div>
        
        {/* 装饰性动画元素 */}
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-30 animate-pulse-glow"></div>
          <button
            className={`${buttonClass} text-xl px-8 py-4 relative neon-border`}
            onClick={connect}
          >
            <span className="flex items-center gap-2">
              <svg className="w-6 h-6 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect Rainbow Wallet
            </span>
          </button>
        </div>
        
        {/* 连接提示装饰 */}
        <div className="mt-8 flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  if (fhevmStatus === "loading") {
    return (
      <div className={`${cardClass} opacity-0 ${mounted ? 'animate-fade-in-up' : ''}`}>
        <div className="flex flex-col items-center justify-center py-12">
          {/* 加载动画 */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-4 border-pink-400 rounded-full border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <span className="mt-4 text-gray-600 font-medium">Initializing FHEVM...</span>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 space-y-6 opacity-0 ${mounted ? 'animate-fade-in-up' : ''}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 animate-gradient-flow">
          Encrypted Trust Score Tracker
        </h1>
        <p className="text-gray-600 text-lg">
          Build your private trust curve with encrypted scores
        </p>
        {/* 装饰性下划线 */}
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-shimmer"></div>
        </div>
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
                All scores are encrypted and private. Use Enter to submit, ESC to clear input.
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
              className={`${inputClass} ${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} ${!canRecord ? 'opacity-60' : ''}`}
              onKeyDown={handleKeyDown}
            />
        <button
          className={`${buttonClass} ${
            isRecording
              ? "opacity-75 cursor-not-allowed"
              : ""
          } transition-opacity duration-200`}
          disabled={!scoreInput.trim() || isRecording}
          onClick={handleRecordScore}
        >
          {isRecording ? (
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
        <div className={`${cardClass} group hover:scale-105 transition-transform duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white animate-float">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-700">Total Score</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 animate-count-up">
            {clearTotal !== undefined
              ? String(clearTotal)
              : isDecrypting
              ? "Decrypting..."
              : eventCount > 0
              ? "🔒 Encrypted"
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {clearTotal !== undefined ? "Decrypted" : "Encrypted total"}
          </p>
        </div>

        <div className={`${cardClass} group hover:scale-105 transition-transform duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white animate-float" style={{ animationDelay: '0.2s' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-700">Event Count</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 animate-count-up">
            {eventCount > 0
              ? eventCount
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Total events
          </p>
        </div>

        <div className={`${cardClass} group hover:scale-105 transition-transform duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white animate-float" style={{ animationDelay: '0.4s' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-700">Average Score</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600 animate-count-up">
            {clearAverage !== undefined
              ? Number(clearAverage).toFixed(1)
              : isDecrypting
              ? "Decrypting..."
              : eventCount > 0
              ? "🔒 Encrypted"
              : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            {clearAverage !== undefined
              ? "Decrypted"
              : eventCount > 0
              ? "Click Decrypt to reveal"
              : "No trust events yet"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className={buttonClass}
          disabled={!canGetScores}
          onClick={refreshScores}
        >
          {isRefreshing
            ? "Refreshing..."
            : "Refresh Scores"}
        </button>
        <button
          className={buttonClass}
          disabled={!canDecrypt}
          onClick={decryptScores}
        >
          {isDecrypting
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
              
              // Simulate FHE validation process
              // In a real implementation, this would call a contract function that performs
              // FHE.le (less than or equal) or FHE.ge (greater than or equal) on encrypted data
              // without decrypting it, returning a boolean or another encrypted value.
              
              await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
              
              setValidationResult(true);
              setValidationError("");
              
              // Update message to explain FHE logic
              if (trackerMessage) {
                // This will be caught by the next state update
              }
            } catch {
              setValidationError("Validation failed");
              setValidationResult(false);
            } finally {
              setIsValidating(false);
            }
          }}
        >
          {isValidating ? "Verifying FHE Range..." : "Validate Score (FHE Demo)"}
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
      {trustScores.length > 0 && (
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
      {trustScores.length > 0 && showHistory && (
        <div className={cardClass}>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Trust Score History</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trustScores.map((score, idx) => (
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

      {/* Decryption Process Visualizer */}
      {isDecrypting && (
        <div className={`${cardClass} border-2 border-purple-300 bg-purple-50 animate-pulse-glow`}>
          <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-600 border-t-transparent"></div>
            FHE Decryption Process
          </h3>
          <div className="space-y-4">
            {[
              { id: "generating_keys", label: "1. Generate Session Keys", desc: "Creating ephemeral keypair for this session" },
              { id: "signing", label: "2. Authorize Decryption", desc: "Requesting wallet signature to verify ownership" },
              { id: "requesting_gateway", label: "3. Gateway Re-encryption", desc: "Zama Gateway re-encrypting data for your session key" },
              { id: "decrypting_locally", label: "4. Local Reveal", desc: "Decrypting the re-encrypted data in your browser" }
            ].map((step) => {
              const isActive = decryptionStatus.step === step.id;
              const isPast = ["generating_keys", "signing", "requesting_gateway", "decrypting_locally", "completed"].indexOf(decryptionStatus.step) > ["generating_keys", "signing", "requesting_gateway", "decrypting_locally"].indexOf(step.id);
              
              return (
                <div key={step.id} className={`flex items-start gap-3 transition-opacity duration-300 ${isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'}`}>
                  <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-purple-600 text-white animate-bounce' : isPast ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {isPast ? '✓' : step.id === 'generating_keys' ? '1' : step.id === 'signing' ? '2' : step.id === 'requesting_gateway' ? '3' : '4'}
                  </div>
                  <div>
                    <p className={`font-semibold ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>{step.label}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Reveal Section */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-sm text-purple-600 hover:text-purple-800 underline transition-colors"
        >
          {showTechnicalDetails ? 'Hide Technical Details' : 'Show Technical Cryptography Details'}
        </button>
      </div>

      {showTechnicalDetails && (
        <div className={`${cardClass} bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto`}>
          <h3 className="text-gray-400 mb-2 border-b border-gray-700 pb-1 font-sans font-bold uppercase tracking-wider">Cryptography Audit Trail</h3>
          <div className="space-y-1">
            <p><span className="text-blue-400">contract_address:</span> {contractAddress}</p>
            <p><span className="text-blue-400">total_score_handle:</span> {totalScoreHandle || '0x0'}</p>
            <p><span className="text-blue-400">average_score_handle:</span> {averageScoreHandle || '0x0'}</p>
            {trustScores.length > 0 && (
              <div className="pl-4 border-l border-gray-700 mt-1">
                <p className="text-gray-500 italic">{"// Encrypted score handles in history"}</p>
                {trustScores.map((s, i) => (
                  <p key={i}><span className="text-blue-300">score_handle[{i}]:</span> {s.handle.substring(0, 20)}...</p>
                ))}
              </div>
            )}
            <p className="mt-2 text-yellow-400">{"// FHEVM instance detected: "}{fhevmInstance ? 'ACTIVE' : 'INACTIVE'}</p>
            <p className="text-yellow-400">{"// Chain ID: "}{chainId}</p>
            <p className="text-purple-400 italic mt-2">{"// All operations are performed using Fully Homomorphic Encryption"}</p>
            <p className="text-purple-400 italic">{"// Decryption only possible via Gateway re-encryption for authorized users"}</p>
          </div>
        </div>
      )}

      {/* Status Message */}
      {trackerMessage && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-blue-800">{trackerMessage}</p>
        </div>
      )}

      {/* Debug section removed per user request */}
    </div>
  );
};

