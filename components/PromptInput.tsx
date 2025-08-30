import React from 'react';
import { SendIcon } from './Icons';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onPromptChange, onSubmit, isLoading }) => {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập truy vấn của bạn tại đây... (ví dụ: 'viết một hàm python để sắp xếp một danh sách')"
        className="w-full h-28 p-4 pr-28 bg-gray-700/50 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 custom-scrollbar"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !prompt.trim()}
        className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Đang gửi...</span>
          </>
        ) : (
          <>
            <SendIcon className="h-5 w-5" />
            <span>Gửi</span>
          </>
        )}
      </button>
    </div>
  );
};