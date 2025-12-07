import React, { useState } from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { AIAnalysisResult, BoostSuggestions } from '../types';
import CyberButton from './CyberButton';
import TacticalBuilder from './TacticalBuilder';

interface ResultsDashboardProps {
  result: AIAnalysisResult;
  onBoostAuto: () => void;
  onBoostManual: () => Promise<BoostSuggestions>;
  onCommitManual: (password: string) => void;
  isBoosting: boolean;
  currentPassword?: string; 
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  result, 
  onBoostAuto, 
  onBoostManual, 
  onCommitManual, 
  isBoosting,
  currentPassword = ''
}) => {
  const [boostMode, setBoostMode] = useState<'none' | 'selecting' | 'manual'>('none');
  const [suggestions, setSuggestions] = useState<BoostSuggestions | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score < 40) return '#ef4444'; // red-500
    if (score < 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const chartData = [
    {
      name: 'Security Score',
      value: result.score,
      fill: getScoreColor(result.score),
    },
  ];

  const handleStartManual = async () => {
    setIsLoadingSuggestions(true);
    try {
      const data = await onBoostManual();
      setSuggestions(data);
      setBoostMode('manual');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const resetBoost = () => {
    setBoostMode('none');
    setSuggestions(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Left Column: Score & Main Stats */}
      <div className="bg-slate-900/50 border border-green-500/20 p-6 flex flex-col items-center justify-between relative overflow-hidden rounded-2xl shadow-lg">
        
        <h3 className="text-green-400 uppercase tracking-widest text-sm mb-4 font-bold">Risk Assessment Score</h3>
        
        <div className="w-full h-48 relative">
           <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="80%" 
              outerRadius="100%" 
              barSize={20} 
              data={chartData} 
              startAngle={180} 
              endAngle={0}
            >
              <RadialBar
                label={{ position: 'center', fill: getScoreColor(result.score), fontSize: 40, fontWeight: 'bold' }}
                background
                dataKey="value"
                cornerRadius={10} 
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-0 text-center -mb-2">
            <span className={`text-xl font-bold ${result.score < 50 ? 'text-red-500' : 'text-green-500'}`}>
              {result.score < 50 ? 'VULNERABLE' : 'SECURE'}
            </span>
          </div>
        </div>

        <div className="w-full mt-6 grid grid-cols-2 gap-4 text-center mb-6">
            <div className="p-3 border border-green-500/10 bg-black/40 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Crack Time</p>
                <p className="text-green-300 font-bold text-sm">{result.crackTime}</p>
            </div>
            <div className="p-3 border border-green-500/10 bg-black/40 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Breach Prob.</p>
                <p className={`font-bold text-sm ${
                    result.breachProbability === 'Critical' || result.breachProbability === 'High' 
                    ? 'text-red-500' 
                    : 'text-green-300'
                }`}>{result.breachProbability}</p>
            </div>
        </div>

        {/* Password Booster Logic */}
        {result.score < 95 && boostMode !== 'manual' && (
          <div className="w-full">
            {boostMode === 'none' && (
              <>
                <CyberButton 
                  onClick={() => setBoostMode('selecting')} 
                  disabled={isBoosting}
                  className="w-full py-4 text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  variant="warning"
                >
                  {isBoosting ? (
                    <span className="animate-pulse">ENHANCING ENTROPY...</span>
                  ) : (
                    <>
                      <span className="mr-2 text-lg">⚡</span> 
                      BOOST PASSWORD STRENGTH
                    </>
                  )}
                </CyberButton>
                {!isBoosting && (
                  <p className="text-[10px] text-amber-500/60 text-center mt-2 font-mono">
                    [ AI will fortify credentials while keeping mnemonic ]
                  </p>
                )}
              </>
            )}

            {boostMode === 'selecting' && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] text-amber-500 uppercase tracking-widest text-center mb-1">Select Protocol</p>
                <div className="flex gap-2">
                  <CyberButton onClick={onBoostAuto} variant="warning" className="flex-1 text-[10px] py-3">
                    Protocol A:<br/>Auto-Enhance
                  </CyberButton>
                  <CyberButton onClick={handleStartManual} variant="warning" className="flex-1 text-[10px] py-3" disabled={isLoadingSuggestions}>
                    {isLoadingSuggestions ? 'Initializing...' : <>Protocol B:<br/>Tactical Builder</>}
                  </CyberButton>
                </div>
                 <button onClick={resetBoost} className="text-[10px] text-gray-500 hover:text-white mt-2 underline decoration-dashed">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: AI Insight & Details */}
      <div className="space-y-4">
        
        {/* Render Manual Builder Override if active */}
        {boostMode === 'manual' && suggestions && (
           <div className="col-span-1 md:col-span-2 absolute inset-0 z-20 bg-slate-950/95 flex items-center justify-center p-4 rounded-2xl backdrop-blur-sm">
             <div className="w-full h-full flex items-center justify-center">
                <TacticalBuilder 
                  initialPassword={currentPassword}
                  suggestions={suggestions}
                  onCommit={onCommitManual}
                  onCancel={resetBoost}
                />
             </div>
           </div>
        )}

        {/* Regular Insights (Hidden if manual mode is overlaying/active in a way that obscures, but here we just hide if manual active) */}
        {boostMode !== 'manual' && (
          <>
            <div className="bg-slate-900/50 border border-green-500/20 p-6 relative rounded-2xl">
              <div className="absolute -top-3 left-4 bg-slate-950 px-2 text-green-500 text-xs border border-green-500/50 rounded-full">
                AI_ANALYSIS_ENGINE.V2
              </div>
              <p className="text-green-300/90 leading-relaxed font-light">
                {result.aiInsight}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-red-500/30 bg-red-900/5 p-4 rounded-xl">
                    <h4 className="text-red-400 text-xs uppercase mb-2 font-bold tracking-wider">Detected Weaknesses</h4>
                    <ul className="space-y-1">
                        {result.weaknesses.map((w, i) => (
                            <li key={i} className="text-red-300/80 text-sm flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 bg-red-500 rounded-full shrink-0"></span>
                                {w}
                            </li>
                        ))}
                        {result.weaknesses.length === 0 && <li className="text-gray-500 text-sm">None detected.</li>}
                    </ul>
                </div>
                <div className="border border-green-500/30 bg-green-900/5 p-4 rounded-xl">
                    <h4 className="text-green-400 text-xs uppercase mb-2 font-bold tracking-wider">Detected Strengths</h4>
                    <ul className="space-y-1">
                        {result.strengths.map((s, i) => (
                            <li key={i} className="text-green-300/80 text-sm flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 bg-green-500 rounded-full shrink-0"></span>
                                {s}
                            </li>
                        ))}
                        {result.strengths.length === 0 && <li className="text-gray-500 text-sm">None detected.</li>}
                    </ul>
                </div>
            </div>
            
            {result.similarPatterns.length > 0 && (
                <div className="border border-blue-500/20 bg-blue-900/5 p-3 flex gap-2 items-center text-xs rounded-xl">
                    <span className="text-blue-400 font-bold shrink-0">PATTERN_MATCH:</span>
                    <div className="flex flex-wrap gap-2">
                        {result.similarPatterns.map((p, idx) => (
                            <span key={idx} className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/30">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Attack Vectors Section */}
            <div className="border border-orange-500/20 bg-orange-900/5 p-4 mt-2 rounded-xl">
                <h4 className="text-orange-400 text-xs uppercase mb-2 font-bold tracking-wider">Potential Attack Vectors</h4>
                <div className="flex flex-wrap gap-2">
                    {result.attackVectors && result.attackVectors.length > 0 ? (
                        result.attackVectors.map((v, idx) => (
                            <span key={idx} className="bg-orange-900/20 text-orange-300 px-2 py-1 text-xs rounded-md border border-orange-500/30 font-mono">
                                {v}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-xs italic">No specific vectors identified.</span>
                    )}
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;