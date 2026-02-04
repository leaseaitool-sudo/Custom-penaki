
import React from 'react';
import { Lease, ReviewStatus } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';

interface AdminCompletedReviewsProps {
  leases: Lease[];
  onBack: () => void;
}

const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
};

export const AdminCompletedReviews: React.FC<AdminCompletedReviewsProps> = ({ leases, onBack }) => {

  const completedLeases = leases.filter(lease => lease.reviewStatusR2 === ReviewStatus.COMPLETED || (lease.workflowStage === 'COMPLETED'))
    .sort((a,b) => (b.lastSaved?.getTime() || 0) - (a.lastSaved?.getTime() || 0));

  if (completedLeases.length === 0) {
    return (
      <ScrollAnimatedSection tag="div" className="text-center py-20 bg-surface border border-border rounded-2xl">
        <CheckBadgeIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-text-main">No Completed Reviews</h3>
        <p className="mt-2 text-text-light">There are no leases that have finished the final verification pass yet.</p>
        <button onClick={onBack} className="mt-6 inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors">
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
      </ScrollAnimatedSection>
    );
  }

  return (
    <ScrollAnimatedSection tag="div" className="space-y-6">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2">
            <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
          </button>
          <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Archived</span>
              <p className="text-lg font-black text-slate-800">{completedLeases.length}</p>
          </div>
      </div>

      <div className="overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 rounded-2xl border border-border bg-white">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lease Reference</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reviewer 1 (R1)</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reviewer 2 (R2)</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Completion</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Efficiency</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-border">
            {completedLeases.map(lease => (
              <tr key={lease.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-main">{lease.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{lease.id}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{lease.reviewer?.username || 'AI System'}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 w-fit px-1.5 rounded border border-emerald-100 mt-1">
                            {formatDuration(lease.timeSpentR1)}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{lease.reviewerR2?.username || 'Bypassed'}</span>
                        {lease.reviewerR2 && (
                            <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 w-fit px-1.5 rounded border border-blue-100 mt-1">
                                {formatDuration(lease.timeSpentR2)}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                    {lease.lastSaved ? lease.lastSaved.toLocaleDateString() : 'N/A'}
                    <span className="block text-[10px] opacity-60">
                        {lease.lastSaved ? lease.lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-black text-slate-800">
                        {formatDuration((lease.timeSpentR1 || 0) + (lease.timeSpentR2 || 0))}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollAnimatedSection>
  );
};
