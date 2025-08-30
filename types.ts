
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

export type AppMode = 'comparison' | 'advanced';
export type Priority = 'quality' | 'cost' | 'speed';
export type TaskMode = 'routing' | 'debate';

export interface AdvancedResult {
  status: 'progress' | 'completed';
  progress: string[];
  finalResponse: string;
  model?: Model;
  time?: number;
  cost?: number;
  tokens?: {
    input: number;
    output: number;
  };
}

export interface ApiKeys {
  gemini: string;
  openai: string;
  deepseek: string;
}
