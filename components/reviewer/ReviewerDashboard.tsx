
import React, { useState, useMemo } from 'react';
import { Lease, ReviewStatus, User, LeaseStatus, Role, WorkflowStage } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';
import { DateRangeFilter } from '../DateRangeFilter';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';

interface ReviewerDashboardProps {
  leases: Lease[];
  currentUser: User;
  onOpenWorkbench: (lease: Lease) => void;
  onNavigateToActivity: (filter: string) => void;
}

const WidgetCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    subtext: string; 
    onClick?: () => void; 
    colorClass: string;
}> = ({ title, value, icon, subtext, onClick, colorClass }) => {
    return (
        <button 
            onClick={onClick}
            className={`bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')} bg-opacity-20`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${colorClass}` })}
                </div>
                <span className={`text-4xl font-extrabold ${colorClass}`}>{value}</span>
            </div>
            <div>
                <h4 className="font-bold text-text-main text-sm uppercase tracking-wide">{title}</h4>
                <p className="text-xs text-text-light mt-1">{subtext}</p>
            </div>
        </button>
    );
};

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ leases, currentUser, onOpenWorkbench, onNavigateToActivity }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const assignedLeases = leases.filter(l => 
    (l.reviewer?.email === currentUser.email || l.reviewerR2?.email === currentUser.email) && 
    l.processingMode === 'human'
  );
  
  const r1Pending = assignedLeases.filter(l => l.reviewer?.email === currentUser.email && l.reviewStatus !== ReviewStatus.COMPLETED).length;
  const r2Pending = assignedLeases.filter(l => l.reviewerR2?.email === currentUser.email && l.reviewStatusR2 !== ReviewStatus.COMPLETED).length;
  
  const completedLeases = assignedLeases.filter(l => 
    (l.reviewer?.email === currentUser.email && l.reviewStatus === ReviewStatus.COMPLETED) ||
    (l.reviewerR2?.email === currentUser.email && l.reviewStatusR2 === ReviewStatus.COMPLETED)
  );

  const activeAssignments = useMemo(() => {
      return assignedLeases.filter(l => {
          const isR1AndPending = l.reviewer?.email === currentUser.email && l.reviewStatus !== ReviewStatus.COMPLETED;
          const isR2AndPending = l.reviewerR2?.email === currentUser.email && l.reviewStatusR2 !== ReviewStatus.COMPLETED;
          return isR1AndPending || isR2AndPending;
      }).sort((a, b) => {
          if (a.isEscalated && !b.isEscalated) return -1;
          if (!a.isEscalated && b.isEscalated) return 1;
          return a.uploadDate.getTime() - b.uploadDate.getTime();
      });
  }, [assignedLeases, currentUser.email]);

  return (
    <ScrollAnimatedSection className="space-y-8 max-w-[95rem] mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
                    <BriefcaseIcon className="w-8 h-8 text-secondary" />
                    Reviewer Desk
                </h2>
                <p className="text-text-light mt-1">Overview of your workload and performance.</p>
            </div>
             <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} onClear={() => { setStartDate(''); setEndDate(''); }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WidgetCard title="Task R1 Queue" value={r1Pending} icon={<DocumentTextIcon />} subtext="First pass required" colorClass="text-green-600" onClick={() => onNavigateToActivity('InProgress')} />
            <WidgetCard title="Task R2 Queue" value={r2Pending} icon={<DocumentTextIcon />} subtext="Final verification required" colorClass="text-blue-600" onClick={() => onNavigateToActivity('InProgress')} />
            <WidgetCard title="Escalated" value={assignedLeases.filter(l => l.isEscalated).length} icon={<ExclamationCircleIcon />} subtext="Requires attention" colorClass="text-red-600" onClick={() => onNavigateToActivity('Escalated')} />
             <WidgetCard title="Total Completed" value={completedLeases.length} icon={<CheckBadgeIcon />} subtext="Submitted in both passes" colorClass="text-slate-600" onClick={() => onNavigateToActivity('Completed')} />
        </div>

        <div className="grid grid-cols-1 gap-8 mt-8">
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                    Active Tasks
                    <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">{activeAssignments.length}</span>
                </h3>

                {activeAssignments.length === 0 ? (
                    <div className="bg-surface p-16 rounded-xl border border-dashed border-border text-center">
                        <CheckBadgeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-text-main">Queue Empty</h4>
                        <p className="text-text-light">You are all caught up for now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {activeAssignments.map((lease) => {
                            const isR2 = lease.reviewerR2?.email === currentUser.email;
                            return (
                                <div key={lease.id} className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-lg transition-all flex flex-col justify-between relative ${isR2 ? 'border-blue-300 bg-blue-50/10' : 'border-green-200 bg-green-50/5'}`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold text-text-main truncate pr-4">{lease.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${isR2 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                {isR2 ? 'Second Pass' : 'First Pass'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <p className="text-xs text-text-light font-mono truncate">{lease.id}</p>
                                            <div className="h-3 w-px bg-slate-200"></div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {isR2 ? `R1 Time: ${Math.floor((lease.timeSpentR1 || 0)/60)}m` : `R1 Time: ${Math.floor((lease.timeSpentR1 || 0)/60)}m`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-center">
                                        <div className="text-xs text-text-light flex items-center gap-1">
                                            <ClockIcon className="w-3.5 h-3.5" />
                                            {isR2 ? `R2 Assigned: ${lease.assignedDateR2?.toLocaleDateString()}` : `R1 Assigned: ${lease.assignedDate?.toLocaleDateString()}`}
                                        </div>
                                        <button 
                                            onClick={() => onOpenWorkbench(lease)}
                                            className={`px-5 py-2 text-white rounded-lg font-bold shadow-sm transition-transform active:scale-95 text-sm ${isR2 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-primary-focus'}`}
                                        >
                                            {isR2 ? 'Final Pass' : 'Start R1 Review'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </ScrollAnimatedSection>
  );
};
