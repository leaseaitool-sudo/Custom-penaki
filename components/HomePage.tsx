
import React, { useState, useEffect, useRef } from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ClockIcon } from './icons/ClockIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { FAQSection } from './FAQSection';
import { User, Lease, LeaseStatus, DemoBooking, Availability } from '../types';
import '../styles/HomePage.css';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { ArrowLeftRightIcon } from './icons/ArrowLeftRightIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { CurrencyEuroIcon } from './icons/CurrencyEuroIcon';
import { TableCellsIcon } from './icons/TableCellsIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { DocumentArrowDownIcon } from './icons/DocumentArrowDownIcon';
import { CheckIcon } from './icons/CheckIcon';
import { InteractiveLeaseSlider } from './InteractiveLeaseSlider';
import { BookDemoModal } from './BookDemoModal';
import { EyeIcon } from './icons/EyeIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface HomePageProps {
  onGetStarted: () => void;
  user?: User | null;
  leases?: Lease[];
  onBookDemo: (booking: Omit<DemoBooking, 'id' | 'status' | 'createdAt'>) => void;
  availability?: Availability;
}

// -- Extraction Visualizer (Hero Widget) - REMOVED from display but kept in code if needed later --
const ExtractionVisualizer = () => {
    return (
        <div className="relative w-full max-w-2xl h-[480px] select-none perspective-1000">
            {/* Background Lease Doc */}
            <div className="absolute left-6 top-10 bottom-10 w-[280px] bg-white shadow-xl border border-slate-200/60 rounded-xl p-6 text-[10px] text-slate-400 leading-relaxed font-serif overflow-hidden transform rotate-y-6 transition-transform duration-700 hover:rotate-y-0 origin-left z-10">
                <div className="mb-4 font-bold text-slate-700 text-xs uppercase tracking-wider text-center">Option to Extend</div>
                <p>
                    <span className="bg-sky-100 text-sky-800 px-0.5 rounded font-semibold border border-sky-200">Renewal Period.</span> Tenant may, as its option extend the term for one (1) <span className="bg-sky-100 text-sky-800 px-0.5 rounded font-semibold border border-sky-200">renewal period of five (5) years</span> (the “Renewal Period”) by written notice to the Landlord (the “Renewal Notice”) given <span className="bg-sky-100 text-sky-800 px-0.5 rounded font-semibold border border-sky-200">no earlier than twelve (12) months</span> nor later than <span className="bg-sky-100 text-sky-800 px-0.5 rounded font-semibold border border-sky-200">nine (9) months</span> prior to the expiration of the initial Term.
                </p>
                <p className="mt-2">
                    The Base Rent payable during the Renewal Period shall be at the <span className="bg-sky-100 text-sky-800 px-0.5 rounded font-semibold border border-sky-200">Market Rental Rate</span> for the Premises.
                </p>
                {/* Decorative lines for rest of text */}
                <div className="space-y-2 mt-4 opacity-30">
                    <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-5/6 bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-4/5 bg-slate-200 rounded"></div>
                </div>
                
                {/* Connecting Dots (Anchors) */}
                <div className="absolute top-[52px] right-2 w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
                <div className="absolute top-[52px] right-2 w-2 h-2 bg-sky-500 rounded-full"></div>
            </div>

            {/* Floating Data Card */}
            <div className="absolute right-6 top-20 w-[280px] bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-indigo-100 rounded-2xl p-5 z-20 animate-float-slow">
                <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <CheckBadgeIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Renewal Option</h4>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">AI Verified</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs font-medium text-slate-500">Effective</span>
                        <span className="text-sm font-bold text-slate-700 font-mono text-right">11/01/2002 - <br/>01/21/2025</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs font-medium text-slate-500">Notice Period</span>
                        <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">9-12 months</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs font-medium text-slate-500">Renewal Term</span>
                        <span className="text-sm font-bold text-slate-700">5 years</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                        <span className="text-xs font-medium text-slate-500">Rate</span>
                        <span className="text-sm font-bold text-slate-700">Market Rate</span>
                    </div>
                </div>
            </div>

            {/* Connecting SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                <path 
                    d="M 260 95 C 320 95, 300 130, 360 130" 
                    fill="none" 
                    stroke="#0284C7" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                    className="opacity-40 animate-dash-flow"
                />
            </svg>
        </div>
    );
};

// -- Mockup Components for Product Tour --

const MockupWindow: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="w-full h-[350px] sm:h-[500px] lg:h-[640px] bg-slate-50 rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col transform transition-all duration-500 hover:shadow-primary/10 hover:border-primary/20">
        <div className="h-10 bg-white border-b border-border flex items-center px-4 gap-2 flex-shrink-0">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-[10px] text-slate-500 font-medium">
                    <LockClosedIcon className="w-3 h-3" />
                    app.penaki.com / {title.toLowerCase().replace(/\s+/g, '-')}
                </div>
            </div>
            <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-slate-50">
            {children}
        </div>
    </div>
);

const MockupUpload = () => (
    <div className="p-8 h-full flex items-center justify-center">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl border border-border shadow-lg space-y-6 hover:shadow-xl transition-shadow duration-300">
            <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-text-main">Abstract New Lease</h3>
                <p className="text-sm text-text-light">Upload your PDF documents to begin.</p>
            </div>
            
            <div className="border-2 border-dashed border-primary/40 bg-sky-50/50 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-sky-50 transition-colors">
                <DocumentArrowDownIcon className="w-12 h-12 text-primary mb-3" />
                <p className="text-sm font-medium text-text-main">Drag & Drop your lease PDF here</p>
                <p className="text-xs text-text-light mt-1">or click to browse</p>
            </div>

            <div className="bg-surface-muted p-4 rounded-lg border border-border flex items-center justify-between">
                <span className="text-sm font-medium text-text-main">Processing Mode</span>
                <div className="flex items-center bg-gray-200 rounded-full p-1 w-48 relative cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <div className="w-1/2 h-full absolute left-1/2 top-0 bottom-0 bg-white rounded-full shadow-sm m-0.5 transition-all"></div>
                    <span className="w-1/2 text-center text-[10px] font-bold text-slate-500 z-10 py-1">AI Only</span>
                    <span className="w-1/2 text-center text-[10px] font-bold text-primary z-10 py-1">Human Review</span>
                </div>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-bold shadow-md hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300">
                Continue
            </button>
        </div>
        
        {/* Floating Tooltip */}
        <div className="absolute top-1/2 right-12 translate-x-1/2 bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl animate-float hidden sm:block">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-slate-800 border-b-[6px] border-b-transparent"></div>
            Select "Human Review" for<br/>99% verified accuracy.
        </div>
    </div>
);

const MockupTemplates = () => (
    <div className="p-8 h-full flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-text-main">Select Base Template</h3>
            <p className="text-sm text-text-light">Start with a pre-configured standard for your region.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl overflow-y-auto max-h-[70vh] sm:max-h-none">
            <div className="bg-white p-6 rounded-xl border-2 border-primary shadow-lg relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform hover:shadow-primary/30">
                <div className="absolute top-3 right-3 text-primary"><CheckBadgeIcon className="w-6 h-6" /></div>
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <DocumentTextIcon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-text-main">US Standard</h4>
                <p className="text-xs text-text-light mt-2 leading-relaxed">
                    CAM, Opex, Insurance, & detailed Rent Steps.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-surface-muted text-[10px] rounded border border-border text-slate-500">Rent</span>
                    <span className="px-2 py-1 bg-surface-muted text-[10px] rounded border border-border text-slate-500">Opex</span>
                    <span className="px-2 py-1 bg-surface-muted text-[10px] rounded border border-border text-slate-500">Options</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border hover:border-slate-300 transition-all opacity-70 hover:opacity-100 cursor-pointer hover:scale-105 hover:shadow-lg">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <TableCellsIcon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-text-main">EU / UK Simplified</h4>
                <p className="text-xs text-text-light mt-2 leading-relaxed">
                    VAT considerations & simplified terms.
                </p>
            </div>
        </div>
        
        {/* Saved Templates Section Mock */}
        <div className="w-full max-w-2xl border-t border-border pt-6 hidden sm:block">
            <p className="text-xs font-bold text-text-light uppercase tracking-wider mb-4">Saved Templates</p>
            <div className="flex gap-4">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-border shadow-sm hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                    <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Retail - California</span>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-border shadow-sm hover:border-primary/50 hover:shadow-md cursor-pointer transition-all">
                    <DocumentTextIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Office - NY Metro</span>
                </div>
            </div>
        </div>
    </div>
);

const MockupFieldSelection = () => (
    <div className="p-6 h-full flex flex-col bg-surface-muted/30">
        <div className="flex-1 bg-white rounded-xl border border-border shadow-lg flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-bold text-text-main">Configure AI Extraction</h3>
                    <p className="text-xs text-text-light">Template: <span className="font-semibold text-primary">US Standard</span></p>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
                {/* Standard Sections */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standard Fields</h4>
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">Auto-Detected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Landlord Name', 'Tenant Name', 'Commencement Date', 'Base Rent', 'Security Deposit Amount', 'Renewal Option'].map((field, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-primary/30 text-primary text-xs font-semibold shadow-sm animate-fade-in hover:shadow-md hover:border-primary transition-all cursor-default" style={{animationDelay: `${i*0.1}s`}}>
                                <CheckIcon className="w-3 h-3 stroke-[3]" />
                                {field}
                            </div>
                        ))}
                        <div className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-400 text-xs font-medium border-dashed hover:border-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                            + 40 more
                        </div>
                    </div>
                </div>

                {/* Custom Fields Animation */}
                <div className="relative p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3 hover:bg-indigo-50 transition-colors">
                    <div className="absolute -top-3 -right-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                        <PlusCircleIcon className="w-4 h-4" /> Custom AI Fields
                    </h4>
                    
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex-1 bg-white h-8 rounded-lg border border-indigo-200 shadow-sm flex items-center px-3 text-xs text-text-main font-medium">
                                Pet Policy
                            </div>
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <PlusCircleIcon className="w-5 h-5" />
                            </div>
                        </div>
                        
                        <div className="flex gap-2 items-center animate-slide-up" style={{ animationDelay: '1.5s' }}>
                            <div className="flex-1 bg-white h-8 rounded-lg border border-indigo-200 shadow-sm flex items-center px-3 text-xs text-text-main font-medium">
                                HVAC Maintenance Cap
                            </div>
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                <PlusCircleIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-indigo-400 leading-tight pt-2">
                        Type any datapoint. Our AI model understands context and extracts it automatically.
                    </p>
                </div>
            </div>
            
            <div className="p-4 border-t border-border bg-slate-50 flex justify-end">
                <div className="px-4 py-2 bg-text-main text-white text-xs font-bold rounded-lg shadow-md cursor-pointer hover:bg-slate-800 transition-colors hover:shadow-lg transform hover:-translate-y-0.5 duration-200">
                    Apply Configuration
                </div>
            </div>
        </div>
    </div>
);

