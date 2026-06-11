
import React, { useMemo, useEffect, useState } from 'react';
import { Lease, LeaseStatus, ReviewStatus, User, Role, WorkflowStage } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { BriefcaseIcon } from '@/shared/ui/Icons/BriefcaseIcon';
import { HandRaisedIcon } from '@/shared/ui/Icons/HandRaisedIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { InformationCircleIcon } from '@/shared/ui/Icons/InformationCircleIcon';
import { DateRangeFilter } from '@/shared/ui/Controls/DateRangeFilter';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';

interface AdminReviewQueueProps {
  leases: Lease[];
  reviewers: User[];
  onStartReview: (lease: Lease) => void;
  onAssignLease: (lease: Lease, reviewer: User, role?: 'R1' | 'R2') => void;
  currentUser: User | null;
  notification?: { type: 'success' | 'error'; message: string } | null;
  onClearNotification?: () => void;
}

const ReviewStatusBadge: React.FC<{ status?: ReviewStatus; reviewer?: User; workflowStage?: WorkflowStage }> = ({ status, reviewer, workflowStage }) => {
  const baseClasses = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
  let specificClasses = "";
  let text: string;

  if (workflowStage === 'R1_COMPLETED') {
      specificClasses = "bg-green-100 text-green-800";
      text = "Ready for R2";
  } else if (workflowStage === 'ESCALATED') {
      specificClasses = "bg-red-100 text-red-800";
      text = "Escalated";
  } else {
      switch (status) {
        case ReviewStatus.PENDING:
          specificClasses = "bg-yellow-100 text-yellow-800";
          text = status;
          break;
        case ReviewStatus.IN_PROGRESS:
          specificClasses = "bg-blue-100 text-blue-800";
          text = `In Progress ${reviewer ? `(${reviewer.username.split(' ')[0]})` : ''}`;
          break;
        case ReviewStatus.COMPLETED:
          specificClasses = "bg-green-100 text-green-800";
          text = status;
          break;
        default:
          specificClasses = "bg-gray-100 text-gray-800";
          text = "Unknown";
      }
  }

  return <span title={reviewer ? `Assigned to ${reviewer.username}` : ''} className={`${baseClasses} ${specificClasses}`}>{text}</span>;
};

const TimeDisplay: React.FC<{ seconds?: number; label: string }> = ({ seconds, label }) => {
    if (seconds === undefined || seconds === 0) return null;
    const format = (s: number) => { 
        const m = Math.floor(s / 60); 
        const sec = s % 60; 
        return `${m}m ${sec}s`;
    };
    return (
        <div className="flex flex-col items-start min-w-[70px]">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{label}</span>
            <span className="text-[11px] font-mono text-slate-600 font-bold">{format(seconds)}</span>
        </div>
    );
};

