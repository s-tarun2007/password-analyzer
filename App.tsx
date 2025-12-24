
import React, { useState, useEffect, useRef, memo } from 'react';
import { AnalysisState, AIAnalysisResult, TerminalLine, BoostSuggestions, SavedPasswordEntry, InputModeType } from './types';
import { analyzePasswordRisk, boostPassword, getBoostSuggestions } from './services/geminiService';
import TerminalLog from './components/TerminalLog';
import CyberButton from './components/CyberButton';
import ResultsDashboard from './components/ResultsDashboard';
import PasswordVault from './components/PasswordVault';
import GalaxyIntro from './components/GalaxyIntro';
import TacticalBuilder from './components/TacticalBuilder';
import SecurityReport from './components/SecurityReport';
import RetinaScanner from './components/InputModes/RetinaScanner';
import VoiceRecorder from './components/InputModes/VoiceRecorder';
import BiometricScanner from './components/InputModes/BiometricScanner';
import SecurityGate from './components/SecurityGate';
import SidePanel from './components/SidePanel';
import PixelLockLoader from './components/PixelLockLoader';
import LoaderFraud from './components/LoaderFraud';
import LoaderLink from './components/LoaderLink';
import LoaderDeepFake from './components/LoaderDeepFake';
import LandingPage from './components/LandingPage';
import LinkVerifier from './components/views/LinkVerifier';
import FraudShield from './components/views/FraudShield';
import DeepFake from './components/views/DeepFake';
import AdminControlPanel from './components/AdminControlPanel';
import EvaAssistant from './components/EvaAssistant';

// Optimized Matrix Rain component with fewer elements for performance
const MatrixRain = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 select-none">
    {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="absolute text-green-500 text-xs transform-gpu will-change-transform" style={{ 
            left: `${i * 14}%`, 
            top: '-20px',
            animation: `fall ${Math.random() * 3 + 2}s linear infinite` 
        }}>
            {Math.random().toString(36).substring(2, 8).toUpperCase()}
        </div>
    ))}
  </div>
));

