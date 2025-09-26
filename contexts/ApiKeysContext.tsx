
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { ApiKeys } from '../types';

interface ApiKeysContextType {
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

// FIX: Removed 'gemini' from initial state to comply with @google/genai guidelines.
const initialKeys: ApiKeys = {
  openai: '',
  deepseek: '',
};

export const ApiKeysProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    try {
      const storedKeys = window.localStorage.getItem('aiNexusApiKeys');
      if (storedKeys) {
        const parsed = JSON.parse(storedKeys);
        // FIX: Ensure that we only use keys defined in the new ApiKeys type to avoid stale data.
        return {
          openai: parsed.openai || '',
          deepseek: parsed.deepseek || '',
        };
      }
      return initialKeys;
    } catch (error) {
      console.error("Failed to parse API keys from localStorage", error);
      return initialKeys;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('aiNexusApiKeys', JSON.stringify(apiKeys));
    } catch (error) {
      console.error("Failed to save API keys to localStorage", error);
    }
  }, [apiKeys]);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, setApiKeys }}>
      {children}
    </ApiKeysContext.Provider>
  );
};

export const useApiKeys = (): ApiKeysContextType => {
  const context = useContext(ApiKeysContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
};
