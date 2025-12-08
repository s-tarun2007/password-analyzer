import React, { useState, useEffect } from 'react';
import { SavedPasswordEntry } from '../types';
import CyberButton from './CyberButton';

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
}

const PasswordVault: React.FC<PasswordVaultProps> = ({ 
  isOpen, 
  onClose, 
  savedPasswords, 
  deletedPasswords = [],
  onCopy, 
  onDelete,
  onRestore,
  onPermanentDelete,
  onUpdateDescription
}) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  
  // Description editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
        setShowRecycleBin(false);
        setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getScoreColorClass = (score: number) => {
    if (score < 50) return 'text-red-500 border-red-500/50 bg-red-900/20';
    if (score < 80) return 'text-yellow-500 border-yellow-500/50 bg-yellow-900/20';
    return 'text-green-500 border-green-500/50 bg-green-900/20';
  };

  // Determine active list and theme based on Recycle Bin state
  const isRecycleView = showRecycleBin;
  const activeList = isRecycleView ? deletedPasswords : savedPasswords;
  
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
      // Only allow toggling if we are in delete mode OR we are already in recycle bin
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

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
          submitEdit(id);
      } else if (e.key === 'Escape') {
          setEditingId(null);
          setEditValue(""); // Discard changes
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
                : (isDeleteMode ? 'DANGER: DELETION ENABLED' : 'Stored Credentials Database')
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

        {/* Control Bar */}
        {!isRecycleView && (
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
                  {isRecycleView ? '♻️' : '📂'}
              </div>
              <p className={`text-sm font-mono ${titleColor}`}>
                  {isRecycleView ? 'BIN EMPTY' : 'VAULT EMPTY'}
              </p>
              <p className="text-xs text-green-900 mt-2">
                  {isRecycleView ? 'No deleted items found.' : 'No credentials archived yet.'}
              </p>
            </div>
          ) : (
            activeList.map((entry) => (
              <div 
                key={entry.id} 
                className={`bg-black/50 border p-4 group transition-colors relative overflow-hidden rounded-xl ${
                  isRecycleView
                    ? 'border-emerald-500/20 hover:border-emerald-500/50'
                    : (isDeleteMode 
                        ? 'border-red-500/20 hover:border-red-500/50' 
                        : 'border-green-500/20 hover:border-green-500/50'
                      )
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className={`text-[10px] font-mono ${
                        isRecycleView ? 'text-emerald-500/50' : (isDeleteMode ? 'text-red-500/50' : 'text-green-500/50')
                    }`}>
                      {isRecycleView ? 'DELETED_AT: NOW' : `SAVED: ${entry.savedAt}`}
                    </div>
                    {/* Score Indicator */}
                    {entry.score !== undefined && (
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColorClass(entry.score)}`}>
                            {entry.score}/100
                        </div>
                    )}
                  </div>

                  {/* Description Display / Edit */}
                  {editingId === entry.id ? (
                      <input 
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => submitEdit(entry.id)}
                          onKeyDown={(e) => handleKeyDown(e, entry.id)}
                          className="w-full bg-black border border-green-500 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-green-400 mt-2 placeholder-green-900/50"
                          autoFocus
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
                          title={isDeleteMode || isRecycleView ? undefined : "Click to edit description"}
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

                  <div className="flex justify-between items-end mt-2">
                    <div className="text-[10px] text-gray-500 font-mono">
                        {entry.lastAccessedAt ? (
                            <span className="text-amber-500/70">LAST_ACCESS: {entry.lastAccessedAt}</span>
                        ) : (
                            <span className="opacity-30">NEVER ACCESSED</span>
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
                                    COPY
                                </CyberButton>
                            )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-center bg-black/80 ${borderColor}`}>
          <p className={`text-[10px] font-mono ${
              isRecycleView ? 'text-emerald-900' : (isDeleteMode ? 'text-red-900' : 'text-green-900')
          }`}>
            {isRecycleView 
                ? 'RECOVERY_MODULE_ACTIVE' 
                : (isDeleteMode ? 'SYSTEM_STATUS: PURGE_READY' : 'ENCRYPTED_STORAGE_VOLUME_01 // READ_ONLY')
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordVault;