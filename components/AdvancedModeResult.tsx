import React from 'react';
import type { AdvancedResult } from '../types';
import { ResponseColumn } from './ResponseColumn';

interface AdvancedModeResultProps {
  result: AdvancedResult;
  isLoading: boolean;
}

export const AdvancedModeResult: React.FC<AdvancedModeResultProps> = ({ result, isLoading }) => {
  const model = result.model || { id: 'advanced-result', name: 'Kết quả Nâng cao', provider: 'AI Nexus', isApiDriven: true };

  const renderContent = () => {
    // This is a special case where result can be populated while isLoading is still true (streaming)
    if (!result) {
        return <p className="text-center p-8 text-gray-400">Đang chờ kết quả...</p>
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg mb-2 text-cyan-300">Nhật ký Tác vụ</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                    {result.progress.map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                           { (isLoading && index === result.progress.length - 1) ? 
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div> :
                             <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                           }
                           <span>{step}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4">
                 <ResponseColumn
                    model={model}
                    result={{
                        status: 'completed',
                        model: model,
                        response: result.finalResponse,
                        time: result.time || 0,
                        cost: result.cost || 0,
                        tokens: result.tokens || { input: 0, output: 0 },
                    }}
                    isLoading={isLoading && !result.finalResponse}
                 />
            </div>
        </div>
    )
  }

  return (
    <div>
        {renderContent()}
    </div>
  );
};