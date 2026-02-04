
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { Document } from '../../types';
import './pdf-viewer/PdfViewer.css';

// UI Components
import { MagnifyingGlassPlusIcon } from '../icons/MagnifyingGlassPlusIcon';
import { MagnifyingGlassMinusIcon } from '../icons/MagnifyingGlassMinusIcon';

// Modular Services & Types
import { NavigationTarget, SnippetSource, SearchMatch } from './pdf-viewer/pdf.types';
import { loadDocuments } from './pdf-viewer/services/pdfLoader';
import { runSearch } from './pdf-viewer/services/searchEngine';
import { PdfCache } from './pdf-viewer/services/cacheStore';
import { scrollToTarget } from './pdf-viewer/services/scrollUtils';
import { generateSnippetId } from './pdf-viewer/services/highlightEngine';

// Sub-components
import { PdfSearchBar } from './pdf-viewer/PdfSearchBar';
import { PdfPage } from './pdf-viewer/PdfPage';

export type { NavigationTarget, SnippetSource };

interface PdfViewerProps {
  documents: Document[];
  navigationTarget: NavigationTarget | null;
  allSnippets?: SnippetSource[];
  className?: string;
  onTextSelection?: (text: string, page: number, fileName: string | null) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ documents, navigationTarget, allSnippets, className = '', onTextSelection }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // -- State --
  const [pdfDocs, setPdfDocs] = useState<PDFDocumentProxy[]>([]);
  const [openDocIndices, setOpenDocIndices] = useState<Set<number>>(new Set([0])); 
  const [scale, setScale] = useState(1.5);
  const [isRendering, setIsRendering] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const viewerId = useMemo(() => `pdf-viewer-${Math.random().toString(36).substring(2, 9)}`, [documents]);
  
  // -- Caches & Refs --
  const cache = useRef(new PdfCache()).current;
  const renderTasksRef = useRef(new Set<RenderTask>());
  const isMountedRef = useRef(true);
  const allSnippetsRef = useRef(allSnippets);

  // -- Interaction State --
  const [selectionStart, setSelectionStart] = useState<HTMLElement | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);

  // -- Search State --
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const currentSearchId = useRef(0);
  const searchResultsRef = useRef(searchResults);
  
  // Sync Refs
  useEffect(() => { searchResultsRef.current = searchResults; }, [searchResults]);
  useEffect(() => { allSnippetsRef.current = allSnippets; }, [allSnippets]);

  // -- Lifecycle --
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      renderTasksRef.current.forEach(task => { try { task.cancel(); } catch (e) {} });
      renderTasksRef.current.clear();
      cache.clear();
    };
  }, []);

  // Load Documents
  useEffect(() => {
    if (!documents || documents.length === 0) return;
    setIsRendering(true);
    setIsReady(false);
    setPdfDocs([]);
    setOpenDocIndices(new Set([0]));
    cache.clear();
    
    loadDocuments(documents).then(loadedDocs => {
        if (!isMountedRef.current) return;
        setPdfDocs(loadedDocs);
        setIsRendering(false);
        setIsReady(true);
    });
  }, [documents]);

  // -- Interaction Handlers --

  const handleTextSpanClick = (e: MouseEvent, span: HTMLElement, textContent: string) => {
      e.stopPropagation();
      e.preventDefault();
      
      setSelectionStart(prev => {
          if (!prev) {
              // 1. Start Selection Mode
              span.classList.add('selection-start-marker');
              return span;
          } else {
              // 2. End Selection Mode
              prev.classList.remove('selection-start-marker');
              
              const container = span.closest('.textLayer');
              const prevContainer = prev.closest('.textLayer');

              // Ensure both clicks are in same container/page
              if (container && prevContainer && container === prevContainer) {
                  // Get indices from data attributes
                  const idx1 = parseInt(prev.dataset.idx || '-1');
                  const idx2 = parseInt(span.dataset.idx || '-1');
                  
                  if (idx1 !== -1 && idx2 !== -1) {
                      // Correctly handle click order (user might click end then start)
                      const startIdx = Math.min(idx1, idx2);
                      const endIdx = Math.max(idx1, idx2);
                      
                      // Identify page context
                      const pageContainer = container.closest('.pdf-page-container');
                      if (pageContainer && pageContainer.id) {
                         const parts = pageContainer.id.replace('pdf-page-', '').split('-');
                         const docIdx = parseInt(parts[0]);
                         const pageNum = parseInt(parts[1]);
                         const pageKey = `${docIdx}-${pageNum}`;
                         const fName = documents[docIdx].name;

                         // Retrieve raw text items from cache to ensure clean data
                         const pageItems = cache.text.get(pageKey);
                         if (pageItems) {
                             // Slice the array to get range
                             const selectedItems = pageItems.slice(startIdx, endIdx + 1);
                             
                             // Join with single space.
                             const extractedText = selectedItems
                                .map(item => item.str)
                                .join(' ')
                                .replace(/\s+/g, ' ') // normalize whitespace
                                .trim();
                             
                             // ALWAYS copy to clipboard regardless of mode
                             navigator.clipboard.writeText(extractedText).catch(err => console.error('Clipboard write failed', err));
                             
                             // LOGIC: 
                             // If SHIFT key is held -> Trigger Workflow (Update field)
                             // If NO Shift key -> Just Copy
                             
                             if (e.shiftKey && onTextSelection) {
                                 onTextSelection(extractedText, pageNum, fName);
                                 setCopyMessage('Source Captured!');
                             } else {
                                 setCopyMessage('Copied!');
                             }
                             
                             setTimeout(() => setCopyMessage(null), 2000);
                         }
                      }
                  }
              }
              return null; // Reset selection state
          }
      });
  };

  // -- Navigation --

  useEffect(() => {
      if (!isReady || !navigationTarget) return;
      
      const handleNav = async () => {
          const targetDocIndex = documents.findIndex(d => d.name === navigationTarget.fileName);
          const docIdx = targetDocIndex >= 0 ? targetDocIndex : 0;
          const pageNum = navigationTarget.page;

          if (!openDocIndices.has(docIdx)) {
              setOpenDocIndices(prev => new Set(prev).add(docIdx));
              await new Promise(r => setTimeout(r, 100)); 
          }

          const pageKey = `${docIdx}-${pageNum}`;
          const pageContainer = document.getElementById(`pdf-page-${pageKey}`);
          
          if (navigationTarget.searchText) {
              const snipId = generateSnippetId(docIdx, pageNum, navigationTarget.searchText);
              setActiveSnippetId(snipId);

              setTimeout(() => {
                  const highlights = pageContainer?.querySelectorAll('.snippet-highlight');
                  let targetHighlight: HTMLElement | null = null;
                  // Try to find exact match snippet ID
                  highlights?.forEach(h => {
                      if ((h as HTMLElement).dataset.snippetIds?.split(',').includes(snipId)) {
                          targetHighlight = h as HTMLElement;
                      }
                  });
                  // If no exact match, scroll to page
                  scrollToTarget(targetHighlight, pageContainer);
              }, 200);
          } else if (pageContainer) {
              scrollToTarget(null, pageContainer);
          }
      };
      handleNav();
  }, [navigationTarget, isReady, documents, openDocIndices]);

  // -- Search --

  const performSearchWrapper = useCallback(async (query: string) => {
      const searchId = currentSearchId.current;
      const results = runSearch(query, pdfDocs, cache.text);

      if (currentSearchId.current === searchId) {
          setSearchResults(results);
          setIsSearching(false);
          if (results.length > 0) {
              setCurrentResultIndex(0);
              const target = results[0];
              setOpenDocIndices(prev => new Set(prev).add(target.docIndex));
              
              setTimeout(() => {
                  const pageKey = `${target.docIndex}-${target.pageIndex}`;
                  const pageContainer = document.getElementById(`pdf-page-${pageKey}`);
                  if (pageContainer) {
                      setTimeout(() => {
                           const refreshedEl = pageContainer.querySelector('.search-highlight') as HTMLElement; 
                           scrollToTarget(refreshedEl, pageContainer);
                      }, 100);
                  }
              }, 200);
          } else {
              setCurrentResultIndex(-1);
          }
      }
  }, [pdfDocs]);

  useEffect(() => {
      if (!searchQuery || !isReady) {
          setSearchResults([]);
          setCurrentResultIndex(-1);
          setIsSearching(false);
          return;
      }
      const searchId = ++currentSearchId.current;
      setIsSearching(true);
      const timeoutId = setTimeout(() => performSearchWrapper(searchQuery), 600); 
      return () => clearTimeout(timeoutId);
  }, [searchQuery, isReady, performSearchWrapper]);

  const navigateSearch = (direction: number) => {
      const results = searchResultsRef.current;
      if (results.length === 0) return;
      
      let newIndex = currentResultIndex + direction;
      if (newIndex >= results.length) newIndex = 0;
      if (newIndex < 0) newIndex = results.length - 1;
      
      setCurrentResultIndex(newIndex);
      const target = results[newIndex];
      
      setOpenDocIndices(prevOpen => {
          if (!prevOpen.has(target.docIndex)) return new Set(prevOpen).add(target.docIndex);
          return prevOpen;
      });

      setTimeout(() => {
          const pageKey = `${target.docIndex}-${target.pageIndex}`;
          const pageContainer = document.getElementById(`pdf-page-${pageKey}`);
          if (pageContainer) {
              setTimeout(() => {
                  const activeHighlight = pageContainer.querySelector('.search-highlight.active') as HTMLElement;
                  scrollToTarget(activeHighlight, pageContainer);
              }, 50);
          }
      }, 100);
  };

  // -- Render --

  return (
    <div className="w-full h-full flex flex-col bg-gray-500 relative">
      {copyMessage && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in">{copyMessage}</div>}
      
      {/* Selection Mode Indicator */}
      {selectionStart && (
          <div className="absolute top-28 right-4 z-[70] bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg animate-pulse border border-white/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Click End Word. <span className="opacity-80 font-normal ml-1">(Hold Shift to Capture Source)</span></span>
          </div>
      )}
      
      {isReady && pdfDocs.length > 0 && (
          <PdfSearchBar 
            isOpen={isSearchOpen} setIsOpen={setIsSearchOpen}
            query={searchQuery} setQuery={setSearchQuery}
            isSearching={isSearching} resultCount={searchResults.length} currentIndex={currentResultIndex}
            onNext={() => navigateSearch(1)} onPrev={() => navigateSearch(-1)} onClose={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
            inputRef={searchInputRef}
          />
      )}

      <div id={viewerId} ref={containerRef} className={`flex-grow overflow-auto px-4 pb-4 pt-0 min-h-0 pdf-viewer-root ${className}`}>
          {isRendering && pdfDocs.length === 0 && <div className="text-white text-center mt-10">Loading Documents...</div>}
          
          {pdfDocs.map((doc, dIdx) => {
              const docName = documents[dIdx].name;
              const isOpen = openDocIndices.has(dIdx);
              
              return (
                  <div key={dIdx}>
                      <div className="accordion-header" onClick={() => setOpenDocIndices(prev => { 
                            const next = new Set(prev); 
                            if (next.has(dIdx)) next.delete(dIdx); else next.add(dIdx); 
                            return next; 
                        })}>
                        <span>{docName}</span>
                        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                      </div>
                      
                      <div className={`accordion-content ${isOpen ? '' : 'hidden'}`}>
                         {isOpen && Array.from({ length: doc.numPages }, (_, i) => i + 1).map(pageNum => (
                             <PdfPage 
                                key={pageNum}
                                docIndex={dIdx}
                                pageIndex={pageNum}
                                doc={doc}
                                scale={scale}
                                cache={cache}
                                renderTasks={renderTasksRef.current}
                                snippets={allSnippetsRef.current || []}
                                docName={docName}
                                activeSnippetId={activeSnippetId}
                                searchResults={searchResults}
                                searchResultIndex={currentResultIndex}
                                onTextClick={handleTextSpanClick}
                                onHighlightClick={setActiveSnippetId}
                             />
                         ))}
                      </div>
                  </div>
              );
          })}
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface shadow-xl border border-border rounded-full px-3 py-1.5 flex items-center gap-2 z-50">
           <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1.5 rounded-full hover:bg-surface-muted text-text-light hover:text-primary transition-colors"><MagnifyingGlassMinusIcon className="w-5 h-5" /></button>
            <span className="text-xs font-semibold text-text-main w-10 text-center select-none">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3.0, s + 0.25))} className="p-1.5 rounded-full hover:bg-surface-muted text-text-light hover:text-primary transition-colors"><MagnifyingGlassPlusIcon className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
