"use client";

export const BackgroundDecorations = () => {
  return (
    <>
      {/* 浮动渐变球 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* 大型渐变球 */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-slow"
          style={{ top: '10%', left: '-10%' }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-pink-400/25 to-purple-400/25 rounded-full blur-3xl animate-float-delayed"
          style={{ top: '50%', right: '-5%' }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"
          style={{ bottom: '10%', left: '20%' }}
        />
        
        {/* 小型装饰粒子 */}
        <div className="absolute w-4 h-4 bg-purple-500/40 rounded-full animate-particle" style={{ top: '20%', left: '15%' }} />
        <div className="absolute w-3 h-3 bg-pink-500/50 rounded-full animate-particle" style={{ top: '30%', right: '20%', animationDelay: '1s' }} />
        <div className="absolute w-5 h-5 bg-indigo-500/30 rounded-full animate-particle" style={{ top: '60%', left: '10%', animationDelay: '2s' }} />
        <div className="absolute w-2 h-2 bg-purple-400/60 rounded-full animate-particle" style={{ top: '70%', right: '15%', animationDelay: '0.5s' }} />
        <div className="absolute w-3 h-3 bg-pink-400/40 rounded-full animate-particle" style={{ bottom: '20%', left: '30%', animationDelay: '1.5s' }} />
        <div className="absolute w-4 h-4 bg-indigo-400/35 rounded-full animate-particle" style={{ bottom: '30%', right: '25%', animationDelay: '2.5s' }} />
        
        {/* 旋转装饰环 */}
        <div 
          className="absolute w-[600px] h-[600px] border border-purple-200/20 rounded-full animate-spin-slow"
          style={{ top: '-200px', right: '-200px' }}
        />
        <div 
          className="absolute w-[400px] h-[400px] border border-pink-200/15 rounded-full animate-spin-slow"
          style={{ bottom: '-150px', left: '-150px', animationDirection: 'reverse' }}
        />
        
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </>
  );
};
