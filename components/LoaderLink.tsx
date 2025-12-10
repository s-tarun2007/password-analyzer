
import React, { useEffect, useRef } from 'react';

interface LoaderLinkProps {
  onComplete: () => void;
}

const LoaderLink: React.FC<LoaderLinkProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const stars: any[] = [];
    for(let i=0; i<400; i++) {
        stars.push({
            x: (Math.random() - 0.5) * canvas.width * 2,
            y: (Math.random() - 0.5) * canvas.height * 2,
            z: Math.random() * 2000,
            pz: 0
        });
    }

    let frameId = 0;
    let startTime = Date.now();
    const duration = 3000;

    const render = () => {
      const elapsed = Date.now() - startTime;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w/2;
      const cy = h/2;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, w, h);

      // Warp Speed Stars
      ctx.fillStyle = '#06b6d4'; // Cyan
      stars.forEach(s => {
          s.z -= 20; // Speed
          if(s.z <= 0) {
              s.z = 2000;
              s.x = (Math.random() - 0.5) * w * 2;
              s.y = (Math.random() - 0.5) * h * 2;
          }
          
          const k = 128.0 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          if (px >= 0 && px <= w && py >= 0 && py <= h) {
              const size = (1 - s.z / 2000) * 4;
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI*2);
              ctx.fill();
              
              // Trail
              if(s.pz > 0) {
                 const k_old = 128.0 / (s.z + 40);
                 const px_old = s.x * k_old + cx;
                 const py_old = s.y * k_old + cy;
                 ctx.strokeStyle = `rgba(6, 182, 212, ${1 - s.z/2000})`;
                 ctx.lineWidth = size;
                 ctx.beginPath();
                 ctx.moveTo(px, py);
                 ctx.lineTo(px_old, py_old);
                 ctx.stroke();
              }
          }
      });

      // Central Brain Pulse (Drawing simple representation)
      const pulse = Math.sin(elapsed * 0.01) * 0.2 + 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      
      // Brain Glow
      const grad = ctx.createRadialGradient(0,0, 50, 0,0, 150);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0,0, 150, 0, Math.PI*2);
      ctx.fill();

      // Brain Circle
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0,0, 60, 0, Math.PI*2);
      ctx.stroke();
      
      // Nodes
      for(let i=0; i<8; i++) {
         const a = (elapsed * 0.002) + (i/8)*Math.PI*2;
         const nx = Math.cos(a) * 60;
         const ny = Math.sin(a) * 60;
         ctx.beginPath();
         ctx.arc(nx, ny, 5, 0, Math.PI*2);
         ctx.fillStyle = '#fff';
         ctx.fill();
         ctx.beginPath();
         ctx.moveTo(0,0);
         ctx.lineTo(nx, ny);
         ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
         ctx.stroke();
      }

      ctx.restore();

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
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="relative z-10 mt-64 text-cyan-400 font-mono tracking-widest bg-black/50 px-4 py-2 rounded">
             NEURAL VERIFICATION...
        </div>
    </div>
  );
};

export default LoaderLink;
