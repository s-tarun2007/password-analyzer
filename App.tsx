import React, { useState, useEffect, useRef, memo } from 'react';
import { AnalysisState, AIAnalysisResult, TerminalLine, BoostSuggestions, SavedPasswordEntry } from './types';
import { analyzePasswordRisk, boostPassword, getBoostSuggestions } from './services/geminiService';
import TerminalLog from './components/TerminalLog';
import CyberButton from './components/CyberButton';
import ResultsDashboard from './components/ResultsDashboard';
import PasswordVault from './components/PasswordVault';
import GalaxyIntro from './components/GalaxyIntro';
import TacticalBuilder from './components/TacticalBuilder';

// Optimized Matrix Rain component to prevent re-renders on every log update
const MatrixRain = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
    {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="absolute text-green-500 text-xs transform-gpu" style={{ 
            left: `${i * 10}%`, 
            top: '-20px',
            animation: `fall ${Math.random() * 2 + 1}s linear infinite` 
        }}>
            {Math.random().toString(36).substring(2, 10)}
        </div>
    ))}
  </div>
));

const App: React.FC = () => {
  const [introFinished, setIntroFinished] = useState(false);
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [logs, setLogs] = useState<TerminalLine[]>([]);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  
  // Boost State (Lifted from ResultsDashboard)
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostMode, setBoostMode] = useState<'none' | 'selecting' | 'manual'>('none');
  const [manualSuggestions, setManualSuggestions] = useState<BoostSuggestions | null>(null);

  // Refs for scrolling tour
  const inputSectionRef = useRef<HTMLElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const aiInsightRef = useRef<HTMLDivElement>(null);
  const weaknessesRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null); // For Risk Assessment Code/Score

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

  // Intro finished handler - Auto scroll to input
  useEffect(() => {
    if (introFinished) {
        addLog("System initialized.", "success");
        addLog("Waiting for target input...", "info");
        // SCROLL: Intro complete -> Go to Target Password Input
        setTimeout(() => {
             inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introFinished]);

  const runSimulationLogs = async () => {
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
    
    // SCROLL: User clicked initiate, take them to processing block
    setTimeout(() => {
        processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setResult(null);
    setBoostMode('none'); // Reset boost mode
    
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
        
        if (analysisResult.attackVectors && analysisResult.attackVectors.length > 0) {
            addLog(">> THREAT_VECTOR_ANALYSIS_REPORT:", "warning");
            for (const vector of analysisResult.attackVectors) {
                 addLog(`>> VULNERABILITY CONFIRMED: ${vector}`, "error");
            }
        }
        
        addLog("Analysis complete. Rendering dashboard.", "success");
        setState(AnalysisState.COMPLETE);

        // SCROLL: Score/Risk Assessment appeared, take user there immediately
        // block: 'start' ensures the Booster button is visible if the dashboard is tall
        setTimeout(() => {
             scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } catch (error) {
        console.error(error);
        addLog("Connection to AI Core failed.", "error");
        setState(AnalysisState.ERROR);
    }
  };

  const handleBoostAuto = async () => {
    if (!password) return;

    // SCROLL: Protocol A clicked -> Go to Input FIRST
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setIsBoosting(true);
    addLog("Initiating AUTO-BOOST protocol...", "info");
    
    // Delay as requested
    await new Promise(r => setTimeout(r, 2500));

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

  const handleStartManualBoost = async () => {
    // SCROLL: Protocol B clicked -> Go to Input FIRST
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setIsBoosting(true);
    try {
        const suggestions = await getBoostSuggestions(password);
        setManualSuggestions(suggestions);
        setBoostMode('manual'); 
    } catch (e) {
        addLog("Failed to initialize tactical module.", "error");
    } finally {
        setIsBoosting(false);
    }
  };

  const handleCommitManual = async (newPassword: string) => {
    addLog("Manual configuration committed.", "success");
    setBoostMode('none');
    
    // SCROLL: Ensure user sees the updated password input at the top
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setPassword(newPassword);
    await handleAnalyze(newPassword, true);
  };

  const handleCancelManual = () => {
      setBoostMode('none');
      setManualSuggestions(null);
  };

  const handleInitiateSave = () => {
    if (!password) return;
    
    if (savedPasswords.some(p => p.password === password)) {
      addLog("Credential already exists in vault.", "warning");
      setIsVaultOpen(true);
      return;
    }

    const newEntry: SavedPasswordEntry = {
      id: Math.random().toString(36).substring(2),
      password: password,
      savedAt: new Date().toLocaleString(),
      score: result?.score || 0,
      description: undefined
    };

    setSavedPasswords(prev => [newEntry, ...prev]);
    addLog("Credential archived to secure vault.", "success");
    setIsVaultOpen(true);
  };

  const handleUpdateDescription = (id: string, description: string) => {
      setSavedPasswords(prev => prev.map(entry => 
        entry.id === id ? { ...entry, description } : entry
      ));
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
    setBoostMode('none');
    addLog("System reset. Ready.", "info");
  };

  return (
    <>
        {/* Galaxy Intro Overlay */}
        {!introFinished && (
            <GalaxyIntro onComplete={() => setIntroFinished(true)} />
        )}

        {/* Global Modal Overlay for Tactical Builder */}
        {boostMode === 'manual' && manualSuggestions && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <TacticalBuilder 
                  initialPassword={password}
                  suggestions={manualSuggestions}
                  onCommit={handleCommitManual}
                  onCancel={handleCancelManual}
                />
             </div>
           </div>
        )}

        {/* Main Application */}
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start relative z-10 max-w-6xl mx-auto animate-in fade-in duration-1000">
        
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
                {state === AnalysisState.COMPLETE && password && (
                <button 
                    onClick={handleInitiateSave}
                    className="animate-flash-once transform-gpu px-4 py-2 bg-green-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_8px_rgba(34,197,94,0.3)] rounded-lg"
                >
                    💾 SAVE RESULT
                </button>
                )}

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
            <section ref={inputSectionRef} className="w-full bg-slate-900/30 border border-green-500/20 p-6 md:p-10 relative box-glow rounded-2xl scroll-mt-32">
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
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && password && handleAnalyze()}
                            disabled={state === AnalysisState.SCANNING || isBoosting}
                            className="w-full bg-black/50 border-2 border-green-900 text-white p-4 pr-16 text-lg md:text-xl font-mono focus:border-green-500 focus:outline-none focus:bg-black/70 transition-all placeholder-green-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                            placeholder="ENTER_PASSWORD_SEQUENCE..."
                        />
                        <button
                            onClick={() => setIsVisible(!isVisible)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-500 transition-colors uppercase text-xs font-bold"
                            onMouseDown={(e) => { e.preventDefault(); setIsVisible(true); }}
                            onMouseUp={(e) => { e.preventDefault(); setIsVisible(false); }}
                            onMouseLeave={() => setIsVisible(false)}
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
                <div ref={terminalRef} className="lg:col-span-1 order-2 lg:order-1 scroll-mt-32">
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
                        <div ref={processingRef} className="h-full min-h-[300px] flex flex-col items-center justify-center border border-green-500/20 bg-black/40 relative overflow-hidden rounded-2xl scroll-mt-32">
                            <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                            <div className="w-full h-1 bg-green-500 absolute top-0 animate-[loading_2s_ease-in-out_infinite]"></div>
                            
                            <div className="text-4xl font-bold text-green-500 mb-2 animate-bounce">PROCESSING</div>
                            <div className="text-xs text-green-400 font-mono">Decryption algorithms running...</div>
                            
                            <MatrixRain />
                        </div>
                    )}

                    {state === AnalysisState.COMPLETE && result && (
                        <ResultsDashboard 
                            result={result} 
                            onBoostAuto={handleBoostAuto}
                            onBoostManual={handleStartManualBoost}
                            isBoosting={isBoosting}
                            boostMode={boostMode}
                            onSelectBoostMode={setBoostMode}
                            refs={{
                                aiInsightRef,
                                weaknessesRef,
                                scoreRef
                            }}
                        />
                    )}
                </div>
            </div>

        </main>
        
        {/* Footer */}
        <footer className="w-full mt-12 border-t border-green-900/30 pt-4 text-center">
            <p className="text-[10px] text-gray-600 px-4 max-w-4xl mx-auto leading-relaxed">
                DISCLAIMER: This AI-powered platform showcases a modern password security and risk assessment framework in a controlled simulation environment, developed exclusively for education, research, innovation, cybersecurity awareness, testing, and compliance demonstration—ensuring complete user privacy and safety.
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
            onUpdateDescription={handleUpdateDescription}
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
    </>
  );
};

export default App;