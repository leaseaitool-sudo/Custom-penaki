
import React, { useState, useMemo, useEffect } from 'react';
import { Lease, User, ReviewStatus, LeaseStatus } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { DateRangeFilter } from '../DateRangeFilter';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';

interface ReviewerActivityProps {
  leases: Lease[];
  currentUser: User;
  onBack: () => void;
  initialFilter?: string; // 'All', 'InProgress', 'Completed', 'Escalated'
}

const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
};

export const ReviewerActivity: React.FC<ReviewerActivityProps> = ({ leases, currentUser, onBack, initialFilter = 'All' }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [passFilter, setPassFilter] = useState<'All' | 'Pass 1' | 'Pass 2'>('All');
  const [escalationFilter, setEscalationFilter] = useState<string>('All'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
      if (initialFilter === 'Escalated') {
          setEscalationFilter('Escalated');
          setStatusFilter('InProgress'); 
      } else if (initialFilter) {
          setStatusFilter(initialFilter);
          setEscalationFilter('All');
      }
  }, [initialFilter]);

  const filteredLeases = useMemo(() => {
    return leases.filter(l => 
        l.processingMode === 'human' && 
        (l.reviewer?.email === currentUser.email || l.reviewerR2?.email === currentUser.email)
    ).filter(lease => {
        // Pass Filter
        if (passFilter === 'Pass 1' && lease.reviewer?.email !== currentUser.email) return false;
        if (passFilter === 'Pass 2' && lease.reviewerR2?.email !== currentUser.email) return false;

        // Date Filter
        if (startDate || endDate) {
            const relevantDate = lease.lastSaved || lease.uploadDate;
            relevantDate.setHours(0,0,0,0);
            const start = startDate ? new Date(startDate) : null;
            if(start) start.setHours(0,0,0,0);
            const end = endDate ? new Date(endDate) : null;
            if(end) end.setHours(23,59,59,999);
            if (start && relevantDate < start) return false;
            if (end && relevantDate > end) return false;
        }

        // Status Filter
        if (statusFilter === 'InProgress') {
            const isR1Me = lease.reviewer?.email === currentUser.email;
            const isR2Me = lease.reviewerR2?.email === currentUser.email;
            const r1Active = isR1Me && lease.reviewStatus !== ReviewStatus.COMPLETED;
            const r2Active = isR2Me && lease.reviewStatusR2 !== ReviewStatus.COMPLETED;
            if (!r1Active && !r2Active) return false;
        } else if (statusFilter === 'Completed') {
            const isR1Me = lease.reviewer?.email === currentUser.email;
            const isR2Me = lease.reviewerR2?.email === currentUser.email;
            const r1Done = isR1Me && lease.reviewStatus === ReviewStatus.COMPLETED;
            const r2Done = isR2Me && lease.reviewStatusR2 === ReviewStatus.COMPLETED;
            if (!r1Done && !r2Done) return false;
        }

        // Escalation Filter
        if (escalationFilter === 'Escalated') {
            if (!lease.wasEscalated && !lease.isEscalated) return false;
        }

        // Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesName = lease.name.toLowerCase().includes(term);
            const matchesId = lease.id.toLowerCase().includes(term);
            const matchesClient = lease.user?.username.toLowerCase().includes(term);
            if (!matchesName && !matchesId && !matchesClient) return false;
        }

        return true;
    }).sort((a,b) => (b.lastSaved?.getTime() || b.uploadDate.getTime()) - (a.lastSaved?.getTime() || a.uploadDate.getTime()));
  }, [leases, currentUser, startDate, endDate, statusFilter, escalationFilter, searchTerm, passFilter]);

  return (
    <ScrollAnimatedSection className="space-y-6 max-w-[95rem] mx-auto px-4">
      <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2">
                <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                <CheckBadgeIcon className="w-8 h-8 text-green-600" />
                My Activity History
            </h2>
          </div>
          
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto flex-1">
                  <div className="relative flex-grow max-w-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type="text"
                          placeholder="Search leases..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-surface-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                      />
                  </div>
                  <select 
                    value={passFilter}
                    onChange={(e) => setPassFilter(e.target.value as any)}
                    className="block pl-3 pr-8 py-2 text-sm border border-border focus:outline-none focus:ring-primary focus:border-primary rounded-lg bg-surface-muted"
                  >
                      <option value="All">All Passes</option>
                      <option value="Pass 1">First Pass (R1)</option>
                      <option value="Pass 2">Second Pass (R2)</option>
                  </select>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block pl-3 pr-8 py-2 text-sm border border-border focus:outline-none focus:ring-primary focus:border-primary rounded-lg bg-surface-muted"
                  >
                      <option value="All">All Statuses</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Submitted</option>
                  </select>
                  <select 
                    value={escalationFilter}
                    onChange={(e) => setEscalationFilter(e.target.value)}
                    className="block pl-3 pr-8 py-2 text-sm border border-border focus:outline-none focus:ring-primary focus:border-primary rounded-lg bg-surface-muted"
                  >
                      <option value="All">All Types</option>
                      <option value="Escalated">Escalated Only</option>
                  </select>
              </div>
              
              <DateRangeFilter 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={() => { setStartDate(''); setEndDate(''); }}
            />
          </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-muted">
                <tr>
                  {['Lease Name', 'Role', 'Last Active', 'Time Spent (R1)', 'Time Spent (R2)', 'Status', 'Escalation'].map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-light uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {filteredLeases.length > 0 ? (
                    filteredLeases.map(lease => {
                        const isR1Me = lease.reviewer?.email === currentUser.email;
                        const isR2Me = lease.reviewerR2?.email === currentUser.email;
                        let roleLabel = 'Reviewer';
                        if (isR1Me && isR2Me) roleLabel = 'R1 & R2';
                        else if (isR1Me) roleLabel = 'First Pass (R1)';
                        else if (isR2Me) roleLabel = 'Second Pass (R2)';

                        return (
                        <tr key={lease.id} className="hover:bg-surface-muted transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                                {lease.name}
                                <span className="block text-xs text-text-light font-normal font-mono mt-0.5">{lease.id}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${isR2Me ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {roleLabel}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                {lease.lastSaved ? lease.lastSaved.toLocaleString() : lease.uploadDate.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-600">
                                {formatDuration(lease.timeSpentR1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600">
                                {formatDuration(lease.timeSpentR2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    (isR2Me ? lease.reviewStatusR2 : lease.reviewStatus) === ReviewStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                                    (isR2Me ? lease.reviewStatusR2 : lease.reviewStatus) === ReviewStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {(isR2Me ? lease.reviewStatusR2 : lease.reviewStatus) === ReviewStatus.COMPLETED ? 'Submitted' : (isR2Me ? lease.reviewStatusR2 : lease.reviewStatus)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {(lease.wasEscalated || lease.isEscalated) ? (
                                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${lease.isEscalated ? 'bg-red-100 text-red-800 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                                        {lease.isEscalated ? 'Active' : 'Resolved'}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                )}
                            </td>
                        </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-text-light">
                            No activity found matching your filters.
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
