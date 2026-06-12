/**
 * processingService.ts
 *
 * Direct client-side calls to Gemini API using @google/genai SDK.
 * Includes exponential backoff retry for transient API errors (503, 429).
 */

import { Lease, SelectionSection, AbstractedData } from '@/shared/types';
import { GoogleGenAI } from '@google/genai';
import { generateProtocolPrompt, rehydrateData } from '@/shared/utils/protocolEngine';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-pro';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

const getAiClient = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables.');
    return new GoogleGenAI({ apiKey: key });
};

/** Check if an error is transient (worth retrying) */
const isTransientError = (error: any): boolean => {
    const message = error?.message || '';
    const status = error?.status || error?.code;
    // 503 = service unavailable, 429 = rate limited, network errors
    if (status === 503 || status === 429) return true;
    if (message.includes('503') || message.includes('429')) return true;
    if (message.includes('UNAVAILABLE') || message.includes('high demand')) return true;
    if (message.includes('RESOURCE_EXHAUSTED') || message.includes('rate limit')) return true;
    if (message.includes('fetch failed') || message.includes('network')) return true;
    return false;
};

export interface ProcessingResult {
    success: boolean;
    abstractedData?: AbstractedData;
    rawData?: any[];
    duration?: number;
    error?: string;
}

/**
 * Convert File objects to base64 inline data parts for Gemini API.
 */
const filesToInlineParts = async (files: File[]): Promise<Array<{ inlineData: { data: string; mimeType: string } }>> => {
    console.log(`[AI PIPELINE] Converting ${files.length} file(s) to base64...`);
    const parts = await Promise.all(files.map(async (file, idx) => {
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    resolve((reader.result as string).split(',')[1]);
                } else {
                    reject(new Error(`FileReader returned empty result for ${file.name}`));
                }
            };
            reader.onerror = () => reject(new Error(`FileReader error for ${file.name}`));
            reader.readAsDataURL(file);
        });
        const sizeMB = (base64.length * 0.75 / 1024 / 1024).toFixed(2);
        console.log(`[AI PIPELINE]   File ${idx + 1}: "${file.name}" (${sizeMB} MB, ${file.type || 'application/pdf'})`);
        return { inlineData: { data: base64, mimeType: file.type || 'application/pdf' } };
    }));
    console.log(`[AI PIPELINE] Base64 conversion complete.`);
    return parts;
};

/**
 * Call Gemini API with retry + exponential backoff for transient failures.
 */
const callGeminiWithRetry = async (
    ai: InstanceType<typeof GoogleGenAI>,
    prompt: string,
    inlineParts: Array<{ inlineData: { data: string; mimeType: string } }>,
    model: string = PRIMARY_MODEL
): Promise<string> => {
    let lastError: any = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
            const jitter = Math.random() * 1000;
            const delay = backoff + jitter;
            console.warn(`[AI PIPELINE] Retry attempt ${attempt}/${MAX_RETRIES} after ${Math.round(delay)}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }

        const modelToUse = attempt >= 2 && model === PRIMARY_MODEL ? FALLBACK_MODEL : model;
        console.log(`[AI PIPELINE] Calling ${modelToUse} (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
        const startTime = Date.now();

        try {
            const response = await ai.models.generateContent({
                model: modelToUse,
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        ...inlineParts
                    ]
                }],
                config: {
                    responseMimeType: 'application/json',
                }
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`[AI PIPELINE] Response received in ${elapsed}s`);

            // Safely extract text
            const text = response?.text;
            if (!text || text.trim().length === 0) {
                throw new Error('Gemini returned an empty response. The document may be unreadable or blocked.');
            }

            console.log(`[AI PIPELINE] Response length: ${text.length} chars`);
            return text;
        } catch (error: any) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            lastError = error;
            console.error(`[AI PIPELINE] Attempt ${attempt + 1} failed after ${elapsed}s:`, error.message || error);

            if (!isTransientError(error)) {
                console.error(`[AI PIPELINE] Non-transient error — not retrying.`);
                throw error;
            }
        }
    }

    throw lastError || new Error('All retry attempts exhausted.');
};

