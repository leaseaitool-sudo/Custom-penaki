
import React, { useMemo, useState } from 'react';
import { Lease, LeaseStatus } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { TableCellsIcon } from '../icons/TableCellsIcon';
import { ChartPieIcon } from '../icons/ChartPieIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { MapPinIcon } from '../icons/MapPinIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { CurrencyEuroIcon } from '../icons/CurrencyEuroIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';

// --- ICONS ---
const TrendingUpIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;

interface PortfolioDashboardProps {
    leases: Lease[];
    onNavigate: (view: any) => void;
    onViewLease?: (lease: Lease) => void;
}

// --- UTILITIES ---

const parseCurrency = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

const parseArea = (val: string | null): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const formatCompact = (n: number) => Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(n);
const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

// --- CUSTOM CHART COMPONENTS ---

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; size?: number }> = ({ data, size = 160 }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativeAngle = 0;
    const center = size / 2;
    const radius = size / 2 - 10;
    const strokeWidth = 20;

    if (total === 0) {
        return (
            <div className="flex items-center justify-center text-slate-300 text-xs" style={{ width: size, height: size }}>
                No Data
            </div>
        );
    }

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((slice, i) => {
                const angle = (slice.value / total) * 360;
                const largeArc = angle > 180 ? 1 : 0;
                const x1 = center + radius * Math.cos((Math.PI * cumulativeAngle) / 180);
                const y1 = center + radius * Math.sin((Math.PI * cumulativeAngle) / 180);
                const x2 = center + radius * Math.cos((Math.PI * (cumulativeAngle + angle)) / 180);
                const y2 = center + radius * Math.sin((Math.PI * (cumulativeAngle + angle)) / 180);
                
                const pathData = total === slice.value 
                    ? `M ${center}, ${center} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
                    : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

                cumulativeAngle += angle;

                return (
                    <path
                        key={i}
                        d={pathData}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={strokeWidth}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <title>{slice.label}: {slice.value} ({Math.round(slice.value/total * 100)}%)</title>
                    </path>
                );
            })}
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-xl font-bold fill-slate-700">{total}</text>
        </svg>
    );
};

const BarChart: React.FC<{ data: { label: string; value: number }[]; color: string; height?: number }> = ({ data, color, height = 200 }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    
    // Sort logic to ensure years are in order
    const sortedData = [...data].sort((a,b) => {
        if (a.label === 'Past') return -1;
        if (b.label === 'Past') return 1;
        if (a.label === '10+ Yrs') return 1;
        if (b.label === '10+ Yrs') return -1;
        return a.label.localeCompare(b.label);
    });

    if (data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">No Expiration Data</div>;
    }

    return (
        <div className="flex items-end gap-2 w-full h-full pt-4">
            {sortedData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div 
                        className={`w-full max-w-[40px] rounded-t-md transition-all duration-1000 relative ${color} opacity-80 group-hover:opacity-100`}
                        style={{ height: `${(item.value / maxVal) * 80}%`, minHeight: '4px' }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold shadow-lg pointer-events-none">
                            {item.value} Leases
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-800"></div>
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-bold truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

// --- NEW INTERACTIVE REVENUE CHART ---
const InteractiveRevenueChart: React.FC<{ data: { label: string; value: number }[]; height?: number }> = ({ data, height = 200 }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1; // 10% buffer for visual space

    if (data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400 text-sm">Insufficient Data</div>;

    return (
        <div className="w-full h-full flex flex-col justify-end pt-8 pb-2 relative select-none">
            {/* Bars Container */}
            <div className="flex items-end justify-between gap-2 md:gap-4 h-full w-full">
                {data.map((item, idx) => {
                    const heightPercent = (item.value / maxVal) * 100;
                    return (
                        <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                <div className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap relative">
                                    {formatCurrency(item.value)}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800"></div>
                                </div>
                            </div>

                            {/* The Bar */}
                            <div 
                                className="w-full bg-[#6366f1] rounded-t-md transition-all duration-500 ease-out relative overflow-hidden group-hover:bg-[#4f46e5] shadow-sm hover:shadow-indigo-200"
                                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                            >
                                {/* Light sheen effect on top */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                            </div>

                            {/* Label */}
                            <div className="mt-3 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- DATA LOGIC ---

const usePortfolioAnalytics = (leases: Lease[]) => {
    return useMemo(() => {
        const abstracted = leases.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData);
        
        let totalRentMonthly = 0;
        let totalArea = 0;
        let activeCount = 0;
        let expiredCount = 0;
        let expiringSoonCount = 0;
        let leasesWithAmendments = 0;

        const leaseTypes: Record<string, number> = { Gross: 0, NNN: 0, Net: 0, MG: 0 };
        const usageStats: Record<string, number> = { Office: 0, Retail: 0, Industrial: 0, Residential: 0, Other: 0 };
        const expiryByYear: Record<string, number> = {};
        
        const today = new Date();
        // Generate last 12 months buckets for labels and values
        const revenueBuckets = Array.from({ length: 12 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
            return {
                date: d,
                label: d.toLocaleString('default', { month: 'short' }),
                value: 0
            };
        });
        
        abstracted.forEach(lease => {
            let monthlyRent = 0;
            let area = 0;
            let type = 'Gross';
            let usage = 'Other';
            let startDate: Date | null = null;
            let expiryDate: Date | null = null;

            // Extract Data
            lease.abstractedData.forEach(sec => {
                const sTitle = sec.title.toLowerCase();
                
                sec.fields.forEach(f => {
                    if (!f.value) return;
                    const label = f.label.toLowerCase();
                    const val = f.value;
                    const valLower = val.toLowerCase();

                    // Financials
                    if (label.includes('monthly rent') || (label.includes('amount') && sTitle.includes('rent'))) {
                        monthlyRent = Math.max(monthlyRent, parseCurrency(val));
                    }
                    // Area
                    if (label.includes('gross area') || label.includes('sq ft')) {
                        area = Math.max(area, parseArea(val));
                    }
                    // Lease Type
                    if (label.includes('type') && sTitle.includes('details')) {
                        if (valLower.includes('triple') || valLower.includes('nnn')) type = 'NNN';
                        else if (valLower.includes('modified')) type = 'MG';
                        else if (valLower.includes('net')) type = 'Net';
                    }
                    // Usage
                    if ((label.includes('use') || label.includes('type')) && (sTitle.includes('premises') || sTitle.includes('building'))) {
                        if (valLower.includes('office')) usage = 'Office';
                        else if (valLower.includes('retail') || valLower.includes('shop') || valLower.includes('restaurant')) usage = 'Retail';
                        else if (valLower.includes('warehouse') || valLower.includes('industrial') || valLower.includes('manufacturing')) usage = 'Industrial';
                        else if (valLower.includes('residential') || valLower.includes('apartment')) usage = 'Residential';
                    }
                    // Dates
                    if (label.includes('start') || label.includes('commencement')) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) startDate = d;
                    }
                    if (label.includes('end') || label.includes('expiry')) {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) expiryDate = d;
                    }
                });
            });

            // Amendments
            if (lease.amendments && lease.amendments.length > 0) {
                leasesWithAmendments++;
            }

            // Status & Counts
            if (expiryDate) {
                const year = expiryDate.getFullYear();
                // Group long-tail dates
                const yearLabel = year < today.getFullYear() ? 'Past' : year > today.getFullYear() + 10 ? '10+ Yrs' : year.toString();
                expiryByYear[yearLabel] = (expiryByYear[yearLabel] || 0) + 1;

                if (expiryDate < today) {
                    expiredCount++;
                } else {
                    activeCount++;
                    // Check for soon
                    const diffTime = expiryDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 90) expiringSoonCount++;

                    // Add to revenue projection if active
                    revenueBuckets.forEach(bucket => {
                        // Include rent if bucket date is within [today, expiryDate] AND (if startDate exists, bucket date >= startDate)
                        const bucketDate = bucket.date;
                        if (bucketDate <= expiryDate! && (!startDate || bucketDate >= startDate)) {
                            bucket.value += monthlyRent;
                        }
                    });
                }
            } else {
                // Assume active if no date found but abstracted
                activeCount++;
                // Add indefinite revenue
                revenueBuckets.forEach(bucket => {
                    bucket.value += monthlyRent;
                });
            }

            // Aggregates
            if (expiryDate && expiryDate >= today) {
                totalRentMonthly += monthlyRent;
            } else if (!expiryDate) {
                // Include in monthly rent if status is assumed active due to missing date
                totalRentMonthly += monthlyRent;
            }

            totalArea += area;
            leaseTypes[type] = (leaseTypes[type] || 0) + 1;
            usageStats[usage] = (usageStats[usage] || 0) + 1;
        });

        // Format charts data
        const usageData = Object.entries(usageStats)
            .filter(([_, val]) => val > 0)
            .map(([label, value], i) => ({
                label,
                value,
                color: ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#64748b'][i % 5]
            }));

        const typeData = Object.entries(leaseTypes)
            .filter(([_, val]) => val > 0)
            .map(([label, value], i) => ({
                label,
                value,
                color: ['#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'][i % 4]
            }));

        const expirationData = Object.entries(expiryByYear)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => a.label.localeCompare(b.label));

        const revenueProjectionData = revenueBuckets.map(b => ({ label: b.label, value: b.value }));

        return {
            kpis: {
                totalRentAnnual: totalRentMonthly * 12,
                totalArea,
                activeCount,
                expiredCount,
                expiringSoonCount,
                leasesWithAmendments,
                totalLeases: abstracted.length
            },
            charts: {
                usageData,
                typeData,
                expirationData,
                revenueProjection: revenueProjectionData
            },
            raw: abstracted
        };
    }, [leases]);
};

// --- KPI CARD ---
const KpiCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    subtext?: string; 
    accentColor: string;
    trend?: string;
}> = ({ title, value, icon, subtext, accentColor, trend }) => (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${accentColor}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-16 h-16' })}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg bg-opacity-10 ${accentColor.replace('text-', 'bg-')} ${accentColor}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                </div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
                {trend && <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{trend}</span>}
            </div>
            {subtext && <p className="text-xs text-slate-400 font-medium mt-1">{subtext}</p>}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ leases, onNavigate, onViewLease }) => {
    const analytics = usePortfolioAnalytics(leases);
    const [filter, setFilter] = useState('All');

    // Filter Logic
    const displayLeases = useMemo(() => {
        let data = analytics.raw;
        if (filter === 'Active') {
            // Simplified check matching the analytics logic roughly
            const today = new Date();
            data = data.filter(l => {
                const expVal = l.abstractedData.find(s => s.title.toLowerCase().includes('term'))?.fields.find(f => f.label.toLowerCase().includes('end'))?.value;
                return !expVal || new Date(expVal) >= today;
            });
        } else if (filter === 'Expired') {
            const today = new Date();
            data = data.filter(l => {
                const expVal = l.abstractedData.find(s => s.title.toLowerCase().includes('term'))?.fields.find(f => f.label.toLowerCase().includes('end'))?.value;
                return expVal && new Date(expVal) < today;
            });
        }
        return data;
    }, [analytics.raw, filter]);

    return (
        <ScrollAnimatedSection className="space-y-8 max-w-[95rem] mx-auto px-4 pb-24">
            
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-border pb-6 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                        Portfolio Intelligence
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                        Comprehensive analytics across <span className="font-bold text-slate-900">{analytics.kpis.totalLeases} properties</span>. Real-time financial and operational metrics.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => onNavigate('assets')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all">
                        <MapPinIcon className="w-4 h-4" /> Map View
                    </button>
                    <button onClick={() => onNavigate('history')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
                        <DocumentTextIcon className="w-4 h-4" /> Manage Data
                    </button>
                </div>
            </div>

            {/* 2. KPI CARDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard 
                    title="Active Leases" 
                    value={analytics.kpis.activeCount} 
                    subtext={`${analytics.kpis.expiredCount} Expired / Historical`}
                    icon={<CheckBadgeIcon />} 
                    accentColor="text-emerald-600"
                />
                <KpiCard 
                    title="Total Annual Rent" 
                    value={formatCompact(analytics.kpis.totalRentAnnual)} 
                    subtext="Base Rent + Recurring Charges"
                    icon={<CurrencyEuroIcon />} 
                    accentColor="text-indigo-600"
                    trend="+2.4%"
                />
                <KpiCard 
                    title="Portfolio Area" 
                    value={formatCompact(analytics.kpis.totalArea)} 
                    subtext="Square Feet (GLA)"
                    icon={<BuildingOfficeIcon />} 
                    accentColor="text-sky-600"
                />
                <KpiCard 
                    title="Modified Leases" 
                    value={analytics.kpis.leasesWithAmendments} 
                    subtext="Contain active amendments"
                    icon={<DocumentPlusIcon />} 
                    accentColor="text-purple-600"
                />
            </div>

            {/* 3. CHARTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Usage Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest w-full text-left mb-6 flex items-center gap-2">
                        <ChartPieIcon className="w-5 h-5 text-indigo-500" /> Usage Mix
                    </h3>
                    <div className="flex items-center gap-8">
                        <DonutChart data={analytics.charts.usageData} />
                        <div className="space-y-3">
                            {analytics.charts.usageData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-xs font-medium text-slate-600">{d.label}</span>
                                    <span className="text-xs font-bold text-slate-800">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lease Expiration Profile */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest w-full text-left mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-rose-500" /> Expiration Schedule
                    </h3>
                    <div className="flex-1 w-full min-h-[200px]">
                        <BarChart data={analytics.charts.expirationData} color="bg-rose-500" height={220} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Financial Forecast */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUpIcon className="w-5 h-5 text-emerald-500" /> Revenue Forecast (12 Mo)
                        </h3>
                        <div className="flex gap-4 items-center">
                            <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#6366f1] rounded-full"></div>Base</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sky-400 rounded-full"></div>Recoveries</div>
                            </div>
                            <div className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                Total: {formatCurrency(analytics.charts.revenueProjection.reduce((a,b)=>a+b.value,0))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[220px]">
                        <InteractiveRevenueChart data={analytics.charts.revenueProjection} height={220} />
                    </div>
                </div>

                {/* Lease Structure */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest w-full text-left mb-6 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-sky-500" /> Contract Types
                    </h3>
                    <div className="space-y-4">
                        {analytics.charts.typeData.map((d, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                                    <span>{d.label}</span>
                                    <span>{d.value}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(d.value / analytics.kpis.totalLeases) * 100}%`, backgroundColor: d.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. DETAILED ASSET TABLE */}
            <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TableCellsIcon className="w-5 h-5 text-slate-500" />
                            Asset Register
                        </h3>
                    </div>
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button onClick={() => setFilter('All')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'All' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                        <button onClick={() => setFilter('Active')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}>Active Only</button>
                        <button onClick={() => setFilter('Expired')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'Expired' ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:text-slate-700'}`}>Expired</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Asset Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Expiration</th>
                                <th className="px-6 py-4 text-right text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Current Monthly Rent</th>
                                <th className="px-6 py-4 text-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {displayLeases.map(lease => {
                                let rent = 0;
                                let type = 'Standard';
                                let expiry = 'N/A';
                                let expiryDateObj: Date | null = null;
                                
                                lease.abstractedData.forEach(s => s.fields.forEach(f => {
                                    if(f.label.toLowerCase().includes('monthly rent') && f.value) rent = parseCurrency(f.value);
                                    if(f.label.toLowerCase().includes('use') && f.value) type = f.value;
                                    if((f.label.toLowerCase().includes('end') || f.label.toLowerCase().includes('expiry')) && f.value) {
                                        expiryDateObj = new Date(f.value);
                                        expiry = expiryDateObj.toLocaleDateString();
                                    }
                                }));

                                const isExpired = expiryDateObj && expiryDateObj < new Date();
                                const isExpiringSoon = expiryDateObj && !isExpired && (expiryDateObj.getTime() - new Date().getTime()) < (90 * 24 * 60 * 60 * 1000); // 90 days

                                const statusLabel = isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active';
                                const statusClass = isExpired ? 'bg-red-50 text-red-600 border-red-100' : isExpiringSoon ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-600 border-green-100';

                                // Rent logic: Only show for active leases
                                const displayRent = !isExpired ? formatCurrency(rent) : '-';

                                return (
                                    <tr key={lease.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onViewLease && onViewLease(lease)}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{lease.name}</div>
                                            <div className="text-xs text-slate-400 font-mono mt-0.5">{lease.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 truncate max-w-[150px]">
                                            {type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {expiry}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className={`text-sm font-mono font-bold ${!isExpired ? 'text-slate-800' : 'text-slate-300'}`}>{displayRent}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${statusClass}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-300 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                                                <ArrowRightIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {displayLeases.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>No assets found matching filters.</p>
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
