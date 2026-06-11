
import React, { useState, useEffect } from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { BellIcon } from '@/shared/ui/Icons/BellIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="hero-blob bg-sky-200 w-[40rem] h-[40rem] rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply opacity-40"></div>
        <div className="hero-blob bg-indigo-200 w-[40rem] h-[40rem] rounded-full top-1/4 right-0 translate-x-1/2 mix-blend-multiply opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="hero-blob bg-cyan-100 w-[30rem] h-[30rem] rounded-full bottom-0 left-1/4 mix-blend-multiply opacity-40" style={{ animationDelay: '4s' }}></div>
    </div>
);

// --- MOCK COMPONENTS ---

const MockRemindersDashboard = () => (
    <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative font-sans text-left transform transition-all hover:shadow-indigo-500/10 duration-700">
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BellIcon className="w-5 h-5 text-indigo-600" />
                Collection Center
            </h3>
            <div className="flex gap-2">
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded border border-rose-100">3 Urgent</span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">12 Active</span>
            </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50">
            {/* Urgent Column */}
            <div>
                <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-4 h-4" /> Action Required
                </h4>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border-l-4 border-l-rose-500 shadow-sm relative group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">Due Today</span>
                            <span className="text-sm font-black text-slate-800">$12,500</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">TechFlow Systems Inc.</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <BuildingOfficeIcon className="w-3 h-3" /> Unit 400 - Main St.
                        </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border-l-4 border-l-amber-500 shadow-sm relative group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Due in 2 Days</span>
                            <span className="text-sm font-black text-slate-800">$8,200</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">Apex Retail Group</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <BuildingOfficeIcon className="w-3 h-3" /> Suite 101 - Plaza
                        </p>
                    </div>
                </div>
            </div>

            {/* Upcoming Column */}
            <div>
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" /> Upcoming
                </h4>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Nov 01, 2024</span>
                            <span className="text-sm font-black text-slate-800">$15,000</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">Global Logistics Corp</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <BuildingOfficeIcon className="w-3 h-3" /> Warehouse B
                        </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Nov 01, 2024</span>
                            <span className="text-sm font-black text-slate-800">$22,100</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700">Horizon Health</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <BuildingOfficeIcon className="w-3 h-3" /> Medical Center
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockRentRoll = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 w-full max-w-lg mx-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform"></div>
        
        <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
                <h3 className="text-lg font-black text-slate-800">Rent Escalation</h3>
                <p className="text-xs text-slate-500">Automated step-ups for Lease #9921</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Value</p>
                <p className="text-xl font-black text-slate-900">$3.2M</p>
            </div>
        </div>

        <div className="space-y-4 relative z-10">
            {[
                { year: 'Year 1', date: '2024', amount: '$12,500', status: 'Current' },
                { year: 'Year 2', date: '2025', amount: '$12,875', status: '3% Increase' },
                { year: 'Year 3', date: '2026', amount: '$13,261', status: '3% Increase' },
                { year: 'Year 4', date: '2027', amount: '$13,659', status: '3% Increase' },
            ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${i === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'} transition-colors`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {row.year.split(' ')[1]}
                        </div>
                        <div>
                            <p className={`text-xs font-bold ${i === 0 ? 'text-emerald-900' : 'text-slate-700'}`}>{row.date}</p>
                            <p className="text-[10px] text-slate-400">Base Rent</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${i === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>{row.amount}</p>
                        <p className={`text-[9px] font-bold ${i === 0 ? 'text-emerald-600' : 'text-indigo-500'}`}>{row.status}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const MockNotification = () => (
    <div className="relative">
        {/* Background Blur */}
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 rounded-full"></div>
        
        {/* Notification Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-80 relative z-10 animate-float">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                        <ClockIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Critical Alert</span>
                </div>
                <span className="text-[10px] text-slate-400">2m ago</span>
            </div>
            
            <h4 className="font-bold text-slate-900 text-sm mb-1">Renewal Notice Window Open</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                The notification period for <strong>Highland Park Unit 102</strong> is now active (9-12 months prior).
            </p>
            
            <div className="flex gap-2">
                <button className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Draft Notice
                </button>
                <button className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors">
                    Dismiss
                </button>
            </div>
        </div>
        
        {/* Badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold z-20 animate-bounce">
            1
        </div>
    </div>
);

export const ProductCriticalEvents: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden bg-grid-pattern relative">
            <BackgroundBlobs />
            
            {/* Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-16 md:pb-20 px-6">
                
                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-indigo-100 text-indigo-600 text-sm font-bold uppercase tracking-wide mb-8 shadow-sm animate-fade-in">
                        <BellIcon className="w-5 h-5" />
                        Automated Critical Date Management
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        Never Miss a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500">
                            High-Stakes Deadline.
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Penaki turns static lease documents into a proactive, living calendar. 
                        Receive automated alerts for renewals, rent escalations, and compliance events well before they become liabilities.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={onBookDemo} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature 1: The Reminders Dashboard */}
            <ScrollAnimatedSection className="py-12 md:py-16 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-indigo-200 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                            <div className="transform transition-transform duration-700 hover:rotate-y-2">
                                <MockRemindersDashboard />
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                            <ExclamationCircleIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Proactive Risk Mitigation</h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Missing a renewal option notice can cost millions in leverage. Penaki calculates notification windows automatically based on your lease clauses (e.g., "9-12 months prior to expiration") and alerts your team.
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1 h-12 bg-indigo-200 rounded-full flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Smart Prioritization</h4>
                                    <p className="text-sm text-slate-500">Urgent items are flagged automatically based on financial impact.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1 h-12 bg-emerald-200 rounded-full flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Contextual Action</h4>
                                    <p className="text-sm text-slate-500">Links directly to the relevant lease clause for rapid decision making.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 2: Rent Roll Automation */}
            <ScrollAnimatedSection className="py-20 md:py-24 border-y border-slate-200 bg-white/60 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                            <CurrencyEuroIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Automated Rent Steps</h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Whether it's a fixed % increase, CPI adjustment, or hard-coded step-up, Penaki extracts the logic and projects your future obligations automatically.
                        </p>
                        <ul className="grid grid-cols-1 gap-3">
                            <li className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="font-bold text-slate-700 text-sm">Eliminate manual rent roll entry</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="font-bold text-slate-700 text-sm">Forecast cash flow 5+ years out</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="font-bold text-slate-700 text-sm">Audit landlord billing accuracy</span>
                            </li>
                        </ul>
                    </div>
                    <div className="relative flex justify-center">
                        <MockRentRoll />
                        {/* Floating Element */}
                        <div className="absolute -bottom-6 -right-2 md:-right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce" style={{animationDuration: '3s'}}>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Savings Found</p>
                            <p className="text-xl font-black text-emerald-600">+$12k/yr</p>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 3: Notifications */}
            <ScrollAnimatedSection className="py-20 md:py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live Updates
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black mb-6">Stay Alerted, Anywhere.</h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Critical alerts delivered directly in-app. Set reminders for your whole team or specific asset managers to ensure nothing slips through the cracks.
                        </p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <MockNotification />
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Final CTA */}
            <ScrollAnimatedSection className="py-24 text-center">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-8">Stop managing dates in spreadsheets.</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
                    <button onClick={onBookDemo} className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 transform">
                        Automate Your Calendar
                    </button>
                    <button onClick={() => onNavigate('abstract')} className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all">
                        Try Free Abstract
                    </button>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
