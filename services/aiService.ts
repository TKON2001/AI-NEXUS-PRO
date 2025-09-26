
import { GoogleGenAI } from "@google/genai";
import type { Model, BenchmarkData, ApiKeys } from '../types';
import { MOCK_PRICING } from '../constants';

// --- UTILITY FUNCTIONS ---

const estimateTokens = (text: string): number => {
  // A very rough estimation: 1 token ~= 4 characters
  return Math.ceil(text.length / 4);
};

const calculateCost = (modelId: string, inputTokens: number, outputTokens: number): number => {
  const pricing = MOCK_PRICING[modelId];
  if (!pricing) return 0;
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
};


// --- GENERIC STREAMING FETCHER FOR OPENAI-COMPATIBLE APIS ---

const getOpenAICompatibleResponseStream = async (
  endpoint: string,
  apiKey: string,
  modelId: string,
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error(`Khóa API cho ${modelId} chưa được cung cấp. Vui lòng thêm vào cài đặt.`);
    }
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Lỗi API từ nhà cung cấp của ${modelId}: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Không có thông tin chi tiết'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Không thể đọc phản hồi streaming.');
    }
    
    const decoder = new TextDecoder();
    let responseText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
            const jsonStr = line.replace('data: ', '');
            if (jsonStr === '[DONE]') {
                break;
            }
            try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                    responseText += content;
                    onChunk(content);
                }
            } catch (error) {
                console.error('Lỗi phân tích cú pháp JSON từ stream:', error);
            }
        }
    }
    return responseText;
};

// --- GOOGLE GEMINI API STREAMING ---

const getGoogleResponseStream = async (
    prompt: string,
    model: Model,
    apiKey: string,
    onChunk: (chunk: string) => void
): Promise<string> => {
    if (!apiKey) {
        throw new Error("Khóa API của Google Gemini chưa được cung cấp. Vui lòng thêm vào cài đặt.");
    }
    let responseText = '';
    const genAI = new GoogleGenAI({ apiKey });
    const result = await genAI.models.generateContentStream({ model: model.id, contents: prompt });

    for await (const chunk of result) {
        const chunkText = chunk.text;
        responseText += chunkText;
        onChunk(chunkText);
    }
    return responseText;
};


// --- CORE API ROUTER ---

export const getAiResponseStream = async (
    prompt: string,
    model: Model,
    apiKeys: ApiKeys,
    onChunk: (chunk: string) => void
): Promise<BenchmarkData> => {
    const startTime = performance.now();
    const inputTokens = estimateTokens(prompt);
    let responseText = '';

    try {
        switch (model.provider) {
            case 'Google':
                responseText = await getGoogleResponseStream(prompt, model, apiKeys.gemini, onChunk);
                break;
            case 'OpenAI':
                responseText = await getOpenAICompatibleResponseStream('https://api.openai.com/v1/chat/completions', apiKeys.openai, model.id, prompt, onChunk);
                break;
            case 'DeepSeek':
                 responseText = await getOpenAICompatibleResponseStream('https://api.deepseek.com/chat/completions', apiKeys.deepseek, model.id, prompt, onChunk);
                break;
            default:
                throw new Error(`Nhà cung cấp không được hỗ trợ: ${model.provider}`);
        }
    } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu từ ${model.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : `Lỗi: Không thể lấy phản hồi từ ${model.name}.`;
        // We don't stream error message anymore, just throw it.
        throw new Error(errorMessage);
    }

    const outputTokens = estimateTokens(responseText);
    const endTime = performance.now();
    const time = parseFloat(((endTime - startTime) / 1000).toFixed(2));
    const cost = calculateCost(model.id, inputTokens, outputTokens);

    return {
        model,
        response: responseText,
        time,
        cost,
        tokens: { input: inputTokens, output: outputTokens }
    };
};