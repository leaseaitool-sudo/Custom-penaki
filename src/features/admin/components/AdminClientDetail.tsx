
import React, { useMemo } from 'react';
import { Lease, User, LeaseStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '@/shared/ui/Icons/ExclamationTriangleIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';

interface AdminClientDetailProps {
  client: User;
  leases: Lease[];
  onView: (lease: Lease) => void;
  onDownloadExcel: (lease: Lease) => void;
  onBack: () => void;
}

const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return '-';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

const StatusBadge: React.FC<{ lease: Lease }> = ({ lease }) => {
  const status = lease.status;
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

export const AdminClientDetail: React.FC<AdminClientDetailProps> = ({ client, leases, onView, onDownloadExcel, onBack }) => {
  const sortedLeases = useMemo(() => {
    return [...leases].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }, [leases]);

  return (
    <ScrollAnimatedSection tag="div" className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2 mb-2">
            <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Clients
          </button>
          <div className="flex items-center gap-4">
             <UserCircleIcon className="w-12 h-12 text-text-light flex-shrink-0" />
             <div>
                <h2 className="text-2xl font-bold text-text-main">{client.username}</h2>
                <p className="text-text-light">{client.email}</p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl bg-white">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-light uppercase tracking-wider">Lease Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-light uppercase tracking-wider">Reviewer 1 (Time)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-light uppercase tracking-wider">Reviewer 2 (Time)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-text-light uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-text-light uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedLeases.length > 0 ? sortedLeases.map(lease => (
              <tr key={lease.id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-main">{lease.name}</span>
                        {lease.isEscalated && <ExclamationCircleIcon className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-[10px] text-text-light font-mono">{lease.id}</p>
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
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge lease={lease} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => onView(lease)}
                        disabled={lease.status !== LeaseStatus.ABSTRACTED}
                        className="p-1 text-primary hover:text-primary-focus disabled:text-gray-300"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                          onClick={() => onDownloadExcel(lease)}
                          disabled={lease.status !== LeaseStatus.ABSTRACTED}
                          className="p-1 text-slate-400 hover:text-green-600 disabled:text-gray-300"
                          title="Excel Download"
                      >
                        <TableCellsIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-text-light">No leases found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ScrollAnimatedSection>
  );
};
