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
            Select "Human Review" for<br />99% verified accuracy.
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
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-primary/30 text-primary text-xs font-semibold shadow-sm animate-fade-in hover:shadow-md hover:border-primary transition-all cursor-default" style={{ animationDelay: `${i * 0.1}s` }}>
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
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${i === 2 ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                    {i === 1 ? <UserCircleIcon className="w-5 h-5" /> :
                        i === 2 ? <CurrencyEuroIcon className="w-5 h-5" /> :
                            i === 3 ? <CalendarIcon className="w-5 h-5" /> :
                                <DocumentTextIcon className="w-5 h-5" />}
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


export { MockupWindow, MockupUpload, MockupTemplates, MockupFieldSelection, MockupWorkbench, MockupDashboard, MockupExcel, MockupEscalation };