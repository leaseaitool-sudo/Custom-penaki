
import React from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { PresentationChartLineIcon } from '@/shared/ui/Icons/PresentationChartLineIcon';
import { ChartBarIcon } from '@/shared/ui/Icons/ChartBarIcon';
import { ChartPieIcon } from '@/shared/ui/Icons/ChartPieIcon';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

// --- MOCK UI COMPONENTS ---

const MockPortfolioDashboard = () => (
    <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-2xl overflow-hidden relative font-sans text-left">
        {/* Fake Window Header */}
        <div className="bg-white border-b border-slate-200 p-3 flex gap-2 items-center">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="ml-4 flex-1 bg-slate-100 rounded-md h-6 text-[10px] flex items-center px-3 text-slate-400 font-medium">
                penaki.com/dashboard/portfolio
            </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 bg-slate-50/50">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                        Portfolio Intelligence
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Global view across 142 properties.</p>
                </div>
                <div className="hidden sm:block">
                    <span className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        FY 2024 Q3
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-colors">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BuildingOfficeIcon className="w-8 h-8 text-sky-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Leases</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">128</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 inline-block px-1.5 py-0.5 rounded border border-emerald-100">+4 this month</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CurrencyEuroIcon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Rent</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">$14.2M</p>
                    <p className="text-[10px] text-indigo-600 font-bold mt-1">Avg $32/sq ft</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <UsersIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupancy</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">94%</p>
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
                        <div className="bg-purple-500 h-1 rounded-full w-[94%]"></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <ChartPieIcon className="w-8 h-8 text-rose-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry Risk</p>
                    <p className="text-2xl font-black text-rose-500 mt-1">12</p>
                    <p className="text-[10px] text-rose-400 font-bold mt-1">In next 90 days</p>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-3 gap-4 h-40">
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-700 mb-4">Revenue Forecast (12 Mo)</h3>
                    <div className="flex-1 flex items-end gap-2">
                        {[40, 45, 42, 50, 55, 60, 58, 65, 70, 75, 80, 85].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm opacity-80" style={{height: `${h}%`}}></div>
                        ))}
                    </div>
                </div>
                <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center">
                    <h3 className="text-xs font-bold text-slate-700 mb-2 w-full text-left">Asset Type</h3>
                    <div className="relative w-24 h-24 rounded-full border-[6px] border-slate-100 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <path className="text-indigo-500" fill="none" strokeDasharray="60, 100" strokeWidth="3" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-sky-400" fill="none" strokeDasharray="30, 100" strokeWidth="3" stroke="currentColor" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-lg font-black text-slate-800">60%</span>
                            <span className="block text-[8px] text-slate-400 uppercase font-bold">Office</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockEntityDirectory = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden relative font-sans text-left">
        {/* Fake Window Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-2 items-center">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="ml-4 flex-1 bg-white rounded-md h-6 text-[10px] flex items-center px-3 text-slate-400 font-medium">
                penaki.com/directory/tenants
            </div>
        </div>

        <div className="p-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex gap-2">
                    <button className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm">Tenants</button>
                    <button className="px-4 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 text-xs font-bold transition-colors">Landlords</button>
                </div>
                <div className="flex gap-2 text-slate-400">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
                {[
                    { name: "Acme Corp Global", type: "Tech", leases: 12, vol: "$4.2M", status: "Active" },
                    { name: "Logistics Solutions Inc", type: "Industrial", leases: 8, vol: "$2.8M", status: "Active" },
                    { name: "Apex Retail Group", type: "Retail", leases: 5, vol: "$1.1M", status: "Review" },
                    { name: "Horizon Health", type: "Medical", leases: 3, vol: "$900k", status: "Active" },
                ].map((entity, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors cursor-default group flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-sky-500' : idx === 2 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                {entity.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">{entity.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium">{entity.type} • {entity.leases} Leases</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-mono font-bold text-slate-700">{entity.vol}</p>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${entity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {entity.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const SolutionAnalytics: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 bg-grid-pattern">
            {/* 1. Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-24 px-6 overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold uppercase tracking-wide mb-8 animate-fade-in">
                        <PresentationChartLineIcon className="w-5 h-5" />
                        Business Intelligence
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight animate-slide-up">
                        Lease Insights <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            & Analytics
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Don't just store documents. Unlock the strategic value hidden in your lease portfolio. 
                        Visualize occupancy costs, model revenue scenarios, and manage entity risk from a single dashboard.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={onBookDemo} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-500 transition-all hover:shadow-indigo-500/25 transform hover:-translate-y-1">
                            Book a Demo
                        </button>
                        <button onClick={() => {}} className="px-8 py-4 bg-transparent border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-white/5 transition-all hover:text-white">
                            View Sample Report
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Portfolio Visibility Section */}
            <ScrollAnimatedSection className="py-24 px-6 bg-white bg-grid-pattern">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-700"></div>
                                <div className="transform transition-transform duration-700 hover:rotate-y-2 hover:scale-[1.01]">
                                    <MockPortfolioDashboard />
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Total Portfolio Visibility</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Aggregate critical data points across hundreds of leases instantly. 
                                Our dashboards provide real-time visibility into occupancy costs, expirations, and revenue forecasts without the spreadsheet chaos.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Real-time revenue & expense forecasting',
                                    'Automated expiration & renewal tracking',
                                    'Occupancy cost benchmarking by region',
                                    'Visual exposure heatmaps'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                            <ArrowRightIcon className="w-3 h-3" />
                                        </div>
                                        <span className="font-medium text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 3. Entity Management Section */}
            <ScrollAnimatedSection className="py-24 px-6 bg-slate-50 bg-grid-pattern border-t border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 mb-6">Centralized Entity Directory</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Manage landlord and tenant relationships with clarity. 
                                Penaki automatically extracts and normalizes entity names, linking them to their respective leases to calculate total exposure and value per partner.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <UsersIcon className="w-8 h-8 text-purple-600 mb-3" />
                                    <h4 className="font-bold text-slate-900">Tenant Risk Profiles</h4>
                                    <p className="text-sm text-slate-500 mt-1">Monitor concentration risk by industry or specific tenant groups.</p>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <MapPinIcon className="w-8 h-8 text-sky-600 mb-3" />
                                    <h4 className="font-bold text-slate-900">Landlord Exposure</h4>
                                    <p className="text-sm text-slate-500 mt-1">Track total obligations and security deposits per landlord.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-4 bg-gradient-to-l from-sky-500 to-indigo-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-700"></div>
                            <div className="transform transition-transform duration-700 hover:-rotate-y-2 hover:scale-[1.01]">
                                <MockEntityDirectory />
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 4. Strategic Benefits Grid */}
            <ScrollAnimatedSection className="py-24 px-6 bg-white bg-grid-pattern">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900">From Data to Strategy</h2>
                        <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
                            Empower your real estate team with actionable insights that drive cost savings and portfolio optimization.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 mb-6 text-2xl font-bold border border-slate-100">
                                <PresentationChartLineIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Financial Modeling</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Export structured cash flow data directly into Excel or ERPs for robust financial modeling and budgeting cycles.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 mb-6 text-2xl font-bold border border-slate-100">
                                <CurrencyEuroIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Cost Auditing</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Instantly compare CAM, insurance, and tax caps across your portfolio to identify billing discrepancies and savings.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-rose-600 mb-6 text-2xl font-bold border border-slate-100">
                                <ChartPieIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Market Benchmarking</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Compare your lease terms against market standards. Identify outliers in rent, escalation rates, and security deposits.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* 5. Final CTA */}
            <ScrollAnimatedSection className="py-24 bg-slate-900 text-white text-center px-6">
                <h2 className="text-3xl sm:text-4xl font-black mb-8">Ready to optimize your portfolio?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={onBookDemo} className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-500 transition-all transform hover:-translate-y-1">
                        Book a Demo
                    </button>
                    <button onClick={() => onNavigate('abstract')} className="px-10 py-4 bg-transparent border border-slate-600 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all hover:text-white">
                        Try with One Lease
                    </button>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
