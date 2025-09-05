
import React, { useState, useCallback, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ModelSelector } from './components/ModelSelector';
import { ResponseColumn } from './components/ResponseColumn';
import { HistoryModal } from './components/HistoryModal';
import { Welcome } from './components/Welcome';
import { RadarChart } from './components/RadarChart';
import { getAiResponseStream } from './services/aiService';
import { MODELS } from './constants';
import type { HistoryEntry, BenchmarkResult, Model, BenchmarkData } from './types';
import { BrainCircuitIcon, HistoryIcon, InformationCircleIcon, Cog6ToothIcon } from './components/Icons';
import { Tutorial } from './components/Tutorial';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useApiKeys } from './contexts/ApiKeysContext';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>(MODELS.map(m => m.id));
  const [results, setResults] = useState<Record<string, BenchmarkResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const localHistory = window.localStorage.getItem('aiNexusHistory');
      return localHistory ? JSON.parse(localHistory) : [];
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      return [];
    }
  });
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(false);
  
  const [showWelcome, setShowWelcome] = useState(true);

  // API Key Modal State
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);
  const { apiKeys } = useApiKeys();

  // Tutorial State
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  useEffect(() => {
    const hasSeenTutorial = window.localStorage.getItem('aiNexusTutorialSeen');
    if (!hasSeenTutorial) {
      setIsTutorialVisible(true);
    }
  }, []);


  useEffect(() => {
    try {
      window.localStorage.setItem('aiNexusHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);
  
  const completedComparisonResults = Object.values(results)
      .filter(r => r.status === 'completed')
      .map(r => r as BenchmarkData);


  const handlePromptSubmit = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResults({});
    setShowWelcome(false);

    const submissionId = Date.now();
    const newHistoryEntries: Record<string, HistoryEntry> = {};

    const modelsToQuery = MODELS.filter(m => selectedModels.includes(m.id));
    
    const initialResults: Record<string, BenchmarkResult> = {};
    modelsToQuery.forEach(m => {
      initialResults[m.id] = { status: 'loading' };
    });
    setResults(initialResults);

    await Promise.all(
      modelsToQuery.map(async (model) => {
        
        const onChunk = (chunk: string) => {
          setResults(prev => {
            const currentResult = prev[model.id];
            let existingResponse = '';
            if (currentResult?.status === 'completed') {
                existingResponse = currentResult.response;
            } else if (currentResult?.status === 'error') {
                // If we start getting chunks, it means the error was transient. Clear it.
                existingResponse = '';
            }
            
            return {
               ...prev,
              [model.id]: {
                status: 'completed',
                model: model,
                response: existingResponse + chunk,
                time: 0, cost: 0, tokens: { input: 0, output: 0 }
              }
            }
          });
        };
        
        try {
          const result = await getAiResponseStream(prompt, model, apiKeys, onChunk);
          
          const finalEntry = {
            id: `${submissionId}-${model.id}`,
            submissionId,
            prompt,
            ...result,
            quality: 0
          };
          
          newHistoryEntries[model.id] = finalEntry;
          setResults(prev => ({ ...prev, [model.id]: { status: 'completed', ...result } }));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
          setResults(prev => ({ ...prev, [model.id]: { status: 'error', message } }));
        }
      })
    );
    setHistory(prev => [...Object.values(newHistoryEntries), ...prev]);
    setIsLoading(false);
  }, [prompt, isLoading, selectedModels, apiKeys]);
  
  const handleQualityChange = (id: string, newQuality: number) => {
    setHistory(prevHistory =>
      prevHistory.map(entry =>
        entry.id === id ? { ...entry, quality: newQuality } : entry
      )
    );
  };
  
  const getQualityForResponse = (response: string): number => {
      const historyEntry = history.find(h => h.response === response);
      return historyEntry?.quality || 0;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8 font-sans">
      <Tutorial isVisible={isTutorialVisible} onClose={() => setIsTutorialVisible(false)} />
      <ApiKeyModal isVisible={isApiKeyModalVisible} onClose={() => setIsApiKeyModalVisible(false)} />
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Nexus</h1>
        </div>
        <div className="flex items-center gap-2">
           <button
              onClick={() => setIsApiKeyModalVisible(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
              title="Cài đặt API Keys"
            >
              <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
              onClick={() => setIsTutorialVisible(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
              title="Xem lại hướng dẫn"
            >
              <InformationCircleIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsHistoryVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200"
          >
            <HistoryIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Lịch sử & Phân tích</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <ModelSelector models={MODELS} selected={selectedModels} onChange={setSelectedModels} />
          </div>
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handlePromptSubmit}
            isLoading={isLoading}
          />
        </div>
        
        {showWelcome && <Welcome />}

        {!showWelcome && (
          <div className="flex flex-col gap-6">
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
              {MODELS.filter(m => selectedModels.includes(m.id)).map((model: Model) => (
                <ResponseColumn
                  key={model.id}
                  model={model}
                  result={results[model.id]}
                  isLoading={isLoading && !results[model.id]}
                  quality={results[model.id]?.status === 'completed' ? getQualityForResponse((results[model.id] as BenchmarkData).response) : 0}
                  onQualityChange={(newQuality) => {
                      const result = results[model.id];
                      if(result?.status === 'completed') {
                        const hEntry = history.find(h => h.response === result.response);
                        if(hEntry) handleQualityChange(hEntry.id, newQuality);
                      }
                  }}
                />
              ))}
            </div>
             {completedComparisonResults.length > 0 && (
                 <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
                     <h2 className="text-xl font-bold text-center mb-4">Phân tích Hiệu suất Trực quan</h2>
                    <RadarChart results={completedComparisonResults} history={history}/>
                </div>
            )}
          </div>
        )}
      </main>

      <HistoryModal
        isVisible={isHistoryVisible}
        onClose={() => setIsHistoryVisible(false)}
        history={history}
        onQualityChange={handleQualityChange}
      />
    </div>
  );
};

export default App;
