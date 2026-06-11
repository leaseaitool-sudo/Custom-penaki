
import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Lease } from '@/shared/types';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { UserIcon } from '@/shared/ui/Icons/UserIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { CalendarDaysIcon } from '@/shared/ui/Icons/CalendarDaysIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { InformationCircleIcon } from '@/shared/ui/Icons/InformationCircleIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { ChevronDownIcon } from '@/shared/ui/Icons/ChevronDownIcon';
import { PdfFileIcon } from '@/shared/ui/Icons/PdfFileIcon';
import '@/widgets/pdf-viewer/PdfViewerGlobal.css';
import { PdfViewer, NavigationTarget, SnippetSource } from '@/widgets/pdf-viewer/PdfViewer';

interface ViewSubmissionModalProps {
  lease: Lease;
  onClose: () => void;
  onDownloadExcel: (lease: Lease) => void;
  onDownloadPdf: (lease: Lease) => void;
}

const getIconForSection = (title: string): React.ReactNode => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('landlord')) {
        return <UserIcon className="w-6 h-6" />;
    }
    if (lowerCaseTitle.includes('tenant')) {
        return <BuildingOfficeIcon className="w-6 h-6" />;
    }
    if (lowerCaseTitle.includes('rent')) {
        return <CurrencyEuroIcon className="w-6 h-6" />;
    }
    if (lowerCaseTitle.includes('term')) {
        return <CalendarDaysIcon className="w-6 h-6" />;
    }
    return <DocumentTextIcon className="w-6 h-6" />;
}

const DataSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div id={`section-${title}`} className="mb-8 scroll-mt-6">
        <div className="flex items-center border-b border-border pb-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center mr-4">
                <span className="text-primary">{getIconForSection(title)}</span>
            </div>
            <h3 className="text-xl font-semibold text-text-main">{title}</h3>
        </div>
        <div className="space-y-3 pl-2">{children}</div>
    </div>
);

const DataField: React.FC<{ label: string; value: string | null; page: number | null; fileName: string | null | undefined; snippet: string | null; onFieldClick: (page: number, fileName: string | null, snippet: string | null) => void; }> = ({ label, value, page, fileName, snippet, onFieldClick }) => (
    <div 
        className={`p-2 rounded-lg transition-all duration-200 ${page && snippet ? 'cursor-pointer hover:bg-sky-50' : ''}`}
        onClick={() => page && snippet && onFieldClick(page, fileName || null, snippet)}
        title={page && snippet ? `Click to highlight "${snippet}" on page {page} of {fileName || 'document'}` : ''}
    >
        <dt className="text-sm font-medium text-text-light">{label}</dt>
        <dd className="mt-1 text-lg text-text-main font-medium">{value ?? <span className="text-base text-gray-400 italic">Not Found</span>}</dd>
        {page && snippet && (
            <dd className="mt-2 text-xs text-text-light italic bg-surface p-2.5 rounded-md border border-border">
                <span className="font-semibold">Source ({fileName ? `${fileName}, ` : ''}Page {page}):</span> "{snippet}"
            </dd>
        )}
    </div>
);

