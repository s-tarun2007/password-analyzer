
import React from 'react';
import CyberButton from './CyberButton';

interface LandingPageProps {
  onOpenSidebar: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onOpenSidebar }) => {
  return (
    <div className="relative w-full min-h-screen bg-[#020617] text-white overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"></div>
      </div>

      {/* Top Left Sidebar Trigger */}
      <button 
        onClick={onOpenSidebar}
        className="fixed top-8 left-8 z-50 text-white/50 hover:text-green-500 transition-all hover:scale-110 duration-300 group bg-black/50 p-2 rounded-full border border-white/10 backdrop-blur"
        aria-label="Open Menu"
      >
        <span className="text-xl font-bold font-mono">&lt;</span>
      </button>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-900/10 text-green-400 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-1000">
           New: Deep Fake Detection Module V2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 leading-[1.1]">
           Turn Weak Passwords into<br/>
           <span className="text-white drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">Unhackable Digital Shields.</span>
        </h1>
        
        <p className="max-w-2xl text-gray-400 text-lg leading-relaxed mb-10 font-light">
           AI-powered password cracking simulation, phishing detection, biometric intelligence & smart security wallet — all in one platform.
        </p>

        <div className="flex flex-col md:flex-row gap-4">
             <button onClick={onOpenSidebar} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-black font-bold text-sm uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                 Start Security Audit
             </button>
             <button className="px-8 py-4 bg-transparent border border-gray-700 hover:border-white text-white font-bold text-sm uppercase tracking-widest rounded transition-all">
                 View Live Demo
             </button>
        </div>
      </header>

      {/* --- PROBLEM SECTION (PAIN) --- */}
      <section className="relative z-10 w-full bg-black/50 border-y border-white/5 py-20">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-4">
                  <div className="text-4xl font-bold text-red-500">81%</div>
                  <h3 className="text-xl font-bold text-white">Data Breaches</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                      Caused by weak or reused passwords. Hackers don't break in, they log in.
                  </p>
              </div>
              <div className="space-y-4">
                  <div className="text-4xl font-bold text-red-500">+400%</div>
                  <h3 className="text-xl font-bold text-white">Phishing Attacks</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                      AI-driven phishing campaigns are increasing every year, bypassing traditional filters.
                  </p>
              </div>
              <div className="space-y-4">
                  <div className="text-4xl font-bold text-red-500">#1 Cause</div>
                  <h3 className="text-xl font-bold text-white">Identity Theft</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                      Password reuse across multiple sites is the single biggest vulnerability.
                  </p>
              </div>
          </div>
          <div className="text-center mt-12">
              <p className="text-sm text-gray-500 uppercase tracking-widest">Security today is reactive. We make it predictive.</p>
          </div>
      </section>

      {/* --- SOLUTION SECTION --- */}
      <section className="relative z-10 w-full py-24 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Ultimate Defense Stack</h2>
              <p className="text-gray-400">Integrated modules working in tandem to secure your digital identity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                  { icon: '⚡', title: 'Live Cracking Sim', desc: 'Real-time brute force estimation engine.' },
                  { icon: '🛡️', title: 'Phishing Scanner', desc: 'Heuristic analysis of suspicious URLs.' },
                  { icon: '🧬', title: 'Biometric Intel', desc: 'WebAuthn & Retina simulation support.' },
                  { icon: '🧠', title: 'AI Evolution', desc: 'Auto-fortify weak credentials instantly.' },
                  { icon: '📂', title: 'Smart Wallet', desc: 'AES-256 encrypted local vault storage.' },
                  { icon: '📊', title: 'Forensic Report', desc: 'Downloadable PDF security audits.' },
              ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-green-500/30 transition-all group">
                      <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                      <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
              ))}
          </div>
      </section>

      {/* --- USE CASES --- */}
      <section className="relative z-10 w-full bg-[#050a1f] py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-bold mb-12 text-center">Built For Every Threat Model</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                      { role: 'Students', benefit: 'Secure Assignments' },
                      { role: 'Startups', benefit: 'Protect IP' },
                      { role: 'Banks', benefit: 'Compliance Ready' },
                      { role: 'Cyber Pros', benefit: 'Advanced Forensics' },
                      { role: 'Users', benefit: 'Peace of Mind' },
                  ].map((card, i) => (
                      <div key={i} className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-blue-500 transition-colors">
                          <h4 className="font-bold text-white mb-1">{card.role}</h4>
                          <p className="text-xs text-blue-400">{card.benefit}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- COMPETITIVE EDGE (WHY US) --- */}
      <section className="relative z-10 w-full py-24 max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Why We Are Different</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 text-left">
              <div className="flex-1 bg-gradient-to-br from-green-900/20 to-black p-8 rounded-2xl border border-green-500/20">
                  <h3 className="text-green-400 font-bold uppercase tracking-widest mb-4">The Standard Way</h3>
                  <ul className="space-y-3 text-gray-400 text-sm">
                      <li>❌ Just stores passwords</li>
                      <li>❌ Static strength checking</li>
                      <li>❌ Reacts after the hack</li>
                  </ul>
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-black p-8 rounded-2xl border border-blue-500/20">
                  <h3 className="text-blue-400 font-bold uppercase tracking-widest mb-4">The Our Way</h3>
                  <ul className="space-y-3 text-white text-sm">
                      <li>✅ Simulates real attacks live</li>
                      <li>✅ Evolves passwords using AI</li>
                      <li>✅ Converts you into a digital fortress</li>
                  </ul>
              </div>
          </div>
      </section>

      {/* --- TRUST & LEGAL --- */}
      <section className="relative z-10 w-full bg-black py-16 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="flex justify-center gap-8 mb-8">
                  <span className="text-4xl">🔒</span>
                  <span className="text-4xl">🛡️</span>
                  <span className="text-4xl">👁️</span>
              </div>
              <h2 className="text-2xl font-bold mb-6">Trust & Privacy Protocol</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 text-left bg-white/5 p-8 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                      <span className="text-green-500">✔</span> We never store raw passwords
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-green-500">✔</span> All encryption is zero-knowledge based
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-green-500">✔</span> No unauthorized hacking performed
                  </div>
                  <div className="flex items-center gap-3">
                      <span className="text-green-500">✔</span> For educational & research purposes only
                  </div>
              </div>
          </div>
      </section>

      {/* --- ANALYTICS PREVIEW --- */}
      <section className="relative z-10 w-full py-24 max-w-7xl mx-auto px-6">
          <div className="bg-slate-900/50 border border-gray-800 rounded-3xl p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">📊</div>
              <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                  <div>
                      <h2 className="text-3xl font-bold mb-4">Engineering Grade Analytics</h2>
                      <p className="text-gray-400 max-w-md">
                          We don't just give you a green checkmark. We provide crack-time graphs, attack success rates, and threat severity metering.
                      </p>
                      <button onClick={onOpenSidebar} className="mt-8 text-green-400 hover:text-green-300 font-bold uppercase text-sm tracking-widest flex items-center gap-2">
                          Access Dashboard <span className="text-xl">→</span>
                      </button>
                  </div>
                  {/* Mock Graph Visual */}
                  <div className="flex-1 w-full h-48 flex items-end justify-end gap-2 opacity-80">
                      {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                          <div key={i} className="w-8 bg-green-500/20 border-t border-green-500" style={{ height: `${h}%` }}></div>
                      ))}
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 border-t border-gray-800 text-center text-[10px] text-gray-600 uppercase tracking-widest">
          &copy; 2024 Password Strength Problem Platform. All Rights Reserved.
      </footer>

    </div>
  );
};

export default LandingPage;
