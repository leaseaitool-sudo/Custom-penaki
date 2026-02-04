import Tesseract from 'tesseract.js';
import { OcrLine, OcrWord } from '../pdf.types';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export const runOcrOnPage = async (
    docIndex: number, 
    pageNum: number, 
    pdfDoc: PDFDocumentProxy, 
    existingCanvas?: HTMLCanvasElement,
    onProgress?: (progress: number) => void
): Promise<OcrLine[]> => {
    try {
        let canvasToScan = existingCanvas;
        
        // If no canvas provided, render a temporary one at 2.0 scale for better OCR accuracy
        if (!canvasToScan) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 }); 
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get 2D context.');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport } as any).promise;
            canvasToScan = canvas;
        }

        const result = await Tesseract.recognize(canvasToScan, 'eng', {
            logger: m => { 
                if (onProgress && m.status === 'recognizing text') {
                    onProgress(Math.round(m.progress * 100)); 
                }
            }
        });
        
        const lines: OcrLine[] = [];
        if (result?.data?.blocks) {
            for (const block of result.data.blocks) {
                if (!block?.paragraphs) continue;
                for (const para of block.paragraphs) {
                    if (!para?.lines) continue;
                    for (const line of para.lines) {
                        if (!line?.text || !line?.words) continue;
                        const words: OcrWord[] = [];
                        for (const word of line.words) {
                            if (word?.bbox && word.text) {
                                words.push({ 
                                    text: word.text, 
                                    x: word.bbox.x0 / canvasToScan.width, 
                                    y: word.bbox.y0 / canvasToScan.height, 
                                    width: (word.bbox.x1 - word.bbox.x0) / canvasToScan.width, 
                                    height: (word.bbox.y1 - word.bbox.y0) / canvasToScan.height, 
                                    confidence: word.confidence 
                                });
                            }
                        }
                        if (words.length > 0) lines.push({ text: line.text.trim(), words: words });
                    }
                }
            }
        }
        return lines;
    } catch (error) {
        console.error("OCR Failed", error);
        return [];
    }
};
