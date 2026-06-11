import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { PdfCache } from './services/cacheStore';
import { processPagePipeline } from './services/pagePipeline';
import { SnippetSource, PageStatus } from './pdf.types';
import { paintSearchHighlights, paintHighlights } from './services/domPainter';
import { calculatePageHighlightBlocks } from './services/highlightEngine';

interface PdfPageProps {
    docIndex: number;
    pageIndex: number;
    doc: PDFDocumentProxy;
    scale: number;
    cache: PdfCache;
    renderTasks: Set<RenderTask>;
    snippets: SnippetSource[];
    docName: string;
    activeSnippetId: string | null;
    searchResults: any[];
    searchResultIndex: number;
    onTextClick: (e: MouseEvent, span: HTMLElement, text: string) => void;
    onHighlightClick: (id: string) => void;
}

export const PdfPage: React.FC<PdfPageProps> = ({
    docIndex, pageIndex, doc, scale, cache, renderTasks, snippets, docName, activeSnippetId, searchResults, searchResultIndex, onTextClick, onHighlightClick
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textLayerRef = useRef<HTMLDivElement>(null);
    const highlightLayerRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(true);

    // Stable refs for callbacks to avoid stale closures in the pipeline (Bug 1)
    const onTextClickRef = useRef(onTextClick);
    const onHighlightClickRef = useRef(onHighlightClick);
    useEffect(() => { onTextClickRef.current = onTextClick; }, [onTextClick]);
    useEffect(() => { onHighlightClickRef.current = onHighlightClick; }, [onHighlightClick]);

    const [status, setStatus] = useState<PageStatus>('pending');
    const [ocrProgress, setOcrProgress] = useState<string | number>('');
    const [isInView, setIsInView] = useState(false);

    // Provide a reasonable estimate for unrendered page height to preserve scrollbar scale. (Standard letter: 792 points)
    const estimatedHeight = Math.floor(792 * scale);

    // Lazy load rendering trigger
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsInView(true);
                observer.disconnect(); // Once in view, keep it rendered to prevent flickering
            }
        }, {
            root: null,
            // Pre-load pages when they come within 2 viewports (about 200% height) distance
            rootMargin: '200% 0px',
            threshold: 0
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Stable refs for snippets and activeSnippetId to avoid pipeline re-runs on highlight changes
    const snippetsRef = useRef(snippets);
    const activeSnippetIdRef = useRef(activeSnippetId);
    useEffect(() => { snippetsRef.current = snippets; }, [snippets]);
    useEffect(() => { activeSnippetIdRef.current = activeSnippetId; }, [activeSnippetId]);

    useEffect(() => {
        if (!isInView) return; // Block pipeline until the page scrolls into view

        isMountedRef.current = true;
        // Abort flag for THIS specific effect invocation (Bug 2)
        let aborted = false;

        if (containerRef.current && canvasRef.current && textLayerRef.current && highlightLayerRef.current) {
            processPagePipeline(
                docIndex,
                pageIndex,
                doc,
                containerRef.current,
                canvasRef.current,
                textLayerRef.current,
                highlightLayerRef.current,
                scale,
                cache,
                renderTasks,
                snippetsRef.current,
                docName,
                activeSnippetIdRef.current,
                setStatus,
                setOcrProgress,
                (e, span, text) => onTextClickRef.current(e, span, text),
                (id) => onHighlightClickRef.current(id),
                () => isMountedRef.current && !aborted
            );
        }

        return () => {
            aborted = true; // Cancel this pipeline invocation on re-render
            isMountedRef.current = false;
        };
    }, [scale, doc, isInView]); // Only re-run pipeline on scale/doc/visibility changes

    // Lightweight highlight-only repaint when snippets or active snippet changes
    // This avoids re-running the entire expensive pipeline (canvas + text extraction)
    useEffect(() => {
        if (status !== 'ready' || !highlightLayerRef.current) return;

        const pageKey = `${docIndex}-${pageIndex}`;
        const textItems = cache.text.get(pageKey);
        if (!textItems) return;

        const relevantSnippets = snippets.filter(s =>
            s.page === pageIndex && (!s.fileName || s.fileName === docName)
        );
        const snippetRaw = relevantSnippets.length === 0
            ? '0'
            : relevantSnippets.map(s => `${s.page}:${(s.snippet || '').slice(0, 30)}`).sort().join('|');
        let hash = 5381;
        for (let i = 0; i < snippetRaw.length; i++) {
            hash = ((hash << 5) + hash + snippetRaw.charCodeAt(i)) | 0;
        }
        const highlightCacheKey = `${pageKey}-${hash}`;
        let highlightBlocks = cache.highlights.get(highlightCacheKey);

        if (!highlightBlocks) {
            cache.invalidateHighlightsForPage(pageKey);
            highlightBlocks = calculatePageHighlightBlocks(docIndex, pageIndex, textItems, relevantSnippets);
            cache.highlights.set(highlightCacheKey, highlightBlocks);
        }

        paintHighlights(highlightLayerRef.current, highlightBlocks, activeSnippetId, onHighlightClickRef.current);
    }, [snippets, activeSnippetId, status, docIndex, pageIndex, docName]);

    // Handle search highlights separately as they change often without re-processing text
    useEffect(() => {
        if (status === 'ready' && highlightLayerRef.current) {
            const pageMatches = searchResults.filter(r => r.docIndex === docIndex && r.pageIndex === pageIndex);
            if (pageMatches.length > 0 || searchResults.length === 0) {
                paintSearchHighlights(highlightLayerRef.current, pageMatches, searchResultIndex, searchResults);
            }
        }
    }, [searchResults, searchResultIndex, status, docIndex, pageIndex]);

    return (
        <div 
            id={`pdf-page-${docIndex}-${pageIndex}`} 
            ref={containerRef} 
            className={`pdf-page-container mb-4 shadow-lg bg-white relative ${status === 'ready' ? 'page-ready' : ''}`}
            style={{ minHeight: `${estimatedHeight}px` }}
        >
            <canvas ref={canvasRef} />
            <div ref={textLayerRef} className="textLayer" />
            <div ref={highlightLayerRef} className="highlightLayer" />

            {status !== 'ready' && (
                <div className="ocr-overlay">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        <span>{status === 'processing' ? (ocrProgress ? `Scanning... ${ocrProgress}%` : `Processing Page ${pageIndex}...`) : 'Pending...'}</span>
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded z-20 pointer-events-none font-mono">
                Page {pageIndex}
            </div>
        </div>
    );
};