const MockupWorkbench = () => (
    <div className="flex h-full bg-surface-muted">
        {/* Sidebar */}
        <div className="w-12 sm:w-16 bg-white border-r border-border flex flex-col items-center py-4 gap-4 flex-shrink-0">
            {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${i === 2 ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                    {i === 1 ? <UserCircleIcon className="w-5 h-5"/> : 
                     i === 2 ? <CurrencyEuroIcon className="w-5 h-5"/> :
                     i === 3 ? <CalendarIcon className="w-5 h-5"/> :
                     <DocumentTextIcon className="w-5 h-5"/>}
                </div>
            ))}
        </div>

        {/* Data Panel */}
        <div className="w-full sm:w-80 bg-white border-r border-border flex flex-col shadow-xl z-10">
            <div className="p-4 border-b border-border bg-white">
                <h4 className="font-bold text-text-main flex items-center gap-2 text-sm sm:text-base">
                    <CurrencyEuroIcon className="w-5 h-5 text-primary" />
                    Base Rent
                </h4>
            </div>
            <div className="flex-1 overflow-hidden p-4 space-y-4">
                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 relative hover:bg-primary/10 transition-colors cursor-pointer">
                    <label className="text-[10px] font-bold text-primary uppercase">Monthly Amount</label>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-text-main">$12,500.00</span>
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 italic border-t border-primary/10 pt-2 hidden sm:block">
                        Source: Page 4, "...monthly base rent of $12,500.00 payable..."
                    </div>
                </div>
                
                <div className="p-3 rounded-lg border border-border bg-white opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                    <div className="h-4 w-24 bg-slate-100 rounded mt-1"></div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-white opacity-60 hover:opacity-100 transition-opacity">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Escalation</label>
                    <div className="h-4 w-full bg-slate-100 rounded mt-1"></div>
                </div>
            </div>
        </div>

        {/* Viewer Panel - Hidden on very small screens for mockup purpose */}
        <div className="flex-1 bg-slate-200 p-6 hidden md:flex justify-center overflow-hidden relative">
            <div className="w-full max-w-[500px] bg-white shadow-2xl h-[120%] -mt-10 px-8 py-10 text-[8px] text-slate-400 font-serif leading-loose relative hover:shadow-2xl transition-shadow">
                <p className="mb-4 text-center font-bold text-slate-600 text-xs">LEASE AGREEMENT - RENT SCHEDULE</p>
                <div className="space-y-3">
                    <p>4.1. <strong>Base Rent.</strong> Tenant shall pay to Landlord...</p>
                    <p>
                        Commencing on the Rent Commencement Date, Tenant shall pay Base Rent in the amount of 
                        <span className="bg-yellow-200/50 border-b-2 border-primary mx-1 px-1 text-slate-800 font-bold cursor-help" title="Source Match">Twelve Thousand Five Hundred Dollars ($12,500.00)</span> 
                        per month.
                    </p>
                    <p>4.2. <strong>Adjustments.</strong> On each anniversary of the...</p>
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                </div>
                
                {/* Floating Connection Line */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                    <path d="M -20 120 C -100 120, -150 150, -340 100" stroke="#0284C7" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-dash-flow" />
                    <circle cx="-20" cy="120" r="4" fill="#0284C7" />
                </svg>
            </div>
        </div>
    </div>
);

