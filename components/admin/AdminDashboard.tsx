
import React from 'react';
import { Lease, ReviewStatus, View, User, LeaseStatus, Role, DemoBooking } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ClockIcon } from '../icons/ClockIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { PencilSquareIcon } from '../icons/PencilSquareIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';

interface AdminDashboardProps {
  leases: Lease[];
  users: User[];
  onNavigate: (view: View, filter?: string) => void;
  demoBookings: DemoBooking[];
}

const WidgetCard: React.FC<{ 
    title: string; 
    value: number | string; 
    icon: React.ReactNode; 
    subtext?: string; 
    onClick?: () => void; 
    accentColor?: string; // Tailwind class like 'text-blue-600'
}> = ({ title, value, icon, subtext, onClick, accentColor = "text-slate-700" }) => {
    
    // Extract base color name for bg opacity usage (simplified heuristic)
    const bgBase = accentColor.replace('text-', 'bg-').split('-')[0] + '-50';
    
    return (
        <button 
            onClick={onClick}
            className={`w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 text-left group h-full flex flex-col justify-between min-h-[170px] ${onClick ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'}`}
        >
            <div className="flex justify-between items-start w-full mb-4">
                <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-slate-500 text-xs uppercase tracking-widest">{title}</h4>
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight mt-1">{value}</span>
                </div>
                <div className={`p-3 rounded-xl ${bgBase} ${accentColor} bg-opacity-60 transition-transform group-hover:scale-110 shadow-sm border border-white`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6` })}
                </div>
            </div>
            {subtext && (
                <div className="border-t border-slate-100 pt-3 mt-auto w-full">
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')}`}></span>
                        {subtext}
                    </p>
                </div>
            )}
        </button>
    );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            {title}
        </h3>
        <div className="h-px bg-slate-200 flex-grow"></div>
    </div>
);

