
import React, { useEffect, useRef } from 'react';

interface PixelLockLoaderProps {
  onComplete?: () => void;
}

const PixelLockLoader: React.FC<PixelLockLoaderProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-dpi displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set explicit size matching window
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const particles: any[] = [];
    const particleCount = 800; // Increased density for enhanced look
    const width = window.innerWidth;
    const height = window.innerHeight;

    // --- ENHANCED LOCK GEOMETRY (CENTERED) ---
    const lockPoints: {x: number, y: number}[] = [];
    
    // Scale factor to make lock larger
    const scale = 0.25; // 25% of screen width/height roughly
    const cx = 0.5; // Center X (0-1)
    const cy = 0.55; // Center Y (0-1) - slightly lower to balance with shackle

    // Lock Body (Square) - Centered around cx, cy
    const bodyW = scale; 
    const bodyH = scale * 0.8; 
    
    const startX = cx - bodyW/2;
    const startY = cy - bodyH/2;

    // Create a dense grid of points for the body
    for(let i=0; i<60; i++) {
        for(let j=0; j<50; j++) {
             // Only add edge points and some internal structure for "hologram" feel
             if (i===0 || i===59 || j===0 || j===49 || (i%5===0 && j%5===0)) {
                 lockPoints.push({
                     x: startX + (i/60) * bodyW,
                     y: startY + (j/50) * bodyH
                 });
             }
        }
    }

    // Shackle (Arch)
    const shackleRadius = bodyW * 0.35;
    const shackleCenterY = startY; 
    
    for(let i=0; i<60; i++) {
        const angle = Math.PI + (i/60) * Math.PI;
        lockPoints.push({
            x: cx + Math.cos(angle) * shackleRadius,
            y: shackleCenterY + Math.sin(angle) * shackleRadius * 1.2
        });
        // Thicker shackle (inner ring)
        lockPoints.push({
            x: cx + Math.cos(angle) * (shackleRadius * 0.8),
            y: shackleCenterY + Math.sin(angle) * (shackleRadius * 0.8) * 1.2
        });
    }

    // Initialize Particles at Bottom Left (Off-screen start or corner)
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0, 
        y: height,
        vx: (Math.random() * width * 0.015) + 2,
        vy: -(Math.random() * height * 0.015) - 2,
        size: Math.random() * 2 + 1,
        color: '#22c55e',
        targetIndex: Math.floor(Math.random() * lockPoints.length)
      });
    }

    let animationFrameId: number;
    let startTime = Date.now();
    const duration = 5000;

    const render = () => {
      const elapsed = Date.now() - startTime;
      
      // Trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; 
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        if (elapsed < 2000) {
            // Phase 1: Splitter from Bottom Left Corner to Top Right
            // Move in a diagonal wave
            p.x += p.vx;
            p.y += p.vy;
            p.x += Math.sin(p.y * 0.02) * 3; // Wavy motion
            
            // If out of bounds, reset slightly to keep flow
            if(p.x > width || p.y < 0) {
                p.x = 0;
                p.y = height;
            }
        } else {
            // Phase 2: Form Lock
            const targetRel = lockPoints[p.targetIndex];
            const tx = targetRel.x * width; 
            const ty = targetRel.y * height;
            
            // Ease into position
            const dx = tx - p.x;
            const dy = ty - p.y;
            
            p.x += dx * 0.08;
            p.y += dy * 0.08;
            
            // Color shift: Green -> White -> Gold/Green
            if (elapsed > 4000) {
                 p.color = '#ffffff'; // Flash white before unlock
            } else {
                 p.color = '#22c55e';
            }
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // Enhanced Keyhole Visual (Center of Lock Body)
      if (elapsed > 2500) {
          const alpha = Math.min(1, (elapsed - 2500) / 1000);
          ctx.globalAlpha = alpha;
          
          const keyholeX = width * cx;
          const keyholeY = height * (cy + 0.02);
          
          // Glow
          const grad = ctx.createRadialGradient(keyholeX, keyholeY, 5, keyholeX, keyholeY, 40);
          grad.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(keyholeX, keyholeY, 40, 0, Math.PI*2);
          ctx.fill();

          // Solid Shape
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(keyholeX, keyholeY - 10, 15, 0, Math.PI*2); // Top circle
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(keyholeX, keyholeY - 10);
          ctx.lineTo(keyholeX + 10, keyholeY + 25);
          ctx.lineTo(keyholeX - 10, keyholeY + 25);
          ctx.fill();
          
          ctx.globalAlpha = 1;
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(render);
      } else {
          if (onComplete) onComplete();
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
      <div className="absolute bottom-16 text-green-500 font-mono text-sm tracking-[0.5em] animate-pulse z-20 w-full text-center">
        ENCRYPTING SECURE CHANNEL...
      </div>
    </div>
  );
};

export default PixelLockLoader;
