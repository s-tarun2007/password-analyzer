
import React from 'react';

interface SidePanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ activeTab, onTabChange, isOpen, toggleOpen }) => {
  
  const navItems = [
    { id: 'landing', label: 'Home Base', icon: '🏠', color: 'gray' },
    { id: 'password', label: 'Password Strength', icon: '🔑', color: 'green' },
    { id: 'fraud-shield', label: 'FraudShield AI', icon: '🧠', color: 'purple' },
    { id: 'link-verifier', label: 'Line Verifier', icon: '🔗', color: 'cyan' },
    { id: 'deep-fake', label: 'Deep Fake Scan', icon: '🎭', color: 'blue' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleOpen}
      />

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-black border-r border-gray-800 z-[100] transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header Image Section */}
        <div className="h-48 w-full relative overflow-hidden group">
             {/* Abstract/Tech Background Placeholder */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
             
             <div className="absolute bottom-4 left-4">
                 <h2 className="text-white font-bold text-lg tracking-wider">SECURE.IO</h2>
                 <p className="text-[10px] text-gray-400">One Vision, Endless Possibilities.</p>
             </div>
        </div>

        {/* Client Info / Purpose */}
        <div className="p-6 border-b border-gray-800">
            <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2">Mission Statement</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                Providing elite digital defense mechanisms for enterprise clients. Real-time threat analysis and credential fortification.
            </p>
            <div className="mt-4 flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] text-green-500">SYSTEMS OPERATIONAL</span>
            </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-3">
            <h3 className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-2 px-2">Security Modules</h3>
            {navItems.map((item) => {
                const isActive = activeTab === item.id;
                // Dynamic Liquid Glass Button Style for Nav
                return (
                    <button
                        key={item.id}
                        onClick={() => { onTabChange(item.id); toggleOpen(); }}
                        className={`w-full relative group overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-300 ${isActive ? 'bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                        <div className={`flex items-center gap-3 relative z-10 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        
                        {/* Active Glow Bar */}
                        {isActive && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${item.color}-500 shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${item.color}-500`}></div>
                        )}
                        
                        {/* Hover Liquid Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </button>
                )
            })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-black/20 text-center">
            <p className="text-[9px] text-gray-600">© 2024 SECURITY SUITE</p>
        </div>
      </div>
    </>
  );
};

export default SidePanel;
