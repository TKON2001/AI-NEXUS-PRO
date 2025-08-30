import React from 'react';
import type { BenchmarkData } from '../types';
import { ClockIcon, CurrencyDollarIcon, CubeIcon } from './Icons';

interface MetricsDisplayProps {
  data: BenchmarkData;
  quality?: number;
  onQualityChange?: (newQuality: number) => void;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ data, quality, onQualityChange }) => {
  return (
    <div className="p-3 bg-gray-900/50 rounded-b-xl border-t border-gray-700 text-sm text-gray-300">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5" title="Thời gian phản hồi">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <span>{data.time.toFixed(2)}s</span>
        </div>
        <div className="flex items-center gap-1.5" title="Chi phí ước tính">
          <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
          <span>${data.cost.toFixed(5)}</span>
        </div>
        <div className="flex items-center gap-1.5" title={`Đầu vào: ${data.tokens.input} / Đầu ra: ${data.tokens.output}`}>
          <CubeIcon className="h-4 w-4 text-gray-400" />
          <span>{data.tokens.input + data.tokens.output} Tokens</span>
        </div>
      </div>
       {onQualityChange && quality !== undefined && (
        <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
            <span className="font-medium">Đánh giá chất lượng:</span>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => onQualityChange(star)} className="focus:outline-none">
                        <svg
                            className={`w-6 h-6 ${quality >= star ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
       )}
    </div>
  );
};