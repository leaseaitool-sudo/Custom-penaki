/**
 * processingService.ts
 *
 * All AI operations are now routed through Supabase Edge Functions.
 * The Google GenAI API key lives in Supabase secrets — it is NEVER in this file
 * or anywhere in the browser bundle.
 *
 * Functions here are thin wrappers around Edge Function invocations.
 */

import { supabase } from '@/shared/api/supabaseClient';
import { Lease, SelectionSection, AbstractedData } from '@/shared/types';

// ---- File Conversion Helper ----

/**
 * Converts a File to a base64 string for Edge Function transmission.
 * Used by useLeaseManager.ts when invoking process-lease.
 */
export const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error(`FileReader returned no result for ${file.name}`));
            }
        };
        reader.onerror = () => reject(new Error(`FileReader error for ${file.name}: ${reader.error?.message || 'Unknown error'}`));
        reader.onabort = () => reject(new Error(`FileReader aborted for ${file.name}`));
        reader.readAsDataURL(file);
    });
    return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
};

export interface ProcessingResult {
    success: boolean;
    abstractedData?: AbstractedData;
    rawData?: any[];
    duration?: number;
    error?: string;
}

/**
 * Ask the lease AI assistant a question.
 * Routes through the ai-assistant Edge Function — API key never hits the browser.
 */
export const askLeaseAgent = async (
    abstractedData: AbstractedData,
    history: { role: string; text: string }[],
    question: string
): Promise<string | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { action: 'ask', abstractedData, history, question },
        });
        if (error) throw new Error(error.message);
        return data?.text ?? null;
    } catch (e) {
        console.error('[askLeaseAgent] Edge Function failed:', e);
        return null;
    }
};

/**
 * Generate a structured AI summary of abstracted lease data.
 * Routes through the ai-assistant Edge Function.
 */
export const generateLeaseSummary = async (abstractedData: AbstractedData): Promise<string | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: { action: 'summarize', abstractedData },
        });
        if (error) throw new Error(error.message);
        return data?.summary ?? null;
    } catch (e) {
        console.error('[generateLeaseSummary] Edge Function failed:', e);
        return null;
    }
};

// NOTE: processLeaseAI and processAmendmentAI have been fully removed.
// All lease and amendment AI processing now happens exclusively via
// the `process-lease` Edge Function, invoked from useLeaseManager.ts.
// This ensures the Google GenAI API key is NEVER sent to or accessible from the browser.
