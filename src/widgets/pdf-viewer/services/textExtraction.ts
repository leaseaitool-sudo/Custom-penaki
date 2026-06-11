import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { NormalizedTextItem } from '@/widgets/pdf-viewer/pdf.types';
import { runVisionOcr, isVisionApiAvailable } from '@/features/leases/api/visionService';

/**
 * Sorts items into visual reading order (Top->Bottom, Left->Right).
 * Async with yield breaks for large item arrays (> 500 items) to prevent main thread blocking.
 */
export const sortVisualReadingOrder = async (items: NormalizedTextItem[]): Promise<NormalizedTextItem[]> => {
    if (items.length === 0) return [];

    const rows: { y: number; h: number; items: NormalizedTextItem[] }[] = [];
    const sortedY = [...items].sort((a, b) => a.rect.y - b.rect.y);

    for (let i = 0; i < sortedY.length; i++) {
        // Yield to main thread every 500 items to prevent blocking
        if (i > 0 && i % 500 === 0) {
            await new Promise(r => setTimeout(r, 0));
        }

        const item = sortedY[i];
        const tolerance = item.rect.h * 0.5;
        const existingRow = rows.find(r => Math.abs(r.y - item.rect.y) < tolerance);

        if (existingRow) {
            existingRow.items.push(item);
        } else {
            rows.push({ y: item.rect.y, h: item.rect.h, items: [item] });
        }
    }

    rows.sort((a, b) => a.y - b.y);
    rows.forEach(r => r.items.sort((a, b) => a.rect.x - b.rect.x));

    return rows.flatMap(r => r.items);
};

/**
 * Extract text from a PDF page.
 * 
 * Accepts a pre-resolved PDFPageProxy to avoid a redundant doc.getPage() worker round-trip
 * (the caller in pagePipeline already resolved the page).
 * 
 * Priority order:
 * 1. Native pdf.js text extraction (instant, perfect for digital PDFs)
 * 2. Google Vision API OCR (for scanned/image PDFs — ~0.5-1s/page)
 * 
 * Note: DB caching is handled by the pagePipeline, not here.
 * This function focuses purely on extraction logic.
 */
export const extractPageText = async (
    docIndex: number,
    pageNum: number,
    pdfDoc: PDFDocumentProxy,
    existingCanvas?: HTMLCanvasElement,
    onOcrProgress?: (progress: number | string) => void,
    preResolvedPage?: PDFPageProxy
): Promise<NormalizedTextItem[]> => {
    const page = preResolvedPage || await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    let items: NormalizedTextItem[] = [];
    const hasMeaningfulText = textContent.items.filter((item: any) => item.str.trim().length > 0).length > 5;

    if (hasMeaningfulText) {
        // ─── Native PDF Text (instant, accurate) ────────────────────
        textContent.items.forEach((item: any) => {
            if (!item.str || typeof item.str !== 'string') return;
            const tx = item.transform;
            let x = tx[4];
            let y = tx[5];
            let w = item.width;
            let h = Math.hypot(tx[2], tx[3]);
            if (!w || w <= 0) w = item.str.length * h * 0.5;

            const [vx, vy] = viewport.convertToViewportPoint(x, y);

            const rect = {
                x: vx / viewport.width,
                y: (vy - h) / viewport.height,
                w: w / viewport.width,
                h: h / viewport.height
            };

            items.push({ str: item.str, rect });
        });
    } else {
        // ─── OCR Fallback: Google Vision API ────────────────────────
        if (isVisionApiAvailable()) {
            if (onOcrProgress) onOcrProgress('Preparing page for OCR...');

            // Get or create a canvas with the page rendered at 2x for OCR accuracy
            let canvasToScan = existingCanvas;
            if (!canvasToScan) {
                const ocrViewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Could not get 2D context for OCR.');
                canvas.height = ocrViewport.height;
                canvas.width = ocrViewport.width;
                await page.render({ canvasContext: context, viewport: ocrViewport } as any).promise;
                canvasToScan = canvas;
            }

            const result = await runVisionOcr(canvasToScan, (msg) => {
                if (onOcrProgress) onOcrProgress(msg);
            });

            items = result.items;
        } else {
            // No Vision API key — fall back to basic text content (may be empty)
            console.warn(`Page ${pageNum}: No text found and Vision API not configured. Skipping OCR.`);
            if (onOcrProgress) onOcrProgress('No OCR available');
        }
    }

    return sortVisualReadingOrder(items);
};

/**
 * Get the extraction method used for a page.
 * Useful for tracking/analytics.
 */
export const detectExtractionMethod = async (
    pdfDoc: PDFDocumentProxy,
    pageNum: number
): Promise<'native' | 'vision_api'> => {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const hasMeaningfulText = textContent.items.filter((item: any) => item.str.trim().length > 0).length > 5;
    return hasMeaningfulText ? 'native' : 'vision_api';
};
