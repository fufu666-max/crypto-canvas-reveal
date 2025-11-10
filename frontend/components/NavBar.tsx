"use client";

import Image from "next/image";
import { RainbowConnectButton } from "../app/RainbowConnectButton";
import { NetworkToggle } from "./NetworkToggle";

export function NavBar() {
  return (
    <nav className="flex w-full px-3 md:px-0 h-fit py-6 justify-between items-center">
      <Image
        src="/trust-logo.svg"
        alt="Trust Score Tracker Logo"
        width={80}
        height={80}
      />
      <div className="flex items-center gap-4">
        <NetworkToggle />
        <RainbowConnectButton />
      </div>
    </nav>
  );
}

