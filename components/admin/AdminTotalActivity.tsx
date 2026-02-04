
import React, { useState, useMemo, useEffect } from 'react';
import { Lease, LeaseStatus } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { TableCellsIcon } from '../icons/TableCellsIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { DateRangeFilter } from '../DateRangeFilter';

interface AdminTotalActivityProps {
  leases: Lease[];
  onView: (lease: Lease) => void;
  onDownloadExcel: (lease: Lease) => void;
  onBack: () => void;
  initialFilter?: string;
}

const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

const StatusBadge: React.FC<{ status: LeaseStatus }> = ({ status }) => {
  const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1.5";
  let specificClasses = "";
  let icon = null;

  switch (status) {
    case LeaseStatus.PROCESSING:
      specificClasses = "bg-yellow-100 text-yellow-800";
      icon = <SpinnerIcon className="animate-spin h-3 w-3" />;
      break;
    case LeaseStatus.IN_REVIEW:
      specificClasses = "bg-blue-100 text-blue-800";
      icon = <PencilSquareIcon className="h-3 w-3" />;
      break;
    case LeaseStatus.ABSTRACTED:
      specificClasses = "bg-green-100 text-green-800";
      icon = <CheckBadgeIcon className="h-3 w-3" />;
      break;
    case LeaseStatus.FAILED:
      specificClasses = "bg-red-100 text-red-800";
      icon = <ExclamationTriangleIcon className="h-3 w-3" />;
      break;
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {icon}
      {status}
    </span>
  );
};

export const AdminTotalActivity: React.FC<AdminTotalActivityProps> = ({ leases, onView, onDownloadExcel, onBack, initialFilter = 'All' }) => {
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
      setFilterStatus(initialFilter);
  }, [initialFilter]);

  const statuses = ['All', ...Object.values(LeaseStatus)];

  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      const matchesSearch = lease.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            lease.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            lease.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || lease.status === filterStatus;
      
      let matchesDate = true;
      if (startDate || endDate) {
        const leaseDate = new Date(lease.uploadDate);
        leaseDate.setHours(0,0,0,0);
        
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && leaseDate < start) matchesDate = false;
        if (end && leaseDate > end) matchesDate = false;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }, [leases, searchTerm, filterStatus, startDate, endDate]);

  return (
    <ScrollAnimatedSection className="space-y-6 max-w-[95rem] mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2 mb-1">
                <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
            </button>
            <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                <DocumentTextIcon className="w-8 h-8 text-primary" />
                System Activity Log
            </h2>
          </div>
          
           <DateRangeFilter 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={() => { setStartDate(''); setEndDate(''); }}
            />
      </div>

      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col xl:flex-row gap-4">
          <div className="relative flex-grow">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                  type="text"
                  placeholder="Search clients, leases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none sm:text-sm transition-all"
              />
          </div>
          <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-48 pl-3 pr-10 py-2 text-sm border border-border rounded-lg bg-slate-50 outline-none"
          >
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-light uppercase tracking-wider">Lease / Client</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-light uppercase tracking-wider">Reviewer 1 (R1)</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-light uppercase tracking-wider">Reviewer 2 (R2)</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-text-light uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-text-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredLeases.length > 0 ? (
                    filteredLeases.map(lease => (
                    <tr key={lease.id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-text-main truncate max-w-[200px]">{lease.name}</span>
                                <span className="text-[10px] text-slate-500">{lease.user?.username} ({lease.user?.email})</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-700">{lease.reviewer?.username || 'AI System'}</span>
                                <span className="text-[10px] font-mono text-slate-400">{formatDuration(lease.timeSpentR1)}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-700">{lease.reviewerR2?.username || '-'}</span>
                                <span className="text-[10px] font-mono text-slate-400">{formatDuration(lease.timeSpentR2)}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={lease.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => onView(lease)}
                                    disabled={lease.status !== LeaseStatus.ABSTRACTED}
                                    className="p-1 text-primary hover:text-primary-focus disabled:text-gray-300"
                                    title="View Abstract"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDownloadExcel(lease)}
                                    disabled={lease.status !== LeaseStatus.ABSTRACTED}
                                    className="p-1 text-slate-400 hover:text-green-600 disabled:text-gray-300"
                                    title="Excel Download"
                                >
                                    <TableCellsIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No activity matching criteria.</td></tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </ScrollAnimatedSection>
  );
};