export const processLeaseClientSide = async (lease: Lease, files: File[]): Promise<ProcessingResult> => {
    const pipelineStart = Date.now();
    console.log(`[AI PIPELINE] ========== STARTING LEASE PROCESSING ==========`);
    console.log(`[AI PIPELINE] Lease: ${lease.name} (${lease.id})`);
    console.log(`[AI PIPELINE] Template: ${lease.templateType}`);
    console.log(`[AI PIPELINE] Files: ${files.length}`);

    try {
        if (!lease.templateConfig) throw new Error('No template config provided');

        // Step 1: Build prompt
        console.log(`[AI PIPELINE] Step 1: Building extraction prompt...`);
        const ai = getAiClient();
        const prompt = generateProtocolPrompt(lease.templateConfig, lease.templateType);
        console.log(`[AI PIPELINE] Prompt length: ${prompt.length} chars`);

        // Step 2: Convert files to base64
        console.log(`[AI PIPELINE] Step 2: Converting files...`);
        const inlineParts = await filesToInlineParts(files);

        // Step 3: Call Gemini API with retry
        console.log(`[AI PIPELINE] Step 3: Calling Gemini API...`);
        const text = await callGeminiWithRetry(ai, prompt, inlineParts);

        // Step 4: Parse JSON response
        console.log(`[AI PIPELINE] Step 4: Parsing JSON response...`);
        let rawItems: any[] = [];
        try {
            rawItems = JSON.parse(text);
            if (!Array.isArray(rawItems)) {
                console.warn(`[AI PIPELINE] Response is not an array, wrapping...`);
                rawItems = [rawItems];
            }
        } catch (parseErr) {
            console.error(`[AI PIPELINE] JSON parse failed. Attempting recovery...`);
            // Try to extract JSON array from response text
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                try {
                    rawItems = JSON.parse(arrayMatch[0]);
                    console.log(`[AI PIPELINE] Recovery succeeded: extracted ${rawItems.length} items`);
                } catch {
                    console.error(`[AI PIPELINE] Recovery failed. Raw text:`, text.substring(0, 500));
                    throw new Error('Failed to parse AI response as JSON');
                }
            } else {
                throw new Error('AI response does not contain a JSON array');
            }
        }
        console.log(`[AI PIPELINE] Parsed ${rawItems.length} raw protocol items.`);

        // Step 5: Rehydrate into AbstractedData
        console.log(`[AI PIPELINE] Step 5: Rehydrating into AbstractedData...`);
        const abstractedData = rehydrateData(rawItems, lease.templateConfig);
        console.log(`[AI PIPELINE] Rehydrated ${abstractedData.length} sections.`);

        const duration = (Date.now() - pipelineStart) / 1000;
        console.log(`[AI PIPELINE] ========== SUCCESS in ${duration.toFixed(1)}s ==========`);
        return { success: true, abstractedData, rawData: rawItems, duration };

    } catch (e: any) {
        const duration = (Date.now() - pipelineStart) / 1000;
        console.error(`[AI PIPELINE] ========== FAILED after ${duration.toFixed(1)}s ==========`);
        console.error(`[AI PIPELINE] Error:`, e.message || e);
        return { success: false, error: e.message || 'Unknown processing error' };
    }
};

export const askLeaseAgent = async (
    abstractedData: AbstractedData,
    history: { role: string; text: string }[],
    question: string
): Promise<string | null> => {
    try {
        const ai = getAiClient();
        const prompt = `You are a lease abstraction assistant. Here is the extracted lease data:\n${JSON.stringify(abstractedData)}\n\nQuestion: ${question}`;
        const response = await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });
        return response.text || null;
    } catch (e) {
        console.error('[askLeaseAgent] Failed:', e);
        return null;
    }
};

export const generateLeaseSummary = async (abstractedData: AbstractedData): Promise<string | null> => {
    try {
        const ai = getAiClient();
        const prompt = `You are an expert real estate lease abstractor. Generate a concise, professional HTML summary of the following lease data:\n${JSON.stringify(abstractedData)}`;
        const response = await ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: prompt
        });
        return response.text || null;
    } catch (e) {
        console.error('[generateLeaseSummary] Failed:', e);
        return null;
    }
};
