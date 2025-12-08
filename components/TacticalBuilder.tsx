import React, { useState, useRef, useEffect } from 'react';
import { BoostSuggestions } from '../types';
import CyberButton from './CyberButton';

interface TacticalBuilderProps {
  initialPassword: string;
  suggestions: BoostSuggestions;
  onCommit: (password: string) => void;
  onCancel: () => void;
}

// Utility to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

const TacticalBuilder: React.FC<TacticalBuilderProps> = ({ initialPassword, suggestions, onCommit, onCancel }) => {
  const [password, setPassword] = useState(initialPassword);
  const [previewPassword, setPreviewPassword] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastCursorPos = useRef<number | null>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // Track cursor position to ensure preview happens at the right spot even if focus blurs slightly
  const handleSelect = () => {
    if (inputRef.current) {
        lastCursorPos.current = inputRef.current.selectionStart;
    }
  };

  const getInsertionIndices = () => {
      const input = inputRef.current;
      // Use current selection if focused, otherwise fall back to last known or end of string
      const start = input?.selectionStart ?? lastCursorPos.current ?? password.length;
      const end = input?.selectionEnd ?? lastCursorPos.current ?? password.length;
      return { start, end };
  }

  const insertAtCursor = (text: string) => {
    const { start, end } = getInsertionIndices();

    const newPassword = password.substring(0, start) + text + password.substring(end);
    setPassword(newPassword);
    setPreviewPassword(null); // Clear preview on commit
    
    // Defer focus restoration to allow React render
    setTimeout(() => {
      if(inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = start + text.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        lastCursorPos.current = newCursorPos;
      }
    }, 0);
  };

  const applySubstitution = (original: string, replacement: string) => {
    // Replace all occurrences case-insensitive
    const escapedOriginal = escapeRegExp(original);
    const regex = new RegExp(escapedOriginal, 'gi');
    const newPassword = password.replace(regex, replacement);
    setPassword(newPassword);
    setPreviewPassword(null); // Clear preview on commit
  };

  // --- Preview Handlers ---

  const handlePreviewInsert = (text: string) => {
    const { start, end } = getInsertionIndices();
    const preview = password.substring(0, start) + text + password.substring(end);
    setPreviewPassword(preview);
  };

  const handlePreviewSub = (original: string, replacement: string) => {
    const escapedOriginal = escapeRegExp(original);
    const regex = new RegExp(escapedOriginal, 'gi');
    const preview = password.replace(regex, replacement);
    setPreviewPassword(preview);
  };

  const clearPreview = () => {
    setPreviewPassword(null);
  };

  const checkApplicability = (original: string) => {
      const escapedOriginal = escapeRegExp(original);
      const regex = new RegExp(escapedOriginal, 'i'); // Case insensitive check
      return regex.test(password);
  };

  return (
    <div className="w-full bg-slate-950/90 border-2 border-amber-500/50 p-6 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden box-glow rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-amber-500/30 pb-2">
        <h3 className="text-amber-500 font-bold tracking-widest uppercase flex items-center gap-2">
          <span className="text-xl">🛠</span> Tactical Override Module
        </h3>
        <span className="text-[10px] text-amber-500/60 font-mono">MODE: MANUAL_INTERVENTION</span>
      </div>

      {/* Editor Area */}
      <div className="mb-6 relative">
        <div className="flex justify-between items-end mb-2 h-5">
            <label className="text-xs text-amber-400/80 uppercase block tracking-wider">Target Credential Buffer</label>
            <span className={`text-[10px] text-cyan-400 font-bold uppercase tracking-wider transition-opacity duration-200 ${previewPassword ? 'opacity-100' : 'opacity-0'}`}>
                Preview Active (Hover)
            </span>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={previewPassword !== null ? previewPassword : password}
          onChange={(e) => setPassword(e.target.value)}
          onSelect={handleSelect}
          className={`w-full bg-black border p-4 font-mono text-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all rounded-xl ${
              previewPassword !== null 
                ? 'text-cyan-400 border-cyan-500/50' 
                : 'text-amber-100 border-amber-500'
          }`}
        />
        <div className={`absolute right-4 bottom-4 text-[10px] text-cyan-500 pointer-events-none transition-opacity duration-200 ${previewPassword ? 'opacity-100' : 'opacity-0'}`}>
            PREVIEWING CHANGE...
        </div>
      </div>

      {/* Toolset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Symbols */}
        <div className="bg-amber-900/10 p-3 border border-amber-500/20 rounded-xl">
          <h4 className="text-[10px] text-amber-500 uppercase mb-3 font-bold">Inject Symbols</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestedSymbols.map((sym, idx) => (
              <button
                key={idx}
                onMouseEnter={() => handlePreviewInsert(sym)}
                onMouseLeave={clearPreview}
                onClick={() => insertAtCursor(sym)}
                className="relative w-8 h-8 flex items-center justify-center bg-black border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:scale-110 hover:z-10 transition-all duration-200 font-mono font-bold rounded-md"
                title="Hover to preview, Click to insert"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Suffixes */}
        <div className="bg-amber-900/10 p-3 border border-amber-500/20 rounded-xl">
          <h4 className="text-[10px] text-amber-500 uppercase mb-3 font-bold">Append Shards</h4>
          <div className="flex flex-wrap gap-2">
             {suggestions.suggestedSuffixes.map((suffix, idx) => (
              <button
                key={idx}
                onMouseEnter={() => handlePreviewInsert(suffix)}
                onMouseLeave={clearPreview}
                onClick={() => insertAtCursor(suffix)}
                className="relative px-2 py-1 bg-black border border-amber-500/40 text-amber-400 text-xs hover:bg-amber-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] hover:scale-105 hover:z-10 transition-all duration-200 font-mono rounded-md"
              >
                {suffix}
              </button>
            ))}
          </div>
        </div>

        {/* Substitutions */}
        <div className="bg-amber-900/10 p-3 border border-amber-500/20 rounded-xl">
          <h4 className="text-[10px] text-amber-500 uppercase mb-3 font-bold">Mutate Chars</h4>
          <div className="flex flex-col gap-2">
            {suggestions.leetspeak.map((item, idx) => {
              const isApplicable = checkApplicability(item.original);
              return (
                <button
                  key={idx}
                  onMouseEnter={() => isApplicable && handlePreviewSub(item.original, item.replacement)}
                  onMouseLeave={clearPreview}
                  onClick={() => isApplicable && applySubstitution(item.original, item.replacement)}
                  disabled={!isApplicable}
                  className={`flex items-center justify-between px-3 py-1 bg-black border text-xs transition-all duration-150 font-mono group rounded-md ${
                    isApplicable 
                      ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] cursor-pointer' 
                      : 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  title={isApplicable ? "Click to swap all occurrences" : "Character not found in password"}
                >
                  <span>Swap <strong className={isApplicable ? "text-white group-hover:text-black" : "text-gray-500"}>{item.original}</strong></span>
                  <span className="opacity-50">➔</span>
                  <strong className={isApplicable ? "text-white group-hover:text-black" : "text-gray-500"}>{item.replacement}</strong>
                </button>
              );
            })}
             {suggestions.leetspeak.length === 0 && <span className="text-amber-500/40 text-xs italic">No relevant chars found</span>}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-xs uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
        >
          Abort
        </button>
        <CyberButton 
          onClick={() => onCommit(password)} 
          variant="warning"
          className="shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          Commit Configuration
        </CyberButton>
      </div>
    </div>
  );
};

export default TacticalBuilder;