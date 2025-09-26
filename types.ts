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

// FIX: Add AppMode type export to resolve import error in ModeSwitcher.tsx
export type AppMode = 'comparison' | 'advanced';

// FIX: Add TaskMode type export to resolve import error in AutoSelectDashboard.tsx
export type TaskMode = 'routing' | 'debate';

// FIX: Add Priority type export to resolve import error in AutoSelectDashboard.tsx
export type Priority = 'quality' | 'cost' | 'speed';

// FIX: Add AdvancedResult type export to resolve import error in AdvancedModeResult.tsx
export interface AdvancedResult {
  model?: Model;
  progress: string[];
  finalResponse: string;
  time?: number;
  cost?: number;
  tokens?: {
    input: number;
    output: number;
  };
}
