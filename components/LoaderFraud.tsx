
import React, { useEffect, useRef } from 'react';

interface LoaderFraudProps {
  onComplete: () => void;
}

const LoaderFraud: React.FC<LoaderFraudProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const width = canvas.width;
    const height = canvas.height;
    const blocks: any[] = [];
    const blockSize = 40;
    const cols = Math.ceil(width / blockSize);
    const rows = Math.ceil(height / blockSize);

    // Initialize Grid
    for(let i=0; i<50; i++) {
        blocks.push({
            x: Math.floor(Math.random() * cols) * blockSize,
            y: Math.floor(Math.random() * rows) * blockSize,
            color: Math.random() > 0.5 ? '#ef4444' : '#7f1d1d', // Red 500 or Red 900
            life: Math.random() * 20,
            speed: Math.random() * 10 + 5
        });
    }

    let frameId = 0;
    let startTime = Date.now();
    const duration = 3000; // 3 seconds

    const render = () => {
      const elapsed = Date.now() - startTime;
      
      // Clear with fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw random digital blocks
      blocks.forEach(b => {
          b.x += b.speed;
          if(b.x > canvas.width) b.x = -blockSize;
          
          // Glitch effect
          const jitterX = (Math.random() - 0.5) * 5;
          
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x + jitterX, b.y, blockSize - 2, blockSize - 2);
          
          // Random text
          if (Math.random() > 0.9) {
              ctx.fillStyle = '#fff';
              ctx.font = '10px monospace';
              ctx.fillText(Math.random().toString(16).substring(2,6).toUpperCase(), b.x, b.y + 20);
          }
      });

      // Overlay Scanline
      const scanY = (elapsed * 0.5) % height;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(0, scanY, width, 5);

      if (elapsed < duration) {
          frameId = requestAnimationFrame(render);
      } else {
          onComplete();
      }
    };

    render();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frameId);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="relative z-10 text-red-500 font-mono font-bold text-2xl tracking-widest bg-black/80 px-6 py-4 border border-red-500/50 rounded-xl">
            <span className="animate-pulse">⚠ THREAT PATTERN RECOGNITION...</span>
        </div>
    </div>
  );
};

export default LoaderFraud;
