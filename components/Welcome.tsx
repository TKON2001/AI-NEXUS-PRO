import React from 'react';
import { BrainCircuitIcon } from './Icons';

export const Welcome: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-xl border border-dashed border-gray-700">
      <BrainCircuitIcon className="h-16 w-16 text-cyan-500 mb-4" />
      <h2 className="text-3xl font-bold text-white mb-2">Chào mừng đến với AI Nexus</h2>
      <p className="max-w-xl text-gray-400">
        Bắt đầu bằng cách nhập một truy vấn vào ô bên trên. Bạn có thể so sánh hiệu suất của nhiều mô hình AI cùng lúc hoặc để hệ thống của chúng tôi tự động chọn mô hình tốt nhất cho bạn.
      </p>
    </div>
  );
};
