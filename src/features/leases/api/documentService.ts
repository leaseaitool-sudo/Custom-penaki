/**
 * Document Service — Supabase DB operations for lease documents and text cache.
 * 
 * Tables:
 * - lease_documents: tracks uploaded PDF files
 * - document_text_cache: per-page extracted text (cached)
 */
import { supabase } from '@/shared/api/supabaseClient';

// Types matching the DB schema
export interface LeaseDocument {
    id: string;
    lease_id: string;
    user_id: string;
    storage_path: string;
    file_name: string;
    file_size: number;
    page_count: number | null;
    created_at: string;
}

export interface TextCacheEntry {
    id: string;
    document_id: string;
    page_number: number;
    text_items: any[]; // NormalizedTextItem[] stored as JSONB
    extraction_method: 'native' | 'vision_api';
    created_at: string;
}

// ─── Lease Documents ─────────────────────────────────────────────

/**
 * Create a document record when a PDF is uploaded.
 */
export const createDocumentRecord = async (
    leaseId: string,
    userId: string,
    storagePath: string,
    fileName: string,
    fileSize: number
): Promise<LeaseDocument> => {
    const { data, error } = await supabase
        .from('lease_documents')
        .insert({
            lease_id: leaseId,
            user_id: userId,
            storage_path: storagePath,
            file_name: fileName,
            file_size: fileSize,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create document record: ${error.message}`);
    return data as LeaseDocument;
};

/**
 * Get all documents for a lease.
 */
export const getDocumentsForLease = async (leaseId: string): Promise<LeaseDocument[]> => {
    const { data, error } = await supabase
        .from('lease_documents')
        .select('*')
        .eq('lease_id', leaseId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
    return (data || []) as LeaseDocument[];
};

/**
 * Update page count after PDF is loaded.
 */
export const updatePageCount = async (docId: string, pageCount: number): Promise<void> => {
    const { error } = await supabase
        .from('lease_documents')
        .update({ page_count: pageCount })
        .eq('id', docId);

    if (error) throw new Error(`Failed to update page count: ${error.message}`);
};

/**
 * Delete a document record and its text cache (cascades).
 */
export const deleteDocumentRecord = async (docId: string): Promise<void> => {
    const { error } = await supabase
        .from('lease_documents')
        .delete()
        .eq('id', docId);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
};

// ─── Text Cache ──────────────────────────────────────────────────

/**
 * Fetch cached text items for a specific page.
 * Returns null if not cached.
 */
export const fetchCachedText = async (
    documentId: string,
    pageNumber: number
): Promise<any[] | null> => {
    const { data, error } = await supabase
        .from('document_text_cache')
        .select('text_items')
        .eq('document_id', documentId)
        .eq('page_number', pageNumber)
        .single();

    if (error || !data) return null;
    return data.text_items;
};

/**
 * Fetch cached text for multiple pages in one query.
 * Returns a Map of pageNumber → text_items.
 */
export const fetchCachedTextBatch = async (
    documentId: string,
    pageNumbers: number[]
): Promise<Map<number, any[]>> => {
    const { data, error } = await supabase
        .from('document_text_cache')
        .select('page_number, text_items')
        .eq('document_id', documentId)
        .in('page_number', pageNumbers);

    const result = new Map<number, any[]>();
    if (error || !data) return result;

    for (const row of data) {
        result.set(row.page_number, row.text_items);
    }
    return result;
};

/**
 * Cache text items for a page. Uses upsert to handle re-processing.
 */
export const cacheTextItems = async (
    documentId: string,
    pageNumber: number,
    textItems: any[],
    method: 'native' | 'vision_api'
): Promise<void> => {
    const { error } = await supabase
        .from('document_text_cache')
        .upsert(
            {
                document_id: documentId,
                page_number: pageNumber,
                text_items: textItems,
                extraction_method: method,
            },
            { onConflict: 'document_id,page_number' }
        );

    if (error) {
        console.error(`Failed to cache text for page ${pageNumber}:`, error.message);
        // Non-fatal: cache miss just means re-extraction next time
    }
};
