
import React, { useState, useEffect } from 'react';
import { useApiKeys } from '../contexts/ApiKeysContext';
import { XMarkIcon } from './Icons';
import type { ApiKeys } from '../types';

interface ApiKeyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isVisible, onClose }) => {
  const { apiKeys, setApiKeys } = useApiKeys();
  const [localKeys, setLocalKeys] = useState<ApiKeys>(apiKeys);

  useEffect(() => {
    // Sync local state if global state changes (e.g., from another tab)
    setLocalKeys(apiKeys);
  }, [apiKeys, isVisible]);

  const handleSave = () => {
    setApiKeys(localKeys);
    onClose();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalKeys(prev => ({ ...prev, [name]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Cài đặt API Keys</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors"><XMarkIcon className="h-6 w-6" /></button>
        </header>
        <div className="p-6 space-y-4">
          {/* FIX: Removed Google Gemini API Key input to comply with @google/genai guidelines. */}
          <div>
            <label htmlFor="openai-key" className="block mb-2 text-sm font-medium text-gray-300">
              OpenAI API Key (GPT-4o, v.v...)
            </label>
            <input
              type="password"
              id="openai-key"
              name="openai"
              value={localKeys.openai}
              onChange={handleInputChange}
              className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
              placeholder="Nhập khóa API của bạn"
            />
          </div>
           <div>
            <label htmlFor="deepseek-key" className="block mb-2 text-sm font-medium text-gray-300">
              DeepSeek API Key
            </label>
            <input
              type="password"
              id="deepseek-key"
              name="deepseek"
              value={localKeys.deepseek}
              onChange={handleInputChange}
              className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
              placeholder="Nhập khóa API của bạn"
            />
          </div>
          <p className="text-xs text-gray-500 text-center pt-2">
              Các khóa API của bạn được lưu trữ an toàn ngay trên trình duyệt của bạn và không bao giờ được gửi đến máy chủ của chúng tôi.
          </p>
        </div>
        <footer className="flex justify-end p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-xl">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors mr-2">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors">Lưu thay đổi</button>
        </footer>
      </div>
    </div>
  );
};
