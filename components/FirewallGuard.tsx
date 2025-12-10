
import React, { useState, useEffect } from 'react';

interface FirewallGuardProps {
  className?: string;
}

const FirewallGuard: React.FC<FirewallGuardProps> = ({ className = "" }) => {
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  const [lastThreat, setLastThreat] = useState<string>("SYSTEM_SECURE");
  const [isExpanded, setIsExpanded] = useState(false);

  // Simulation of blocking threats
  useEffect(() => {
    const threatTypes = ["Packet Sniffer", "Brute Force IP", "SQL Injection", "XSS Attempt", "MITM Attack"];
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setThreatsBlocked(prev => prev + 1);
        const randomIP = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*10)}.x`;
        const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
        setLastThreat(`BLOCKED: ${randomThreat} [${randomIP}]`);
        
        // Clear message after 2 seconds
        setTimeout(() => setLastThreat("MONITORING_NETWORK_TRAFFIC..."), 2000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transition-all duration-300 z-10 ${isExpanded ? 'w-full' : 'w-auto'} ${className}`}>
      <div 
        className="bg-slate-950/90 border border-green-500/30 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.15)] backdrop-blur-md cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Header / Minimized View */}
        <div className="p-3 flex items-center gap-3 border-b border-green-500/10">
           <div className="relative">
             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
             <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50"></div>
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-green-500 font-bold tracking-widest uppercase">
                Firewall: ACTIVE
             </span>
             {!isExpanded && (
                <span className="text-[8px] text-green-500/60 font-mono">
                    {threatsBlocked} THREATS NEUTRALIZED
                </span>
             )}
           </div>
           <div className="ml-auto text-green-500 text-xs transform transition-transform duration-300">
             {isExpanded ? '▼' : '▲'}
           </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="p-4 bg-black/40 animate-in slide-in-from-bottom-2 duration-200">
            
            {/* Layer Status */}
            <div className="space-y-2 mb-4">
                <h4 className="text-[9px] text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-1">Security Layers</h4>
                <div className="flex justify-between items-center text-[10px] text-green-400">
                    <span>1. Master Gate</span> <span className="text-green-500">● ON</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-green-400">
                    <span>2. Traffic Monitor</span> <span className="text-green-500">● ON</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-green-400">
                    <span>3. Auto-Lock</span> <span className="text-green-500">● OFF (USER)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-green-400">
                    <span>4. Privacy Veil</span> <span className="text-green-500">● ON</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-green-400">
                    <span>5. E2E Encryption</span> <span className="text-green-500">● ON</span>
                </div>
            </div>

            {/* Live Log */}
            <div className="bg-black/80 p-2 rounded border border-green-900/50 font-mono text-[9px] h-16 flex flex-col justify-end">
                <div className="text-green-500/50">sys.net.guard --verbose</div>
                <div className="text-white mt-1 break-all">{lastThreat}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirewallGuard;
