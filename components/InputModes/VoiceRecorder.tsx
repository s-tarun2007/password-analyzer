import React, { useEffect, useRef, useState } from 'react';
import CyberButton from '../CyberButton';

interface VoiceRecorderProps {
  onRecordingComplete: (hash: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number>(0);
  
  // Hash Accumulator
  const audioFingerprintRef = useRef<number[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracks();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationIdRef.current);
    };
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;
      audioFingerprintRef.current = []; // Reset fingerprint
      
      setIsRecording(true);
      setError(null);
      draw();

      // Record for 3 seconds then stop
      setTimeout(() => {
         stopRecording();
      }, 3000);

    } catch (err) {
      console.error(err);
      setError("MICROPHONE_ACCESS_DENIED. CHECK PERMISSIONS.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    cancelAnimationFrame(animationIdRef.current);
    
    stopTracks();
    
    if (audioContextRef.current) {
        audioContextRef.current.close();
    }

    // Generate Hash from Audio Fingerprint
    const fingerprint = audioFingerprintRef.current;
    if (fingerprint.length > 0) {
        // Simple hashing of the accumulated frequency data
        let hashVal = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            hashVal = ((hashVal << 5) - hashVal) + fingerprint[i];
            hashVal |= 0; // Convert to 32bit integer
        }
        
        // Create a complex string based on the hash
        const rawHex = Math.abs(hashVal).toString(16).toUpperCase();
        const complexHash = `VOICE-AUTH-${rawHex}-${fingerprint.length}Smp-HZ${fingerprint[10] || 0}`;
        onRecordingComplete(complexHash);
    } else {
        // Fallback if no audio detected or immediate error
        const randomFreq = Math.floor(Math.random() * 9000) + 1000;
        onRecordingComplete(`VOICE-AUTH-SILENCE-${randomFreq}`);
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    animationIdRef.current = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    
    // Collect data points for hashing (every 10th frame roughly to save memory, or take average)
    // We just take the loudest frequency bin of this frame
    let maxVal = 0;
    for(let i=0; i<dataArray.length; i++) {
        if(dataArray[i] > maxVal) maxVal = dataArray[i];
    }
    audioFingerprintRef.current.push(maxVal);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Fade effect
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = dataArray[i];
      
      // Dynamic Green to Blue gradient
      const r = 0;
      const g = 255 - (i / dataArray.length) * 100;
      const b = (i / dataArray.length) * 255;
      
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, height - barHeight / 1.5, barWidth, barHeight / 1.5); // Scaled down height

      x += barWidth + 1;
    }
  };

  return (
    <div className="relative h-64 w-full bg-slate-950 rounded-xl overflow-hidden border border-green-500/30 flex flex-col items-center justify-center gap-4">
       {error ? (
           <div className="text-red-500 font-mono text-center px-4">
               <div className="text-2xl mb-2">🔇</div>
               {error}
               <CyberButton onClick={startRecording} variant="danger" className="mt-4">
                   RETRY PERMISSIONS
               </CyberButton>
           </div>
       ) : (
           <>
                <div className="absolute top-4 left-4 text-[10px] text-green-500 font-mono uppercase">
                    {isRecording ? '● REC_ACTIVE: ANALYZING WAVEFORM' : '○ MIC_STANDBY'}
                </div>
                
                <canvas 
                    ref={canvasRef} 
                    width={600} 
                    height={200} 
                    className="w-full h-full absolute inset-0 opacity-50"
                />

                <div className="z-10 text-center">
                    {!isRecording ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                             <div className="text-green-500 text-4xl mb-4 opacity-80">🎙</div>
                             <CyberButton onClick={startRecording} className="shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                RECORD VOICE KEY
                             </CyberButton>
                             <p className="text-[10px] text-green-900 mt-2 font-mono">Speak a phrase to generate a unique key.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                                 <div className="w-8 h-8 bg-green-400 rounded-full"></div>
                             </div>
                             <p className="text-green-400 font-mono text-xs mt-2">ENCODING AUDIO DATA...</p>
                        </div>
                    )}
                </div>
           </>
       )}
    </div>
  );
};

export default VoiceRecorder;