const App: React.FC = () => {
  // Application Flow State
  const [introFinished, setIntroFinished] = useState(false);
  const [loadingFinished, setLoadingFinished] = useState(false); // Used for initial load
  
  // Transition State for Tools
  const [transitionMode, setTransitionMode] = useState<'none' | 'password' | 'fraud' | 'link' | 'deepfake'>('none');

  // Security Layer State
  const [isLocked, setIsLocked] = useState(true); 
  const [isBlurred, setIsBlurred] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');

  // Navigation & Layout
  const [activeView, setActiveView] = useState('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Input State
  const [inputMode, setInputMode] = useState<InputModeType>('text');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // Analysis State
  const [state, setState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [logs, setLogs] = useState<TerminalLine[]>([]);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  
  // Boost State
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostMode, setBoostMode] = useState<'none' | 'selecting' | 'manual'>('none');
  const [manualSuggestions, setManualSuggestions] = useState<BoostSuggestions | null>(null);

  // Refs
  const inputSectionRef = useRef<HTMLElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const aiInsightRef = useRef<HTMLDivElement>(null);
  const weaknessesRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Vault State
  const [savedPasswords, setSavedPasswords] = useState<SavedPasswordEntry[]>([]);
  const [deletedPasswords, setDeletedPasswords] = useState<SavedPasswordEntry[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  
  // 1. Privacy Veil (Tab Switching)
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.hidden) {
              setIsBlurred(true);
          } else {
              setIsBlurred(false);
          }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const addLog = (text: string, type: TerminalLine['type'] = 'info') => {
    const newLog: TerminalLine = {
      id: Math.random().toString(36).substring(7),
      text,
      type,
      timestamp: new Date().toISOString().split('T')[1].slice(0, 12)
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

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
    
    setTimeout(() => {
        processingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setResult(null);
    setBoostMode('none'); 
    
    if (!keepLogs) setLogs([]); 
    else addLog("--- RE-EVALUATING NEW TARGET ---", "info");
    
    const logPromise = runSimulationLogs();
    
    try {
        const analysisPromise = analyzePasswordRisk(targetPassword);
        const [_, analysisResult] = await Promise.all([logPromise, analysisPromise]);
        
        setResult(analysisResult);
        
        if (analysisResult.attackVectors && analysisResult.attackVectors.length > 0) {
            addLog(">> THREAT_VECTOR_ANALYSIS_REPORT:", "warning");
            for (const vector of analysisResult.attackVectors) {
                 addLog(`>> VULNERABILITY CONFIRMED: ${vector}`, "error");
            }
        }
        
        addLog("Analysis complete. Rendering dashboard.", "success");
        addLog("Generating Security Health Report...", "success");
        setState(AnalysisState.COMPLETE);

        setTimeout(() => {
             scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } catch (error) {
        console.error(error);
        addLog("Connection to AI Core failed.", "error");
        setState(AnalysisState.ERROR);
    }
  };

  const handleVoiceInput = (hash: string) => {
      setPassword(hash);
      addLog("Audio frequency encoded to hash.", "success");
      handleAnalyze(hash);
  };

  const handleRetinaInput = (hash: string) => {
      setPassword(hash);
      addLog("Retina scan validated & hashed.", "success");
      handleAnalyze(hash);
  };

  const handleBioInput = (hash: string) => {
      setPassword(hash);
      addLog("Biometric fingerprint tokenized.", "success");
      handleAnalyze(hash);
  };

  const handleBoostAuto = async () => {
    if (!password) return;
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsBoosting(true);
    addLog("Initiating AUTO-BOOST protocol...", "info");
    await new Promise(r => setTimeout(r, 2500));
    addLog("Analyzing base patterns for fortification...", "info");

    try {
        const boostResult = await boostPassword(password);
        addLog(`Optimization Success: ${boostResult.explanation}`, "success");
        addLog("Applying fortified credentials...", "success");
        setPassword(boostResult.boostedPassword);
        await handleAnalyze(boostResult.boostedPassword, true);
    } catch (error) {
        addLog("Enhancement algorithm failed. Try again.", "error");
    } finally {
        setIsBoosting(false);
    }
  };

  const handleStartManualBoost = async () => {
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
    addLog("Encrypting data packet [AES-256]...", "info");
    setTimeout(() => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);

        const newEntry: SavedPasswordEntry = {
            id: Math.random().toString(36).substring(2),
            password: password,
            savedAt: new Date().toLocaleString(),
            score: result?.score || 0,
            description: undefined,
            type: inputMode,
            expiresAt: expiryDate.toISOString().split('T')[0]
        };

        setSavedPasswords(prev => [newEntry, ...prev]);
        addLog(`Credential securely archived to vault [TYPE: ${inputMode.toUpperCase()}].`, "success");
        setIsVaultOpen(true);
    }, 800);
  };

  const handleUpdateDescription = (id: string, description: string) => {
      setSavedPasswords(prev => prev.map(entry => 
        entry.id === id ? { ...entry, description } : entry
      ));
  };

  const handleUpdateExpiry = (id: string, date: string) => {
    setSavedPasswords(prev => prev.map(entry => 
      entry.id === id ? { ...entry, expiresAt: date } : entry
    ));
    addLog("Expiration policy updated for credential.", "info");
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
    setInputMode('text');
    addLog("System reset. Ready.", "info");
  };

  // --- ROUTING & TRANSITIONS ---
  
  const handleNavigation = (viewId: string) => {
      if (viewId === activeView) return;

      // 1. Determine Loader
      if (viewId === 'password') setTransitionMode('password');
      else if (viewId === 'fraud-shield') setTransitionMode('fraud');
      else if (viewId === 'link-verifier') setTransitionMode('link');
      else if (viewId === 'deep-fake') setTransitionMode('deepfake');
      else setTransitionMode('none');

      // 2. Switch View Immediately (Behind loader)
      setActiveView(viewId);
  };

  const onLoaderComplete = () => {
      setTransitionMode('none');
      // No need to set activeView here as it is already set
  };

  return (
    <>
        {/* Layer 1: Master Gate */}
        <SecurityGate 
            isLocked={isLocked} 
            onUnlock={(role) => {
                setIsLocked(false);
                setUserRole(role || 'user');
                setLoadingFinished(true); // Unlock -> ready
            }} 
        />
        
        {/* Admin Panel Modal */}
        {isAdminPanelOpen && (
            <AdminControlPanel onClose={() => setIsAdminPanelOpen(false)} />
        )}

        {/* Transition Loaders (Overlays) */}
        {/* These sit on top of everything (z-200) so view switching behind them is invisible */}
        {transitionMode === 'password' && (
             <PixelLockLoader onComplete={onLoaderComplete} />
        )}

        {transitionMode === 'fraud' && (
            <LoaderFraud onComplete={onLoaderComplete} />
        )}

        {transitionMode === 'link' && (
            <LoaderLink onComplete={onLoaderComplete} />
        )}

        {transitionMode === 'deepfake' && (
            <LoaderDeepFake onComplete={onLoaderComplete} />
        )}
        
        {/* Global AI Assistant */}
        {introFinished && !isLocked && <EvaAssistant />}

        {/* Layer 4: Privacy Veil (Blur effect) */}
        <div className={`transition-all duration-300 ${isBlurred ? 'blur-xl opacity-50 scale-95' : 'blur-0 opacity-100 scale-100'} flex h-screen bg-[#020617]`}>
            
            {/* Sidebar (Desktop Fixed, Mobile Drawer) */}
            <SidePanel 
                activeTab={activeView}
                onTabChange={handleNavigation}
                isOpen={isSidebarOpen}
                toggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            <div className={`flex-1 min-h-screen relative overflow-x-hidden ${isSidebarOpen ? 'md:ml-72' : ''} transition-all duration-300`}>
                
                {/* 1. GALAXY INTRO (Runs once on mount) */}
                {!introFinished && (
                    <GalaxyIntro onComplete={() => {
                        setIntroFinished(true);
                        // Default to landing page after intro
                        setActiveView('landing'); 
                    }} />
                )}

                {/* 2. HEADER for Admin (if unlocked and not intro) */}
                {introFinished && !isLocked && (
                    <div className="absolute top-4 right-4 z-50">
                        {userRole === 'admin' && (
                            <CyberButton 
                                onClick={() => setIsAdminPanelOpen(true)}
                                className="text-[10px] !py-1 !px-2 bg-red-900/50 border-red-500 text-red-400"
                            >
                                ADMIN DASHBOARD
                            </CyberButton>
                        )}
                    </div>
                )}

                {/* 3. LANDING PAGE (Default View) */}
                {introFinished && activeView === 'landing' && (
                    <LandingPage onOpenSidebar={() => setIsSidebarOpen(true)} />
                )}

                {/* 4. TOOL VIEWS */}
                {introFinished && activeView !== 'landing' && (
                  <div className="p-4 md:p-8 flex flex-col items-center justify-start relative z-10 max-w-6xl mx-auto animate-in fade-in duration-700 min-h-screen">
                    
                    {/* Header Toggle / Back Button (ALWAYS VISIBLE in tools) */}
                    <div className="absolute top-4 left-4 z-30">
                        <button onClick={() => setIsSidebarOpen(true)} className="text-white p-2 border border-green-500/30 rounded-full bg-slate-900/50 hover:bg-green-500 hover:text-black transition-colors">
                            <span className="font-mono text-xl">&lt;</span>
                        </button>
                    </div>

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

                    {/* ----------------- PASSWORD STRENGTH TOOL VIEW ----------------- */}
                    {activeView === 'password' && (
                      <>
                        <header className="w-full border-b border-green-500/30 pb-4 mb-8 flex flex-col md:flex-row gap-4 justify-between md:items-end mt-12 md:mt-0 pl-12">
                            <div>
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-white glow-text mb-1">
                                PASSWORD STRENGTH <span className="text-green-500">PROBLEM</span>
                            </h1>
                            <p className="text-xs md:text-sm text-green-500/60 uppercase tracking-widest">
                                AI-Powered High-Security Risk Platform
                            </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {state === AnalysisState.COMPLETE && password && (
                                <button 
                                    onClick={handleInitiateSave}
                                    className="animate-flash-once transform-gpu px-4 py-2 bg-green-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_8px_rgba(34,197,94,0.3)] rounded-lg"
                                >
                                    💾 SAVE & ENCRYPT
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
                            </div>
                        </header>

                        <main className="w-full flex flex-col gap-6 max-w-full">
                            <section ref={inputSectionRef} className="w-full bg-slate-900/30 border border-green-500/20 p-4 md:p-10 relative box-glow rounded-2xl scroll-mt-32 transition-all duration-300">
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="absolute bottom-2 left-2 text-[10px] text-green-900">ID: INPUT_MODULE_01 // SECURE_LAYER_ACTIVE</div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3">
                                        <label className="text-green-400 text-sm uppercase font-bold tracking-wider">
                                            Authentication Protocol
                                        </label>
                                        
                                        <div className="flex gap-1 bg-black p-1 rounded-lg border border-green-500/30 w-full md:w-auto overflow-x-auto no-scrollbar">
                                            {(['text', 'voice', 'retina', 'bio'] as const).map(mode => (
                                                <button
                                                    key={mode}
                                                    onClick={() => {
                                                        if (state !== AnalysisState.SCANNING) {
                                                            setInputMode(mode);
                                                            setResult(null); 
                                                            setPassword(''); 
                                                        }
                                                    }}
                                                    className={`flex-1 md:flex-none px-3 py-1 text-[10px] uppercase font-bold rounded transition-all whitespace-nowrap ${
                                                        inputMode === mode 
                                                            ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                                            : 'text-gray-500 hover:text-green-400'
                                                    }`}
                                                    disabled={state === AnalysisState.SCANNING}
                                                >
                                                    {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative group min-h-[80px]">
                                        {inputMode === 'text' && (
                                            <>
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
                                            </>
                                        )}

                                        {inputMode === 'voice' && (
                                            <div className="animate-in fade-in duration-500">
                                                <VoiceRecorder onRecordingComplete={handleVoiceInput} />
                                            </div>
                                        )}

                                        {inputMode === 'retina' && (
                                            <div className="animate-in fade-in duration-500">
                                                <RetinaScanner onScanComplete={handleRetinaInput} />
                                            </div>
                                        )}

                                        {inputMode === 'bio' && (
                                            <div className="animate-in fade-in duration-500">
                                                <BiometricScanner onScanComplete={handleBioInput} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                                        {inputMode === 'text' && (
                                            <CyberButton 
                                                onClick={() => handleAnalyze()} 
                                                disabled={!password || state === AnalysisState.SCANNING || isBoosting}
                                                className="w-full md:w-auto flex-1 md:flex-none"
                                            >
                                                {state === AnalysisState.SCANNING ? 'SCANNING...' : 'INITIATE DEEP SCAN'}
                                            </CyberButton>
                                        )}
                                        
                                        {state === AnalysisState.COMPLETE && (
                                            <CyberButton 
                                                onClick={handleReset} 
                                                variant="secondary"
                                                className="w-full md:w-auto flex-1 md:flex-none"
                                                disabled={isBoosting}
                                            >
                                                RESET TARGET
                                            </CyberButton>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                <div ref={terminalRef} className="lg:col-span-1 order-2 lg:order-1 scroll-mt-32 w-full overflow-hidden">
                                    <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider">Operation Log</div>
                                    <TerminalLog logs={logs} />
                                </div>

                                <div className="lg:col-span-2 order-1 lg:order-2 w-full">
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
                                            <div className="text-xs text-green-400 font-mono">
                                                {inputMode === 'text' ? 'Decryption algorithms running...' : 
                                                inputMode === 'voice' ? 'Processing Audio Waveform...' :
                                                inputMode === 'retina' ? 'Mapping Iris Vector Points...' : 
                                                'Verifying Biometric Hash...'}
                                            </div>
                                            
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
                            
                            {state === AnalysisState.COMPLETE && result && (
                                <div ref={reportRef} className="w-full">
                                    <SecurityReport result={result} password={password} />
                                </div>
                            )}
                        </main>
                      </>
                    )}
                    
                    {/* ----------------- OTHER VIEWS ----------------- */}
                    {activeView === 'link-verifier' && <LinkVerifier />}
                    {activeView === 'fraud-shield' && <FraudShield />}
                    {activeView === 'deep-fake' && <DeepFake />}


                    {/* Global Footer (Visible on all tool views) */}
                    <footer className="w-full mt-12 border-t border-gray-800 pt-4 text-center">
                        <p className="text-[10px] text-gray-600 px-4 max-w-4xl mx-auto leading-relaxed">
                            DISCLAIMER: This AI-powered platform showcases a modern password security and risk assessment framework in a controlled simulation environment.
                        </p>
                    </footer>

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
                        onUpdateExpiry={handleUpdateExpiry}
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
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                  </div>
                )}
            </div>
        </div>
    </>
  );
};

export default App;
