
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

    // Initialize Particles
    const particleCount = 2500; // Increased count slightly for better line density
    const particles = [];
    const colors = ['#8b5cf6', '#6366f1', '#a855f7', '#3b82f6', '#ffffff']; 

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 250 + Math.random() * 100; // Slightly larger radius
        
        particles.push({
            // Spherical coords
            theta,
            phi,
            r,
            originalR: r,
            
            // Cartesian (calculated per frame)
            x: 0, y: 0, z: 0,
            
            // Attributes
            size: Math.random() * 1.2 + 0.3, // Smaller variance for sharper look
            color: colors[Math.floor(Math.random() * colors.length)],
            speedOffset: Math.random() * 0.005, // Reduced variance for uniform flow
            
            // Collapse targets
            targetX: (Math.random() - 0.5) * window.innerWidth * 0.9, 
            targetY: 0, 
        });
    }
    animState.current.particles = particles;

    // Animation Loop
    const animate = () => {
      if (!ctx || !canvas) return;
      animState.current.time += 0.008; // Slower time progression
      
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
            // Slower Rotation
            p.theta += 0.0015 + p.speedOffset;
            
            // Slower, smoother Sine Wave Fluidity
            // Frequency reduced (p.phi * 3 instead of 5)
            // Time multiplier reduced (time * 1.5 instead of 2)
            const fluidR = p.originalR + Math.sin(animState.current.time * 1.5 + p.phi * 3) * 12;
            
            p.x = fluidR * Math.sin(p.phi) * Math.cos(p.theta);
            p.y = fluidR * Math.sin(p.phi) * Math.sin(p.theta);
            p.z = fluidR * Math.cos(p.phi);
        
        } else if (currentPhase === 'COLLAPSING') {
            // Collapse logic
            
            // Calculate "current" spherical position to maintain flow entering collapse
            const sphereX = p.r * Math.sin(p.phi) * Math.cos(p.theta + 0.05); 
            
            // Slower easing for smoother, less blurry movement
            const ease = 0.04; 
            
            // Tighter line target (less Y jitter)
            const targetX = p.targetX; 
            const targetY = 0 + (Math.sin(p.theta * 20) * 0.5); // Very tight center line
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
            ctx.globalAlpha = 1;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            // Removed size multiplier to keep it crisp
            ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      // Check for collapse completion
      if (currentPhase === 'COLLAPSING') {
          const firstP = animState.current.particles[0];
          // Check if y is very close to 0
          if (Math.abs(firstP.y) < 1.0) {
             setPhase('FLASH');
          }
      }

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
             <button 
                onClick={handleStart}
                className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-full transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] active:scale-95"
             >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity animate-gradient-x"></div>
                <div className="absolute inset-0 rounded-full border border-blue-400/50"></div>
                <span className="relative z-10 text-white font-bold text-xl uppercase tracking-[0.2em] drop-shadow-md group-hover:tracking-[0.25em] transition-all">
                    Let's Start
                </span>
             </button>
        </div>

        {/* The Flash Effect - Center Line */}
        <div className={`absolute top-1/2 left-0 w-full h-[2px] bg-cyan-200 z-40 -translate-y-1/2 shadow-[0_0_100px_60px_rgba(255,255,255,0.9)] transition-all duration-200 ${phase === 'FLASH' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-110'}`}></div>
        
        {/* Full Screen Flash Overlay */}
        <div className={`absolute inset-0 bg-white z-40 mix-blend-overlay transition-opacity duration-300 ${phase === 'FLASH' ? 'opacity-60' : 'opacity-0'}`}></div>

        <style>{`
            @keyframes gradient-x {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            .animate-gradient-x {
                background-size: 200% 200%;
                animation: gradient-x 3s ease infinite;
            }
        `}</style>
    </div>
  );
};

export default GalaxyIntro;
