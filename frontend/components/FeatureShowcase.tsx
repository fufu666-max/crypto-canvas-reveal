"use client";

import { useState, useEffect } from "react";

export const FeatureShowcase = () => {
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Fully Homomorphic Encryption",
      description: "Compute on encrypted data without ever decrypting it. Your trust scores remain private at all times.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      title: "Decentralized Trust",
      description: "Build reputation on-chain with cryptographic guarantees. No central authority controls your trust score.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Zero-Knowledge Proofs",
      description: "Prove your trustworthiness without revealing sensitive details. Privacy meets transparency.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className={`w-full max-w-6xl mx-auto px-4 mt-8 opacity-0 ${mounted ? 'animate-fade-in-up animate-delay-500' : ''}`}>
      {/* 标题 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
          Powered by Advanced Cryptography
        </h2>
        <p className="text-gray-600">
          State-of-the-art privacy technology for the decentralized future
        </p>
      </div>

      {/* 特性卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`
              relative p-6 rounded-2xl 
              bg-white/60 backdrop-blur-sm border border-white/30
              shadow-lg hover:shadow-2xl
              transition-all duration-500 cursor-pointer
              ${activeFeature === idx ? 'scale-105 animate-pulse-glow' : 'hover:scale-102'}
            `}
            onMouseEnter={() => setActiveFeature(idx)}
          >
            {/* 图标 */}
            <div className={`
              w-16 h-16 rounded-xl mb-4
              bg-gradient-to-br ${feature.gradient}
              flex items-center justify-center text-white
              shadow-lg animate-float
            `}
            style={{ animationDelay: `${idx * 0.3}s` }}
            >
              {feature.icon}
            </div>

            {/* 内容 */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>

            {/* 装饰线 */}
            <div className={`
              absolute bottom-0 left-0 h-1 rounded-b-2xl
              bg-gradient-to-r ${feature.gradient}
              transition-all duration-500
              ${activeFeature === idx ? 'w-full' : 'w-0'}
            `} />
          </div>
        ))}
      </div>

      {/* 统计装饰 */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "256-bit", label: "Encryption" },
          { value: "100%", label: "Privacy" },
          { value: "< 1s", label: "Latency" },
          { value: "∞", label: "Scalability" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="text-center p-4 rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-all duration-300"
          >
            <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-heartbeat" style={{ animationDelay: `${idx * 0.5}s` }}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