const TimeInQueue: React.FC<{ date: Date, label?: string }> = ({ date, label }) => {
    const diff = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60); 
    let colorClass = "text-slate-500 bg-slate-100 border-slate-200";
    let animate = false;
    
    if (diff > 48) {
        colorClass = "text-red-700 bg-red-50 border-red-200 font-bold";
        animate = true;
    }
    else if (diff > 24) colorClass = "text-amber-700 bg-amber-50 border-amber-200 font-medium";

    return (
        <div className="flex flex-col items-start">
            {label && <span className="text-[10px] text-text-light uppercase tracking-wide mb-0.5">{label}</span>}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${colorClass} ${animate ? 'animate-pulse' : ''}`}>
                <ClockIcon className="w-3 h-3" />
                {Math.floor(diff)}h ago
            </span>
        </div>
    );
};

export const AdminReviewQueue: React.FC<AdminReviewQueueProps> = ({ leases, reviewers, onStartReview, onAssignLease, currentUser, notification, onClearNotification }) => {
  const [assigningLeaseId, setAssigningLeaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'R1' | 'R2' | 'ESCALATED'>('R1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('priority');
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (notification && onClearNotification) {
      timer = setTimeout(() => {
        onClearNotification();
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notification, onClearNotification]);
  
  const leasesForQueue = useMemo(() => {
    return leases.filter(l => {
      if (activeTab === 'R1') {
          return !l.isEscalated && (l.processingMode === 'human') && (l.workflowStage === 'R1_PENDING' || l.workflowStage === 'R1_ASSIGNED' || l.workflowStage === 'R1_IN_PROGRESS');
      } else if (activeTab === 'R2') {
          return !l.isEscalated && l.status !== LeaseStatus.ABSTRACTED && l.status !== LeaseStatus.FAILED;
      } else {
          // Escalations Tab
          return l.isEscalated === true;
      }
    }).filter(lease => {
        if (!startDate && !endDate) return true;
        const leaseDate = new Date(lease.uploadDate);
        leaseDate.setHours(0,0,0,0);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && leaseDate < start) return false;
        if (end && leaseDate > end) return false;
        return true;
    }).sort((a,b) => {
        if (sortBy === 'priority') {
            if (a.isEscalated && !b.isEscalated) return -1;
            if (!a.isEscalated && b.isEscalated) return 1;
            return a.uploadDate.getTime() - b.uploadDate.getTime();
        } else if (sortBy === 'newest') {
            return b.uploadDate.getTime() - a.uploadDate.getTime();
        } else {
            return a.uploadDate.getTime() - b.uploadDate.getTime();
        }
    });
  }, [leases, startDate, endDate, sortBy, activeTab]);
  
  const groupedByClient = useMemo(() => {
    return leasesForQueue.reduce<Record<string, { user: User | undefined, leases: Lease[] }>>((acc, lease) => {
        const clientKey = lease.user?.email || 'unknown@example.com';
        if (!acc[clientKey]) acc[clientKey] = { user: lease.user, leases: [] };
        acc[clientKey].leases.push(lease);
        return acc;
    }, {});
  }, [leasesForQueue]);

  const clientGroups = Object.values(groupedByClient);
  const eligibleReviewers = reviewers;

  return (
    <ScrollAnimatedSection tag="div" className="space-y-8 max-w-[95rem] mx-auto px-4">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
              <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                  Review Queue
                  <span className="bg-secondary text-white text-sm px-2.5 py-0.5 rounded-full">{leasesForQueue.length}</span>
              </h2>
              <p className="text-sm text-text-light mt-1">Manage assignments and monitor review progress.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface border border-border text-text-main text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
              >
                  <option value="priority">Priority (Oldest First)</option>
                  <option value="newest">Newest Uploads</option>
                  <option value="oldest">Oldest Uploads</option>
              </select>
              
              <DateRangeFilter 
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onClear={() => { setStartDate(''); setEndDate(''); }}
                />
          </div>
       </div>

       <div className="flex border-b border-border mb-6">
           <button 
             onClick={() => setActiveTab('R1')}
             className={`px-8 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'R1' ? 'border-primary text-primary bg-sky-50/50' : 'border-transparent text-text-light hover:text-text-main'}`}
           >
               <span className={`w-2 h-2 rounded-full ${activeTab === 'R1' ? 'bg-primary animate-pulse' : 'bg-slate-300'}`}></span>
               First Pass (Reviewer 1)
           </button>
           <button 
             onClick={() => setActiveTab('R2')}
             className={`px-8 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'R2' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-text-light hover:text-text-main'}`}
           >
               <span className={`w-2 h-2 rounded-full ${activeTab === 'R2' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></span>
               Second Pass (Reviewer 2)
           </button>
           <button 
             onClick={() => setActiveTab('ESCALATED')}
             className={`px-8 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ESCALATED' ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-text-light hover:text-text-main'}`}
           >
               <span className={`w-2 h-2 rounded-full ${activeTab === 'ESCALATED' ? 'bg-red-600 animate-pulse' : 'bg-slate-300'}`}></span>
               Escalations
           </button>
       </div>

      {notification && (
        <div className="p-4 mb-4 rounded-lg border bg-green-50 border-green-200 text-green-800 animate-fade-in shadow-sm flex items-center gap-3">
            <CheckBadgeIcon className="h-6 w-6 text-green-600" />
            <div className="flex-1 font-medium">{notification.message}</div>
            {onClearNotification && (
                <button onClick={onClearNotification} className="text-green-600 hover:text-green-800">
                    <XCircleIcon className="h-5 w-5" />
                </button>
            )}
        </div>
      )}
      
      {clientGroups.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-text-main">No leases in this queue</h3>
            <p className="mt-2 text-text-light">Assignments for this queue will appear here.</p>
        </div>
      ) : clientGroups.map(({ user, leases: clientLeases }) => (
        <div key={user?.email || 'unknown'} className="bg-white p-6 rounded-2xl border border-border shadow-lg mb-6">
          <div className="flex items-center mb-6 pb-4 border-b border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-4 shadow-md font-bold text-lg ${activeTab === 'R1' ? 'bg-indigo-600' : activeTab === 'R2' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main">{user?.username || 'Unknown User'}</h3>
              <p className="text-sm text-text-light">{user?.email || 'No email provided'}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 rounded-lg">
                <tr>
                  {['Lease Name', 'Timeline', 'Efficiency', 'System ID', 'Status', 'Actions'].map(header => (
                    <th key={header} scope="col" className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clientLeases.map(lease => {
                  const currentReviewer = activeTab === 'ESCALATED' ? lease.reviewerR2 : (activeTab === 'R1' ? lease.reviewer : lease.reviewerR2);
                  const isAssigned = !!currentReviewer;
                  
                  const isWaitingForR1 = activeTab === 'R2' && lease.reviewStatus !== ReviewStatus.COMPLETED;
                  
                  return (
                    <tr key={lease.id} className={`${lease.isEscalated ? 'bg-red-50/30' : ''} transition-colors duration-150`}>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-text-main">
                          <div className="flex flex-col gap-1">
                              <span className="font-bold text-base">{lease.name}</span>
                              {lease.isEscalated && (
                                  <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                                      <ExclamationCircleIcon className="w-3.5 h-3.5" />
                                      ESCALATED
                                  </div>
                              )}
                          </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm">
                          <TimeInQueue date={activeTab !== 'R1' && lease.assignedDateR2 ? lease.assignedDateR2 : (lease.assignedDate || lease.uploadDate)} />
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                              <TimeDisplay label="R1 Dur" seconds={lease.timeSpentR1} />
                              <TimeDisplay label="R2 Dur" seconds={lease.timeSpentR2} />
                          </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-mono text-text-light">
                          {lease.id}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm">
                        {isWaitingForR1 ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                Queued (R1 In-Progress)
                            </span>
                        ) : (
                            <ReviewStatusBadge 
                              status={activeTab === 'R1' ? lease.reviewStatus : lease.reviewStatusR2} 
                              reviewer={currentReviewer}
                              workflowStage={lease.workflowStage}
                            />
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-2 min-w-[160px]">
                           {assigningLeaseId === lease.id ? (
                               <div className="flex items-center gap-2 animate-fade-in bg-white p-1 rounded-lg border border-primary shadow-sm">
                                  <select 
                                      className="text-xs border-none rounded px-2 py-1 bg-transparent focus:ring-0 w-40 font-medium"
                                      onChange={(e) => {
                                          const reviewer = eligibleReviewers.find(r => r.email === e.target.value);
                                          if (reviewer) onAssignLease(lease, reviewer, activeTab === 'R1' ? 'R1' : 'R2');
                                          setAssigningLeaseId(null);
                                      }}
                                      defaultValue=""
                                      autoFocus
                                      onBlur={() => setAssigningLeaseId(null)}
                                  >
                                      <option value="" disabled>Select Reviewer</option>
                                      {eligibleReviewers.map(r => (
                                          <option key={r.email} value={r.email}>{r.username}</option>
                                      ))}
                                  </select>
                                  <button onClick={() => setAssigningLeaseId(null)} className="text-gray-400 p-1"><XCircleIcon className="w-4 h-4" /></button>
                               </div>
                           ) : (
                              <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                      <button
                                          onClick={() => setAssigningLeaseId(lease.id)}
                                          className={`flex-1 inline-flex items-center justify-center text-[11px] font-bold transition-all px-3 py-2 rounded-lg shadow-sm border ${
                                              isAssigned 
                                                ? 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                                                : activeTab === 'R1' 
                                                    ? 'text-primary bg-sky-50 border-sky-200 hover:bg-primary hover:text-white' 
                                                    : activeTab === 'R2' 
                                                        ? 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-600 hover:text-white'
                                                        : 'text-red-700 bg-red-50 border-red-200 hover:bg-red-600 hover:text-white'
                                          }`}
                                      >
                                          <HandRaisedIcon className="h-3.5 w-3.5 mr-1" />
                                          {isAssigned ? 'Reassign' : activeTab === 'ESCALATED' ? 'Assign Expert' : `Assign ${activeTab === 'R2' ? 'R2' : 'Reviewer'}`}
                                      </button>
                                      
                                      {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) && (
                                          <button
                                            onClick={() => currentUser && onAssignLease(lease, currentUser, activeTab === 'R1' ? 'R1' : 'R2')}
                                            className="inline-flex items-center justify-center text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            title="Assign to Me"
                                          >
                                            Take
                                          </button>
                                      )}
                                  </div>
                                  
                                  {isAssigned && currentReviewer?.email === currentUser?.email && (
                                      <button
                                          onClick={() => onStartReview(lease)}
                                          className="inline-flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-r from-secondary to-indigo-700 px-4 py-2 rounded-lg shadow-md hover:shadow-indigo-500/20"
                                      >
                                          <BriefcaseIcon className="h-3.5 w-3.5 mr-1" />
                                          Open Workbench
                                      </button>
                                  )}
                              </div>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </ScrollAnimatedSection>
  );
};
