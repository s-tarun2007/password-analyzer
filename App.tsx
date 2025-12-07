import React, { useState, useEffect } from 'react';
import { AnalysisState, AIAnalysisResult, TerminalLine, BoostSuggestions, SavedPasswordEntry } from './types';
import { analyzePasswordRisk, boostPassword, getBoostSuggestions } from './services/geminiService';
import TerminalLog from './components/TerminalLog';
import CyberButton from './components/CyberButton';
import ResultsDashboard from './components/ResultsDashboard';
import PasswordVault from './components/PasswordVault';

const App: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [logs, setLogs] = useState<TerminalLine[]>([]);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [isBoosting, setIsBoosting] = useState(false);
  
  // Vault State
  const [savedPasswords, setSavedPasswords] = useState<SavedPasswordEntry[]>([]);
  const [deletedPasswords, setDeletedPasswords] = useState<SavedPasswordEntry[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  const addLog = (text: string, type: TerminalLine['type'] = 'info') => {
    const newLog: TerminalLine = {
      id: Math.random().toString(36).substring(7),
      text,
      type,
      timestamp: new Date().toISOString().split('T')[1].slice(0, 12)
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    addLog("System initialized.", "success");
    addLog("Waiting for target input...", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSimulationLogs = async () => {
    // UPDATED: More specific "hacking" simulation steps
    const steps = [
      { msg: "Connecting to neural analysis engine...", delay: 200, type: 'info' },
      { msg: "Simulating: DICTIONARY ATTACK Vectors...", delay: 300, type: 'info' },
      { msg: "Simulating: RAINBOW TABLE Lookups...", delay: 300, type: 'info' },
      { msg: "Simulating: SOCIAL ENGINEERING Patterns...", delay: 300, type: 'warning' },
      { msg: "Simulating: BRUTE FORCE Permutations...", delay: 400, type: 'info' },
      { msg: "Simulating: MASK ATTACK Combinations...", delay: 300, type: 'info' },
      { msg: "Aggregating vulnerability data...", delay: 300, type: 'success' }
    ] as const;

    for (const step of steps) {
      await new Promise(r => setTimeout(r, step.delay));
      addLog(step.msg, step.type as TerminalLine['type']);
    }
  };

  const handleAnalyze = async (passwordToAnalyze?: string, keepLogs = false) => {
    const targetPassword = passwordToAnalyze || password;

    if (!targetPassword) {
        addLog("Input empty. Aborting.", "error");
        return;
    }

    setState(AnalysisState.SCANNING);
    setResult(null);
    if (!keepLogs) setLogs([]); 
    else addLog("--- RE-EVALUATING NEW TARGET ---", "info");
    
    // Start simulation logs in background
    const logPromise = runSimulationLogs();
    
    // Start actual AI analysis
    try {
        const analysisPromise = analyzePasswordRisk(targetPassword);
        
        // Wait for both
        const [_, analysisResult] = await Promise.all([logPromise, analysisPromise]);
        
        setResult(analysisResult);
        
        // LOG THE CONFIRMED ATTACK VECTORS
        if (analysisResult.attackVectors && analysisResult.attackVectors.length > 0) {
            addLog(">> THREAT_VECTOR_ANALYSIS_REPORT:", "warning");
            for (const vector of analysisResult.attackVectors) {
                 // Add a tiny delay between vector logs if desired, or just log them
                 addLog(`>> VULNERABILITY CONFIRMED: ${vector}`, "error");
            }
        }
        
        addLog("Analysis complete. Rendering dashboard.", "success");
        setState(AnalysisState.COMPLETE);

    } catch (error) {
        console.error(error);
        addLog("Connection to AI Core failed.", "error");
        setState(AnalysisState.ERROR);
    }
  };

  const handleBoostAuto = async () => {
    if (!password) return;

    setIsBoosting(true);
    addLog("Initiating AUTO-BOOST protocol...", "info");
    addLog("Analyzing base patterns for fortification...", "info");

    try {
        const boostResult = await boostPassword(password);
        
        addLog(`Optimization Success: ${boostResult.explanation}`, "success");
        addLog("Applying fortified credentials...", "success");
        
        // Update password and immediately re-scan
        setPassword(boostResult.boostedPassword);
        await handleAnalyze(boostResult.boostedPassword, true);

    } catch (error) {
        addLog("Enhancement algorithm failed. Try again.", "error");
    } finally {
        setIsBoosting(false);
    }
  };

  const handleGetBoostSuggestions = async (): Promise<BoostSuggestions> => {
    addLog("Initiating TACTICAL-BUILDER protocol...", "info");
    addLog("Scanning for injection points and mutators...", "info");
    try {
      const suggestions = await getBoostSuggestions(password);
      addLog(`Found ${suggestions.suggestedSymbols.length} viable symbol injections.`, "success");
      addLog(`Found ${suggestions.leetspeak.length} mutator patterns.`, "success");
      return suggestions;
    } catch (e) {
      addLog("Failed to fetch suggestions.", "error");
      throw e;
    }
  };

  const handleCommitManual = async (newPassword: string) => {
    addLog("Manual configuration committed.", "success");
    setPassword(newPassword);
    await handleAnalyze(newPassword, true);
  };

  const handleSavePassword = () => {
    if (!password) return;
    
    // Check duplicates
    if (savedPasswords.some(p => p.password === password)) {
      addLog("Credential already exists in vault.", "warning");
      setIsVaultOpen(true);
      return;
    }

    const newEntry: SavedPasswordEntry = {
      id: Math.random().toString(36).substring(2),
      password: password,
      savedAt: new Date().toLocaleString(),
      score: result?.score || 0 // Store current score
    };

    setSavedPasswords(prev => [newEntry, ...prev]);
    addLog("Credential archived to secure vault.", "success");
    setIsVaultOpen(true);
  };

  const handleDeletePassword = (id: string) => {
    const item = savedPasswords.find(p => p.id === id);
    if (item) {
        setDeletedPasswords(prev => [item, ...prev]);
        setSavedPasswords(prev => prev.filter(entry => entry.id !== id));
        addLog("Credential moved to recycle bin.", "warning");
    }
  };

  const handleRestorePassword = (id: string) => {
      const item = deletedPasswords.find(p => p.id === id);
      if (item) {
          setSavedPasswords(prev => [item, ...prev]);
          setDeletedPasswords(prev => prev.filter(entry => entry.id !== id));
          addLog("Credential restored from recycle bin.", "success");
      }
  };

  const handlePermanentDelete = (id: string) => {
      setDeletedPasswords(prev => prev.filter(entry => entry.id !== id));
      addLog("Credential permanently shredded from system.", "error");
  };

  const handleCopyFromVault = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    
    // Update last accessed time
    setSavedPasswords(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, lastAccessedAt: new Date().toLocaleTimeString() }
        : entry
    ));
    
    addLog(`Credential [${id.substring(0,4)}...] copied to clipboard.`, "info");
  };

  const handleReset = () => {
    setState(AnalysisState.IDLE);
    setResult(null);
    setPassword('');
    setLogs([]);
    addLog("System reset. Ready.", "info");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start relative z-10 max-w-6xl mx-auto">
      
      {/* Header */}
      <header className="w-full border-b border-green-500/30 pb-4 mb-8 flex flex-wrap gap-4 justify-between items-end">
        <div>
           <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-white glow-text mb-1">
             PASSWORD STRENGTH <span className="text-green-500">PROBLEM</span>
           </h1>
           <p className="text-xs md:text-sm text-green-500/60 uppercase tracking-widest">
             AI-Powered Realtime Risk Detection Platform
           </p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Save Button - Only visible when analysis complete */}
            {state === AnalysisState.COMPLETE && password && (
              <button 
                onClick={handleSavePassword}
                className="animate-flash-once transform-gpu px-4 py-2 bg-green-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_8px_rgba(34,197,94,0.3)] rounded-lg"
              >
                💾 SAVE RESULT
              </button>
            )}

            {/* Vault Toggle */}
            <button 
                onClick={() => setIsVaultOpen(true)}
                className="px-4 py-2 bg-slate-900 border border-green-500/50 text-green-500 text-xs uppercase tracking-widest hover:bg-green-500/10 transition-colors flex items-center gap-2 rounded-lg"
            >
                <span>📂 VAULT</span>
                {savedPasswords.length > 0 && (
                    <span className="bg-green-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {savedPasswords.length}
                    </span>
                )}
            </button>

            <div className="text-right hidden md:block border-l border-green-500/20 pl-4">
                <div className="text-xs text-green-900 bg-green-500/10 px-2 py-1 border border-green-900 mb-1 rounded-sm">
                    SECURE_CONNECTION: ENCRYPTED
                </div>
                <div className="text-[10px] text-gray-500 text-right">
                    VER: 2.6.0-DELTA
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex flex-col gap-6">
        
        {/* Input Section */}
        <section className="w-full bg-slate-900/30 border border-green-500/20 p-6 md:p-10 relative box-glow rounded-2xl">
            <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] text-green-900">ID: INPUT_MODULE_01</div>

            <div className="flex flex-col gap-4">
                <label className="text-green-400 text-sm uppercase font-bold tracking-wider">
                    Target Password Input
                </label>
                <div className="relative group">
                    <input
                        type={isVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={state === AnalysisState.SCANNING || isBoosting}
                        className="w-full bg-black/50 border-2 border-green-900 text-white p-4 pr-16 text-lg md:text-xl font-mono focus:border-green-500 focus:outline-none focus:bg-black/70 transition-all placeholder-green-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                        placeholder="ENTER_PASSWORD_SEQUENCE..."
                    />
                     <button
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-500 transition-colors uppercase text-xs font-bold"
                    >
                        {isVisible ? 'HIDE' : 'SHOW'}
                    </button>
                </div>
                
                <div className="flex gap-4 mt-2">
                    <CyberButton 
                        onClick={() => handleAnalyze()} 
                        disabled={!password || state === AnalysisState.SCANNING || isBoosting}
                        className="flex-1 md:flex-none"
                    >
                        {state === AnalysisState.SCANNING ? 'SCANNING...' : 'INITIATE DEEP SCAN'}
                    </CyberButton>
                    
                    {state === AnalysisState.COMPLETE && (
                         <CyberButton 
                            onClick={handleReset} 
                            variant="secondary"
                            className="flex-1 md:flex-none"
                            disabled={isBoosting}
                        >
                            RESET TARGET
                        </CyberButton>
                    )}
                </div>
            </div>
        </section>

        {/* Terminal & Results Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Terminal Panel */}
            <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider">Operation Log</div>
                <TerminalLog logs={logs} />
            </div>

            {/* Analysis Results Area */}
            <div className="lg:col-span-2 order-1 lg:order-2">
                 {state === AnalysisState.IDLE && (
                    <div className="h-64 flex flex-col items-center justify-center border border-dashed border-green-900/50 bg-slate-950/30 text-green-900 rounded-2xl">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="uppercase tracking-widest text-sm">Awaiting Input Data</p>
                    </div>
                 )}
                 
                 {state === AnalysisState.SCANNING && (
                     <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-green-500/20 bg-black/40 relative overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                        <div className="w-full h-1 bg-green-500 absolute top-0 animate-[loading_2s_ease-in-out_infinite]"></div>
                        
                        <div className="text-4xl font-bold text-green-500 mb-2 animate-bounce">PROCESSING</div>
                        <div className="text-xs text-green-400 font-mono">Decryption algorithms running...</div>
                        
                        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="absolute text-green-500 text-xs" style={{ 
                                    left: `${i * 10}%`, 
                                    top: '-20px',
                                    animation: `fall ${Math.random() * 2 + 1}s linear infinite` 
                                }}>
                                    {Math.random().toString(36).substring(2, 10)}
                                </div>
                            ))}
                        </div>
                     </div>
                 )}

                 {state === AnalysisState.COMPLETE && result && (
                     <ResultsDashboard 
                        result={result} 
                        onBoostAuto={handleBoostAuto}
                        onBoostManual={handleGetBoostSuggestions}
                        onCommitManual={handleCommitManual}
                        isBoosting={isBoosting}
                        currentPassword={password}
                    />
                 )}
            </div>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="w-full mt-12 border-t border-green-900/30 pt-4 text-center">
        <p className="text-[10px] text-gray-600">
            DISCLAIMER: This tool is for educational purposes only. Do not enter real passwords you use in production environments. 
            Analysis is performed by AI and simulations.
        </p>
      </footer>

      {/* Vault Drawer */}
      <PasswordVault 
        isOpen={isVaultOpen} 
        onClose={() => setIsVaultOpen(false)} 
        savedPasswords={savedPasswords}
        deletedPasswords={deletedPasswords}
        onCopy={handleCopyFromVault}
        onDelete={handleDeletePassword}
        onRestore={handleRestorePassword}
        onPermanentDelete={handlePermanentDelete}
      />
      
      <style>{`
        @keyframes loading {
            0% { width: 0; left: 0; }
            50% { width: 100%; left: 0; }
            100% { width: 0; left: 100%; }
        }
        @keyframes fall {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default App;