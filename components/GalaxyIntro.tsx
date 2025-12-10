
import React, { useEffect, useRef, useState } from 'react';

interface GalaxyIntroProps {
  onComplete: () => void;
}

const GalaxyIntro: React.FC<GalaxyIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'IDLE' | 'COLLAPSING' | 'FLASH' | 'OPENING'>('IDLE');
  
  // Animation state
  const animState = useRef({
    particles: [] as any[],
    time: 0,
    animationFrameId: 0
  });

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

    // PERFORMANCE OPTIMIZATION: Reduce particles on mobile to prevent lag
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 600 : 2000; 
    
    const particles = [];
    const colors = ['#8b5cf6', '#6366f1', '#a855f7', '#3b82f6', '#ffffff']; 

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 200 + Math.random() * 150; // Wider distribution for less "hard shell" look
        
        particles.push({
            // Spherical coords
            theta,
            phi,
            r,
            originalR: r,
            
            // Cartesian (calculated per frame)
            x: 0, y: 0, z: 0,
            
            // Attributes
            size: Math.random() * 1.5 + 0.5, 
            color: colors[Math.floor(Math.random() * colors.length)],
            speedOffset: Math.random() * 0.002, 
            
            // Collapse targets
            targetX: (Math.random() - 0.5) * window.innerWidth * 0.8, 
            targetY: 0, 
        });
    }
    animState.current.particles = particles;

    // Animation Loop
    const animate = () => {
      if (!ctx || !canvas) return;
      animState.current.time += 0.01; 
      
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      
      // Clear
      ctx.clearRect(0, 0, width, height);

      const currentPhase = phaseRef.current; 

      // Logic based on phase
      animState.current.particles.forEach(p => {
        
        if (currentPhase === 'IDLE') {
            // Rotation
            p.theta += 0.002 + p.speedOffset;
            
            // MORPHING LOGIC:
            const fluidR = p.originalR 
                + Math.sin(animState.current.time * 2 + p.phi * 4) * 50 
                + Math.cos(animState.current.time * 1.5 + p.theta * 2) * 30;
            
            p.x = fluidR * Math.sin(p.phi) * Math.cos(p.theta);
            p.y = fluidR * Math.sin(p.phi) * Math.sin(p.theta);
            p.z = fluidR * Math.cos(p.phi);
        
        } else if (currentPhase === 'COLLAPSING') {
            // Collapse logic
            const fluidR = p.originalR * 0.5; // Shrink slightly
            
            const ease = 0.08; // Snappier collapse
            
            const targetX = p.targetX; 
            const targetY = 0 + (Math.sin(p.theta * 10) * 2); 
            const targetZ = 0;

            p.x += (targetX - p.x) * ease;
            p.y += (targetY - p.y) * ease;
            p.z += (targetZ - p.z) * ease;
            
            // Turn white/bright blue for the energy beam effect
            p.color = '#e0e7ff'; 
        }

        // Projection
        const fov = 400;
        const scale = fov / (fov - p.z);
        const x2d = cx + p.x * scale;
        const y2d = cy + p.y * scale;

        // Draw
        if (scale > 0 && currentPhase !== 'FLASH') {
            ctx.globalAlpha = currentPhase === 'IDLE' ? 0.8 : 1;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      animState.current.animationFrameId = requestAnimationFrame(animate);
    };

    animState.current.animationFrameId = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animState.current.animationFrameId);
    };
  }, []);

  const phaseRef = useRef('IDLE');
  useEffect(() => {
      phaseRef.current = phase;
      
      if (phase === 'FLASH') {
          setTimeout(() => {
              setPhase('OPENING');
              setTimeout(onComplete, 800);
          }, 150); // Shorter flash hold
      }
  }, [phase, onComplete]);

  const handleStart = () => {
    setPhase('COLLAPSING');
    // Force transition after sufficient time for collapse animation
    setTimeout(() => {
        setPhase('FLASH');
    }, 1200);
  };

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden pointer-events-none`}>
        
        {/* Curtains (Top and Bottom) */}
        <div className={`absolute top-0 left-0 w-full h-1/2 bg-slate-950 z-10 transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${phase === 'OPENING' ? '-translate-y-full' : 'translate-y-0'}`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-slate-950 z-10 transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${phase === 'OPENING' ? 'translate-y-full' : 'translate-y-0'}`}></div>

        {/* The Galaxy Canvas */}
        <div className={`absolute inset-0 z-20 transition-opacity duration-300 ${phase === 'FLASH' || phase === 'OPENING' ? 'opacity-0' : 'opacity-100'}`}>
            <canvas ref={canvasRef} className="block w-full h-full" />
        </div>

        {/* Start Button */}
        <div className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-500 ${phase === 'IDLE' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
             
             <style>{`
                /* --- Custom Variables --- */
                :root {
                  --black-base: rgba(10, 10, 10, 0.3);
                  --black-dark: #000000;
                  --glass-highlight: rgba(255, 255, 255, 0.15);
                  --border-color: rgba(255, 255, 255, 0.05);
                  --transition-speed: 0.3s;
                }

                /* --- Liquid Glass Button Styling --- */
                .liquid-glass-button {
                  position: relative;
                  overflow: hidden;
                  padding: 1rem 2.5rem;
                  border: 1px solid var(--border-color);
                  border-radius: 12px;
                  background-color: var(--black-base);
                  backdrop-filter: blur(12px); 
                  -webkit-backdrop-filter: blur(12px);
                  box-shadow: 
                    0 4px 30px rgba(0, 0, 0, 0.5), 
                    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
                  color: #fff;
                  font-size: 1.1rem;
                  font-weight: 600;
                  text-decoration: none;
                  cursor: pointer;
                  z-index: 1;
                  transition: 
                    box-shadow var(--transition-speed) ease,
                    transform var(--transition-speed) ease;
                  display: inline-flex;
                  align-items: center;
                  gap: 12px;
                }

                .liquid-glass-button span, .liquid-glass-button svg {
                  position: relative;
                  z-index: 10;
                }

                /* --- The 'Liquid' Highlight Effect --- */
                .liquid-glass-button::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 200%;
                  height: 100%;
                  background: linear-gradient(
                    90deg, 
                    transparent, 
                    var(--glass-highlight), 
                    transparent
                  );
                  transform: translateX(-100%) skewX(-30deg);
                  transition: transform 0.45s ease-in-out;
                  z-index: 5;
                }

                /* --- Hover State --- */
                .liquid-glass-button:hover {
                  transform: translateY(-2px) scale(1.05);
                  box-shadow: 
                    0 8px 40px rgba(0, 0, 0, 0.8), 
                    0 0 15px rgba(255, 255, 255, 0.05), 
                    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
                }

                .liquid-glass-button:hover::before {
                  transform: translateX(0%) skewX(-30deg);
                }

                /* --- Active State --- */
                .liquid-glass-button:active {
                  transform: translateY(0) scale(1);
                  box-shadow: 
                    0 2px 20px rgba(0, 0, 0, 0.5),
                    inset 0 0 5px rgba(255, 255, 255, 0.1);
                }
             `}</style>

             <button 
                onClick={handleStart}
                className="liquid-glass-button"
             >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z" />
                </svg>
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">LET'S START</span>
             </button>
        </div>

        {/* Flash Effect */}
        <div className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${phase === 'FLASH' ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

export default GalaxyIntro;
