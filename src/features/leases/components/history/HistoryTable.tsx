
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lease, LeaseStatus } from '@/shared/types';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { ArrowDownTrayIcon } from '@/shared/ui/Icons/ArrowDownTrayIcon';
import { ExclamationTriangleIcon } from '@/shared/ui/Icons/ExclamationTriangleIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { ArrowPathIcon } from '@/shared/ui/Icons/ArrowPathIcon';
import { DocumentPlusIcon } from '@/shared/ui/Icons/DocumentPlusIcon';
import { ChatBubbleLeftRightIcon } from '@/shared/ui/Icons/ChatBubbleLeftRightIcon';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';
import { PdfFileIcon } from '@/shared/ui/Icons/PdfFileIcon';
import { DateRangeFilter } from '@/shared/ui/Controls/DateRangeFilter';

interface HistoryTableProps {
  leases: Lease[];
  onView: (lease: Lease) => void;
  onDownloadExcel: (lease: Lease) => void;
  onDownloadAllExcel: () => void;
  onDownloadPdf: (lease: Lease) => void;
  onChat: (lease: Lease) => void;
  onRetry: (lease: Lease) => void;
  onAddAmendment: (lease: Lease) => void;
  onOpenInsights: (lease: Lease) => void;
}

const StatusBadge: React.FC<{ status: LeaseStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
  let specificClasses = "";
  let icon = null;

  switch (status) {
    case LeaseStatus.PROCESSING:
      specificClasses = "bg-yellow-100 text-yellow-800";
      icon = <SpinnerIcon className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-yellow-500" />;
      break;
    case LeaseStatus.IN_REVIEW:
      specificClasses = "bg-blue-100 text-blue-800";
      icon = <PencilSquareIcon className="-ml-1 mr-1.5 h-4 w-4 text-blue-500" />;
      break;
    case LeaseStatus.ABSTRACTED:
      specificClasses = "bg-green-100 text-green-800";
      icon = <span className="-ml-1 mr-1.5 text-green-600">✅</span>;
      break;
    case LeaseStatus.FAILED:
      specificClasses = "bg-red-100 text-red-800";
      icon = <ExclamationTriangleIcon className="-ml-1 mr-1.5 h-4 w-4 text-red-500" />;
      break;
    case LeaseStatus.AMENDMENT_REVIEW:
      specificClasses = "bg-purple-100 text-purple-800";
      icon = <DocumentPlusIcon className="-ml-1 mr-1.5 h-4 w-4 text-purple-500" />;
      break;
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {icon}
      {status}
    </span>
  );
};

const ProcessingModeBadge: React.FC<{ processingMode: 'ai' | 'human' }> = ({ processingMode }) => {
  const isAi = processingMode === 'ai';
  const text = isAi ? 'AI Only' : 'Human Reviewed';
  
  const baseClasses = "px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full whitespace-nowrap";
  const specificClasses = isAi 
    ? "bg-cyan-100 text-cyan-800"
    : "bg-indigo-100 text-indigo-800";

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {text}
    </span>
  );
};

// --- NEW DROPDOWN COMPONENTS ---