const MockupDashboard = () => (
    <div className="flex flex-col h-full bg-surface-muted">
        <div className="bg-white border-b border-border p-4 flex justify-between items-center">
            <h3 className="font-bold text-text-main">My Leases</h3>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1 hover:bg-primary-focus transition-colors shadow-primary/30 hover:shadow-lg">
                    <ArrowDownTrayIcon className="w-3 h-3" /> Export All
                </button>
            </div>
        </div>
        <div className="p-4">
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="grid grid-cols-12 bg-slate-50 border-b border-border py-2 px-4 text-xs font-bold text-slate-500 uppercase">
                    <div className="col-span-8 sm:col-span-5">Lease Name</div>
                    <div className="col-span-4 sm:col-span-3">Status</div>
                    <div className="hidden sm:block sm:col-span-2">Mode</div>
                    <div className="hidden sm:block sm:col-span-2 text-right">Action</div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50/50 transition-colors cursor-pointer group">
                        <div className="col-span-8 sm:col-span-5">
                            <p className="font-bold text-sm text-text-main group-hover:text-primary transition-colors truncate">Skyline Tower - Floor 12</p>
                            <p className="text-[10px] text-slate-400">ID: lease_8291</p>
                        </div>
                        <div className="col-span-4 sm:col-span-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                                <CheckIcon className="w-3 h-3" strokeWidth={4} /> Abstracted
                            </span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2">
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Human Review</span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2 text-right">
                            <button className="text-primary hover:text-primary-focus font-medium text-xs hover:underline">View</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50/50 transition-colors cursor-pointer">
                        <div className="col-span-8 sm:col-span-5">
                            <p className="font-bold text-sm text-text-main truncate">Tech Park Building A</p>
                            <p className="text-[10px] text-slate-400">ID: lease_8292</p>
                        </div>
                        <div className="col-span-4 sm:col-span-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                                <PencilSquareIcon className="w-3 h-3" /> In Review
                            </span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2">
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Human Review</span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2 text-right">
                            <button className="text-slate-400 cursor-not-allowed font-medium text-xs">Processing...</button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50/50 transition-colors opacity-60 hover:opacity-100">
                        <div className="col-span-8 sm:col-span-5">
                            <p className="font-bold text-sm text-text-main truncate">Warehouse 4B</p>
                            <p className="text-[10px] text-slate-400">ID: lease_8290</p>
                        </div>
                        <div className="col-span-4 sm:col-span-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">
                                <CheckIcon className="w-3 h-3" strokeWidth={4} /> Abstracted
                            </span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2">
                            <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">AI Only</span>
                        </div>
                        <div className="hidden sm:block sm:col-span-2 text-right">
                            <button className="text-primary font-medium text-xs">View</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockupExcel = () => (
    <div className="flex flex-col h-full bg-white">
        <div className="bg-[#1D6F42] h-10 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
                <TableCellsIcon className="w-5 h-5 text-white" />
                <span className="text-white text-xs font-bold">Lease_Abstract_Export.xlsx</span>
            </div>
            <div className="flex gap-1">
               <div className="w-3 h-3 rounded-full bg-white/20"></div>
               <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
        </div>
        <div className="bg-gray-100 border-b border-gray-300 h-6 flex items-center px-2 text-[10px] text-gray-500 gap-4">
            <span>File</span><span>Home</span><span>Insert</span><span>Data</span>
        </div>
        <div className="flex-1 overflow-auto relative">
            <div className="grid grid-cols-5 text-[10px] min-w-[400px]">
                {/* Headers */}
                <div className="bg-gray-200 border-r border-b border-gray-300 p-2 font-bold text-gray-700">Lease ID</div>
                <div className="bg-gray-200 border-r border-b border-gray-300 p-2 font-bold text-gray-700">Tenant</div>
                <div className="bg-gray-200 border-r border-b border-gray-300 p-2 font-bold text-gray-700">Monthly Rent</div>
                <div className="bg-gray-200 border-r border-b border-gray-300 p-2 font-bold text-gray-700">Start Date</div>
                <div className="bg-gray-200 border-b border-gray-300 p-2 font-bold text-gray-700">Escalation</div>

                {/* Row 1 */}
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">L-8291</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">Innovate Inc.</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">$12,500.00</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">01/01/2024</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">3% Annually</div>

                {/* Row 2 */}
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">L-8292</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">TechFlow Sys</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">$8,250.00</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">03/15/2024</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">CPI + 1%</div>

                {/* Row 3 */}
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">L-8290</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">Logistics Co.</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">$22,000.00</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">06/01/2023</div>
                <div className="border-r border-b border-gray-200 p-2 hover:bg-blue-50 cursor-cell transition-colors">Fixed Steps</div>
            </div>
            
            {/* Success Toast Overlay */}
            <div className="absolute bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                <span className="text-xs font-bold">Export Successful</span>
            </div>
        </div>
    </div>
);

const MockupEscalation = () => (
    <div className="relative h-full w-full bg-surface-muted flex items-center justify-center p-6">
        {/* Background blurred card to represent lease view */}
        <div className="absolute inset-0 bg-white opacity-50 blur-[2px]"></div>
        
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-border p-6 animate-slide-up hover:shadow-primary/20 transition-shadow">
            <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <ExclamationCircleIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-main">Flag for Review</h3>
                    <p className="text-xs text-text-light">Submit this section for expert human analysis.</p>
                </div>
            </div>
            
            <div className="space-y-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Context</p>
                    <p className="text-sm text-slate-800 font-medium truncate">Section 4.2 - Rent Adjustments</p>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Notes</label>
                    <div className="w-full h-20 bg-white border border-border rounded-lg p-2 text-sm text-slate-600 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                        The escalation clause mentions "Market Rate" but doesn't specify the index. Please verify.
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3">
                <button className="flex-1 py-2 bg-white border border-border rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 flex items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                    Submit Issue
                </button>
            </div>
        </div>
    </div>
);

// -- Product Tour Workflow --

const ProductTourWorkflow = () => {
    const [activeTab, setActiveTab] = useState(0);
    
    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab(prev => (prev + 1) % 7);
        }, 6000); 
        return () => clearInterval(timer);
    }, []);

    const steps = [
        {
            id: 0,
            title: 'AI-First Intake',
            desc: 'AI or Human-in-the-Loop.',
            mockup: <MockupUpload />
        },
        {
            id: 1,
            title: 'Context-Aware Config',
            desc: 'Region-specific templates.',
            mockup: <MockupTemplates />
        },
        {
            id: 2,
            title: 'Custom AI Fields',
            desc: 'Add custom fields on the fly.',
            mockup: <MockupFieldSelection />
        },
        {
            id: 3,
            title: 'Verified Workbench',
            desc: 'Side-by-side data & source.',
            mockup: <MockupWorkbench />
        },
        {
            id: 4,
            title: 'Portfolio Dashboard',
            desc: 'Track, filter, and analyze.',
            mockup: <MockupDashboard />
        },
        {
            id: 5,
            title: 'Expert Escalation',
            desc: 'Flag clauses for expert review.',
            mockup: <MockupEscalation />
        },
        {
            id: 6,
            title: 'Export & Integrate',
            desc: 'Excel reports for ERPs.',
            mockup: <MockupExcel />
        }
    ];

    return (
        <ScrollAnimatedSection className="py-16 sm:py-24 px-4 sm:px-6 max-w-[95rem] mx-auto">
            <div className="text-center mb-10 sm:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 hover:bg-indigo-100 transition-colors cursor-default">
                    <EyeIcon className="w-4 h-4" /> End-to-End Workflow
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-text-main mb-6">See AI In Action</h2>
                <p className="text-lg text-text-light max-w-2xl mx-auto">
                    From raw PDF to verified data in seven simple steps.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Navigation (Left) */}
                <div className="lg:col-span-4 flex flex-col gap-2 relative">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveTab(step.id)}
                            className={`text-left p-4 sm:p-6 rounded-2xl transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                                activeTab === step.id 
                                ? 'bg-white shadow-lg ring-1 ring-border z-10' 
                                : 'hover:bg-slate-50'
                            }`}
                        >
                            {/* Progress bar background for active tab */}
                            {activeTab === step.id && (
                                <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full">
                                    <div className="h-full bg-primary animate-progress-fill"></div>
                                </div>
                            )}
                            
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                                    activeTab === step.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-1 ${activeTab === step.id ? 'text-primary' : 'text-slate-700'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${activeTab === step.id ? 'text-text-main' : 'text-slate-400'}`}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mockup Display (Right) */}
                <div className="lg:col-span-8 perspective-1000">
                    <MockupWindow title={steps[activeTab].title}>
                        <div key={activeTab} className="h-full w-full animate-fade-in">
                            {steps[activeTab].mockup}
                        </div>
                    </MockupWindow>
                </div>
            </div>
        </ScrollAnimatedSection>
    );
};

// -- Styled Components --

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

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, user, leases = [], onBookDemo, availability }) => {
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const productTourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleScroll = () => {
          if (window.scrollY > 600) {
              setShowFloatingCTA(true);
          } else {
              setShowFloatingCTA(false);
          }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden bg-grid-pattern">
      <BackgroundBlobs />
      
      {/* Floating CTA */}
      <button 
        onClick={onGetStarted}
        className={`floating-cta flex items-center gap-2 bg-text-main text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-primary/50 font-bold text-base transition-transform hover:scale-105 active:scale-95 ${showFloatingCTA ? 'visible' : ''} hover-glow`}
      >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Upload Lease</span>
      </button>

      {/* Hero Section - UPDATED: Removed Visualizer, Centered Text */}
      <section className="relative pt-12 pb-10 sm:pt-24 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="relative z-10 animate-fade-in space-y-8">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-text-main leading-[1.15]">
                AI-Driven Intelligence <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500 gradient-text-header shimmer">
                    Built for Commercial Leases.
                </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
                Go beyond simple abstraction. Extract critical data with 99% accuracy, manage portfolio obligations proactively, and unlock strategic intelligence from your commercial lease documents.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button 
                    onClick={() => setIsDemoModalOpen(true)}
                    className="px-8 py-4 text-lg font-bold text-white bg-secondary rounded-xl shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105 min-w-[180px] hover-glow btn-gradient"
                >
                    Request Demo
                </button>
                <button 
                    onClick={() => productTourRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-4 text-lg font-semibold text-text-main bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-300 min-w-[180px] flex items-center justify-center gap-2 hover:shadow-md hover:border-primary/30 group"
                >
                    How It Works
                </button>
            </div>
        </div>
      </section>

      {/* Performance Metrics Section */}
      <section className="py-12 bg-surface-muted/50 border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  <PerformanceMetricCard 
                      value="2-5 mins"
                      label="AI Processing Speed"
                      subtext="Instant analysis vs days"
                      delayClass="stagger-1"
                      icon={<ClockIcon className="w-10 h-10 text-primary" />}
                  />
                  <PerformanceMetricCard 
                      value={<AnimatedCounter targetValue={200} duration={1500} postfix="+" />}
                      label="AI Extraction Depth"
                      subtext="Data points per lease"
                      delayClass="stagger-2"
                      icon={<TableCellsIcon className="w-10 h-10 text-primary" />}
                  />
                  <PerformanceMetricCard 
                      value={<AnimatedCounter targetValue={99} duration={2000} postfix="%" />}
                      label="AI + Human Verification"
                      subtext="Accuracy guaranteed"
                      delayClass="stagger-3"
                      icon={<CheckBadgeIcon className="w-10 h-10 text-primary" />}
                  />
              </div>
          </div>
      </section>

      {/* Conditional Dashboard */}
      {user ? <DashboardWidget user={user} leases={leases} /> : <div className="h-0"></div>}

      {/* Redesigned Impact Section */}
      <ScrollAnimatedSection className="py-16 sm:py-24 bg-[#0B1120] text-white my-12 relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] mx-4 sm:mx-6 shadow-2xl border border-slate-800/50 group cursor-default">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/30 via-slate-900 to-[#0B1120] pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/15 transition-all duration-1000"></div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              
              {/* Visual Side (Left) */}
              <div className="order-2 lg:order-1 relative h-[350px] sm:h-[450px] flex items-center justify-center perspective-1000">
                  <div className="relative w-full h-full max-w-md transform group-hover:rotate-1 transition-transform duration-700">
                      {/* Background Abstract Layer */}
                      <div className="absolute inset-0 border border-slate-700/30 rounded-3xl bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                          {/* Decorative Circles */}
                          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                      </div>

                      {/* 3% Widget (Transparent Background as requested) */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72">
                          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl animate-float hover:bg-white/10 transition-colors">
                              <div className="absolute -top-3 -right-3">
                                  <span className="relative flex h-6 w-6">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 items-center justify-center">
                                        <CheckIcon className="w-3 h-3 text-white" strokeWidth={4} />
                                    </span>
                                  </span>
                              </div>
                              
                              <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl border border-emerald-500/20">
                                      <ChartBarIcon className="w-6 h-6 text-emerald-400" />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Revenue Insight</p>
                                      <p className="text-sm text-slate-300">Escalation Clause</p>
                                  </div>
                              </div>
                              
                              <div className="flex items-baseline gap-1 mb-2">
                                  <span className="text-4xl font-extrabold text-white tracking-tight">3.0%</span>
                                  <span className="text-sm font-medium text-slate-400">/ yr</span>
                              </div>
                              
                              <p className="text-xs text-slate-400 leading-relaxed">
                                  Automatic base rent adjustment detected in Section 4.2.
                              </p>

                              {/* Progress bar visual */}
                              <div className="mt-4 pt-4 border-t border-white/5">
                                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                                      <span>Probability</span>
                                      <span>99%</span>
                                  </div>
                                  <div className="w-full bg-white/10 rounded-full h-1.5">
                                      <div className="bg-emerald-500 h-1.5 rounded-full w-[99%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Floating secondary elements */}
                      <div className="absolute top-12 left-8 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-lg animate-float hover:scale-105 transition-transform" style={{ animationDelay: '1.5s' }}>
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                              <span className="text-xs font-mono text-sky-100">cam_audit.pdf</span>
                          </div>
                      </div>
                      
                      <div className="absolute bottom-12 right-8 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-lg animate-float hover:scale-105 transition-transform" style={{ animationDelay: '2.5s' }}>
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                              <span className="text-xs font-mono text-purple-100">lease_v2_signed.pdf</span>
                          </div>
                      </div>

                  </div>
              </div>

              {/* Text Side (Right) */}
              <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-sm">
                      <MagnifyingGlassIcon className="w-3 h-3" />
                      AI REVENUE INTELLIGENCE
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white">
                      Stop Leaving Revenue <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-white">
                          On The Table.
                      </span>
                  </h2>
                  
                  <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl font-light">
                      Manual abstraction often misses complex financial triggers. Penaki's AI reads between the lines, identifying unbilled escalations, expense recoverables, and critical dates that directly impact your bottom line.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <CurrencyEuroIcon className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                              <p className="text-white font-bold">Cost Recovery</p>
                              <p className="text-xs text-slate-500">Catch missed billings</p>
                          </div>
                      </div>
                      <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                              <ShieldCheckIcon className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                              <p className="text-white font-bold">Risk Mitigation</p>
                              <p className="text-xs text-slate-500">Never miss a critical date</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </ScrollAnimatedSection>

      {/* Chaos to Clarity Section */}
      <ScrollAnimatedSection className="py-16 sm:py-24 px-6 max-w-[90rem] mx-auto relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-[100px] -z-10"></div>
          
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-5/12 text-center lg:text-left space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      <ArrowLeftRightIcon className="w-4 h-4 text-primary" /> 
                      Transformation
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-text-main leading-[1.1] tracking-tight">
                      From Chaos to <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary animate-gradient-pan bg-[length:200%_auto]">
                          AI-Verified Clarity.
                      </span>
                  </h2>
                  
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                      Raw lease documents are dense, unstructured, and often hundreds of pages long. Penaki's AI standardizes every clause into a clean, interactive data model.
                  </p>
                  
                  <div className="grid gap-6 max-w-lg mx-auto lg:mx-0">
                      <div className="flex gap-4 text-left p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-default">
                          <div className="mt-1 w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center flex-shrink-0 text-primary">
                              <DocumentTextIcon className="w-5 h-5" />
                          </div>
                          <div>
                              <h4 className="font-bold text-text-main">Unstructured Input</h4>
                              <p className="text-sm text-slate-500 mt-1">PDFs with varied layouts, fonts, and legal jargon.</p>
                          </div>
                      </div>
                      
                      <div className="flex gap-4 text-left p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300 cursor-default">
                          <div className="mt-1 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                              <TableCellsIcon className="w-5 h-5" />
                          </div>
                          <div>
                              <h4 className="font-bold text-text-main">Structured Output</h4>
                              <p className="text-sm text-slate-500 mt-1">Normalized JSON/Excel data ready for your ERP.</p>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="w-full lg:w-7/12 perspective-1000">
                  <div className="relative transform transition-transform duration-700 hover:scale-[1.02]">
                      <div className="absolute -inset-1 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-2xl blur opacity-30"></div>
                      <InteractiveLeaseSlider />
                  </div>
              </div>
          </div>
      </ScrollAnimatedSection>

      {/* Product Tour Section */}
      <div ref={productTourRef}>
        <ProductTourWorkflow />
      </div>

      {/* Dark Security Section */}
      <section className="bg-slate-900 py-16 sm:py-24 text-white relative overflow-hidden my-12 rounded-3xl sm:rounded-[3rem] mx-4 hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 border border-emerald-500/30">
                      <LockClosedIcon className="w-3 h-3" /> SECURE BY DESIGN
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">Your Data, <br/>Protected at Every Step.</h2>
                  <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                      We understand that lease documents contain sensitive financial and legal information. 
                      That's why we've built our platform with a security-first architecture.
                  </p>
                  <ul className="space-y-4">
                      {['End-to-End Encryption', 'Private Cloud Deployment Option', 'Regular Penetration Testing', 'Role-Based Access Control'].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900">
                                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium text-slate-200">{item}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              <div className="md:w-1/2 flex justify-center">
                  <div className="relative group">
                      <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                      <ShieldCheckIcon className="w-64 h-64 text-slate-800 fill-slate-800 stroke-emerald-500 stroke-[0.5] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] relative z-10 transform group-hover:scale-105 transition-transform duration-500" />
                  </div>
              </div>
          </div>
      </section>

      {/* Data Sovereignty Section - No Training Disclaimer */}
      <ScrollAnimatedSection className="py-16 sm:py-20 px-6 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2rem] p-8 md:p-12 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-bl-full opacity-50 -mr-16 -mt-16 pointer-events-none group-hover:opacity-70 transition-opacity"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                  <div className="flex-shrink-0 bg-white p-6 rounded-full shadow-md border border-indigo-50 group-hover:scale-110 transition-transform duration-300">
                      <LockClosedIcon className="w-16 h-16 text-indigo-600" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-extrabold text-text-main mb-4">Your Data Sovereignty Is Absolute.</h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-6">
                          Unlike other platforms, <strong>Penaki does not train its AI models on your uploaded documents.</strong> Your proprietary lease data remains strictly confidential and is used solely for the purpose of extraction within your own account environment.
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm hover:border-green-500 transition-colors">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Zero Retention for Training</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm hover:border-green-500 transition-colors">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Isolated Processing Contexts</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </ScrollAnimatedSection>
      
      <FAQSection />

      {/* Final CTA */}
      <section className="py-20 px-6">
        <ScrollAnimatedSection className="text-center bg-slate-900 p-8 sm:p-20 rounded-[2.5rem] shadow-2xl max-w-[80rem] mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900 opacity-90 z-0"></div>
            <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-primary opacity-20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                Experience AI-Driven Lease Intelligence
                </h2>
                <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 font-medium">
                Experience a dynamic, AI-abstracted living document—a culmination of dozens of files, all brought together in a way that allows you to verify, analyze, and manage your lease obligations with confidence.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                        onClick={onGetStarted}
                        className="px-10 py-4 text-lg font-bold bg-white text-slate-900 rounded-xl shadow-lg hover:bg-sky-50 transition-all duration-300 transform hover:scale-105 hover-glow"
                    >
                        Get Started Now
                    </button>
                    <button 
                        onClick={() => setIsDemoModalOpen(true)}
                        className="px-10 py-4 text-lg font-bold bg-transparent border border-slate-600 text-white rounded-xl hover:bg-white/10 transition-all duration-300 hover:border-white"
                    >
                        Book a Demo
                    </button>
                </div>
            </div>
        </ScrollAnimatedSection>
      </section>

      {/* Demo Modal Render */}
      {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} onBook={onBookDemo} availability={availability} />}

    </div>
  );
};
