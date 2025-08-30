import React from 'react';
import type { AppMode } from '../types';

interface ModeSwitcherProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, setMode }) => {
  const isComparison = mode === 'comparison';

  return (
    <div className="flex items-center p-1 bg-gray-700/50 rounded-lg">
      <button
        onClick={() => setMode('comparison')}
        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${isComparison ? 'bg-cyan-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
      >
        Chế độ So sánh
      </button>
      <button
        onClick={() => setMode('advanced')}
        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-300 ${!isComparison ? 'bg-cyan-600 text-white shadow' : 'text-gray-300 hover:bg-gray-600/50'}`}
      >
        Chế độ Nâng cao
      </button>
    </div>
  );
};