const DownloadDropdown: React.FC<{ onExcel: () => void; onPdf: () => void }> = ({ onExcel, onPdf }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 bg-white border border-border text-slate-600 hover:text-primary hover:border-primary px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
                <ArrowDownTrayIcon className="w-4 h-4" /> Download
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-border z-20 animate-fade-in overflow-hidden">
                    <button onClick={() => { onExcel(); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2">
                        <TableCellsIcon className="w-4 h-4" /> Excel
                    </button>
                    <div className="h-px bg-slate-100 mx-2"></div>
                    <button onClick={() => { onPdf(); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-red-500 flex items-center gap-2">
                        <PdfFileIcon className="w-4 h-4" /> PDF
                    </button>
                </div>
            )}
        </div>
    );
};

const ExportAllDropdown: React.FC<{ onExportExcel: () => void; disabled: boolean }> = ({ onExportExcel, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
             <button
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className="flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-focus disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              <span>Export All</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border z-30 animate-fade-in overflow-hidden">
                    <button onClick={() => { onExportExcel(); setIsOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-green-600 flex items-center gap-3">
                        <TableCellsIcon className="w-5 h-5" /> Export Excel
                    </button>
                    <div className="h-px bg-slate-100 mx-2"></div>
                    <button 
                        onClick={() => { alert('Bulk PDF Export coming soon!'); setIsOpen(false); }} 
                        className="w-full text-left px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-50 flex items-center gap-3 cursor-not-allowed"
                    >
                        <PdfFileIcon className="w-5 h-5" /> Export PDF (Zip)
                    </button>
                </div>
            )}
        </div>
    )
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ leases, onView, onDownloadExcel, onDownloadAllExcel, onDownloadPdf, onChat, onRetry, onAddAmendment, onOpenInsights }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Keeping lease status filter as well (Processing, etc)
  const [processStatusFilter, setProcessStatusFilter] = useState('All');

  const processStatuses = useMemo(() => ['All', ...Object.values(LeaseStatus)], []);

  const abstractedLeasesCount = useMemo(() => {
    return leases.filter(lease => lease.status === LeaseStatus.ABSTRACTED).length;
  }, [leases]);

  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      const nameMatch = lease.name.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = (lease.displayId || lease.id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const processMatch = processStatusFilter === 'All' || lease.status === processStatusFilter;

      // Date Range Filter
      let dateMatch = true;
      if (startDate || endDate) {
          const d = new Date(lease.uploadDate);
          d.setHours(0,0,0,0);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start && d < start) dateMatch = false;
          if (end && d > end) dateMatch = false;
      }

      // Status Filter (Active/Expired based on abstraction data if available, else simple logic)
      let assetStatusMatch = true;
      if (statusFilter !== 'All') {
          // Attempt to find expiry date in abstraction
          let expiryDate: Date | null = null;
          if (lease.abstractedData) {
              lease.abstractedData.forEach(s => s.fields.forEach(f => {
                  if ((f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry')) && f.value) {
                      const parsed = new Date(f.value);
                      if (!isNaN(parsed.getTime())) expiryDate = parsed;
                  }
              }));
          }
          
          if (statusFilter === 'Expired') {
              // If we have a date, check it. If not, assume active unless failed.
              assetStatusMatch = expiryDate ? expiryDate < new Date() : false;
          } else if (statusFilter === 'Active') {
              assetStatusMatch = expiryDate ? expiryDate >= new Date() : true;
          }
      }

      return (nameMatch || idMatch) && processMatch && dateMatch && assetStatusMatch;
    });
  }, [leases, searchTerm, processStatusFilter, statusFilter, startDate, endDate]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setProcessStatusFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm || processStatusFilter !== 'All' || statusFilter !== 'All' || startDate || endDate;

  if (leases.length === 0) {
    return (
      <ScrollAnimatedSection tag="div" className="text-center py-20 bg-surface border border-border rounded-2xl">
        <h3 className="mt-4 text-xl font-semibold text-text-main">No leases submitted yet.</h3>
        <p className="mt-2 text-text-light">Use the "Abstract Lease" tab to get started.</p>
      </ScrollAnimatedSection>
    );
  }

  return (
    <ScrollAnimatedSection tag="div" className="space-y-6 max-w-[95rem] mx-auto px-4">
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-grow flex flex-col xl:flex-row items-center gap-4 w-full">
            <div className="w-full xl:w-1/3 relative">
              <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="block w-full rounded-lg border-border bg-surface-muted pl-10 focus:border-primary focus:ring-primary text-sm py-2.5 outline-none transition-all"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                 <select
                    value={processStatusFilter}
                    onChange={e => setProcessStatusFilter(e.target.value)}
                    className="rounded-lg border-border bg-surface-muted text-sm py-2.5 px-3 focus:border-primary outline-none cursor-pointer min-w-[120px]"
                  >
                    {processStatuses.map(status => <option key={status}>{status}</option>)}
                  </select>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as any)}
                    className="rounded-lg border-border bg-surface-muted text-sm py-2.5 px-3 focus:border-primary outline-none cursor-pointer min-w-[120px]"
                >
                    <option value="All">All Assets</option>
                    <option value="Active">Active Leases</option>
                    <option value="Expired">Expired Leases</option>
                </select>

                <div className="h-8 w-px bg-border mx-1"></div>

                <DateRangeFilter 
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onClear={() => { setStartDate(''); setEndDate(''); }}
                />
                
                <div className="h-8 w-px bg-border mx-1"></div>
                
                {/* Export Button placed beside filters */}
                <ExportAllDropdown 
                    onExportExcel={onDownloadAllExcel}
                    disabled={abstractedLeasesCount === 0}
                />
            </div>
          </div>
        </div>
        
        {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{filteredLeases.length} results found</p>
                <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-primary hover:text-primary-focus transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

      {filteredLeases.length > 0 ? (
        <div className="shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl hidden md:block bg-white">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr>
                {['Lease Name', 'Lease ID', 'Upload Date', 'Status', 'Actions'].map(header => (
                  <th key={header} scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {filteredLeases.map(lease => (
                <tr key={lease.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-800 truncate max-w-xs" title={lease.name}>{lease.name}</span>
                        <ProcessingModeBadge processingMode={lease.processingMode} />
                      </div>
                      <div className="flex items-center text-text-light mt-1 gap-3">
                        {lease.documents.length > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                                {lease.documents.length} files
                            </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 select-all" title={lease.id}>
                        {lease.displayId || lease.id}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {lease.uploadDate.toLocaleDateString()} <span className="text-slate-400 text-xs">{lease.uploadDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={lease.status} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex items-center justify-end gap-3">
                        {lease.status === LeaseStatus.FAILED ? (
                            <button 
                                onClick={() => onRetry(lease)} 
                                className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                            >
                                <ArrowPathIcon className="h-4 w-4" /> Retry
                            </button>
                        ) : (
                            <>
                                {/* Primary View Button */}
                                <button 
                                    onClick={() => onView(lease)} 
                                    disabled={lease.status !== LeaseStatus.ABSTRACTED} 
                                    className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-focus px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <EyeIcon className="h-4 w-4" /> View
                                </button>
                                
                                {lease.status === LeaseStatus.ABSTRACTED && (
                                    <>
                                        {/* Download Dropdown */}
                                        <DownloadDropdown 
                                            onExcel={() => onDownloadExcel(lease)} 
                                            onPdf={() => onDownloadPdf(lease)} 
                                        />

                                        {/* Chat Action */}
                                        <button 
                                            onClick={() => onChat(lease)} 
                                            className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors relative"
                                            title="Messages"
                                        >
                                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                            {lease.chatHistory && lease.chatHistory.length > 0 && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                            )}
                                        </button>

                                        {/* Summary Button */}
                                        <button 
                                            onClick={() => onOpenInsights(lease)} 
                                            className="flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border border-purple-100"
                                        >
                                            <SparklesIcon className="w-3.5 h-3.5" /> Summary
                                        </button>

                                        {/* Add Amendment Button */}
                                        <button 
                                            onClick={() => onAddAmendment(lease)} 
                                            className="flex items-center gap-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border border-sky-100"
                                        >
                                            <DocumentPlusIcon className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400 opacity-50" />
            <h3 className="mt-4 text-xl font-bold text-text-main">No leases match your criteria.</h3>
            <button onClick={resetFilters} className="mt-4 text-primary font-bold hover:underline">Reset Filters</button>
        </div>
      )}
    </ScrollAnimatedSection>
  );
};
    