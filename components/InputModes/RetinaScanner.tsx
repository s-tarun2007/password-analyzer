
import React, { useEffect, useRef, useState } from 'react';
import CyberButton from '../CyberButton';

interface RetinaScannerProps {
  onScanComplete: (hash: string) => void;
}

const RetinaScanner: React.FC<RetinaScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Hidden canvas for processing
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      // Prefer front-facing camera for mobile
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
      });
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
      setIsComplete(false);
    } catch (err) {
      console.error(err);
      setError("CAMERA ACCESS DENIED. CHECK PERMISSIONS.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const processFrame = () => {
      if (!videoRef.current || !canvasRef.current) return "ERROR";
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return "ERROR";

      // Draw current video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract center pixel data (simulate iris scan area)
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const frameData = ctx.getImageData(centerX - 50, centerY - 50, 100, 100); // 100x100 box
      
      // Generate Hash from pixel data
      let hash = 0;
      for (let i = 0; i < frameData.data.length; i += 4) { // Sample R,G,B,A
          hash = ((hash << 5) - hash) + frameData.data[i];
          hash |= 0;
      }
      
      return `RETINA-ID:${Math.abs(hash).toString(16)}-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleScan = () => {
    setScanning(true);
    
    // Wait a moment for "scanning" effect, then capture
    setTimeout(() => {
      const generatedHash = processFrame();
      
      // Stop Camera immediately after capture
      stopCamera();
      
      setScanning(false);
      setIsComplete(true);
      onScanComplete(generatedHash);
    }, 2500);
  };

  // Error State
  if (error) {
    return (
      <div className="h-64 bg-black border border-red-500/50 flex flex-col items-center justify-center text-red-500 p-4 rounded-xl">
        <span className="text-4xl mb-2">⚠️</span>
        <p className="font-mono text-center text-sm mb-4">{error}</p>
        <CyberButton onClick={startCamera} variant="danger">RETRY PERMISSION</CyberButton>
      </div>
    );
  }

  // Success State
  if (isComplete) {
    return (
        <div className="h-96 w-full bg-slate-950 rounded-xl overflow-hidden border-2 border-green-500 flex flex-col items-center justify-center relative animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="w-32 h-32 rounded-full border-4 border-green-500 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.5)] z-10">
                <span className="text-4xl">👁️</span>
            </div>
            <h3 className="text-green-500 font-bold text-xl mt-6 tracking-widest uppercase z-10">Identity Verified</h3>
            <p className="text-green-500/60 font-mono text-xs mt-2 z-10">OPTICAL FEED TERMINATED</p>
        </div>
    );
  }

  // Initial Standby State (Before Permission Request)
  if (!cameraActive) {
      return (
        <div className="h-96 w-full bg-black rounded-xl overflow-hidden border border-green-500/30 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black"></div>
            
            {/* HUD Elements */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-green-500/50"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-green-500/50"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-green-500/50"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-green-500/50"></div>

            <div className="z-10 text-center space-y-4">
                <div className="text-6xl grayscale opacity-30">📷</div>
                <h3 className="text-green-500 font-bold tracking-widest uppercase">Optical Sensor Standby</h3>
                <p className="text-green-900 text-xs font-mono max-w-xs mx-auto">
                    Initialize camera uplink to proceed with retinal identification. Permission required.
                </p>
                <CyberButton onClick={startCamera} className="mt-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    INITIALIZE SENSOR
                </CyberButton>
            </div>
        </div>
      );
  }

  // Active Camera State
  return (
    <div className="relative h-96 w-full bg-black rounded-xl overflow-hidden border-2 border-green-500/30 group animate-in fade-in duration-700">
      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-full object-cover opacity-60 transition-opacity duration-300 ${scanning ? 'opacity-100' : ''}`}
      />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-green-500"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-green-500"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-green-500"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-green-500"></div>

        {/* Center Target */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${scanning ? 'scale-90' : 'scale-110'}`}>
           <div className={`w-32 h-32 rounded-full border-2 border-dashed border-green-400 flex items-center justify-center ${scanning ? 'animate-spin' : ''}`}>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
           </div>
           {scanning && (
             <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"></div>
           )}
        </div>

        {/* Scanning Line */}
        {scanning && (
            <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_20px_rgba(34,197,94,1)] animate-[scan_2s_linear_infinite]"></div>
        )}

        {/* Status Text */}
        <div className="absolute bottom-8 left-0 w-full text-center">
             <span className={`px-3 py-1 bg-black/80 border border-green-500 text-green-400 font-mono text-xs uppercase ${scanning ? 'animate-pulse' : ''}`}>
                 {scanning ? 'CAPTURING BIOMETRIC FRAME...' : 'ALIGN EYES WITH TARGET'}
             </span>
        </div>
      </div>

      {!scanning && (
          <div className="absolute bottom-8 right-8 pointer-events-auto">
              <CyberButton onClick={handleScan} className="shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                 INITIATE SCAN
              </CyberButton>
          </div>
      )}

      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RetinaScanner;
