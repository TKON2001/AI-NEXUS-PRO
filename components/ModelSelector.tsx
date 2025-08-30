import React from 'react';
import type { Model } from '../types';

interface ModelSelectorProps {
  models: Model[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selected, onChange }) => {
  const handleCheckboxChange = (modelId: string) => {
    const newSelection = selected.includes(modelId)
      ? selected.filter((id) => id !== modelId)
      : [...selected, modelId];
    onChange(newSelection);
  };

  return (
    <div className="flex-grow flex items-center gap-4 p-2 bg-gray-700/50 rounded-lg">
      <span className="font-semibold text-gray-300 ml-2">So sánh các mô hình:</span>
      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
        {models.map((model) => (
          <label key={model.id} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(model.id)}
              onChange={() => handleCheckboxChange(model.id)}
              className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
            />
            <span className="text-gray-200 group-hover:text-white transition-colors">{model.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};