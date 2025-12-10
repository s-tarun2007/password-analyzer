
import React, { useState } from 'react';
import CyberButton from '../CyberButton';

interface BiometricScannerProps {
  onScanComplete: (hash: string) => void;
}

const BiometricScanner: React.FC<BiometricScannerProps> = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [method, setMethod] = useState<'simulation' | 'device' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fallback Simulation for devices without WebAuthn or if user chooses manual
  const handleSimulationScan = () => {
    if (scanning) return;
    setMethod('simulation');
    setScanning(true);
    setProgress(0);

    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setScanning(false);
                    const bioHash = `BIO-PRNT-SIM-X${Math.floor(Math.random()*9999)}-${Date.now().toString().slice(-6)}`;
                    onScanComplete(bioHash);
                }, 500);
                return 100;
            }
            return prev + 2;
        });
    }, 50);
  };

  // Real Device Authentication using WebAuthn (TouchID/FaceID)
  const handleDeviceAuth = async () => {
      setMethod('device');
      setError(null);
      setScanning(true);
      
      if (!window.PublicKeyCredential) {
          setError("DEVICE_NOT_SUPPORTED");
          setScanning(false);
          return;
      }

      try {
          // We use 'create' to generate a new credential which acts as our unique "password"
          // In a real app, this would register a passkey. Here we use the ID as a high-entropy string.
          const publicKey: PublicKeyCredentialCreationOptions = {
            challenge: new Uint8Array(32), // Random challenge
            rp: {
                name: "Password Strength Problem AI",
                id: window.location.hostname
            },
            user: {
                id: new Uint8Array(16),
                name: "user@secure.local",
                displayName: "Authorized User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
            authenticatorSelection: {
                authenticatorAttachment: "platform", // Forces built-in sensor (TouchID/FaceID)
                userVerification: "required"
            },
            timeout: 60000,
            attestation: "none"
          };

          const credential = await navigator.credentials.create({ publicKey }) as any;
          
          if (credential) {
              // Convert the raw ID to a Base64 string to use as the password
              // Note: We use the ID because it's deterministic for the credential pair
              const rawId = credential.id; 
              const bioHash = `BIO-AUTH-DEVICE-${rawId.substring(0, 32).toUpperCase()}`;
              setScanning(false);
              onScanComplete(bioHash);
          }
      } catch (err: any) {
          console.error(err);
          setScanning(false);
          // Common error handling
          if (err.name === 'NotAllowedError') {
              setError("USER_CANCELLED_OR_TIMEOUT");
          } else if (err.name === 'NotSupportedError') {
               setError("AUTHENTICATOR_NOT_FOUND");
          } else {
              setError("BIOMETRIC_AUTH_FAILED");
          }
      }
  };

  return (
    <div className="h-64 w-full bg-slate-950 rounded-xl border border-green-500/30 flex flex-col items-center justify-center relative overflow-hidden p-4">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        {error && (
            <div className="absolute top-2 left-0 w-full text-center z-20">
                <span className="bg-red-900/80 text-red-400 text-[10px] px-2 py-1 rounded border border-red-500">
                    ERROR: {error}
                </span>
            </div>
        )}

        {!scanning && (
            <div className="z-10 flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                <div className="text-center">
                    <p className="text-green-500 font-bold uppercase tracking-widest text-sm mb-1">Select Scan Method</p>
                    <p className="text-green-900 text-[10px] font-mono">Use device hardware or run simulation</p>
                </div>
                
                <div className="flex gap-4">
                    <CyberButton 
                        onClick={handleDeviceAuth} 
                        className="shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    >
                        <span className="text-lg mr-2">🔒</span> DEVICE SENSOR
                    </CyberButton>
                    
                    <button 
                        onClick={handleSimulationScan}
                        className="px-4 py-2 border border-green-500/30 text-green-500/60 text-xs hover:text-green-400 hover:border-green-500 rounded uppercase tracking-wider"
                    >
                        Run Simulation
                    </button>
                </div>
            </div>
        )}

        {/* Simulation View */}
        {scanning && method === 'simulation' && (
            <div className="z-10 flex flex-col items-center">
                 <div className="relative group cursor-wait">
                    <svg className="w-24 h-24 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C9.5 2 7.2 3.1 5.6 5L7 6.4C8.3 4.9 10 4 12 4C16.4 4 20 7.6 20 12C20 13.4 19.6 14.8 18.9 16L20.6 17.1C21.5 15.6 22 13.9 22 12C22 6.5 17.5 2 12 2M12 22C16.1 22 19.7 19.6 21.3 16.1L19.5 15.2C18.4 17.9 15.5 19.9 12.1 20C8.5 20.1 5.3 17.6 4.6 14.1L2.6 14.5C3.6 18.9 7.5 22.1 12 22M5.6 19L7 17.6C5.6 16.2 4.6 14.3 4.3 12.2L2.3 12.5C2.7 15.1 3.9 17.4 5.6 19M10.8 11.5C10.8 12.1 11.3 12.6 11.9 12.6C12.5 12.6 13 12.1 13 11.5C13 10.9 12.5 10.4 11.9 10.4C11.3 10.4 10.8 10.9 10.8 11.5M13.5 16.2C14.7 15.6 15.6 14.4 15.8 13H17.8C17.5 15.4 15.9 17.3 13.9 18.1L13.5 16.2Z" />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(34,197,94,1)] animate-[scan_1s_linear_infinite]"></div>
                    <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-50"></div>
                </div>
                <div className="mt-4 w-48 h-1 bg-green-900 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-green-400 font-mono mt-2">SIMULATING SCAN... {progress}%</span>
            </div>
        )}

        {/* Device Auth View */}
        {scanning && method === 'device' && (
             <div className="z-10 flex flex-col items-center animate-pulse">
                <div className="w-20 h-20 rounded-full border-4 border-green-500 border-t-transparent animate-spin mb-4"></div>
                <p className="text-green-400 font-bold uppercase tracking-widest text-sm">Waiting for Device...</p>
                <p className="text-green-600 text-[10px] font-mono mt-1">Please verify identity on your sensor</p>
             </div>
        )}
    </div>
  );
};

export default BiometricScanner;
