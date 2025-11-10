"use client";

import { useState, useRef, useEffect } from "react";
import { useRainbow } from "@/hooks/rainbow/useRainbowProvider";

type SupportedNetwork = "hardhat" | "sepolia";

const NETWORKS: Record<
  SupportedNetwork,
  {
    label: string;
    chainId: number;
    chainIdHex: `0x${string}`;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }
> = {
  hardhat: {
    label: "Hardhat Local",
    chainId: 31337,
    chainIdHex: "0x7a69",
    rpcUrls: ["http://127.0.0.1:8545"],
    blockExplorerUrls: [],
    nativeCurrency: {
      name: "Hardhat ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
  sepolia: {
    label: "Sepolia Testnet",
    chainId: 11155111,
    chainIdHex: "0xaa36a7",
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "SEP",
      decimals: 18,
    },
  },
};

export function NetworkToggle() {
  const { provider, chainId, isConnected } = useRainbow();
  const [status, setStatus] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current network
  const currentNetwork = Object.entries(NETWORKS).find(
    ([, network]) => network.chainId === chainId
  )?.[0] as SupportedNetwork | undefined;

  const currentNetworkLabel = currentNetwork
    ? NETWORKS[currentNetwork].label
    : "Select Network";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSwitch = async (target: SupportedNetwork) => {
    if (!provider) {
      setStatus("Wallet provider not detected");
      setIsOpen(false);
      return;
    }
    setIsSwitching(true);
    setStatus(null);
    setIsOpen(false);

    const targetNetwork = NETWORKS[target];
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetNetwork.chainIdHex }],
      });
      setStatus(`Switched to ${targetNetwork.label}`);
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error?.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: targetNetwork.chainIdHex,
                chainName: targetNetwork.label,
                nativeCurrency: targetNetwork.nativeCurrency,
                rpcUrls: targetNetwork.rpcUrls,
                blockExplorerUrls: targetNetwork.blockExplorerUrls,
              },
            ],
          });
          setStatus(`Added ${targetNetwork.label}, please approve switch`);
        } catch (addError: unknown) {
          const addErr = addError as { message?: string };
          setStatus(addErr?.message ?? "Failed to add chain");
        }
      } else {
        setStatus(error?.message ?? "Failed to switch network");
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!provider || !isConnected || isSwitching}
        className={`
          flex items-center justify-between gap-2
          px-4 py-2 rounded-lg text-sm font-semibold
          transition-all duration-200 min-w-[160px]
          ${
            currentNetwork
              ? "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white shadow-lg"
              : "bg-white/80 backdrop-blur-sm border border-purple-200/50 text-purple-600 hover:bg-purple-50/50"
          }
          ${!provider || !isConnected || isSwitching ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
        `}
      >
        <span>{currentNetworkLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg border border-purple-200/50 shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {(Object.keys(NETWORKS) as SupportedNetwork[]).map((key) => {
            const network = NETWORKS[key];
            const isActive = chainId === network.chainId;
            return (
              <button
                key={key}
                onClick={() => handleSwitch(key)}
                disabled={isSwitching || isActive}
                className={`
                  w-full text-left px-4 py-2.5 text-sm font-medium
                  transition-all duration-150
                  flex items-center justify-between
                  ${
                    isActive
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold"
                      : "text-gray-700 hover:bg-purple-50/50 hover:text-purple-600"
                  }
                  ${isSwitching || isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                `}
              >
                <span>{network.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {status && (
        <div className="text-xs text-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-3 py-1.5 shadow-sm transition-all duration-300 animate-in fade-in">
          {status}
        </div>
      )}
    </div>
  );
}

