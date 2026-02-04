
import React, { useMemo, useState } from 'react';
import { Lease, LeaseStatus } from '../types';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { BellIcon } from './icons/BellIcon';
import { CurrencyEuroIcon } from './icons/CurrencyEuroIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';

interface RemindersPageProps {
  leases: Lease[];
  onViewLease: (lease: Lease) => void;
  onMarkAsPaid: (leaseId: string, eventId: string) => void;
}

interface RentEvent {
    id: string;
    leaseId: string;
    leaseName: string;
    tenant: string;
    amount: number;
    dueDate: Date;
    status: 'urgent' | 'today' | 'upcoming' | 'past';
    period: string;
    isPaid: boolean;
}

const parseCurrency = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const RemindersPage: React.FC<RemindersPageProps> = ({ leases, onViewLease, onMarkAsPaid }) => {
    const [viewMode, setViewMode] = useState<'active' | 'logs'>('active');

    const reminders = useMemo(() => {
        const events: RentEvent[] = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData).forEach(lease => {
            let amount = 0;
            let tenant = 'Unknown Tenant';
            let dueDay = 1; 
            
            lease.abstractedData.forEach(section => {
                const sTitle = section.title.toLowerCase();
                
                if (sTitle.includes('tenant')) {
                    const nameField = section.fields.find(f => f.label.toLowerCase().includes('name'));
                    if (nameField && nameField.value) tenant = nameField.value;
                }

                if (sTitle.includes('rent') || sTitle.includes('payment')) {
                    section.fields.forEach(field => {
                        const label = field.label.toLowerCase();
                        if ((label.includes('monthly') || label.includes('amount')) && field.value) {
                            const val = parseCurrency(field.value);
                            if (val > amount) amount = val;
                        }
                    });
                }
            });

            if (amount > 0) {
                const generateEvent = (date: Date): RentEvent => {
                    const diffTime = date.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let status: RentEvent['status'] = 'upcoming';
                    if (diffDays < 0) status = 'past';
                    else if (diffDays === 0) status = 'today';
                    else if (diffDays <= 5) status = 'urgent';
                    
                    const eventId = `${lease.id}-${date.getMonth()}-${date.getFullYear()}`;
                    const isPaid = (lease.paidRentEvents || []).includes(eventId);

                    return {
                        id: eventId,
                        leaseId: lease.id,
                        leaseName: lease.name,
                        tenant,
                        amount,
                        dueDate: date,
                        status,
                        period: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
                        isPaid: isPaid
                    };
                };

                // Previous Month (For Logs)
                events.push(generateEvent(new Date(today.getFullYear(), today.getMonth() - 1, dueDay)));
                // Current Month
                events.push(generateEvent(new Date(today.getFullYear(), today.getMonth(), dueDay)));
                // Next Month
                events.push(generateEvent(new Date(today.getFullYear(), today.getMonth() + 1, dueDay)));
            }
        });

        return events.sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());
    }, [leases]);

    const activeReminders = reminders.filter(r => (r.status === 'urgent' || r.status === 'today' || r.status === 'upcoming') && !r.isPaid);
    const urgentReminders = activeReminders.filter(r => r.status === 'urgent' || r.status === 'today');
    const upcomingReminders = activeReminders.filter(r => r.status === 'upcoming');
    const logs = reminders.filter(r => r.status === 'past' || r.isPaid).sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime());

    const totalDueActive = activeReminders.reduce((acc, r) => acc + r.amount, 0);
    const totalDueUrgent = urgentReminders.reduce((acc, r) => acc + r.amount, 0);

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 pb-20 space-y-8">
            {/* Header Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
                        <BellIcon className="w-8 h-8 text-primary" />
                        Collection Center
                    </h1>
                    <p className="text-text-light mt-1 font-medium">Rent roll dues and payment tracking.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-right min-w-[160px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required</p>
                        <p className="text-2xl font-black text-rose-500">{formatCurrency(totalDueUrgent)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-border shadow-sm text-right min-w-[160px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pipeline</p>
                        <p className="text-2xl font-black text-text-main">{formatCurrency(totalDueActive)}</p>
                    </div>
                </div>
            </div>

            {/* Toggle */}
            <div className="flex gap-4 border-b border-border">
                <button 
                    onClick={() => setViewMode('active')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${viewMode === 'active' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}
                >
                    Active Reminders <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{activeReminders.length}</span>
                </button>
                <button 
                    onClick={() => setViewMode('logs')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${viewMode === 'logs' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}
                >
                    Payment Logs
                </button>
            </div>

            {viewMode === 'active' && (
                <div className="space-y-10 animate-fade-in">
                    
                    {/* Urgent Lane */}
                    <div>
                        <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ExclamationCircleIcon className="w-5 h-5" /> Due Today & Upcoming (5 Days)
                        </h3>
                        {urgentReminders.length === 0 ? (
                            <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center text-slate-400">
                                <CheckBadgeIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>All clear. No urgent collections pending.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {urgentReminders.map(item => (
                                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-l-rose-500 border-y border-r border-slate-100 relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <CurrencyEuroIcon className="w-32 h-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'today' ? 'bg-rose-500 text-white animate-pulse' : 'bg-orange-100 text-orange-700'}`}>
                                                    {item.status === 'today' ? 'Due Today' : `Due in ${Math.ceil((item.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} Days`}
                                                </span>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Amount Due</p>
                                                    <p className="text-2xl font-black text-slate-800">{formatCurrency(item.amount)}</p>
                                                </div>
                                            </div>
                                            
                                            <h4 className="text-lg font-bold text-text-main truncate mb-1">{item.tenant}</h4>
                                            <p className="text-sm text-text-light flex items-center gap-1 mb-6">
                                                <BuildingOfficeIcon className="w-4 h-4" />
                                                {item.leaseName}
                                                <span className="text-xs text-slate-400 font-mono ml-1">({item.leaseId})</span>
                                            </p>

                                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                                <button 
                                                    onClick={() => onMarkAsPaid(item.leaseId, item.id)}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:from-emerald-400 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckBadgeIcon className="w-4 h-4" /> Mark Paid
                                                </button>
                                                <button 
                                                    onClick={() => onViewLease(leases.find(l => l.id === item.leaseId)!)}
                                                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    View Lease
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Lane */}
                    <div>
                        <h3 className="text-sm font-black text-sky-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" /> Upcoming Schedule
                        </h3>
                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lease</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {upcomingReminders.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No upcoming payments scheduled.</td></tr>
                                    ) : (
                                        upcomingReminders.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm font-medium text-slate-700">{item.dueDate.toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-text-main">{item.tenant}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                                                    {item.leaseName} <span className="text-xs text-slate-400 font-mono ml-1">({item.leaseId})</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-right text-slate-700">{formatCurrency(item.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button 
                                                        onClick={() => onMarkAsPaid(item.leaseId, item.id)}
                                                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 hover:border-emerald-200 transition-colors"
                                                    >
                                                        Record Payment
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'logs' && (
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-slide-up">
                    <div className="p-6 border-b border-border bg-slate-50">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-slate-400" /> Payment History Log
                        </h3>
                    </div>
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant / Lease</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {logs.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.isPaid ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckBadgeIcon className="w-3 h-3" /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                History
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.dueDate.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-700">{item.tenant}</div>
                                        <div className="text-xs text-slate-400">{item.leaseName} <span className="font-mono text-[10px]">({item.leaseId})</span></div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-slate-600">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No payment history recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </ScrollAnimatedSection>
    );
};
