import type { PDFDocumentProxy } from 'pdfjs-dist';
import { NormalizedTextItem } from '../pdf.types';
import { runOcrOnPage } from './ocrEngine';

/**
 * Sorts items into visual reading order (Top->Bottom, Left->Right)
 * Improved robustness for line detection.
 */
export const sortVisualReadingOrder = (items: NormalizedTextItem[]): NormalizedTextItem[] => {
    if (items.length === 0) return [];
    
    const rows: { y: number; h: number; items: NormalizedTextItem[] }[] = [];
    
    // Sort roughly by Y first to make grouping easier
    const sortedY = [...items].sort((a, b) => a.rect.y - b.rect.y);

    sortedY.forEach(item => {
        // Dynamic tolerance based on the item's own height (typically font size)
        // 50% of height overlap allows for subscripts/superscripts/misalignment to still capture the line
        const tolerance = item.rect.h * 0.5;
        
        const existingRow = rows.find(r => Math.abs(r.y - item.rect.y) < tolerance);
        
        if (existingRow) {
            existingRow.items.push(item);
            // Optionally adjust row Y to weighted average, but simple first-item Y usually works
        } else {
            rows.push({ y: item.rect.y, h: item.rect.h, items: [item] });
        }
    });
    
    // Sort rows top to bottom
    rows.sort((a, b) => a.y - b.y);
    
    // Sort items within rows left to right
    rows.forEach(r => r.items.sort((a, b) => a.rect.x - b.rect.x));
    
    return rows.flatMap(r => r.items);
};

export const extractPageText = async (
    docIndex: number,
    pageNum: number,
    pdfDoc: PDFDocumentProxy,
    existingCanvas?: HTMLCanvasElement,
    onOcrProgress?: (progress: number | string) => void
): Promise<NormalizedTextItem[]> => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 }); // Base scale for geometry normalization
    const textContent = await page.getTextContent();
    
    let items: NormalizedTextItem[] = [];
    const hasMeaningfulText = textContent.items.filter((item: any) => item.str.trim().length > 0).length > 5;

    if (hasMeaningfulText) {
        // Native PDF Text
        textContent.items.forEach((item: any) => {
            if (!item.str || typeof item.str !== 'string') return;
            const tx = item.transform;
            let x = tx[4];
            let y = tx[5];
            let w = item.width;
            let h = Math.hypot(tx[2], tx[3]); 
            if (!w || w <= 0) w = item.str.length * h * 0.5;

            // PDF.js uses bottom-left origin, we convert to top-left normalized
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
        // OCR Fallback
        if (onOcrProgress) onOcrProgress('Initializing OCR...');
        const ocrLines = await runOcrOnPage(
            docIndex, 
            pageNum, 
            pdfDoc, 
            existingCanvas, 
            (p) => onOcrProgress && onOcrProgress(p)
        );
        ocrLines.forEach(line => {
            line.words.forEach(word => {
                items.push({
                    str: word.text,
                    rect: { x: word.x, y: word.y, w: word.width, h: word.height }
                });
            });
        });
    }

    // Always sort for consistent processing
    return sortVisualReadingOrder(items);
};
