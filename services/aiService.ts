
import { GoogleGenAI } from "@google/genai";
import type { Model, BenchmarkData, Priority, AdvancedResult, ApiKeys } from '../types';
import { MOCK_PRICING, MODELS } from '../constants';

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
        throw new Error(`Chưa cung cấp khóa API cho nhà cung cấp của mô hình ${modelId}. Vui lòng vào Cài đặt ⚙️ để thêm khóa của bạn.`);
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
    geminiApiKey: string,
    onChunk: (chunk: string) => void
): Promise<string> => {
    if (!geminiApiKey) {
        throw new Error("Chưa cung cấp khóa API cho Google Gemini. Vui lòng vào Cài đặt ⚙️ để thêm khóa của bạn.");
    }
    let responseText = '';
    const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
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

// --- INTELLIGENT ROUTING LOGIC (STREAMING) ---

export const getAutoRoutedResponseStream = async (prompt: string, priority: Priority, apiKeys: ApiKeys, onChunk: (chunk: string, model: Model, reason: string) => void): Promise<BenchmarkData> => {
  let intent: 'code' | 'creative' | 'general' = 'general';
  const lowerCasePrompt = prompt.toLowerCase();
  if (lowerCasePrompt.includes('code') || lowerCasePrompt.includes('python') || lowerCasePrompt.includes('javascript') || lowerCasePrompt.includes('function')) {
    intent = 'code';
  } else if (lowerCasePrompt.includes('story') || lowerCasePrompt.includes('poem') || lowerCasePrompt.includes('write')) {
    intent = 'creative';
  }

  let selectedModelId: string;
  let reason: string;

  if (intent === 'code') {
    if (priority === 'quality') {
      selectedModelId = 'deepseek-coder';
      reason = "Đã chọn DeepSeek Coder vì hiệu suất chuyên biệt trong việc tạo mã (Ưu tiên Chất lượng).";
    } else if (priority === 'cost') {
      selectedModelId = 'deepseek-coder';
      reason = "Đã chọn DeepSeek Coder vì hiệu quả chi phí tuyệt vời cho các tác vụ lập trình (Ưu tiên Chi phí)."
    } else {
      selectedModelId = 'gemini-2.5-flash';
      reason = "Đã chọn Gemini 2.5 Flash vì thời gian phản hồi nhanh cho các tác vụ lập trình (Ưu tiên Tốc độ)."
    }
  } else if (intent === 'creative') {
     if (priority === 'quality') {
      selectedModelId = 'gpt-4o';
      reason = "Đã chọn GPT-4o vì khả năng viết sáng tạo chất lượng cao (Ưu tiên Chất lượng).";
    } else if (priority === 'cost') {
      selectedModelId = 'gemini-2.5-flash';
      reason = "Đã chọn Gemini 2.5 Flash vì giá cả phải chăng cho các tác vụ sáng tạo (Ưu tiên Chi phí)."
    } else {
      selectedModelId = 'gemini-2.5-flash';
      reason = "Đã chọn Gemini 2.5 Flash để tạo nội dung sáng tạo nhanh chóng (Ưu tiên Tốc độ)."
    }
  } else {
    if (priority === 'quality') {
      selectedModelId = 'gpt-4o';
      reason = "Đã chọn GPT-4o vì kiến thức tổng quát và khả năng suy luận mạnh mẽ (Ưu tiên Chất lượng).";
    } else if (priority === 'cost') {
      selectedModelId = 'gemini-2.5-flash';
      reason = "Đã chọn Gemini 2.5 Flash như một lựa chọn tiết kiệm chi phí cho các truy vấn chung (Ưu tiên Chi phí)."
    } else {
      selectedModelId = 'gemini-2.5-flash';
      reason = "Đã chọn Gemini 2.5 Flash để có câu trả lời nhanh nhất cho các câu hỏi chung (Ưu tiên Tốc độ)."
    }
  }

  const modelToQuery = MODELS.find(m => m.id === selectedModelId)!;
  const result = await getAiResponseStream(prompt, modelToQuery, apiKeys, (chunk) => onChunk(chunk, modelToQuery, reason));
  
  return { ...result, routingReason: reason };
};

// --- DEBATE AND SYNTHESIS LOGIC ---
export const getDebateAndSynthesisResponseStream = async (prompt: string, apiKeys: ApiKeys, onUpdate: (update: Partial<AdvancedResult>) => void): Promise<BenchmarkData> => {
    const startTime = performance.now();
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    // Step 1: Get initial arguments from all models
    onUpdate({ status: 'progress', progress: ['[Bước 1/3] Đang thu thập lập luận ban đầu từ các mô hình...'], finalResponse: '' });
    
    // Create a dummy onChunk for non-streaming full response fetches
    const noOpOnChunk = () => {}; 
    const argumentPromises = MODELS.map(model => getAiResponseStream(prompt, model, apiKeys, noOpOnChunk).catch(e => e as Error));
    const initialArgumentsResults = await Promise.all(argumentPromises);

    const successfulArguments = initialArgumentsResults.filter(res => !(res instanceof Error)) as BenchmarkData[];
    
    if (successfulArguments.length === 0) {
        const errorMessages = initialArgumentsResults.map(res => (res as Error).message).join('\n');
        throw new Error(`Không thể thu thập bất kỳ lập luận nào. Lỗi: \n${errorMessages}`);
    }

    totalCost += successfulArguments.reduce((sum, res) => sum + res.cost, 0);
    totalInputTokens += successfulArguments.reduce((sum, res) => sum + res.tokens.input, 0);
    totalOutputTokens += successfulArguments.reduce((sum, res) => sum + res.tokens.output, 0);

    // Step 2: Formulate synthesis prompt
    onUpdate({ status: 'progress', progress: ['[Bước 2/3] Đang phân tích và chuẩn bị tổng hợp...'], finalResponse: '' });
    await new Promise(res => setTimeout(res, 1000)); // Simulate analysis time

    const synthesisPrompt = `
        Dựa trên các lập luận từ nhiều mô hình AI khác nhau về truy vấn của người dùng, hãy viết một câu trả lời tổng hợp cuối cùng. Câu trả lời này phải khách quan, toàn diện, và kết hợp những điểm mạnh nhất từ mỗi lập luận.

        **Truy vấn gốc của người dùng:** "${prompt}"

        ---
        **CÁC LẬP LUẬN ĐÃ THU THẬP:**

        ${successfulArguments.map(arg => `
        **Từ ${arg.model.name}:**
        ${arg.response}
        ---
        `).join('\n')}

        **YÊU CẦU:** Viết một phản hồi tổng hợp cuối cùng.
    `;

    // Step 3: Get final synthesis from the most powerful model (Gemini)
    onUpdate({ status: 'progress', progress: ['[Bước 3/3] Đang tạo phản hồi tổng hợp cuối cùng...'], finalResponse: '' });
    
    const geminiModel = MODELS.find(m => m.id === 'gemini-2.5-flash');
    if (!geminiModel) throw new Error("Gemini model not found");

    let finalResponseText = '';
    const synthesisResult = await getAiResponseStream(synthesisPrompt, geminiModel, apiKeys, (chunk) => {
        finalResponseText += chunk;
        onUpdate({ status: 'progress', progress: [], finalResponse: finalResponseText });
    });

    totalCost += synthesisResult.cost;
    totalInputTokens += synthesisResult.tokens.input;
    totalOutputTokens += synthesisResult.tokens.output;

    const endTime = performance.now();
    const totalTime = parseFloat(((endTime - startTime) / 1000).toFixed(2));
    
    const finalData = {
        response: synthesisResult.response,
        time: totalTime,
        cost: totalCost,
        tokens: { input: totalInputTokens, output: totalOutputTokens },
        model: { id: 'debate-synthesis', name: 'Tranh luận & Tổng hợp', provider: 'AI Nexus', isApiDriven: true }
    };

    onUpdate({ status: 'completed', progress: ['Hoàn thành!'], finalResponse: synthesisResult.response, ...finalData });

    return finalData;
};