const ActivityItem: React.FC<{ lease: Lease }> = ({ lease }) => {
    let actionText = '';
    let timeAgo = '';
    
    // Simple time ago logic
    const diff = (new Date().getTime() - (lease.lastSaved || lease.uploadDate).getTime()) / 1000 / 60; // minutes
    if (diff < 60) timeAgo = `${Math.floor(diff)}m ago`;
    else if (diff < 1440) timeAgo = `${Math.floor(diff / 60)}h ago`;
    else timeAgo = `${Math.floor(diff / 1440)}d ago`;

    if (lease.status === LeaseStatus.ABSTRACTED) actionText = 'Abstraction completed';
    else if (lease.reviewStatus === ReviewStatus.IN_PROGRESS) actionText = 'Review started';
    else if (lease.status === LeaseStatus.PROCESSING) actionText = 'Processing AI';
    else actionText = 'Uploaded';

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all hover:border-slate-200 cursor-default">
            <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${lease.status === LeaseStatus.ABSTRACTED ? 'bg-green-500' : lease.isEscalated ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div>
                    <p className="text-sm font-bold text-slate-700">{lease.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{actionText} by <span className="text-slate-700">{lease.reviewer?.username || lease.user?.username || 'System'}</span></p>
                </div>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">{timeAgo}</span>
        </div>
    );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ leases, users, onNavigate, demoBookings }) => {
    // 1. General Stats
    const totalLeases = leases.length;
    const totalClients = users.filter(u => u.role !== Role.ADMIN).length;
    const totalAbstracted = leases.filter(l => l.status === LeaseStatus.ABSTRACTED).length;

    // 2. AI Pipeline Stats
    const aiInProcess = leases.filter(l => l.processingMode === 'ai' && l.status === LeaseStatus.PROCESSING).length;
    const aiDone = leases.filter(l => l.processingMode === 'ai' && l.status === LeaseStatus.ABSTRACTED).length;
    const aiFailed = leases.filter(l => l.processingMode === 'ai' && l.status === LeaseStatus.FAILED).length;

    // 3. Human Review Stats
    const pendingHumanReview = leases.filter(l => l.processingMode === 'human' && l.status !== LeaseStatus.AMENDMENT_REVIEW && l.reviewStatus === ReviewStatus.PENDING).length;
    const humanInReview = leases.filter(l => l.processingMode === 'human' && l.status !== LeaseStatus.AMENDMENT_REVIEW && l.reviewStatus === ReviewStatus.IN_PROGRESS).length;
    const humanReviewsDone = leases.filter(l => l.processingMode === 'human' && l.status !== LeaseStatus.AMENDMENT_REVIEW && l.reviewStatus === ReviewStatus.COMPLETED).length;

    // 4. Escalations
    const escalatedPending = leases.filter(l => l.isEscalated && l.reviewStatus === ReviewStatus.PENDING).length;
    const escalatedInReview = leases.filter(l => l.isEscalated && l.reviewStatus === ReviewStatus.IN_PROGRESS).length;
    const escalatedDone = leases.filter(l => !l.isEscalated && l.wasEscalated && l.reviewStatus === ReviewStatus.COMPLETED).length; 

    // 5. Amendments
    const amendmentPending = leases.filter(l => l.status === LeaseStatus.AMENDMENT_REVIEW && l.reviewStatus === ReviewStatus.PENDING).length;
    const amendmentInReview = leases.filter(l => l.status === LeaseStatus.AMENDMENT_REVIEW && l.reviewStatus === ReviewStatus.IN_PROGRESS).length;

    // 6. Demos
    const now = new Date();
    const demoRequests = demoBookings.filter(b => b.status === 'Pending').length;
    const demosScheduled = demoBookings.filter(b => b.status === 'Confirmed' && new Date(b.date) >= now).length;
    const demosCompleted = demoBookings.filter(b => b.status === 'Confirmed' && new Date(b.date) < now).length;

    // Recent Activity (Last 10 items)
    const recentActivity = [...leases].sort((a, b) => (b.lastSaved || b.uploadDate).getTime() - (a.lastSaved || a.uploadDate).getTime()).slice(0, 10);

    return (
        <ScrollAnimatedSection className="pb-16 max-w-[95rem] mx-auto px-4">
            <div className="mb-10 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h2>
                    <p className="mt-2 text-base text-slate-500 font-medium">System overview and operational controls.</p>
                </div>
                <div className="text-right hidden md:block">
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200 shadow-sm">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide">System Online</span>
                    </div>
                </div>
            </div>

            {/* 1. Platform Overview */}
            <SectionHeader title="Platform Overview" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="Total Leases" 
                    value={totalLeases} 
                    icon={<DocumentTextIcon />} 
                    accentColor="text-slate-600"
                    subtext="All uploaded documents"
                    onClick={() => onNavigate('admin-total-activity', 'All')} 
                />
                <WidgetCard 
                    title="Total Clients" 
                    value={totalClients} 
                    icon={<UsersIcon />} 
                    accentColor="text-indigo-600"
                    subtext="Registered users"
                    onClick={() => onNavigate('admin-clients')} 
                />
                <WidgetCard 
                    title="Total Abstracted" 
                    value={totalAbstracted} 
                    icon={<CheckBadgeIcon />} 
                    accentColor="text-emerald-600"
                    subtext="Successfully processed"
                    onClick={() => onNavigate('admin-total-activity', 'Abstracted')} 
                />
            </div>

            {/* 2. Bookings */}
            <SectionHeader title="Bookings & Demos" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="Pending Requests" 
                    value={demoRequests} 
                    icon={<CalendarIcon />} 
                    accentColor="text-amber-500"
                    subtext="Awaiting confirmation"
                    onClick={() => onNavigate('admin-bookings')} 
                />
                <WidgetCard 
                    title="Upcoming Demos" 
                    value={demosScheduled} 
                    icon={<ClockIcon />} 
                    accentColor="text-blue-600"
                    subtext="Scheduled on calendar"
                    onClick={() => onNavigate('admin-bookings')} 
                />
                <WidgetCard 
                    title="Completed Demos" 
                    value={demosCompleted} 
                    icon={<CheckBadgeIcon />} 
                    accentColor="text-slate-500"
                    subtext="Past demonstrations"
                    onClick={() => onNavigate('admin-bookings')} 
                />
            </div>

            {/* 3. Human Review */}
            <SectionHeader title="Human Review Queue" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="Pending Assignment" 
                    value={pendingHumanReview} 
                    icon={<ClockIcon />} 
                    accentColor="text-orange-500"
                    subtext="Waiting for reviewer"
                    onClick={() => onNavigate('admin-review-queue')} 
                />
                <WidgetCard 
                    title="In Progress" 
                    value={humanInReview} 
                    icon={<PencilSquareIcon />} 
                    accentColor="text-blue-600"
                    subtext="Currently being reviewed"
                    onClick={() => onNavigate('admin-review-queue')} 
                />
                <WidgetCard 
                    title="Reviews Completed" 
                    value={humanReviewsDone} 
                    icon={<CheckBadgeIcon />} 
                    accentColor="text-green-600"
                    subtext="Verified and sent"
                    onClick={() => onNavigate('admin-completed-reviews')} 
                />
            </div>

            {/* 4. AI Pipeline */}
            <SectionHeader title="AI Pipeline Status" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="Processing" 
                    value={aiInProcess} 
                    icon={<SpinnerIcon className="animate-spin" />} 
                    accentColor="text-purple-500"
                    subtext="Analyzing documents"
                    onClick={() => onNavigate('admin-ai-leases', 'Processing')} 
                />
                <WidgetCard 
                    title="AI Completed" 
                    value={aiDone} 
                    icon={<CheckBadgeIcon />} 
                    accentColor="text-sky-600"
                    subtext="Successfully extracted"
                    onClick={() => onNavigate('admin-ai-leases', 'Abstracted')} 
                />
                <WidgetCard 
                    title="Failed Jobs" 
                    value={aiFailed} 
                    icon={<XCircleIcon />} 
                    accentColor="text-red-500"
                    subtext="Requires retry/check"
                    onClick={() => onNavigate('admin-ai-leases', 'Failed')} 
                />
            </div>

            {/* 5. Escalations */}
            <SectionHeader title="Escalations" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="New Escalations" 
                    value={escalatedPending} 
                    icon={<ExclamationTriangleIcon />} 
                    accentColor="text-red-600"
                    subtext="Requires immediate attention"
                    onClick={() => onNavigate('admin-review-queue')} 
                />
                <WidgetCard 
                    title="Resolving" 
                    value={escalatedInReview} 
                    icon={<ExclamationCircleIcon />} 
                    accentColor="text-rose-500"
                    subtext="Under active review"
                    onClick={() => onNavigate('admin-review-queue')} 
                />
                <WidgetCard 
                    title="Resolved" 
                    value={escalatedDone} 
                    icon={<CheckBadgeIcon />} 
                    subtext="Escalations closed"
                    accentColor="text-green-600"
                    onClick={() => onNavigate('admin-completed-reviews')} 
                />
            </div>

            {/* 6. Amendments */}
            <SectionHeader title="Amendment Center" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <WidgetCard 
                    title="New Requests" 
                    value={amendmentPending} 
                    icon={<DocumentPlusIcon />} 
                    accentColor="text-purple-600"
                    subtext="Pending processing"
                    onClick={() => onNavigate('admin-amendments')} 
                />
                <WidgetCard 
                    title="Processing" 
                    value={amendmentInReview} 
                    icon={<SpinnerIcon className="animate-spin" />} 
                    accentColor="text-indigo-500"
                    subtext="Amendments in review"
                    onClick={() => onNavigate('admin-amendments')} 
                />
                {/* Placeholder for layout balance or future metric */}
                <div className="hidden md:block"></div> 
            </div>

            {/* Live System Feed - At the bottom */}
            <div className="mt-16">
                <SectionHeader title="Live System Feed" />
                <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-200 shadow-inner">
                    <div className="space-y-3">
                        {recentActivity.map(lease => (
                            <ActivityItem key={lease.id} lease={lease} />
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-center text-slate-400 py-8 italic">No recent activity logged.</p>
                        )}
                    </div>
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => onNavigate('admin-total-activity')} 
                            className="text-sm font-bold text-primary hover:text-primary-focus hover:underline transition-all"
                        >
                            View Full Activity Log &rarr;
                        </button>
                    </div>
                </div>
            </div>

        </ScrollAnimatedSection>
    );
};
