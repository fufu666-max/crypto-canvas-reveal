"use client";

import type { ReactNode } from "react";

import { RainbowProvider } from "@/hooks/rainbow/useRainbowProvider";
import { InMemoryStorageProvider } from "@/hooks/useInMemoryStorage";
import { RainbowEthersSignerProvider } from "@/hooks/rainbow/useRainbowEthersSigner";
import { MetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { MetaMaskEthersSignerProvider } from "@/hooks/metamask/useMetaMaskEthersSigner";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <RainbowProvider>
      <MetaMaskProvider>
        <RainbowEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
          <MetaMaskEthersSignerProvider initialMockChains={{ 31337: "http://localhost:8545" }}>
            <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
          </MetaMaskEthersSignerProvider>
        </RainbowEthersSignerProvider>
      </MetaMaskProvider>
    </RainbowProvider>
  );
}
