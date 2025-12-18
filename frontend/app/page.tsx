"use client";

import { TrustScoreTrackerDemo } from "@/components/TrustScoreTrackerDemo";
import { BackgroundDecorations } from "@/components/BackgroundDecorations";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { TrustIndicators } from "@/components/TrustIndicators";
import { Footer } from "@/components/Footer";

// Force dynamic rendering to avoid static generation issues with client-side hooks
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-8 relative overflow-hidden animate-gradient-flow">
      {/* 背景装饰 */}
      <BackgroundDecorations />
      
      <div className="flex flex-col gap-8 items-center w-full px-3 md:px-0 relative z-10">
        {/* 信任指标装饰 */}
        <TrustIndicators />
        
        {/* 主要功能区 */}
        <TrustScoreTrackerDemo />
        
        {/* 功能展示装饰区 */}
        <FeatureShowcase />
        
        {/* 页脚 */}
        <Footer />
      </div>
    </main>
  );
}
