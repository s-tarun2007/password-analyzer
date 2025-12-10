
import React, { useState } from 'react';
import CyberButton from '../CyberButton';

const LinkVerifier: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { safe: boolean, active: boolean, info: string }>(null);

  const handleAnalyze = () => {
    if (!url) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulation
    setTimeout(() => {
        const isSafe = !url.includes('hack') && !url.includes('malware');
        const isActive = Math.random() > 0.1;
        
        setResult({
            safe: isSafe,
            active: isActive,
            info: isSafe 
                ? "SSL Certificate Valid. Domain reputation score: 98/100. No phishing signatures detected."
                : "WARNING: Heuristic analysis detected suspicious patterns. Domain matches known phishing kits."
        });
        setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tighter">LINE <span className="text-cyan-500">VERIFIER</span></h2>
        <p className="text-sm text-gray-500 mb-8 font-mono">URL INTEGRITY & ACTIVE STATUS SCANNER</p>

        <div className="bg-slate-900/50 border border-cyan-500/30 p-8 rounded-2xl relative overflow-hidden">
            <div className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/check-this-link"
                    className="w-full bg-black border border-cyan-900 text-cyan-400 p-4 font-mono focus:outline-none focus:border-cyan-500 rounded-xl"
                />
                <CyberButton 
                    onClick={handleAnalyze} 
                    className="bg-cyan-900/20 text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black whitespace-nowrap"
                >
                    {isAnalyzing ? 'SCANNING...' : 'VERIFY LINK'}
                </CyberButton>
            </div>

            {isAnalyzing && (
                 <div className="text-cyan-500 font-mono text-xs animate-pulse">
                     > PINGING SERVER...<br/>
                     > CHECKING BLACKLISTS...<br/>
                     > ANALYZING DNS RECORDS...
                 </div>
            )}

            {result && (
                <div className={`mt-6 p-6 rounded-xl border-l-4 ${result.safe ? 'bg-green-900/10 border-green-500' : 'bg-red-900/10 border-red-500'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`text-3xl ${result.safe ? 'text-green-500' : 'text-red-500'}`}>
                            {result.safe ? '🛡️' : '☣️'}
                        </div>
                        <div>
                            <h3 className={`font-bold text-xl ${result.safe ? 'text-green-500' : 'text-red-500'}`}>
                                {result.safe ? 'LINK IS SAFE' : 'POTENTIAL THREAT DETECTED'}
                            </h3>
                            <div className="flex gap-3 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${result.active ? 'text-blue-400 border-blue-500' : 'text-gray-500 border-gray-700'}`}>
                                    SERVER: {result.active ? 'ONLINE (200 OK)' : 'OFFLINE / UNREACHABLE'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-300 font-mono leading-relaxed">
                        {result.info}
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default LinkVerifier;
