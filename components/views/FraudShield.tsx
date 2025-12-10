
import React, { useState, useRef } from 'react';
import CyberButton from '../CyberButton';

const FraudShield: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'scanner' | 'report'>('scanner');
  
  // Scanner State
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);

  // Reporting State
  const [reportStep, setReportStep] = useState<'form' | 'processing' | 'success'>('form');
  const [reportData, setReportData] = useState({
      category: 'phishing',
      date: '',
      description: '',
      evidenceFile: null as string | null
  });
  const [caseId, setCaseId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = () => {
      if(!text) return;
      setAnalysis("ANALYZING...");
      setTimeout(() => {
          setAnalysis(`
            FRAUD PATTERN DETECTED: 
            - Urgency Tactics ("Immediately", "24 hours") identified.
            - Suspicious grammatical errors consistent with offshore bot farms.
            - Context matches known "Grandparent Scam" scripts.
            
            RISK LEVEL: HIGH (89%)
          `);
      }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setReportData({ ...reportData, evidenceFile: e.target.files[0].name });
      }
  };

  const submitReport = () => {
      if (!reportData.description || !reportData.date) return;

      setReportStep('processing');
      
      // Simulate complex submission process
      setTimeout(() => {
        const newCaseId = `CASE-${Math.floor(Math.random()*10000)}-${new Date().getFullYear()}`;
        setCaseId(newCaseId);
        setReportStep('success');
      }, 3000);
  };

  const resetReport = () => {
      setReportData({ category: 'phishing', date: '', description: '', evidenceFile: null });
      setReportStep('form');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-right duration-500">
       
       {/* Header */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white tracking-tighter mb-1">FRAUD<span className="text-purple-500">SHIELD</span> AI</h1>
                <p className="text-sm text-purple-400/60 font-mono">NEXT-GEN CYBER FRAUD DETECTION & REPORTING</p>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-purple-500/30">
                <button 
                    onClick={() => setActiveMode('scanner')}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeMode === 'scanner' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-purple-400'}`}
                >
                    AI Scanner
                </button>
                <button 
                    onClick={() => setActiveMode('report')}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${activeMode === 'report' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-purple-400'}`}
                >
                    File Case
                </button>
            </div>
       </div>

       {/* --- MODE 1: SCANNER --- */}
       {activeMode === 'scanner' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               {/* Analyzer */}
               <div className="bg-slate-900/80 border border-purple-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                   <h3 className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-4">AI Text & Pattern Scanner</h3>
                   <textarea 
                      className="w-full h-40 bg-black border border-purple-900 rounded-xl p-4 text-purple-100 font-mono text-sm focus:outline-none focus:border-purple-500 resize-none"
                      placeholder="Paste suspicious email, SMS, or chat text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                   />
                   <CyberButton 
                      onClick={runAnalysis}
                      className="w-full mt-4 bg-purple-900/20 text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white"
                   >
                       DETECT FRAUD PATTERNS
                   </CyberButton>

                   {analysis && (
                       <div className="mt-4 p-4 bg-purple-950/30 border-l-2 border-purple-500 text-xs font-mono text-purple-200 whitespace-pre-line leading-relaxed">
                           {analysis}
                       </div>
                   )}
               </div>

               {/* Feed */}
               <div className="space-y-4">
                   <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs">Live Threat Intel Feed</h3>
                   
                   {[1,2,3].map(i => (
                       <div key={i} className="bg-black/40 border border-gray-800 p-4 rounded-xl flex gap-4 hover:border-purple-500/30 transition-colors">
                           <div className="text-2xl pt-1">⚠️</div>
                           <div>
                               <h4 className="text-white font-bold text-sm">New "Voice Clone" Heist Vector</h4>
                               <p className="text-xs text-gray-500 mt-1">Attackers using AI voice synthesis to bypass bank biometric phone verification.</p>
                               <div className="mt-2 flex gap-2">
                                   <span className="text-[9px] bg-red-900/20 text-red-500 px-1.5 py-0.5 rounded">CRITICAL</span>
                                   <span className="text-[9px] bg-blue-900/20 text-blue-500 px-1.5 py-0.5 rounded">FINANCE</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {/* --- MODE 2: REPORTING PORTAL --- */}
       {activeMode === 'report' && (
           <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               {/* Background Grid */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

               {reportStep === 'form' && (
                   <div className="relative z-10 max-w-2xl mx-auto">
                       <h2 className="text-2xl font-bold text-white mb-2">Official Fraud Reporting Portal</h2>
                       <p className="text-sm text-gray-400 mb-8">
                           Submit a secure report regarding cyber-fraud, identity theft, or financial scams. 
                           Your data will be encrypted and analyzed by our AI forensics engine.
                       </p>

                       <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                   <label className="text-xs uppercase text-purple-400 font-bold tracking-wider">Incident Category</label>
                                   <select 
                                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                                      value={reportData.category}
                                      onChange={(e) => setReportData({...reportData, category: e.target.value})}
                                   >
                                       <option value="phishing">Phishing / Suspicious Link</option>
                                       <option value="identity">Identity Theft</option>
                                       <option value="financial">Financial / Bank Fraud</option>
                                       <option value="crypto">Cryptocurrency Scam</option>
                                       <option value="ransomware">Ransomware Attack</option>
                                   </select>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs uppercase text-purple-400 font-bold tracking-wider">Date of Incident</label>
                                   <input 
                                      type="date" 
                                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                                      value={reportData.date}
                                      onChange={(e) => setReportData({...reportData, date: e.target.value})}
                                   />
                               </div>
                           </div>

                           <div className="space-y-2">
                               <label className="text-xs uppercase text-purple-400 font-bold tracking-wider">Incident Description</label>
                               <textarea 
                                  className="w-full h-32 bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                                  placeholder="Describe the event in detail. How were you contacted? What information was shared?"
                                  value={reportData.description}
                                  onChange={(e) => setReportData({...reportData, description: e.target.value})}
                               />
                           </div>

                           {/* Evidence Upload */}
                           <div className="space-y-2">
                               <label className="text-xs uppercase text-purple-400 font-bold tracking-wider">Upload Proof (Screenshots/Logs)</label>
                               <div className="border-2 border-dashed border-gray-700 bg-black/50 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                                   <input 
                                       type="file" 
                                       ref={fileInputRef} 
                                       className="hidden" 
                                       onChange={handleFileChange}
                                   />
                                   {reportData.evidenceFile ? (
                                       <div className="flex items-center justify-center gap-2 text-green-400">
                                           <span className="text-xl">📄</span>
                                           <span className="font-mono text-sm">{reportData.evidenceFile}</span>
                                           <button onClick={() => setReportData({...reportData, evidenceFile: null})} className="text-red-500 ml-2 hover:underline text-xs">Remove</button>
                                       </div>
                                   ) : (
                                       <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                           <div className="text-2xl mb-2 opacity-50">📂</div>
                                           <p className="text-xs text-gray-500">Click to attach evidence file</p>
                                       </div>
                                   )}
                               </div>
                           </div>
                            
                           <div className="pt-4 border-t border-gray-800">
                               <CyberButton onClick={submitReport} className="w-full py-4 text-sm" variant="warning">
                                   ENCRYPT & SUBMIT CASE
                               </CyberButton>
                               <p className="text-center text-[10px] text-gray-600 mt-2">
                                   By submitting, you consent to AI forensic analysis of the provided data.
                               </p>
                           </div>
                       </div>
                   </div>
               )}

               {reportStep === 'processing' && (
                   <div className="h-96 flex flex-col items-center justify-center relative z-10">
                       <div className="w-24 h-24 rounded-full border-4 border-purple-900 border-t-purple-500 animate-spin mb-6"></div>
                       <h3 className="text-xl font-bold text-white mb-2">Processing Submission...</h3>
                       <div className="font-mono text-purple-400 text-xs space-y-1 text-center">
                           <p className="animate-pulse">>> ENCRYPTING EVIDENCE...</p>
                           <p className="animate-pulse delay-75">>> HASHING INCIDENT DATA...</p>
                           <p className="animate-pulse delay-150">>> ROUTING TO CYBER GRID...</p>
                       </div>
                   </div>
               )}

               {reportStep === 'success' && (
                   <div className="h-96 flex flex-col items-center justify-center relative z-10 text-center animate-in zoom-in duration-300">
                       <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                           <span className="text-4xl text-black">✓</span>
                       </div>
                       <h2 className="text-3xl font-bold text-white mb-2">Case Filed Successfully</h2>
                       <p className="text-gray-400 mb-6">Your report has been logged in the secure database.</p>
                       
                       <div className="bg-black border border-green-500/50 rounded-lg p-4 mb-8">
                           <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Case Reference ID</p>
                           <p className="text-xl font-mono text-green-400 tracking-wider select-all">{caseId}</p>
                       </div>

                       <div className="flex gap-4">
                           <button onClick={resetReport} className="text-sm text-gray-400 hover:text-white underline">
                               File Another Report
                           </button>
                           <CyberButton onClick={() => setActiveMode('scanner')} variant="secondary">
                               Return to Dashboard
                           </CyberButton>
                       </div>
                   </div>
               )}

           </div>
       )}
    </div>
  );
};

export default FraudShield;
