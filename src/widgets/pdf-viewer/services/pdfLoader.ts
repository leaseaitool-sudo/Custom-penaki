import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Document } from '@/shared/types';
import { getSignedUrl } from '@/shared/api/storageService';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

/**
 * Resolve the usable URL for a document.
 * 1. Prioritize generating a fresh Signed URL from storagePath (most reliable)
 * 2. Fall back to testing blob URLs if present
 * 3. Fall back to existing HTTP URLs (might be public or pre-signed)
 */
const resolveDocumentUrl = async (doc: Document): Promise<string> => {
    console.log(`[PDF_LOADER] Resolving URL for document: ${doc.name}`, { url: doc.url, storagePath: doc.storagePath });
    const { url, storagePath } = doc;

    // PRIMARY: Always try to resolve from Supabase Storage first for absolute security/reliability
    if (storagePath) {
        try {
            console.log(`[PDF_LOADER] Attempting to get signed URL for storagePath: ${storagePath}`);
            const signedUrl = await getSignedUrl(storagePath, 3600);
            console.log(`[PDF_LOADER] Successfully generated signed URL:`, signedUrl.substring(0, 80) + '...');
            return signedUrl;
        } catch (e) {
            console.error(`[PDF_LOADER] Failed to get signed URL for ${doc.name}:`, e);
            // Fall through to other strategies
        }
    } else {
        console.warn(`[PDF_LOADER] No storagePath provided for document: ${doc.name}`);
    }

    // SECONDARY: If URL is a blob URL, test if it's still accessible (local preview)
    if (url.startsWith('blob:')) {
        try {
            console.log(`[PDF_LOADER] Testing blob URL accessibility: ${url}`);
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) {
                console.log(`[PDF_LOADER] Blob URL is valid.`);
                return url; // Still valid
            }
        } catch (e) {
            console.warn(`[PDF_LOADER] Blob URL expired or inaccessible:`, e);
            // blob URL expired — fall through
        }
    }

    // FALLBACK: Return whatever original URL exists (often an http:// string)
    console.log(`[PDF_LOADER] Falling back to provided URL: ${url}`);
    return url;
};

export const loadDocuments = async (documents: Document[]): Promise<PDFDocumentProxy[]> => {
    console.log(`[PDF_LOADER] loadDocuments called with ${documents.length} documents.`);
    // Resolve URLs (handle stale blob URLs, get signed URLs from storage)
    const resolvedUrls = await Promise.all(
        documents.map(doc => resolveDocumentUrl(doc))
    );

    const loadTasks = resolvedUrls.map(url => {
        console.log(`[PDF_LOADER] Calling pdfjsLib.getDocument for URL:`, url.substring(0, 80) + '...');
        return pdfjsLib.getDocument(url).promise.then(proxy => {
            console.log(`[PDF_LOADER] Successfully loaded PDFDocumentProxy for URL.`);
            return proxy;
        }).catch(err => {
            console.error(`[PDF_LOADER] Failed to load PDFDocumentProxy for URL:`, err);
            throw err;
        });
    });
    return Promise.all(loadTasks);
};

export const renderPageCanvas = (
    page: any, // PDFPageProxy
    scale: number,
    canvas: HTMLCanvasElement
): any => {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Could not get 2D context');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };

    return page.render(renderContext);
};
