
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Model, BenchmarkResult } from '../types';
import { MetricsDisplay } from './MetricsDisplay';
import { CopyButton } from './CopyButton';
import { CodeBracketIcon } from './Icons';

interface ResponseColumnProps {
  model: Model;
  result: BenchmarkResult | undefined;
  isLoading: boolean;
  quality?: number;
  onQualityChange?: (newQuality: number) => void;
}

export const ResponseColumn: React.FC<ResponseColumnProps> = ({ model, result, isLoading, quality, onQualityChange }) => {
  const renderContent = () => {
    if (isLoading && (!result || result.status !== 'completed')) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin border-t-cyan-400"></div>
          <p>Đang lấy phản hồi...</p>
        </div>
      );
    }
    
    if (result?.status === 'loading') {
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin border-t-cyan-400"></div>
            <p>Đang chờ các mô hình khác...</p>
          </div>
        );
    }

    if (!result || result.status === 'error') {
      const errorMessage = result?.status === 'error' ? result.message : "Không nhận được phản hồi.";
      return (
        <div className="text-red-400 p-4">
          <p className="font-semibold">Đã xảy ra lỗi</p>
          <p>{errorMessage}</p>
        </div>
      );
    }
    
    if (result.status === 'completed') {
       return (
            <>
                <div className="prose prose-invert prose-sm max-w-none flex-grow custom-scrollbar overflow-y-auto p-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // FIX: The 'inline' property is deprecated in recent react-markdown versions.
                      // The logic is updated to rely on the presence of a language class to identify code blocks.
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            // FIX: Correctly type the style prop for react-syntax-highlighter.
                            // The imported style object `atomDark` type was not perfectly matching the expected prop type.
                            style={atomDark as any}
                            language={match[1]}
                            PreTag="div"
                            // FIX: The props from react-markdown (like `ref`) are not compatible with SyntaxHighlighter.
                            // By removing `{...props}`, we prevent passing down invalid attributes that cause a type error.
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {result.response}
                  </ReactMarkdown>
                </div>
                <MetricsDisplay data={result} quality={quality} onQualityChange={onQualityChange} />
            </>
       )
    }

    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg flex flex-col border border-gray-700 h-full max-h-[70vh] min-h-[400px]">
      <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-t-xl border-b border-gray-600">
        <div className="flex items-center gap-2">
          <CodeBracketIcon className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">{model.name}</h3>
          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">{model.provider}</span>
        </div>
        {result?.status === 'completed' && <CopyButton textToCopy={result.response} />}
      </div>
      <div className="flex-grow flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};