
import type { Model } from './types';

export const MODELS: Model[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', isApiDriven: true },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', isApiDriven: true },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek', isApiDriven: true },
];

// Mock pricing in USD per 1M tokens for simulation
export const MOCK_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.35, output: 1.05 }, // Approximate pricing for context
  'gpt-4o': { input: 5.00, output: 15.00 },
  'deepseek-coder': { input: 0.14, output: 0.28 },
};