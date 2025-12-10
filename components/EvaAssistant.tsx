
import React, { useState, useEffect, useRef } from 'react';
import CyberButton from './CyberButton';

const EvaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [imgError, setImgError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reliable source for Eva Unit-01 (Wikimedia)
  const evaImage = "https://upload.wikimedia.org/wikipedia/sh/thumb/8/8b/Eva_unit_01.png/250px-Eva_unit_01.png";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial Greeting
      setTimeout(() => {
        setMessages([{
          sender: 'bot',
          text: "Hi, I'm Eva, your AI Security Assistant. I can help you understand your risk analysis, explain fraud patterns, or guide you through the platform. How can I assist you today?"
        }]);
      }, 500);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');

    // Simulate AI Response
    setTimeout(() => {
      let response = "I'm processing your request against our security database...";
      if (userMsg.toLowerCase().includes('password')) {
        response = "For password strength, I recommend using our tactical builder. It increases entropy without making the password impossible to remember.";
      } else if (userMsg.toLowerCase().includes('fraud') || userMsg.toLowerCase().includes('scam')) {
        response = "FraudShield AI analyzes text patterns for urgency and linguistic anomalies common in social engineering attacks.";
      } else if (userMsg.toLowerCase().includes('help')) {
        response = "You can use the sidebar menu to navigate between the Password Tool, FraudShield, Link Verifier, and DeepFake scanner.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 1000);
  };

  const AvatarDisplay = () => {
    if (imgError) {
      return (
        <div className="w-full h-full bg-purple-900 flex items-center justify-center text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
             <path d="M4 11v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"></path>
             <path d="M12 11v8"></path>
             <path d="M9 21v-3"></path>
             <path d="M15 21v-3"></path>
           </svg>
        </div>
      );
    }
    return (
      <img 
        src={evaImage} 
        alt="Eva AI" 
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <>
      {/* Floating Trigger Button 
          Positioned approx 2cm up from bottom (bottom-24) 
      */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-[90] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-900 border border-purple-500' : 'bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50'}`}
      >
        {isOpen ? (
          <span className="text-xl text-purple-300">✕</span>
        ) : (
          <div className="relative w-full h-full rounded-full overflow-hidden">
             <AvatarDisplay />
             {!imgError && <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay"></div>}
          </div>
        )}
      </button>

      {/* Chat Window 
          Positioned above the button (bottom-40)
      */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-[90] w-80 md:w-96 h-96 bg-slate-950/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-purple-900/10 border-b border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/50">
               <AvatarDisplay />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Eva Unit-01 Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-500/80 uppercase">Systems Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-purple-600 text-white font-medium rounded-tr-none' 
                    : 'bg-slate-800 text-gray-200 border border-gray-700 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-800 bg-black/40 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Eva..."
              className="flex-1 bg-slate-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              onClick={handleSend}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
};

export default EvaAssistant;