export const ViewSubmissionModal: React.FC<ViewSubmissionModalProps> = ({ lease, onClose, onDownloadExcel, onDownloadPdf }) => {
  if (!lease.abstractedData || lease.abstractedData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="bg-surface rounded-2xl p-8 max-w-md mx-auto shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-bold text-text-main mb-2">No Abstraction Data Yet</h2>
          <p className="text-text-light mb-6">
            {lease.status === 'Processing'
              ? 'This lease is still being processed by AI. The report will appear automatically once complete.'
              : 'No abstraction data is available for this lease. It may have failed processing.'}
          </p>
          <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    );
  }
  
  const [navigationTarget, setNavigationTarget] = React.useState<NavigationTarget | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [isReviewerNoteOpen, setIsReviewerNoteOpen] = useState(false);
  
  const sidebarRef = useRef<HTMLElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
      if (lease.abstractedData.length > 0) {
          setActiveSectionId(lease.abstractedData[0].title);
      }
  }, [lease]);

  const handleFieldClick = React.useCallback((page: number, fileName: string | null, snippet: string | null) => {
      setNavigationTarget(null);
      setTimeout(() => setNavigationTarget({ page, fileName, searchText: snippet }), 50);
  }, []);
  
  // Prepare all snippets for auto-highlighting in read-only mode too
  const allSnippets = useMemo<SnippetSource[]>(() => {
      const snippets: SnippetSource[] = [];
      lease.abstractedData.forEach(section => {
          section.fields.forEach(field => {
              if (field.page && field.snippet) {
                  snippets.push({
                      page: field.page,
                      snippet: field.snippet,
                      fileName: field.fileName
                  });
              }
          });
      });
      return snippets;
  }, [lease.abstractedData]);
  
  const scrollToSection = (title: string) => {
      setActiveSectionId(title);
      const element = document.getElementById(`section-${title}`);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const handleScroll = useCallback(() => {
      if (!formContainerRef.current) return;
      const container = formContainerRef.current;
      const triggerTop = container.scrollTop + 150; 
      
      let currentSection = activeSectionId;
      
      for (const section of lease.abstractedData) {
          const el = document.getElementById(`section-${section.title}`);
          if (el) {
              if (el.offsetTop <= triggerTop) {
                  currentSection = section.title;
              } else {
                  break; 
              }
          }
      }
      
      if (currentSection !== activeSectionId) {
          setActiveSectionId(currentSection);
          if (sidebarRef.current) {
              const activeBtn = sidebarRef.current.querySelector(`[data-section-title="${currentSection}"]`);
              if (activeBtn) {
                  activeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }
      }
  }, [lease.abstractedData, activeSectionId]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface w-full h-full flex flex-col md:flex-row shadow-2xl overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Left Panel: Abstracted Data */}
        <div className="w-full md:w-[550px] flex-shrink-0 h-full flex flex-col border-r-0 md:border-r border-border bg-surface-muted min-h-0">
            <header className="p-5 border-b border-border flex-shrink-0 flex justify-between items-center bg-white z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-text-main">Abstraction Report</h2>
                        <p className="text-sm text-text-light truncate max-w-[250px]" title={lease.name}>{lease.name}</p>
                        <p className="text-xs text-text-light font-mono mt-0.5">{lease.displayId || lease.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDownloadExcel(lease)}
                        className="flex items-center justify-center py-2 px-3 text-sm font-medium text-white focus:outline-none bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-md"
                        title="Download Excel Report"
                    >
                        <TableCellsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDownloadPdf(lease)}
                        className="flex items-center justify-center py-2 px-3 text-sm font-medium text-white focus:outline-none bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-md"
                        title="Download PDF Report"
                    >
                        <PdfFileIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            
            <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Sidebar Navigation */}
                <nav ref={sidebarRef} className="flex-shrink-0 border-r border-border bg-white/50 backdrop-blur-sm overflow-y-auto overflow-x-hidden hidden md:block transition-[width] duration-300 ease-out w-16 hover:w-64 group z-20 hover:shadow-xl">
                     <div className="px-1 py-4 space-y-2">
                        <p className="px-3 text-xs font-semibold text-text-light uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                            Sections
                        </p>
                        {lease.abstractedData.map((section, idx) => (
                            <button
                                key={section.title}
                                data-section-title={section.title}
                                onClick={() => scrollToSection(section.title)}
                                className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-all overflow-hidden whitespace-nowrap ${
                                    activeSectionId === section.title 
                                    ? 'bg-white text-primary shadow-sm ring-1 ring-border' 
                                    : 'text-text-light hover:bg-white/60 hover:text-text-main'
                                }`}
                                title={section.title}
                            >
                                <div className={`flex-shrink-0 p-1.5 rounded-md ${activeSectionId === section.title ? 'bg-primary/10' : 'bg-transparent'}`}>
                                    <span className={activeSectionId === section.title ? 'text-primary' : 'text-gray-400'}>
                                        {getIconForSection(section.title)}
                                    </span>
                                </div>
                                <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                                    {section.title}
                                </span>
                            </button>
                        ))}
                     </div>
                </nav>

                <main 
                    ref={formContainerRef}
                    onScroll={handleScroll}
                    className="p-5 overflow-y-auto flex-grow min-h-0"
                >
                    {/* Display R2 Notes to Client */}
                    {lease.reviewerNotesR2 && (
                        <div className="mb-6">
                             <button 
                                onClick={() => setIsReviewerNoteOpen(!isReviewerNoteOpen)}
                                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${isReviewerNoteOpen ? 'bg-sky-50 border-sky-200 rounded-b-none shadow-sm' : 'bg-white border-sky-200 hover:bg-sky-50'}`}
                             >
                                <div className="flex items-center gap-3">
                                    <InformationCircleIcon className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-bold text-text-main">Executive Review Notes</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-primary transition-transform ${isReviewerNoteOpen ? 'rotate-180' : ''}`} />
                             </button>
                             {isReviewerNoteOpen && (
                                <div className="p-4 bg-sky-50 border-x border-b border-sky-200 rounded-b-lg text-sm text-text-main whitespace-pre-wrap animate-slide-up">
                                    {lease.reviewerNotesR2}
                                </div>
                             )}
                        </div>
                    )}
                    {lease.abstractedData.map((section, sectionIndex) => (
                        <DataSection key={`${section.title}-${sectionIndex}`} title={section.title}>
                            {section.fields.map((field, fieldIndex) => (
                                <DataField 
                                    key={`${field.label}-${fieldIndex}`}
                                    label={field.label}
                                    value={field.value}
                                    page={field.page}
                                    fileName={field.fileName}
                                    snippet={field.snippet}
                                    onFieldClick={handleFieldClick}
                                />
                            ))}
                        </DataSection>
                    ))}
                    <div className="h-12"></div>
                </main>
            </div>
        </div>

        {/* Right Panel: PDF Viewer */}
        <div className="flex-grow h-full hidden md:flex flex-col bg-surface relative min-w-0 overflow-hidden">
            <div className="flex-grow bg-gray-500 relative min-h-0 h-full w-full">
                <PdfViewer
                    documents={lease.documents}
                    navigationTarget={navigationTarget}
                    allSnippets={allSnippets}
                    className="modal-viewer relative"
                />
            </div>
        </div>
      </div>
    </div>
  );
};
