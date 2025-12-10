
import React, { useState, useEffect } from 'react';
import CyberButton from './CyberButton';

interface SecurityGateProps {
  onUnlock: (role?: 'admin' | 'user') => void;
  isLocked: boolean;
}

type GateState = 'SETUP' | 'LOCKED' | 'RECOVERY_INPUT' | 'RECOVERY_OTP' | 'RECOVERY_RESET' | 'HELPLINE';

const SecurityGate: React.FC<SecurityGateProps> = ({ onUnlock, isLocked }) => {
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState(false);
  const [gateState, setGateState] = useState<GateState>('LOCKED');
  
  // Recovery State
  const [contactInfo, setContactInfo] = useState({ email: '', mobile: '' });
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [simulatedNotification, setSimulatedNotification] = useState<{msg: string, source: 'WA' | 'EMAIL'} | null>(null);

  // Check local storage for existing master key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('SYSTEM_MASTER_KEY');
    if (storedKey) {
      setMasterKey(storedKey);
      setGateState('LOCKED');
    } else {
      setGateState('SETUP');
    }
  }, []);

  const handleSetup = () => {
    if (inputKey.length < 4) {
      setError(true);
      return;
    }
    localStorage.setItem('SYSTEM_MASTER_KEY', inputKey);
    setMasterKey(inputKey);
    setGateState('LOCKED');
    setInputKey("");
    setError(false);
    onUnlock('admin'); // Auto unlock after setup
  };

  const handleUnlock = () => {
    // 1. Check Master Admin Key
    if (inputKey === masterKey) {
      setInputKey("");
      setError(false);
      onUnlock('admin');
      return;
    } 
    
    // 2. Check Sub-User Keys
    const subKeysRaw = localStorage.getItem('SYSTEM_SUB_KEYS');
    const subKeys: string[] = subKeysRaw ? JSON.parse(subKeysRaw) : [];
    
    if (subKeys.includes(inputKey)) {
        setInputKey("");
        setError(false);
        onUnlock('user');
        return;
    }

    // 3. Failed
    setError(true);
    setTimeout(() => setError(false), 1000);
    setInputKey("");
  };

  const handleSendOtp = (method: 'WA' | 'EMAIL') => {
      if(!contactInfo.mobile || !contactInfo.email) {
          setError(true);
          setTimeout(() => setError(false), 1000);
          return;
      }

      // Generate a random 6-digit code
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setGateState('RECOVERY_OTP');
      
      // SIMULATE SENDING MESSAGE
      setTimeout(() => {
          const message = method === 'WA' 
            ? `WhatsApp Secure Msg: Your Recovery Code is ${newOtp}` 
            : `Email Subject: Recovery Protocol. Code: ${newOtp}`;
            
          setSimulatedNotification({ msg: message, source: method });
          
          // Hide notification after 8 seconds
          setTimeout(() => setSimulatedNotification(null), 8000);
      }, 1500);
  };

  const handleVerifyOtp = () => {
      if (otp === generatedOtp) {
          setGateState('RECOVERY_RESET');
          setOtp("");
          setGeneratedOtp(null);
      } else {
          setError(true);
          setTimeout(() => setError(false), 1000);
      }
  };

  const handleResetKey = () => {
      if (inputKey.length < 4) {
          setError(true);
          return;
      }
      localStorage.setItem('SYSTEM_MASTER_KEY', inputKey);
      setMasterKey(inputKey);
      setInputKey("");
      setGateState('LOCKED'); // Go back to lock screen so they can try new key
      setSimulatedNotification({ msg: "System: Access Code Updated Successfully", source: 'EMAIL' });
      setTimeout(() => setSimulatedNotification(null), 3000);
  };

  // If not locked and setup is done, render nothing
  if (!isLocked && gateState !== 'SETUP') return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background & Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:40px_40px] animate-[pulse_4s_ease-in-out_infinite]"></div>
      </div>

      {/* SIMULATED PHONE NOTIFICATION */}
      {simulatedNotification && (
          <div className="fixed top-4 right-4 bg-white text-black p-4 rounded-xl shadow-2xl z-[200] max-w-sm animate-in slide-in-from-right duration-500 border-l-4 border-green-500 font-sans">
              <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{simulatedNotification.source === 'WA' ? '💬' : '📧'}</span>
                  <span className="font-bold text-sm uppercase text-gray-600">
                      {simulatedNotification.source === 'WA' ? 'WhatsApp • Now' : 'MailClient • Now'}
                  </span>
              </div>
              <p className="font-medium text-sm">{simulatedNotification.msg}</p>
              <p className="text-[10px] text-gray-400 mt-1">Simulated Notification</p>
          </div>
      )}

      <div className="relative z-10 max-w-md w-full bg-black/90 border border-green-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] box-glow backdrop-blur-xl">
        
        {/* -- ICONS -- */}
        <div className="flex justify-center mb-6">
           <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${error ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
              <span className="text-4xl">
                  {gateState === 'SETUP' && '⚙️'}
                  {gateState === 'LOCKED' && '🔒'}
                  {gateState === 'HELPLINE' && '📞'}
                  {(gateState === 'RECOVERY_INPUT' || gateState === 'RECOVERY_OTP') && '🔄'}
                  {gateState === 'RECOVERY_RESET' && '📝'}
              </span>
           </div>
        </div>

        {/* -- HEADERS -- */}
        <h2 className={`text-2xl font-bold text-center mb-2 tracking-widest uppercase ${error ? 'text-red-500' : 'text-white'}`}>
          {error && 'ERROR: INVALID INPUT'}
          {!error && gateState === 'SETUP' && 'INITIALIZE SYSTEM'}
          {!error && gateState === 'LOCKED' && 'SECURITY LOCKDOWN'}
          {!error && gateState === 'HELPLINE' && 'SECURE HELPLINE'}
          {!error && gateState === 'RECOVERY_INPUT' && 'IDENTITY VERIFICATION'}
          {!error && gateState === 'RECOVERY_OTP' && 'ENTER SECURE CODE'}
          {!error && gateState === 'RECOVERY_RESET' && 'NEW ACCESS KEY'}
        </h2>

        {/* -- CONTENT SWITCHER -- */}
        
        {/* 1. SETUP & LOCKED MODES */}
        {(gateState === 'SETUP' || gateState === 'LOCKED') && (
            <div className="space-y-4 animate-in fade-in">
                <p className="text-xs text-center text-gray-500 font-mono mb-8">
                    {gateState === 'SETUP' 
                        ? 'NEW USER DETECTED. Create a unique Access Key to encrypt your vault.' 
                        : 'Enter your personal Access Key to decrypt interface.'}
                </p>
                <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (gateState === 'SETUP' ? handleSetup() : handleUnlock())}
                    placeholder={gateState === 'SETUP' ? "CREATE_NEW_KEY" : "ENTER_KEY"}
                    className={`w-full bg-slate-900/50 border-2 p-4 text-center text-xl text-white font-mono tracking-[0.5em] focus:outline-none focus:bg-black transition-all rounded-lg ${error ? 'border-red-500 placeholder-red-900' : 'border-green-500/50 focus:border-green-400'}`}
                    autoFocus
                />
                
                <CyberButton 
                    onClick={gateState === 'SETUP' ? handleSetup : handleUnlock} 
                    className="w-full justify-center py-4 text-lg"
                    variant={error ? 'danger' : 'primary'}
                >
                    {gateState === 'SETUP' ? 'ESTABLISH PROTOCOL' : 'AUTHENTICATE'}
                </CyberButton>

                {gateState === 'LOCKED' && (
                    <div className="flex justify-between mt-4 text-[10px] text-green-500/60 font-mono">
                        <button onClick={() => setGateState('HELPLINE')} className="hover:text-green-400 hover:underline">
                            📞 CONTACT HELPLINE
                        </button>
                        <button onClick={() => setGateState('RECOVERY_INPUT')} className="hover:text-green-400 hover:underline">
                            🔄 FORGOT KEY?
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* 2. RECOVERY: INPUT CONTACT */}
        {gateState === 'RECOVERY_INPUT' && (
             <div className="space-y-4 animate-in fade-in">
                 <p className="text-xs text-center text-gray-500 font-mono mb-4">
                    Enter registered contact details to receive a recovery token.
                 </p>
                 <input 
                    type="email" 
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    placeholder="REGISTERED_EMAIL"
                    className="w-full bg-slate-900/50 border border-green-500/30 p-3 text-sm text-white font-mono focus:border-green-500 rounded"
                 />
                 <input 
                    type="tel" 
                    value={contactInfo.mobile}
                    onChange={(e) => setContactInfo({...contactInfo, mobile: e.target.value})}
                    placeholder="MOBILE_NUMBER"
                    className="w-full bg-slate-900/50 border border-green-500/30 p-3 text-sm text-white font-mono focus:border-green-500 rounded"
                 />

                 <div className="grid grid-cols-2 gap-3 mt-4">
                     <CyberButton onClick={() => handleSendOtp('WA')} className="text-xs">
                         VIA WHATSAPP
                     </CyberButton>
                     <CyberButton onClick={() => handleSendOtp('EMAIL')} className="text-xs">
                         VIA EMAIL
                     </CyberButton>
                 </div>
                 <button onClick={() => setGateState('LOCKED')} className="w-full text-center text-xs text-gray-500 hover:text-white mt-2">
                     CANCEL RECOVERY
                 </button>
             </div>
        )}

        {/* 3. RECOVERY: OTP VERIFY */}
        {gateState === 'RECOVERY_OTP' && (
            <div className="space-y-4 animate-in fade-in">
                <p className="text-xs text-center text-green-400 font-mono mb-4 animate-pulse">
                    PACKET SENT. CHECK YOUR DEVICE.
                </p>
                <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="ENTER_6_DIGIT_CODE"
                    className="w-full bg-slate-900/50 border-2 border-green-500/50 p-4 text-center text-2xl text-white font-mono tracking-widest focus:outline-none rounded-lg"
                />
                <CyberButton onClick={handleVerifyOtp} className="w-full justify-center">
                    VERIFY TOKEN
                </CyberButton>
                <button onClick={() => setGateState('RECOVERY_INPUT')} className="w-full text-center text-xs text-gray-500 hover:text-white mt-2">
                     RESEND CODE
                 </button>
            </div>
        )}

        {/* 4. RECOVERY: RESET */}
        {gateState === 'RECOVERY_RESET' && (
             <div className="space-y-4 animate-in fade-in">
                <p className="text-xs text-center text-green-500 font-mono mb-4">
                    IDENTITY VERIFIED. SET NEW ACCESS KEY.
                </p>
                <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="NEW_ACCESS_KEY"
                    className="w-full bg-slate-900/50 border-2 border-green-500/50 p-4 text-center text-xl text-white font-mono tracking-[0.5em] focus:outline-none rounded-lg"
                />
                <CyberButton onClick={handleResetKey} className="w-full justify-center">
                    UPDATE SECURITY PROTOCOL
                </CyberButton>
             </div>
        )}

        {/* 5. HELPLINE */}
        {gateState === 'HELPLINE' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="border border-green-500/20 bg-green-900/10 p-4 rounded text-center">
                    <p className="text-green-400 font-bold text-lg mb-1">SECURE LINE</p>
                    <p className="text-2xl text-white font-mono tracking-wider">1-800-CYBER-SEC</p>
                    <p className="text-[10px] text-gray-500 mt-2">ENCRYPTED VOICE CHANNEL • 24/7 SUPPORT</p>
                </div>
                
                <div className="text-xs text-gray-400 text-center space-y-2">
                    <p>Alternatively, email support team:</p>
                    <p className="text-green-500 font-mono">admin@security-problem.ai</p>
                </div>

                <CyberButton onClick={() => setGateState('LOCKED')} variant="secondary" className="w-full justify-center">
                    RETURN TO LOGIN
                </CyberButton>
            </div>
        )}

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
