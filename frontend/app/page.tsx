"use client";

import { TrustScoreTrackerDemo } from "@/components/TrustScoreTrackerDemo";

// Force dynamic rendering to avoid static generation issues with client-side hooks
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-8">
      <div className="flex flex-col gap-8 items-center w-full px-3 md:px-0">
        <TrustScoreTrackerDemo />
      </div>
    </main>
  );
}
