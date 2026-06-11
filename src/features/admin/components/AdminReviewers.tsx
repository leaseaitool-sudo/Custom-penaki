import React, { useState, useMemo } from 'react';
import { User, Role, Lease, ReviewStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { TrashIcon } from '@/shared/ui/Icons/TrashIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';
import { BriefcaseIcon } from '@/shared/ui/Icons/BriefcaseIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { ChartBarIcon } from '@/shared/ui/Icons/ChartBarIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { ChevronRightIcon } from '@/shared/ui/Icons/ChevronRightIcon';
import { PencilIcon } from '@/shared/ui/Icons/PencilIcon';
import { ShieldCheckIcon } from '@/shared/ui/Icons/ShieldCheckIcon';
import { createManagedUser, deleteManagedUser, updateManagedUserProfile } from '@/features/admin/api/userManagementService';

interface AdminReviewersProps {
    reviewers: User[];
    allLeases: Lease[];
    onAddReviewer: (user: User) => void;
    onDeleteReviewer: (email: string) => void;
    onUpdateReviewerSettings?: (email: string, updates: Partial<User>) => void;
}

const ReviewerAnalyticsPanel: React.FC<{
    reviewer: User,
    leases: Lease[],
    onClose: () => void,
    onUpdate: (updates: Partial<User>) => void
}> = ({ reviewer, leases, onClose, onUpdate }) => {
    const reviewerLeases = useMemo(() => {
        return leases.filter(l => (l.reviewer?.email === reviewer.email || l.previousReviewer?.email === reviewer.email) && l.processingMode === 'human');
    }, [leases, reviewer.email]);

    const completed = reviewerLeases.filter(l => l.reviewStatus === ReviewStatus.COMPLETED).length;
    const inProgress = reviewerLeases.filter(l => l.reviewStatus === ReviewStatus.IN_PROGRESS).length;
    const escalated = reviewerLeases.filter(l => l.isEscalated || l.wasEscalated).length;

    const goalPercent = Math.min(((completed / (reviewer.dailyGoal || 1)) * 100), 100);

    return (
        <div className="bg-white border-2 border-primary/10 rounded-3xl p-8 shadow-xl mt-2 mb-6 animate-slide-up mx-4">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-xl text-text-main tracking-tight uppercase">
                        Performance Center: {reviewer.username}
                    </h4>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full">
                    <XCircleIcon className="w-7 h-7" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Pipeline Health</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Active Queue</span>
                            <span className="text-lg font-extrabold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">{inProgress}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Lifetime Verified</span>
                            <span className="text-lg font-extrabold text-green-600 bg-green-50 px-3 py-0.5 rounded-full border border-green-100">{completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">Conflict Flagging</span>
                            <span className="text-lg font-extrabold text-red-600 bg-red-50 px-3 py-0.5 rounded-full border border-red-100">{escalated}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Quota Tuning</p>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-tighter mb-1.5 ml-1">Verified Target</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={reviewer.dailyGoal || 0}
                                    onChange={(e) => onUpdate({ dailyGoal: parseInt(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-extrabold text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Units</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-tighter mb-1.5 ml-1">Hard Intake Cap</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={reviewer.dailyCapacity || 0}
                                    onChange={(e) => onUpdate({ dailyCapacity: parseInt(e.target.value) })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-extrabold text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Max</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner flex flex-col justify-center">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Cycle Progression</p>
                    <div className="text-center">
                        <div className="flex justify-center items-baseline gap-2 mb-3">
                            <span className="text-5xl font-black text-indigo-600 tracking-tighter">{completed}</span>
                            <span className="text-sm font-bold text-slate-400">/ {reviewer.dailyGoal || 0}</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner p-0.5">
                            <div className="bg-gradient-to-r from-indigo-500 to-primary h-full rounded-full transition-all duration-1000" style={{ width: `${goalPercent}%` }}></div>
                        </div>
                        <p className="text-[10px] font-extrabold text-indigo-400 mt-3 uppercase tracking-tighter">{Math.round(goalPercent)}% Throughput Efficiency</p>
                    </div>
                </div>
            </div>

            <div>
                <h5 className="text-[10px] font-extrabold text-text-main mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">Recent Execution Stream</h5>
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Lease Reference</th>
                                <th className="px-6 py-3 text-left text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-3 text-left text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Last Commited</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reviewerLeases.slice(0, 5).map(l => (
                                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 font-bold text-text-main text-xs">{l.name}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${l.reviewStatus === ReviewStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {l.reviewStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-xs text-slate-500 font-medium">{l.lastSaved?.toLocaleDateString() || l.uploadDate.toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {reviewerLeases.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">No production data available for this cycle.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export const AdminReviewers: React.FC<AdminReviewersProps> = ({
    reviewers,
    allLeases,
    onAddReviewer,
    onDeleteReviewer,
    onUpdateReviewerSettings
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newReviewerName, setNewReviewerName] = useState('');
    const [newReviewerEmail, setNewReviewerEmail] = useState('');
    const [newReviewerPassword, setNewReviewerPassword] = useState('');
    const [error, setError] = useState('');
    const [expandedReviewerEmail, setExpandedReviewerEmail] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

    /**
     * FIXED: Now calls the manage-users Edge Function to delete from Supabase Auth.
     * Previously called onDeleteReviewer directly with just an email, which only removed
     * the reviewer from local state — they could still log in with their credentials.
     */
    const handleDeleteReviewer = async (reviewer: User) => {
        if (!window.confirm(`Decommission reviewer account: ${reviewer.username}? All active jobs will be unassigned.`)) return;
        setDeletingEmail(reviewer.email);
        try {
            const result = await deleteManagedUser(reviewer.id);
            if (!result.success) {
                alert(`Failed to delete reviewer: ${result.error}`);
                return;
            }
            // Success: notify parent to remove from list
            onDeleteReviewer(reviewer.email);
        } catch (err: any) {
            alert(`Error deleting reviewer: ${err.message}`);
        } finally {
            setDeletingEmail(null);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReviewerName.trim() || !newReviewerEmail.trim() || !newReviewerPassword.trim()) {
            setError('Missing required registration parameters.'); return;
        }
        if (reviewers.some(r => r.email.toLowerCase() === newReviewerEmail.toLowerCase())) {
            setError('Reference collision: Email already exists in local roster.'); return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Call the manage-users Edge Function to create a real Supabase Auth account
            const result = await createManagedUser({
                email: newReviewerEmail.trim(),
                password: newReviewerPassword,
                username: newReviewerName.trim(),
                role: 'reviewer',
            });

            if (!result.success || !result.appUser) {
                setError(result.error || 'Failed to create reviewer account.');
                return;
            }

            // Notify parent to refresh reviewer list with the real persisted user
            onAddReviewer(result.appUser);
            setNewReviewerName('');
            setNewReviewerEmail('');
            setNewReviewerPassword('');
            setIsAdding(false);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Unexpected error creating reviewer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateLoad = (email: string) => {
        return allLeases.filter(l => l.reviewer?.email === email && l.processingMode === 'human' && l.reviewStatus !== ReviewStatus.COMPLETED).length;
    };


    return (
        <ScrollAnimatedSection className="space-y-10 max-w-[95rem] mx-auto px-4 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-10">
                <div>
                    <h2 className="text-4xl font-black text-text-main flex items-center gap-4 tracking-tighter uppercase">
                        <BriefcaseIcon className="w-12 h-12 text-primary" />
                        Reviewer Control Center
                    </h2>
                    <p className="mt-2 text-lg text-text-light font-semibold tracking-tight">System workforce orchestration and throughput management.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 font-extrabold uppercase tracking-wider text-sm ${isAdding ? 'bg-slate-200 text-slate-700' : 'bg-primary text-white hover:bg-primary-focus hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95'}`}
                >
                    {isAdding ? <XCircleIcon className="w-6 h-6" /> : <PlusCircleIcon className="w-6 h-6" />}
                    {isAdding ? 'Cancel' : 'Deploy New Reviewer'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-2xl animate-slide-up max-w-5xl mx-auto ring-8 ring-primary/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <UserCircleIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-text-main uppercase tracking-tight">Reviewer Registration</h3>
                            <p className="text-sm font-medium text-slate-500">Provision a new verified expert account.</p>
                        </div>
                    </div>

                    {error && <div className="mb-8 text-xs font-bold text-red-600 bg-red-50 p-5 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        {error}
                    </div>}

                    <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Full Legal Name</label>
                            <input
                                type="text" value={newReviewerName} onChange={e => setNewReviewerName(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-700 shadow-sm"
                                placeholder="e.g. Marcus Vane"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Secure ID (Email)</label>
                            <input
                                type="email" value={newReviewerEmail} onChange={e => setNewReviewerEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-700 shadow-sm"
                                placeholder="marcus@penaki.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-2">Access Key (Password)</label>
                            <div className="relative">
                                <input
                                    type="password" value={newReviewerPassword} onChange={e => setNewReviewerPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-slate-700 shadow-sm pr-12"
                                    placeholder="••••••••"
                                />
                                <LockClosedIcon className="w-5 h-5 text-slate-300 absolute right-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div className="md:col-span-3 pt-6 flex justify-end gap-4 border-t border-slate-100">
                            <button type="submit" className="px-10 py-4 bg-primary text-white rounded-2xl hover:bg-primary-focus transition-all shadow-xl font-black uppercase tracking-widest text-xs hover:shadow-primary/40 transform active:scale-95">Complete Deployment</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-border shadow-md hover:shadow-lg transition-all group">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">Total Force</h4>
                    <p className="text-4xl font-black text-text-main tracking-tighter">{reviewers.length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-border shadow-md hover:shadow-lg transition-all group">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-green-500 transition-colors">Nodes Active</h4>
                    <p className="text-4xl font-black text-green-600 tracking-tighter">{reviewers.length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-border shadow-md hover:shadow-lg transition-all group">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">System Workload</h4>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">{allLeases.filter(l => l.reviewStatus === ReviewStatus.IN_PROGRESS).length}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-border shadow-md hover:shadow-lg transition-all group">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Average Health</h4>
                    <p className="text-4xl font-black text-indigo-600 tracking-tighter">94%</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-extrabold text-text-main uppercase tracking-tight flex items-center gap-3">
                        Node Roster
                        <span className="text-xs font-bold text-slate-400 tracking-normal">(Real-time status monitoring)</span>
                    </h3>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                        <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Load Balancing Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {reviewers.map(reviewer => {
                        const activeLoad = calculateLoad(reviewer.email);
                        const isExpanded = expandedReviewerEmail === reviewer.email;
                        return (
                            <div key={reviewer.email} className="animate-fade-in">
                                <div
                                    onClick={() => setExpandedReviewerEmail(isExpanded ? null : reviewer.email)}
                                    className={`bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden group shadow-sm hover:shadow-xl ${isExpanded ? 'ring-4 ring-primary/20 border-primary scale-[1.01]' : 'border-border'}`}
                                >
                                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                                        <div className="flex items-center gap-5 min-w-[280px]">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary/5 transition-colors">
                                                    {reviewer.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white bg-slate-300`}></div>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-text-main truncate text-xl tracking-tight">{reviewer.username}</h4>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{reviewer.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-wrap gap-12 justify-center md:justify-start">
                                            <div className="text-center md:text-left">
                                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Network Node</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-slate-300 w-2 h-2 rounded-full"></span>
                                                    <span className="text-xs text-slate-500">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Pressure</span>
                                                <span className={`text-xs font-black uppercase ${activeLoad > 8 ? 'text-red-600' : activeLoad > 4 ? 'text-orange-500' : 'text-text-main'}`}>
                                                    {activeLoad} / {reviewer.dailyCapacity} Leases
                                                </span>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Daily Quota</span>
                                                <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                                    {reviewer.dailyGoal} Target
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedReviewerEmail(isExpanded ? null : reviewer.email); }}
                                                className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all border border-slate-100 hover:shadow-md" title="Settings"
                                            >
                                                {isExpanded ? <XCircleIcon className="w-6 h-6" /> : <PencilIcon className="w-6 h-6" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteReviewer(reviewer); }}
                                                disabled={deletingEmail === reviewer.email}
                                                className="p-3 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all border border-red-50 hover:shadow-md disabled:opacity-50" title="Decommission"
                                            >
                                                <TrashIcon className="w-6 h-6" />
                                            </button>
                                            <div className={`p-1 transition-transform duration-500 ${isExpanded ? 'rotate-90 text-primary' : 'text-slate-200 group-hover:translate-x-1 group-hover:text-slate-400'}`}>
                                                <ChevronRightIcon className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && <ReviewerAnalyticsPanel reviewer={reviewer} leases={allLeases} onClose={() => setExpandedReviewerEmail(null)} onUpdate={(updates) => onUpdateReviewerSettings?.(reviewer.email, updates)} />}
                            </div>
                        );
                    })}

                    {reviewers.length === 0 && (
                        <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-100 shadow-inner">
                                <UsersIcon className="w-12 h-12 text-slate-300" />
                            </div>
                            <h4 className="text-2xl font-black text-text-main uppercase tracking-tighter">No Active Reviewer Nodes</h4>
                            <p className="text-slate-400 mt-3 max-w-sm mx-auto font-medium">Provision workforce accounts to begin verified human-in-the-loop abstraction.</p>
                            <button onClick={() => setIsAdding(true)} className="mt-8 font-black text-primary hover:underline uppercase tracking-widest text-sm">Initialize first node &rarr;</button>
                        </div>
                    )}
                </div>
            </div>
        </ScrollAnimatedSection>
    );
};

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
);

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
);
