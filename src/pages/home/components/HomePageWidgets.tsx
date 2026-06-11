import React, { useState, useEffect, useRef } from 'react';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';
import { DocumentArrowDownIcon } from '@/shared/ui/Icons/DocumentArrowDownIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { ArrowDownTrayIcon } from '@/shared/ui/Icons/ArrowDownTrayIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { User, Lease, LeaseStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';

const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-blob bg-sky-200 w-[40rem] h-[40rem] rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply opacity-40"></div>
        <div className="hero-blob bg-indigo-200 w-[40rem] h-[40rem] rounded-full top-1/4 right-0 translate-x-1/2 mix-blend-multiply opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="hero-blob bg-cyan-100 w-[30rem] h-[30rem] rounded-full bottom-0 left-1/4 mix-blend-multiply opacity-40" style={{ animationDelay: '4s' }}></div>
    </div>
);

const PerformanceMetricCard: React.FC<{
    value: React.ReactNode;
    label: string;
    subtext: string;
    delayClass?: string;
    icon?: React.ReactNode;
}> = ({ value, label, subtext, delayClass, icon }) => (
    <div className={`metric-card p-8 rounded-2xl flex flex-col justify-center animate-slide-up ${delayClass || ''} border border-border shadow-lg bg-white/70 hover:bg-white/90 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default`}>
        <div className="flex items-center justify-between mb-4">
            <div className="text-5xl font-extrabold metric-value-gradient tracking-tight">{value}</div>
            {icon && <div className="text-primary opacity-30 p-2 bg-sky-50 rounded-xl group-hover:opacity-100 transition-opacity">{icon}</div>}
        </div>
        <div className="font-bold text-lg text-text-main uppercase tracking-wide mb-1">{label}</div>
        <div className="text-sm text-text-light font-medium">{subtext}</div>
    </div>
);

const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:scale-105 hover:shadow-lg cursor-pointer">
        <div>
            <p className="text-xs font-bold text-text-light uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${color}` })}
        </div>
    </div>
);

const DashboardWidget: React.FC<{ user: User; leases: Lease[] }> = ({ user, leases }) => {
    const pending = leases.filter(l => l.status === LeaseStatus.PROCESSING || l.status === LeaseStatus.IN_REVIEW).length;
    const completed = leases.filter(l => l.status === LeaseStatus.ABSTRACTED).length;
    const failed = leases.filter(l => l.status === LeaseStatus.FAILED).length;

    return (
        <section className="relative z-10 max-w-7xl mx-auto -mt-8 mb-24 px-6">
            <div className="glass-panel p-8 rounded-[2rem] shadow-xl animate-fade-in border border-white/60 bg-white/80 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-main">Welcome back, {user.username.split(' ')[0]}</h2>
                        <p className="text-base text-text-light mt-1">Here's a summary of your lease abstraction activity.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Plan</p>
                        <span className="text-sm font-bold text-primary bg-sky-50 px-3 py-1 rounded-full inline-block mt-1 border border-sky-100 cursor-default hover:bg-sky-100 transition-colors">Professional</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Total Uploads" value={leases.length} color="text-indigo-600" icon={<DocumentTextIcon />} />
                    <StatCard title="Processing" value={pending} color="text-amber-500" icon={<SpinnerIcon className="animate-spin" />} />
                    <StatCard title="Completed" value={completed} color="text-emerald-600" icon={<CheckBadgeIcon />} />
                    <StatCard title="Action Required" value={failed} color="text-red-500" icon={<ExclamationTriangleIcon />} />
                </div>
            </div>
        </section>
    );
}

const AnimatedCounter: React.FC<{
    targetValue: number;
    duration?: number;
    decimals?: number;
    postfix?: string;
    prefix?: string;
    className?: string;
}> = ({ targetValue, duration = 2000, decimals = 0, postfix = '', prefix = '', className }) => {
    const [count, setCount] = useState(0);
    const [ref, isInView] = useScrollAnimation<HTMLSpanElement>();

    useEffect(() => {
        if (isInView) {
            let startTime: number | null = null;
            const animation = (currentTime: number) => {
                if (startTime === null) startTime = currentTime;
                const progress = currentTime - startTime;
                const currentNum = Math.min((progress / duration) * targetValue, targetValue);
                setCount(currentNum);
                if (progress < duration) {
                    requestAnimationFrame(animation);
                }
            };
            requestAnimationFrame(animation);
        }
    }, [isInView, targetValue, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}{count.toFixed(decimals)}{postfix}
        </span>
    );
};


export { BackgroundBlobs, PerformanceMetricCard, StatCard, DashboardWidget, AnimatedCounter };