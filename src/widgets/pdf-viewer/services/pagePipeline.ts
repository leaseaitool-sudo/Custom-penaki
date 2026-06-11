import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { SnippetSource, PageStatus } from '@/widgets/pdf-viewer/pdf.types';
import { renderPageCanvas } from './pdfLoader';
import { extractPageText } from './textExtraction';
import { calculatePageHighlightBlocks } from './highlightEngine';
import { paintTextLayer, paintHighlights } from './domPainter';
import { PdfCache } from './cacheStore';

export const processPagePipeline = async (
    docIndex: number,
    pageIndex: number,
    doc: PDFDocumentProxy,
    container: HTMLDivElement,
    canvas: HTMLCanvasElement,
    textLayer: HTMLDivElement,
    highlightLayer: HTMLDivElement,
    scale: number,
    cache: PdfCache,
    renderTasks: Set<RenderTask>,
    snippets: SnippetSource[],
    docName: string,
    activeSnippetId: string | null,
    onStatusChange: (status: PageStatus) => void,
    onOcrProgress: (progress: string | number) => void,
    onTextClick: (e: MouseEvent, span: HTMLElement, text: string) => void,
    onHighlightClick: (id: string) => void,
    isMounted: () => boolean
) => {
    const pageKey = `${docIndex}-${pageIndex}`;
    onStatusChange('processing');

    let currentRenderTask: RenderTask | null = null;

    try {
        if (!isMounted()) return;

        // 1. PDF Rendering
        const page = await doc.getPage(pageIndex);
        const viewport = page.getViewport({ scale });

        container.style.width = `${viewport.width}px`;
        container.style.height = `${viewport.height}px`;

        currentRenderTask = renderPageCanvas(page, scale, canvas);
        renderTasks.add(currentRenderTask);
        try {
            await currentRenderTask.promise;
        } finally {
            // Always clean up the render task reference (Bug 8)
            renderTasks.delete(currentRenderTask);
            currentRenderTask = null;
        }

        if (!isMounted()) return;

        // 2. Text Extraction
        let textItems = cache.text.get(pageKey);
        if (!textItems) {
            // Check in-flight
            if (cache.textPromises.has(pageKey)) {
                textItems = await cache.textPromises.get(pageKey);
            } else {
                const promise = extractPageText(docIndex, pageIndex, doc, canvas, onOcrProgress, page);
                cache.registerTextPromise(pageKey, promise);
                textItems = await promise;
                cache.resolveTextPromise(pageKey);
            }
            if (textItems) cache.text.set(pageKey, textItems);
        }

        if (!isMounted() || !textItems) return;

        // 3. Paint Text
        paintTextLayer(textLayer, textItems, viewport, onTextClick);

        // 4. Highlights
        const relevantSnippets = snippets.filter(s =>
            s.page === pageIndex && (!s.fileName || s.fileName === docName)
        );
        // Bounded hash: use DJB2 on the concatenated snippet identifiers instead of unbounded string keys
        const snippetRaw = relevantSnippets.length === 0
            ? '0'
            : relevantSnippets.map(s => `${s.page}:${(s.snippet || '').slice(0, 30)}`).sort().join('|');
        let hash = 5381;
        for (let i = 0; i < snippetRaw.length; i++) {
            hash = ((hash << 5) + hash + snippetRaw.charCodeAt(i)) | 0; // DJB2
        }
        const highlightCacheKey = `${pageKey}-${hash}`;
        let highlightBlocks = cache.highlights.get(highlightCacheKey);

        if (!highlightBlocks) {
            cache.invalidateHighlightsForPage(pageKey);
            highlightBlocks = calculatePageHighlightBlocks(docIndex, pageIndex, textItems, relevantSnippets);
            cache.highlights.set(highlightCacheKey, highlightBlocks);
        }

        paintHighlights(highlightLayer, highlightBlocks, activeSnippetId, onHighlightClick);

        if (isMounted()) {
            onStatusChange('ready');
        }

    } catch (error) {
        // Clean up render task if it leaked due to error
        if (currentRenderTask) {
            renderTasks.delete(currentRenderTask);
        }
        console.error(`Error processing page ${pageKey}`, error);
        if (isMounted()) onStatusChange('error');
    }
};
