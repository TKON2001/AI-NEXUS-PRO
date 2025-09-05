export interface Model {
  id: string;
  name: string;
  provider: string;
  isApiDriven: boolean;
}

export interface BenchmarkData {
  model: Model;
  response: string;
  time: number;
  cost: number;
  tokens: {
    input: number;
    output: number;
  };
  routingReason?: string;
  quality?: number;
}

export type BenchmarkResult = 
  | { status: 'loading' }
  | ({ status: 'completed' } & BenchmarkData)
  | { status: 'error', message: string };

export interface HistoryEntry extends BenchmarkData {
  id: string;
  submissionId: number;
  prompt: string;
  quality: number;
}

export interface ApiKeys {
  openai: string;
  deepseek: string;
}

// FIX: Add missing type definitions to resolve compilation errors.
export type AppMode = 'comparison' | 'advanced';
export type Priority = 'quality' | 'cost' | 'speed';
export type TaskMode = 'routing' | 'debate';
export interface AdvancedResult {
  model?: Model;
  finalResponse: string;
  time?: number;
  cost?: number;
  tokens?: { input: number; output: number };
  progress: string[];
}
