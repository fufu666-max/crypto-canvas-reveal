"use client";

import { useState, useEffect } from "react";

export const TrustIndicators = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const indicators = [
    { icon: "🔐", label: "End-to-End Encrypted", delay: "animate-delay-100" },
    { icon: "🛡️", label: "Privacy Preserved", delay: "animate-delay-200" },
    { icon: "⚡", label: "Real-time Processing", delay: "animate-delay-300" },
    { icon: "🔗", label: "Blockchain Secured", delay: "animate-delay-400" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-4">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {indicators.map((item, idx) => (
          <div
            key={idx}
            className={`
              flex items-center gap-2 px-4 py-2 
              bg-white/40 backdrop-blur-sm rounded-full 
              border border-white/30 shadow-lg
              opacity-0 ${mounted ? 'animate-fade-in-up' : ''} ${item.delay}
              hover:bg-white/60 hover:scale-105 transition-all duration-300
            `}
          >
            <span className="text-xl animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
              {item.icon}
            </span>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
