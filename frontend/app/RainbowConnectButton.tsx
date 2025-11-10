"use client";

import { useRainbow } from "@/hooks/rainbow/useRainbowProvider";

export function RainbowConnectButton() {
  const { isConnected, connect, accounts } = useRainbow();

  if (isConnected && accounts && accounts.length > 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="font-semibold">
          {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
    >
      Connect Rainbow
    </button>
  );
}

