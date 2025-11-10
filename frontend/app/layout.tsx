import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Encrypted Trust Score Tracker",
  description: "Record and track trust events privately with fully homomorphic encryption",
  icons: {
    icon: "/trust-icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@rainbow-me/rainbowkit@latest/dist/index.css" />
      </head>
      <body className={`text-foreground antialiased`}>
        <main className="flex flex-col max-w-screen-xl mx-auto pb-20 min-w-[850px]">
          <Providers>
            <NavBar />
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}
