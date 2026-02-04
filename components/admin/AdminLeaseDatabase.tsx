
import React, { useMemo, useState } from 'react';
import { Lease, Document } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { CircleStackIcon } from '../icons/CircleStackIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { DateRangeFilter } from '../DateRangeFilter';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { FolderIcon } from '../icons/FolderIcon';

interface AdminLeaseDatabaseProps {
  leases: Lease[];
  onBack: () => void;
}

// Grouped Entry (Bundle or Amendment)
interface DatabaseEntry {
    uniqueKey: string;
    type: 'Original' | 'Amendment';
    entryName: string; // The specific name of the bundle or amendment
    leaseName: string; // Parent lease name (context)
    leaseId: string;
    clientName: string;
    clientEmail: string;
    date: Date;
    files: Document[];
}

// Simple Folder Icon for Bundles
const SimpleFolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

export const AdminLeaseDatabase: React.FC<AdminLeaseDatabaseProps> = ({ leases, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Original' | 'Amendment'>('All');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Transform Leases into Grouped Entries
    const databaseEntries = useMemo(() => {
        const entries: DatabaseEntry[] = [];
        
        leases.forEach(lease => {
            const clientName = lease.user?.username || 'Unknown';
            const clientEmail = lease.user?.email || '';

            // 1. Original Lease Entry (The Bundle)
            if (lease.documents && lease.documents.length > 0) {
                entries.push({
                    uniqueKey: `orig-${lease.id}`,
                    type: 'Original',
                    entryName: lease.name, // The Bundle Name
                    leaseName: lease.name,
                    leaseId: lease.id,
                    clientName,
                    clientEmail,
                    date: lease.uploadDate,
                    files: lease.documents
                });
            }

            // 2. Amendment Entries
            if (lease.amendments) {
                lease.amendments.forEach((amend, idx) => {
                    entries.push({
                        uniqueKey: `amend-${lease.id}-${amend.id}-${idx}`,
                        type: 'Amendment',
                        entryName: amend.name,
                        leaseName: lease.name,
                        leaseId: lease.id,
                        clientName,
                        clientEmail,
                        date: amend.date,
                        files: [amend.document] // Usually one, but array structure keeps it consistent
                    });
                });
            }
        });

        return entries.sort((a,b) => b.date.getTime() - a.date.getTime());
    }, [leases]);

    // Filter Logic
    const filteredEntries = useMemo(() => {
        return databaseEntries.filter(entry => {
            // Text Search
            const term = searchTerm.toLowerCase();
            const matchesText = 
                entry.entryName.toLowerCase().includes(term) ||
                entry.leaseName.toLowerCase().includes(term) ||
                entry.leaseId.toLowerCase().includes(term) ||
                entry.clientName.toLowerCase().includes(term) ||
                entry.clientEmail.toLowerCase().includes(term) ||
                entry.files.some(f => f.name.toLowerCase().includes(term));

            if (!matchesText) return false;

            // Type Filter
            if (typeFilter !== 'All' && entry.type !== typeFilter) return false;

            // Date Filter
            if (startDate || endDate) {
                const entryDate = new Date(entry.date);
                entryDate.setHours(0,0,0,0);
                
                const start = startDate ? new Date(startDate) : null;
                if (start) start.setHours(0,0,0,0);
                
                const end = endDate ? new Date(endDate) : null;
                if (end) end.setHours(23,59,59,999);

                if (start && entryDate < start) return false;
                if (end && entryDate > end) return false;
            }

            return true;
        });
    }, [databaseEntries, searchTerm, typeFilter, startDate, endDate]);

    const handleDownload = (doc: Document) => {
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 pb-20 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                <div>
                    <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2 mb-1">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
                        <CircleStackIcon className="w-8 h-8 text-primary" />
                        Lease Database
                    </h1>
                    <p className="text-text-light mt-1 font-medium">Centralized repository for all lease documents and amendments.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border shadow-sm">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Entries:</span>
                    <span className="text-lg font-black text-text-main">{filteredEntries.length}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col xl:flex-row gap-4">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search by bundle name, lease ID, client, or filename..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-surface-muted rounded-lg p-1 border border-border">
                        {(['All', 'Original', 'Amendment'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                                    typeFilter === type 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-text-light hover:text-text-main hover:bg-white/50'
                                }`}
                            >
                                {type}s
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-border hidden sm:block"></div>

                    <DateRangeFilter 
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onClear={() => { setStartDate(''); setEndDate(''); }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider w-10"></th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Entry Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Related Lease ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Client</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">Files</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-border">
                            {filteredEntries.map((entry) => {
                                const isExpanded = expandedRows.has(entry.uniqueKey);
                                return (
                                    <React.Fragment key={entry.uniqueKey}>
                                        <tr 
                                            className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isExpanded ? 'bg-slate-50' : ''}`}
                                            onClick={() => toggleRow(entry.uniqueKey)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button className="text-slate-400 hover:text-primary transition-colors">
                                                    {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${entry.type === 'Original' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {entry.files.length > 1 ? <SimpleFolderIcon className="w-5 h-5" /> : (entry.type === 'Original' ? <DocumentTextIcon className="w-5 h-5" /> : <DocumentPlusIcon className="w-5 h-5" />)}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm text-text-main block">{entry.entryName}</span>
                                                        {entry.type === 'Amendment' && entry.leaseName !== entry.entryName && (
                                                            <span className="text-xs text-text-light">of {entry.leaseName}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    entry.type === 'Original' 
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                                    : 'bg-purple-100 text-purple-700 border-purple-200'
                                                }`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-text-light">{entry.leaseId}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-text-main">{entry.clientName}</span>
                                                    <span className="text-xs text-text-light">{entry.clientEmail}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                                {entry.date.toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                    {entry.files.length} File{entry.files.length !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="ml-12 border-l-2 border-slate-200 pl-6 space-y-3">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Available Documents</p>
                                                        {entry.files.map((file, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-primary/30 transition-colors group/file">
                                                                <div className="flex items-center gap-3">
                                                                    <DocumentTextIcon className="w-5 h-5 text-slate-400 group-hover/file:text-primary transition-colors" />
                                                                    <span className="text-sm font-medium text-text-main">{file.name}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-focus bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors"
                                                                >
                                                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                                                    Download
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {filteredEntries.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400 bg-surface-muted/30">
                                        <CircleStackIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No database entries found matching your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScrollAnimatedSection>
    );
};
