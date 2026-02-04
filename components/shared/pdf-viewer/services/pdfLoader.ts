import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { Document } from '../../../../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;

export const loadDocuments = async (documents: Document[]): Promise<PDFDocumentProxy[]> => {
    const loadTasks = documents.map(doc => pdfjsLib.getDocument(doc.url).promise);
    return Promise.all(loadTasks);
};

export const renderPageCanvas = async (
    page: any, // PDFPageProxy
    scale: number,
    canvas: HTMLCanvasElement
): Promise<any> => {
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
