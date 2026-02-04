import React, { useMemo, useState, useEffect } from 'react';
import { Lease, User, LeaseStatus } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';

interface AdminAiLeasesProps {
  leases: Lease[];
  onViewLease: (lease: Lease) => void;
  onBack: () => void;
  initialFilter?: string;
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
    case LeaseStatus.ABSTRACTED:
      specificClasses = "bg-green-100 text-green-800";
      icon = <span className="-ml-1 mr-1.5 text-green-600">✅</span>;
      break;
    case LeaseStatus.FAILED:
      specificClasses = "bg-red-100 text-red-800";
      icon = <ExclamationTriangleIcon className="-ml-1 mr-1.5 h-4 w-4 text-red-500" />;
      break;
    default:
        specificClasses = "bg-gray-100 text-gray-800";
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      {icon}
      {status}
    </span>
  );
};

export const AdminAiLeases: React.FC<AdminAiLeasesProps> = ({ leases, onViewLease, onBack, initialFilter = 'All' }) => {
    const [filterStatus, setFilterStatus] = useState(initialFilter);

    useEffect(() => {
        setFilterStatus(initialFilter);
    }, [initialFilter]);

    type ClientLeaseGroup = { user: User | undefined; leases: Lease[] };

    const aiProcessedLeasesByClient = useMemo(() => {
        const aiLeases = leases.filter(l => {
            const isAiMode = l.processingMode === 'ai';
            const matchesFilter = filterStatus === 'All' || l.status === filterStatus;
            return isAiMode && matchesFilter;
        });

        return aiLeases.reduce((acc, lease) => {
            const clientKey = lease.user?.email || 'unknown@example.com';
            if (!acc[clientKey]) {
                acc[clientKey] = { user: lease.user, leases: [] };
            }
            acc[clientKey].leases.push(lease);
            return acc;
        }, {} as Record<string, ClientLeaseGroup>);
    }, [leases, filterStatus]);

    const clientGroups = Object.values(aiProcessedLeasesByClient).sort((a: ClientLeaseGroup, b: ClientLeaseGroup) => (a.user?.username || '').localeCompare(b.user?.username || ''));

    return (
        <ScrollAnimatedSection className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-text-main mt-2">AI-Processed Leases Activity</h2>
                    <p className="mt-1 text-text-light">A complete log of leases submitted through the AI-only pipeline, grouped by client.</p>
                </div>
                <div className="w-48">
                    <label htmlFor="status-filter" className="block text-xs font-semibold text-text-light mb-1 uppercase tracking-wider">Filter Status</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-sm border border-border focus:outline-none focus:ring-primary focus:border-primary rounded-lg bg-surface shadow-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value={LeaseStatus.PROCESSING}>Processing</option>
                        <option value={LeaseStatus.ABSTRACTED}>Abstracted</option>
                        <option value={LeaseStatus.FAILED}>Failed</option>
                    </select>
                </div>
            </div>
            
            {clientGroups.length > 0 ? clientGroups.map(({ user, leases: clientLeases }) => (
                <div key={user?.email || 'unknown'} className="bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-lg">
                    <div className="flex items-center mb-4 pb-4 border-b border-border">
                        <UserCircleIcon className="w-8 h-8 text-text-light mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-text-main">{user?.username || 'Unknown User'}</h3>
                            <p className="text-sm text-text-light">{user?.email || 'No email provided'}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-surface">
                                <tr>
                                    {['Lease Name', 'Upload Date & Time', 'Status', 'Actions'].map(header => (
                                        <th key={header} scope="col" className="py-3 pr-4 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {clientLeases.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()).map(lease => (
                                    <tr key={lease.id} className="hover:bg-surface-muted transition-colors duration-150">
                                        <td className="py-4 pr-4 whitespace-nowrap text-sm font-medium text-text-main">{lease.name}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap text-sm text-text-light">{lease.uploadDate.toLocaleString()}</td>
                                        <td className="py-4 pr-4 whitespace-nowrap text-sm">
                                            <StatusBadge status={lease.status} />
                                        </td>
                                        <td className="py-4 pr-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => onViewLease(lease)}
                                                disabled={lease.status !== LeaseStatus.ABSTRACTED}
                                                className="flex items-center text-primary hover:text-primary-focus disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 group"
                                            >
                                                <EyeIcon className="h-5 w-5 mr-1" />
                                                <span>View Report</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )) : (
                <div className="text-center py-16 bg-surface border border-dashed border-border rounded-2xl">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-text-main">No leases found</h3>
                    <p className="mt-2 text-text-light">There are no AI-processed leases matching the current filter.</p>
                </div>
            )}
        </ScrollAnimatedSection>
    );
};