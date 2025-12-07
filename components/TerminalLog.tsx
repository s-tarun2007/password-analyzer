import React, { useEffect, useRef } from 'react';
import { TerminalLine } from '../types';

interface TerminalLogProps {
  logs: TerminalLine[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-64 bg-black/80 border border-green-500/30 font-mono text-xs md:text-sm overflow-hidden flex flex-col box-glow relative rounded-xl">
      <div className="absolute top-0 left-0 w-full bg-green-500/10 px-4 py-2 text-green-400 text-[10px] uppercase tracking-wider border-b border-green-500/30 flex justify-between rounded-t-xl">
        <span>sys.log.trace</span>
        <span className="animate-pulse">● LIVE</span>
      </div>
      
      <div className="flex-1 overflow-y-auto mt-8 mb-2 px-4 space-y-1">
        {logs.length === 0 && (
          <div className="text-green-900 italic">Waiting for input stream...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3">
            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
            <span className={`
              ${log.type === 'error' ? 'text-red-500' : ''}
              ${log.type === 'warning' ? 'text-yellow-500' : ''}
              ${log.type === 'success' ? 'text-green-400' : ''}
              ${log.type === 'info' ? 'text-blue-400' : ''}
              break-all
            `}>
              {log.type === 'error' && '>> CRITICAL: '}
              {log.type === 'warning' && '>> WARN: '}
              {log.type === 'success' && '>> OK: '}
              {log.text}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default TerminalLog;