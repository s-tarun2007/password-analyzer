
import React from 'react';

const DeepFake: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 rounded-full border border-dashed border-gray-700 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>
            <span className="text-5xl opacity-50">🎭</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-widest uppercase mb-2">Deep Fake Detector</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-4"></div>
        <p className="text-blue-400 font-mono">MODULE_UNDER_CONSTRUCTION</p>
        <p className="text-gray-600 text-xs mt-2 max-w-md text-center">
            Neural networks are being trained to identify synthetic media artifacts.
            <br/>Status: 78% Complete.
        </p>
    </div>
  );
};

export default DeepFake;
