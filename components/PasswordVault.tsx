
import React, { useState, useEffect, useRef } from 'react';
import { SavedPasswordEntry, InputModeType } from '../types';
import CyberButton from './CyberButton';
import FirewallGuard from './FirewallGuard';

interface PasswordVaultProps {
  isOpen: boolean;
  onClose: () => void;
  savedPasswords: SavedPasswordEntry[];
  deletedPasswords?: SavedPasswordEntry[];
  onCopy: (id: string, password: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdateExpiry?: (id: string, date: string) => void;
}

// Helper component to handle focus without scrolling the page
const AutoFocusInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input on mount, but prevent the browser from scrolling it into view
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, []);

  return <input ref={inputRef} {...props} />;
};

const PasswordVault: React.FC<PasswordVaultProps> = ({ 
  isOpen, 
  onClose, 
  savedPasswords, 
  deletedPasswords = [],
  onCopy, 
  onDelete,
  onRestore,
  onPermanentDelete,
  onUpdateDescription,
  onUpdateExpiry
}) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [filterType, setFilterType] = useState<InputModeType | 'all'>('all');
  
  // Description editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Expiration editing state
  const [editingExpiryId, setEditingExpiryId] = useState<string | null>(null);
  const [expiryValue, setExpiryValue] = useState("");

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
        setShowRecycleBin(false);
        setEditingId(null);
        setEditingExpiryId(null);
        setFilterType('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getScoreColorClass = (score: number) => {
    if (score < 50) return 'text-red-500 border-red-500/50 bg-red-900/20';
    if (score < 80) return 'text-yellow-500 border-yellow-500/50 bg-yellow-900/20';
    return 'text-green-500 border-green-500/50 bg-green-900/20';
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return { status: 'none', label: 'SET EXPIRY', color: 'text-gray-600', border: 'border-transparent' };
    
    const expiry = new Date(dateStr);
    const now = new Date();
    // Reset times to midnight for fair comparison
    expiry.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', label: 'EXPIRED', color: 'text-red-500 font-bold', border: 'border-red-500' };
    if (diffDays <= 7) return { status: 'soon', label: `EXPIRING: ${diffDays} DAYS`, color: 'text-amber-500 font-bold', border: 'border-amber-500' };
    return { status: 'ok', label: `VALID UNTIL: ${dateStr}`, color: 'text-green-500/60', border: 'border-green-500/10' };
  };

  const getTypeIcon = (type: InputModeType) => {
      switch(type) {
          case 'voice': return '🎙';
          case 'retina': return '👁';
          case 'bio': return '👆';
          default: return '⌨';
      }
  };

  // Determine active list and theme based on Recycle Bin state
  const isRecycleView = showRecycleBin;
  let activeList = isRecycleView ? deletedPasswords : savedPasswords;
  
  // Apply Filter
  if (filterType !== 'all') {
      activeList = activeList.filter(p => p.type === filterType);
  }
  
  // Theme Logic
  let borderColor = 'border-green-500/30';
  let headerBg = 'bg-green-900/5';
  let titleColor = 'text-green-500';
  
  if (isRecycleView) {
      borderColor = 'border-emerald-500/50';
      headerBg = 'bg-emerald-900/20';
      titleColor = 'text-emerald-400';
  } else if (isDeleteMode) {
      borderColor = 'border-red-500/30';
      headerBg = 'bg-red-900/10';
      titleColor = 'text-red-500';
  }

  const handleToggleRecycleBin = () => {
      if (isDeleteMode || showRecycleBin) {
          setShowRecycleBin(!showRecycleBin);
      }
  };

  const startEditing = (entry: SavedPasswordEntry) => {
      if (isDeleteMode || isRecycleView) return;
      setEditingId(entry.id);
      setEditValue(entry.description || "");
  };

  const submitEdit = (id: string) => {
      onUpdateDescription(id, editValue);
      setEditingId(null);
  };

  const startEditingExpiry = (entry: SavedPasswordEntry) => {
    if (isDeleteMode || isRecycleView) return;
    setEditingExpiryId(entry.id);
    // Use existing expiry or default to 90 days from now if not set
    if (entry.expiresAt) {
        setExpiryValue(entry.expiresAt);
    } else {
        const d = new Date();
        d.setDate(d.getDate() + 90);
        setExpiryValue(d.toISOString().split('T')[0]);
    }
  };

  const submitExpiry = (id: string) => {
    if (onUpdateExpiry && expiryValue) {
        onUpdateExpiry(id, expiryValue);
    }
    setEditingExpiryId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
          submitEdit(id);
      } else if (e.key === 'Escape') {
          setEditingId(null);
          setEditValue(""); 
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`relative w-full max-w-md bg-slate-950 border-l h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-300 transition-colors ${borderColor} rounded-l-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${borderColor} ${headerBg} transition-colors duration-300`}>
          <div>
            <h2 className={`text-xl font-bold tracking-widest flex items-center gap-2 ${titleColor}`}>
              <button 
                 onClick={handleToggleRecycleBin}
                 disabled={!isDeleteMode && !isRecycleView}
                 className={`focus:outline-none transition-transform active:scale-95 ${isDeleteMode || isRecycleView ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                 title={isDeleteMode ? "Open Recycle Bin" : "Vault Secure"}
              >
                  <span className={isDeleteMode ? "animate-pulse" : ""}>
                    {isRecycleView ? '♻️' : (isDeleteMode ? '🗑' : '🔒')}
                  </span> 
              </button>
              
              {isRecycleView 
                ? 'RECOVERY_BIN' 
                : (isDeleteMode ? 'PURGE_PROTOCOL' : 'SECURE_VAULT')
              }
            </h2>
            <p className={`text-[10px] font-mono uppercase mt-1 opacity-70 ${titleColor}`}>
              {isRecycleView 
                ? 'RESTORATION OF DELETED ASSETS' 
                : (isDeleteMode ? 'DANGER: DELETION ENABLED' : 'AES-256 ENCRYPTED STORAGE')
              }
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center border transition-all rounded-md ${
              isDeleteMode && !isRecycleView
                ? 'border-red-500/30 text-red-500 hover:bg-red-500 hover:text-black' 
                : 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        {!isRecycleView && !isDeleteMode && (
             <div className="flex w-full border-b border-gray-800 bg-black/60">
                 {(['all', 'text', 'voice', 'retina', 'bio'] as const).map((type) => (
                     <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider transition-colors border-b-2 ${
                            filterType === type 
                                ? 'text-green-400 border-green-500 bg-green-500/10' 
                                : 'text-gray-600 border-transparent hover:text-gray-400'
                        }`}
                     >
                        {type === 'all' ? 'ALL' : getTypeIcon(type as InputModeType)}
                     </button>
                 ))}
             </div>
        )}

        {/* Control Bar (Delete Mode) */}
        {!isRecycleView && filterType === 'all' && (
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between bg-black/40">
            <span className="text-xs uppercase text-gray-500 tracking-wider">Deletion Mode</span>
            <button 
                onClick={() => setIsDeleteMode(!isDeleteMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                isDeleteMode 
                    ? 'bg-red-900/50 border border-red-500' 
                    : 'bg-green-900/50 border border-green-500'
                }`}
            >
                <span className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all ${
                isDeleteMode 
                    ? 'right-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                    : 'left-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                }`} 
                />
            </button>
            </div>
        )}
        
        {isRecycleView && (
             <div className="px-6 py-3 border-b border-emerald-500/30 flex items-center justify-between bg-emerald-900/10">
                <span className="text-xs uppercase text-emerald-500 tracking-wider">Recycle Bin Active</span>
                <button 
                    onClick={() => setShowRecycleBin(false)}
                    className="text-[10px] text-emerald-400 underline hover:text-white"
                >
                    RETURN TO VAULT
                </button>
             </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeList.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <div className="text-4xl mb-2">
                  {isRecycleView ? '♻️' : (filterType === 'all' ? '📂' : getTypeIcon(filterType as InputModeType))}
              </div>
              <p className={`text-sm font-mono ${titleColor}`}>
                  {isRecycleView ? 'BIN EMPTY' : 'NO DATA'}
              </p>
              <p className="text-xs text-green-900 mt-2">
                  {filterType !== 'all' ? `No ${filterType} records found.` : 'Vault currently empty.'}
              </p>
            </div>
          ) : (
            activeList.map((entry) => {
              const expiryStatus = getExpiryStatus(entry.expiresAt);
              
              return (
              <div 
                key={entry.id} 
                className={`bg-black/50 border p-4 group transition-all relative overflow-hidden rounded-xl ${
                  isRecycleView
                    ? 'border-emerald-500/20 hover:border-emerald-500/50'
                    : (isDeleteMode 
                        ? 'border-red-500/20 hover:border-red-500/50' 
                        : (expiryStatus.status !== 'ok' && expiryStatus.status !== 'none' 
                            ? `${expiryStatus.border} box-glow`
                            : 'border-green-500/20 hover:border-green-500/50'
                          )
                      )
                }`}
              >
                {/* Type Badge */}
                <div className="absolute top-2 right-2 text-xs opacity-50 font-mono flex items-center gap-1 border border-white/10 rounded px-1.5 py-0.5">
                    {getTypeIcon(entry.type)} <span className="uppercase text-[8px]">{entry.type}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className={`text-[10px] font-mono ${
                        isRecycleView ? 'text-emerald-500/50' : (isDeleteMode ? 'text-red-500/50' : 'text-green-500/50')
                    }`}>
                      {isRecycleView ? 'DELETED_AT: NOW' : `ENCRYPTED: ${entry.savedAt}`}
                    </div>
                  </div>
                  
                   {/* Score Indicator */}
                   {entry.score !== undefined && (
                        <div className={`w-fit text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColorClass(entry.score)}`}>
                            {entry.score}/100 SECURE
                        </div>
                    )}

                  {/* Description Display / Edit */}
                  {editingId === entry.id ? (
                      <AutoFocusInput 
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => submitEdit(entry.id)}
                          onKeyDown={(e) => handleKeyDown(e, entry.id)}
                          className="w-full bg-black border border-green-500 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-400 mt-2 placeholder-green-900/50"
                          placeholder="Enter description..."
                      />
                  ) : (
                      <div 
                          onClick={() => startEditing(entry)}
                          className={`text-xs mt-2 font-mono transition-all flex items-center justify-between group/desc select-none rounded-md px-2 py-1.5 ${
                              isDeleteMode || isRecycleView 
                                ? '' 
                                : `cursor-pointer ${entry.description ? 'hover:bg-white/5' : 'border border-dashed border-gray-800 hover:border-green-500/50 hover:text-green-400'}`
                          } ${entry.description ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                         <span className={!entry.description ? "italic opacity-70" : ""}>
                            {entry.description || (isDeleteMode || isRecycleView ? "" : "+ Add description...")}
                         </span>
                         {!isDeleteMode && !isRecycleView && (
                             <span className={`text-[10px] text-green-500 ml-2 ${entry.description ? 'opacity-0 group-hover/desc:opacity-100' : 'opacity-100'}`}>
                                ✎
                             </span>
                         )}
                      </div>
                  )}
                  
                  <div className="flex items-center gap-3 my-1">
                     <span className={`${
                         isRecycleView 
                            ? 'text-emerald-500/40' 
                            : (isDeleteMode ? 'text-red-500/40' : 'text-green-500/40')
                     } text-lg`}>➔</span>
                     <code className={`text-lg text-white font-mono break-all px-2 py-1 rounded w-full border border-transparent ${
                       isRecycleView
                         ? 'bg-emerald-900/10'
                         : (isDeleteMode 
                             ? 'bg-red-900/10 group-hover:border-red-500/20' 
                             : 'bg-green-900/10 group-hover:border-green-500/20'
                           )
                     }`}>
                       {entry.password}
                     </code>
                  </div>

                  {/* Expiration Management */}
                  {!isDeleteMode && !isRecycleView && (
                      <div className="flex items-center justify-between bg-black/30 p-1.5 rounded border border-white/5 mt-1">
                          {editingExpiryId === entry.id ? (
                              <div className="flex items-center gap-2 w-full animate-in fade-in duration-200">
                                  <AutoFocusInput 
                                    type="date"
                                    value={expiryValue}
                                    onChange={(e) => setExpiryValue(e.target.value)}
                                    className="bg-black text-white text-[10px] font-mono border border-green-500/50 rounded px-1 w-full focus:outline-none"
                                  />
                                  <button onClick={() => submitExpiry(entry.id)} className="text-green-500 text-[10px] hover:text-white">✔</button>
                                  <button onClick={() => setEditingExpiryId(null)} className="text-red-500 text-[10px] hover:text-white">✕</button>
                              </div>
                          ) : (
                              <>
                                <div className={`text-[10px] font-mono uppercase flex items-center gap-2 ${expiryStatus.color}`}>
                                    {expiryStatus.status === 'expired' && <span className="animate-pulse">⚠️</span>}
                                    {expiryStatus.label}
                                </div>
                                <button 
                                    onClick={() => startEditingExpiry(entry)}
                                    className="text-[10px] text-gray-600 hover:text-green-400 transition-colors uppercase font-mono border border-transparent hover:border-green-500/30 px-1 rounded"
                                    title="Change Expiration Date"
                                >
                                    📅 SCHEDULE
                                </button>
                              </>
                          )}
                      </div>
                  )}

                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5">
                    <div className="text-[10px] text-gray-500 font-mono">
                        {entry.lastAccessedAt ? (
                            <span className="text-amber-500/70">DECRYPTED: {entry.lastAccessedAt}</span>
                        ) : (
                            <span className="opacity-30">ENCRYPTED AT REST</span>
                        )}
                    </div>
                    
                    {/* Actions Panel */}
                    <div className="flex gap-2">
                        {isRecycleView ? (
                            <>
                                <CyberButton 
                                    onClick={() => onPermanentDelete && onPermanentDelete(entry.id)}
                                    variant="danger"
                                    className="!py-1 !px-2 text-[10px]"
                                >
                                    SHRED
                                </CyberButton>
                                <CyberButton 
                                    onClick={() => onRestore && onRestore(entry.id)}
                                    className="!py-1 !px-2 text-[10px] bg-emerald-900/20 text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-black"
                                >
                                    RESTORE
                                </CyberButton>
                            </>
                        ) : (
                            isDeleteMode ? (
                                <CyberButton 
                                    onClick={() => onDelete(entry.id)}
                                    variant="danger"
                                    className="!py-1 !px-3 text-[10px] shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                                >
                                    DELETE
                                </CyberButton>
                            ) : (
                                <CyberButton 
                                    onClick={() => onCopy(entry.id, entry.password)}
                                    variant="secondary"
                                    className="!py-1 !px-3 text-[10px]"
                                >
                                    DECRYPT
                                </CyberButton>
                            )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t bg-black/80 ${borderColor} relative flex flex-col items-center gap-4`}>
          <p className={`text-[10px] font-mono ${
              isRecycleView ? 'text-emerald-900' : (isDeleteMode ? 'text-red-900' : 'text-green-900')
          }`}>
            {isRecycleView 
                ? 'RECOVERY_MODULE_ACTIVE' 
                : (isDeleteMode ? 'SYSTEM_STATUS: PURGE_READY' : 'ENCRYPTED_STORAGE_VOLUME_01 // READ_ONLY')
            }
          </p>
          
          {/* Embedded Firewall Guard - Bottom Right */}
          <div className="w-full flex justify-end">
            <FirewallGuard className="w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordVault;
