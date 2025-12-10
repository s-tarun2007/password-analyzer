
import React, { useEffect, useRef, useState } from 'react';

interface LoaderDeepFakeProps {
  onComplete: () => void;
}

const LoaderDeepFake: React.FC<LoaderDeepFakeProps> = ({ onComplete }) => {
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleScroll = (e: WheelEvent) => {
          if (e.deltaY > 0 && !scrolled) {
              triggerUnlock();
          }
      };

      // Add touch/drag listener for mobile
      let touchStartY = 0;
      const handleTouchStart = (e: TouchEvent) => {
          touchStartY = e.touches[0].clientY;
      };
      const handleTouchMove = (e: TouchEvent) => {
          const touchEndY = e.touches[0].clientY;
          if (touchStartY - touchEndY > 50 && !scrolled) { // Swipe up
              triggerUnlock();
          }
      };

      window.addEventListener('wheel', handleScroll);
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('touchmove', handleTouchMove);

      return () => {
          window.removeEventListener('wheel', handleScroll);
          window.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchmove', handleTouchMove);
      };
  }, [scrolled]);

  const triggerUnlock = () => {
      setScrolled(true);
      setTimeout(() => {
          onComplete();
      }, 1000); // Wait for zoom animation
  };

  return (
    <div ref={containerRef} className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${scrolled ? 'opacity-0 scale-150' : 'opacity-100 scale-100'}`}>
        
        {/* Beams */}
        <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="absolute w-1 h-[100vh] bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" 
                     style={{ 
                         transform: `rotate(${i * 30}deg)`,
                         animation: `spin 10s linear infinite` 
                     }} 
                />
            ))}
        </div>

        {/* Center Typography */}
        <div className="relative z-10 text-center transform transition-transform duration-500 hover:scale-105">
            <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-900 tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                Deep<br/>Scan
            </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 flex flex-col items-center animate-bounce">
            <div className="w-6 h-10 border-2 border-purple-500/50 rounded-full flex justify-center p-1">
                <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <p className="text-purple-400/50 text-xs uppercase tracking-widest mt-2">Scroll to Engage</p>
        </div>

        <style>{`
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
  );
};

export default LoaderDeepFake;
