
import React, { useState, useEffect } from 'react';
import CyberButton from './CyberButton';

interface AdminControlPanelProps {
  onClose: () => void;
}

const AdminControlPanel: React.FC<AdminControlPanelProps> = ({ onClose }) => {
  const [subKeys, setSubKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('SYSTEM_SUB_KEYS');
    if (stored) {
      try {
        setSubKeys(JSON.parse(stored));
      } catch (e) {
        setSubKeys([]);
      }
    }
  }, []);

  const handleGenerateKey = () => {
    const newKey = 'USER-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const updated = [...subKeys, newKey];
    setSubKeys(updated);
    localStorage.setItem('SYSTEM_SUB_KEYS', JSON.stringify(updated));
  };

  const handleRevokeKey = (keyToRemove: string) => {
    const updated = subKeys.filter(k => k !== keyToRemove);
    setSubKeys(updated);
    localStorage.setItem('SYSTEM_SUB_KEYS', JSON.stringify(updated));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-red-500/30 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-red-500/20 bg-red-900/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
              <span>🛡️</span> Admin Control Panel
            </h2>
            <p className="text-[10px] text-red-400/60 font-mono mt-1">MASTER_ACCESS_GRANTED // MANAGE_SUB_KEYS</p>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-end mb-6">
             <div>
               <h3 className="text-sm font-bold text-white uppercase">Active Access Keys</h3>
               <p className="text-xs text-gray-500">Manage entry tokens for authorized personnel.</p>
             </div>
             <CyberButton onClick={handleGenerateKey} variant="warning" className="text-xs">
                + GENERATE NEW KEY
             </CyberButton>
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-xl overflow-hidden min-h-[200px] max-h-[400px] overflow-y-auto">
             {subKeys.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-gray-600">
                 <span className="text-2xl mb-2">🚫</span>
                 <p className="text-xs font-mono uppercase">No Active Sub-Users</p>
               </div>
             ) : (
               <table className="w-full text-left">
                 <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-mono">
                   <tr>
                     <th className="p-3">Key ID</th>
                     <th className="p-3">Status</th>
                     <th className="p-3 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {subKeys.map((key) => (
                     <tr key={key} className="hover:bg-white/5 transition-colors group">
                       <td className="p-3 font-mono text-sm text-green-400">{key}</td>
                       <td className="p-3">
                         <span className="text-[10px] bg-green-900/20 text-green-500 px-2 py-0.5 rounded border border-green-500/20">ACTIVE</span>
                       </td>
                       <td className="p-3 text-right flex justify-end gap-2">
                         <button 
                           onClick={() => copyToClipboard(key)}
                           className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded border border-transparent hover:border-gray-600"
                         >
                           {copied === key ? 'COPIED' : 'COPY'}
                         </button>
                         <button 
                           onClick={() => handleRevokeKey(key)}
                           className="text-xs text-red-500 hover:bg-red-900/20 px-2 py-1 rounded border border-transparent hover:border-red-500/30"
                         >
                           REVOKE
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black border-t border-gray-800 text-center">
           <p className="text-[10px] text-gray-600 font-mono">
             SYSTEM LOG: ADMIN_SESSION_ACTIVE
           </p>
        </div>

      </div>
    </div>
  );
};

export default AdminControlPanel;
