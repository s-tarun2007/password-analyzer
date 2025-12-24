
import React, { useEffect, useRef, useState } from 'react';

interface PixelLockLoaderProps {
  onComplete?: () => void;
}

const PixelLockLoader: React.FC<PixelLockLoaderProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [statusText, setStatusText] = useState("INITIALIZING SECURITY LAYER...");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base
    if (!ctx) return;

    // --- CONFIG ---
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 800 : 1600; // Optimized count
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance

    // --- GEOMETRY CACHE ---
    let lockPoints: {x: number, y: number}[] = [];
    let clockFacePoints: {x: number, y: number}[] = [];
    
    // Generate Static Geometries
    const initGeometries = () => {
        // LOCK
        const lPoints = [];
        const bodyW = 50, bodyH = 40, bodyY = 10;
        // Body
        for (let x = -bodyW/2; x <= bodyW/2; x += 2) {
            for (let y = 0; y <= bodyH; y += 2) {
                if (x <= -bodyW/2 + 2 || x >= bodyW/2 - 2 || y <= 0 || y >= bodyH - 2 || (x%6===0 && y%6===0)) {
                    lPoints.push({ x, y: y + bodyY });
                }
            }
        }
        // Shackle
        const r = 20;
        for (let a = Math.PI; a <= 2 * Math.PI; a += 0.1) {
            lPoints.push({ x: Math.cos(a) * r, y: bodyY + Math.sin(a) * r * 1.2 });
            lPoints.push({ x: Math.cos(a) * (r-5), y: bodyY + Math.sin(a) * (r-5) * 1.2 });
        }
        lockPoints = lPoints;

        // CLOCK FACE
        const cPoints = [];
        const rad = 45;
        for (let a = 0; a < Math.PI * 2; a += 0.05) {
             cPoints.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
        }
        // Ticks
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const x1 = Math.cos(a) * (rad - 5);
            const y1 = Math.sin(a) * (rad - 5);
            const x2 = Math.cos(a) * rad;
            const y2 = Math.sin(a) * rad;
            cPoints.push({ x: x1, y: y1 });
            cPoints.push({ x: (x1+x2)/2, y: (y1+y2)/2 });
            cPoints.push({ x: x2, y: y2 });
        }
        clockFacePoints = cPoints;
    };
    initGeometries();

    // --- PARTICLE SYSTEM ---
    // Using simple objects for readability, but keeping object creation out of render loop
    const particles = new Array(particleCount).fill(0).map((_, i) => ({
        x: Math.random() * window.innerWidth, 
        y: window.innerHeight + Math.random() * 200, 
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 4 + 2), 
        size: Math.random() * 2 + 0.5,
        color: '#22c55e',
        lockIndex: i % lockPoints.length,
        clockFaceIndex: i % clockFacePoints.length,
        isHand: Math.random() > 0.7, // 30% particles form hands
        handOffset: Math.random() * 40,
        angleOffset: Math.random() * Math.PI * 2,
    }));

    let animationFrameId: number;
    const startTime = Date.now();
    const morphTime = 2500; 
    const duration = 5000; 
    
    // Hand Geometry helper (Calculated per frame)
    const getHandPos = (timeVal: number, p: any) => {
         // Minute hand (fast)
         const minAngle = timeVal * 0.2;
         // Hour hand (slow)
         const hourAngle = minAngle / 12;
         
         const isMinute = p.lockIndex % 2 === 0;
         const angle = isMinute ? minAngle : hourAngle;
         const length = isMinute ? 38 : 25;
         
         // Spread particles along the hand line
         const r = (p.handOffset % length);
         return {
             x: Math.cos(angle) * r,
             y: Math.sin(angle) * r
         };
    };

    const resize = () => {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    // --- RENDER LOOP ---
    const render = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const scale = minDim * 0.0035; 

      // Fade Background
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)'; 
      ctx.fillRect(0, 0, width, height);

      let phase = 'LOCK';
      if (elapsed > morphTime) phase = 'CLOCK';
      if (elapsed > duration - 800) phase = 'EXIT';

      // Update Text State (throttled by logic)
      if (elapsed < 1500) {
          if (statusText !== "ENCRYPTING CHANNEL...") setStatusText("ENCRYPTING CHANNEL...");
      } else if (elapsed < morphTime) {
           if (statusText !== "LOCKING SECURE GEOMETRY...") setStatusText("LOCKING SECURE GEOMETRY...");
      } else if (elapsed < duration - 1000) {
           if (statusText !== "SYNCHRONIZING TIMESTAMPS...") setStatusText("SYNCHRONIZING TIMESTAMPS...");
      } else {
           if (statusText !== "ACCESS GRANTED") setStatusText("ACCESS GRANTED");
      }

      // Pre-calc visual offset multiplier
      const geomScale = scale * 40;

      particles.forEach((p, i) => {
        let tx = p.x;
        let ty = p.y;
        let tColor = '#22c55e';

        if (phase === 'LOCK') {
            // Intro Animation
            if (elapsed < 1200) {
                 p.x += p.vx;
                 p.y += p.vy;
                 // Reset if offscreen
                 if (p.y < -50) { p.y = height + 50; p.x = Math.random() * width; }
            } else {
                // Form Lock
                const pt = lockPoints[p.lockIndex];
                tx = cx + pt.x * geomScale;
                ty = cy + pt.y * geomScale;
                // Easing
                p.x += (tx - p.x) * 0.12;
                p.y += (ty - p.y) * 0.12;
                
                if (Math.abs(tx - p.x) < 2) tColor = '#4ade80'; 
            }
        } 
        else if (phase === 'CLOCK') {
            if (p.isHand) {
                // Hand Particles
                const handPos = getHandPos((elapsed - morphTime) * 0.1, p);
                tx = cx + handPos.x * geomScale;
                ty = cy + handPos.y * geomScale;
                tColor = '#ffffff';
            } else {
                // Face Particles
                const pt = clockFacePoints[p.clockFaceIndex];
                tx = cx + pt.x * geomScale;
                ty = cy + pt.y * geomScale;
                tColor = '#06b6d4'; // Cyan
            }

            // Swirl transition into clock
            if (elapsed < morphTime + 600) {
                // Spiral Movement
                 const angle = Math.atan2(p.y - cy, p.x - cx) + 0.15;
                 const dist = Math.sqrt((p.x-cx)**2 + (p.y-cy)**2);
                 const targetDist = Math.sqrt((tx-cx)**2 + (ty-cy)**2);
                 const d = dist + (targetDist - dist) * 0.1;
                 
                 p.x = cx + Math.cos(angle) * d;
                 p.y = cy + Math.sin(angle) * d;
            } else {
                 p.x += (tx - p.x) * 0.2;
                 p.y += (ty - p.y) * 0.2;
            }
        } 
        else if (phase === 'EXIT') {
            // Explosion / Expansion
            const angle = Math.atan2(p.y - cy, p.x - cx);
            const dist = Math.sqrt((p.x-cx)**2 + (p.y-cy)**2);
            
            p.x += Math.cos(angle) * (dist * 0.1 + 10);
            p.y += Math.sin(angle) * (dist * 0.1 + 10);
            tColor = '#ffffff';
            p.size *= 1.02; // Grow slightly
        }

        ctx.fillStyle = tColor;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      // Glow overlay for Clock Phase
      if (phase === 'CLOCK') {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#06b6d4';
          ctx.globalCompositeOperation = 'lighter';
          // Draw a faint ring
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 45 * geomScale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
          ctx.shadowBlur = 0;
      }

      if (elapsed < duration) {
          animationFrameId = requestAnimationFrame(render);
      } else {
          // Trigger CSS Fade out
          setIsFadingOut(true);
          setTimeout(() => {
              if (onComplete) onComplete();
          }, 600); // Match CSS duration
      }
    };

    render();

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      <div className={`absolute bottom-16 w-full text-center z-20 transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        <p className="font-mono text-sm tracking-[0.5em] animate-pulse transition-colors duration-500" 
           style={{ color: statusText.includes('SYNCHRONIZING') ? '#06b6d4' : '#22c55e' }}>
            {statusText}
        </p>
      </div>
      {/* Visual Timer Bar */}
      <div className={`absolute bottom-12 w-64 h-1 bg-gray-800 rounded-full overflow-hidden z-20 transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 animate-[loading_5s_linear_forwards]"></div>
      </div>
    </div>
  );
};

export default PixelLockLoader;
