import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { PdfCache } from './services/cacheStore';
import { processPagePipeline } from './services/pagePipeline';
import { SnippetSource, PageStatus } from './pdf.types';
import { paintSearchHighlights } from './services/domPainter';

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

    const [status, setStatus] = useState<PageStatus>('pending');
    const [ocrProgress, setOcrProgress] = useState<string | number>('');

    useEffect(() => {
        isMountedRef.current = true;
        
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
                snippets,
                docName,
                activeSnippetId,
                setStatus,
                setOcrProgress,
                onTextClick,
                onHighlightClick,
                () => isMountedRef.current
             );
        }

        return () => { isMountedRef.current = false; };
    }, [scale, doc, activeSnippetId]); // Snippets handled via cache check in pipeline

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
        <div id={`pdf-page-${docIndex}-${pageIndex}`} ref={containerRef} className={`pdf-page-container mb-4 shadow-lg bg-white relative ${status === 'ready' ? 'page-ready' : ''}`}>
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
