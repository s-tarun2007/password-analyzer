import React, { useState, useEffect } from 'react';
import CyberButton from './CyberButton';

interface SecurityGateProps {
  onUnlock: () => void;
  isLocked: boolean;
}

const SecurityGate: React.FC<SecurityGateProps> = ({ onUnlock, isLocked }) => {
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(true);

  // Check local storage for existing master key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('SYSTEM_MASTER_KEY');
    if (storedKey) {
      setMasterKey(storedKey);
      setIsSetupMode(false);
    }
  }, []);

  const handleSetup = () => {
    if (inputKey.length < 4) {
      setError(true);
      return;
    }
    localStorage.setItem('SYSTEM_MASTER_KEY', inputKey);
    setMasterKey(inputKey);
    setIsSetupMode(false);
    setInputKey("");
    setError(false);
    onUnlock();
  };

  const handleUnlock = () => {
    if (inputKey === masterKey) {
      setInputKey("");
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setInputKey("");
    }
  };

  // If not locked, render nothing (pass through happens in App, but this component controls the overlay)
  if (!isLocked && !isSetupMode) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         {/* Background Grid Animation */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_4s_ease-in-out_infinite]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full bg-black/80 border border-green-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] box-glow">
        <div className="flex justify-center mb-6">
           <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${error ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
              <span className="text-4xl">{isSetupMode ? '⚙️' : '🔒'}</span>
           </div>
        </div>

        <h2 className={`text-2xl font-bold text-center mb-2 tracking-widest uppercase ${error ? 'text-red-500' : 'text-white'}`}>
          {error ? 'ACCESS DENIED' : (isSetupMode ? 'INITIALIZE SYSTEM' : 'SECURITY LOCKDOWN')}
        </h2>
        
        <p className="text-xs text-center text-gray-500 font-mono mb-8">
          {isSetupMode 
            ? 'LAYER 1 SECURITY: Create a Master Key to encrypt your session.' 
            : 'Enter Master Key to decrypt interface.'}
        </p>

        <div className="space-y-4">
          <input 
            type="password" 
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (isSetupMode ? handleSetup() : handleUnlock())}
            placeholder={isSetupMode ? "CREATE_MASTER_KEY" : "ENTER_ACCESS_CODE"}
            className={`w-full bg-slate-900/50 border-2 p-4 text-center text-xl text-white font-mono tracking-[0.5em] focus:outline-none focus:bg-black transition-all rounded-lg ${error ? 'border-red-500 placeholder-red-900' : 'border-green-500/50 focus:border-green-400'}`}
            autoFocus
          />
          
          <CyberButton 
            onClick={isSetupMode ? handleSetup : handleUnlock} 
            className="w-full justify-center py-4 text-lg"
            variant={error ? 'danger' : 'primary'}
          >
            {isSetupMode ? 'ESTABLISH PROTOCOL' : 'AUTHENTICATE'}
          </CyberButton>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                Protected by 5-Layer End-to-End Security
            </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityGate;