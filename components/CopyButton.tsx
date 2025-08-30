import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-md transition-all duration-200"
      title={isCopied ? "Đã sao chép!" : "Sao chép"}
    >
      {isCopied ? (
        <>
          <CheckIcon className="h-4 w-4 text-green-400" />
          <span className="text-green-400">Đã sao chép!</span>
        </>
      ) : (
        <>
          <ClipboardIcon className="h-4 w-4" />
          <span>Sao chép</span>
        </>
      )}
    </button>
  );
};
