
import React from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';
import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

// --- VISUALIZATION COMPONENTS ---

const MockDocumentAudit = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden relative group">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-500 uppercase">Missing Docs Detected</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Audit_ID_9921</span>
        </div>
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DocumentTextIcon className="w-4 h-4"/></div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Master Lease</p>
                        <p className="text-xs text-slate-400">Verified • 42 Pages</p>
                    </div>
                </div>
                <CheckIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white text-red-500 rounded-lg border border-red-100"><ExclamationCircleIcon className="w-4 h-4"/></div>
                    <div>
                        <p className="text-sm font-bold text-red-800">2nd Amendment</p>
                        <p className="text-xs text-red-600">Missing Signature Page</p>
                    </div>
                </div>
                <button className="px-3 py-1 bg-white text-red-600 text-xs font-bold rounded border border-red-200 shadow-sm">Request</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DocumentTextIcon className="w-4 h-4"/></div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">Estoppel Cert</p>
                        <p className="text-xs text-slate-400">Verified • Signed 2d ago</p>
                    </div>
                </div>
                <CheckIcon className="w-5 h-5 text-green-500" />
            </div>
        </div>
    </div>
);

const MockExtraction = () => (
    <div className="relative">
        <div className="absolute inset-0 bg-indigo-600 blur-2xl opacity-10 rounded-full"></div>
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 relative z-10 flex gap-6 items-center">
            {/* Left: PDF visual */}
            <div className="w-32 h-40 bg-slate-100 border border-slate-300 rounded-lg p-3 space-y-2 flex-shrink-0 relative overflow-hidden group">
                <div className="h-2 w-16 bg-slate-300 rounded"></div>
                <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                    <div className="h-1.5 w-2/3 bg-slate-200 rounded"></div>
                </div>
                <div className="absolute top-10 left-0 right-0 h-1 bg-indigo-500/50 blur-[2px] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
            
            {/* Arrow */}
            <div className="flex flex-col items-center gap-1 text-indigo-500">
                <SparklesIcon className="w-6 h-6 animate-pulse" />
                <div className="h-0.5 w-12 bg-indigo-200"></div>
            </div>

            {/* Right: Data */}
            <div className="flex-1 space-y-2">
                <div className="p-2 bg-indigo-50 rounded border border-indigo-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900">Base Rent</span>
                    <span className="text-xs font-mono text-indigo-700">$42,500.00</span>
                </div>
                <div className="p-2 bg-indigo-50 rounded border border-indigo-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900">Expiry</span>
                    <span className="text-xs font-mono text-indigo-700">31 Dec 2028</span>
                </div>
                <div className="p-2 bg-indigo-50 rounded border border-indigo-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-900">Type</span>
                    <span className="text-xs font-mono text-indigo-700">Triple Net</span>
                </div>
            </div>
        </div>
    </div>
);

const MockDigitizedAbstract = () => (
    <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden text-white font-mono text-sm border border-slate-700">
        <div className="bg-slate-800 p-3 border-b border-slate-700 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <span className="text-purple-400">const</span> <span className="text-blue-400">leaseTerms</span> = <span className="text-yellow-400">{`{`}</span>
            </div>
            <div className="pl-6 space-y-2">
                <p><span className="text-sky-300">commencement</span>: <span className="text-green-400">"2024-01-01"</span>,</p>
                <p><span className="text-sky-300">security_deposit</span>: <span className="text-orange-400">150000.00</span>,</p>
                <p><span className="text-sky-300">renewal_options</span>: <span className="text-purple-300">[</span></p>
                <div className="pl-6">
                    <p><span className="text-yellow-400">{`{`}</span> <span className="text-sky-300">years</span>: <span className="text-blue-300">5</span>, <span className="text-sky-300">notice</span>: <span className="text-green-400">"9 mo"</span> <span className="text-yellow-400">{`}`}</span>,</p>
                    <p><span className="text-yellow-400">{`{`}</span> <span className="text-sky-300">years</span>: <span className="text-blue-300">5</span>, <span className="text-sky-300">notice</span>: <span className="text-green-400">"9 mo"</span> <span className="text-yellow-400">{`}`}</span></p>
                </div>
                <p><span className="text-purple-300">]</span>,</p>
            </div>
            <div className="text-yellow-400">{`}`}</div>
        </div>
    </div>
);

const MockCriticalDates = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
        <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-red-500" /> Critical Dates Timeline
        </h4>
        <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
            <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white box-content"></div>
                <p className="text-xs text-slate-400 font-medium mb-1">Jan 01, 2024</p>
                <p className="text-sm font-bold text-slate-700">Lease Commencement</p>
            </div>
            <div className="relative">
                <div className="absolute -left-[23px] top-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white box-content shadow-lg shadow-orange-200"></div>
                <p className="text-xs text-orange-600 font-bold mb-1">Oct 01, 2028 (Upcoming)</p>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <p className="text-sm font-bold text-orange-900">Renewal Notice Deadline</p>
                    <p className="text-xs text-orange-700 mt-1">Window opens: 9 months prior to expiry.</p>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white box-content"></div>
                <p className="text-xs text-slate-400 font-medium mb-1">Dec 31, 2028</p>
                <p className="text-sm font-bold text-slate-700">Lease Expiration</p>
            </div>
        </div>
    </div>
);

const MockLocationsPage = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex h-72 relative group">
        {/* Left Sidebar */}
        <div className="w-1/3 min-w-[140px] border-r border-slate-200 bg-white flex flex-col z-10">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-3 h-3 text-primary" />
                    <div className="h-2 w-16 bg-slate-800 rounded opacity-80"></div>
                </div>
                <div className="h-6 w-full bg-white border border-slate-200 rounded-md flex items-center px-2">
                    <MagnifyingGlassIcon className="w-3 h-3 text-slate-300" />
                </div>
            </div>
            <div className="flex-1 p-2 space-y-2 bg-slate-50/30 overflow-hidden">
                {/* Active Item */}
                <div className="p-2 rounded-lg bg-white border border-indigo-500 shadow-md relative">
                    <div className="flex justify-between items-start mb-1">
                        <div className="h-2 w-20 bg-slate-800 rounded"></div>
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="h-1.5 w-12 bg-slate-400 rounded mb-2"></div>
                    <div className="flex gap-2 border-t border-slate-50 pt-1.5">
                        <div className="h-1.5 w-8 bg-indigo-100 rounded"></div>
                        <div className="h-1.5 w-8 bg-slate-100 rounded"></div>
                    </div>
                </div>
                {/* Other Items */}
                <div className="p-2 rounded-lg bg-white border border-slate-200 opacity-60">
                    <div className="flex justify-between items-start mb-1">
                        <div className="h-2 w-16 bg-slate-700 rounded"></div>
                        <div className="h-1.5 w-1.5 bg-amber-500 rounded-full"></div>
                    </div>
                    <div className="h-1.5 w-10 bg-slate-300 rounded"></div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-slate-200 opacity-60">
                    <div className="flex justify-between items-start mb-1">
                        <div className="h-2 w-18 bg-slate-700 rounded"></div>
                        <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="h-1.5 w-14 bg-slate-300 rounded"></div>
                </div>
            </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-blue-50 relative overflow-hidden">
            {/* Map styling */}
            <div className="absolute inset-0 opacity-20" style={{ 
                backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', 
                backgroundSize: '16px 16px' 
            }}></div>
            
            {/* Pin 1 (Selected) */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white animate-bounce" style={{animationDuration: '2s'}}>
                        <BuildingOfficeIcon className="w-4 h-4" />
                    </div>
                    <div className="w-2 h-2 bg-indigo-600 rotate-45 -mt-1"></div>
                    <div className="w-6 h-1.5 bg-black/20 rounded-full blur-sm mt-1"></div>
                </div>
            </div>

            {/* Pin 2 */}
            <div className="absolute bottom-1/4 right-1/4 transform scale-75 opacity-80">
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white">
                    <BuildingOfficeIcon className="w-4 h-4" />
                </div>
            </div>

            {/* Pin 3 */}
            <div className="absolute top-1/4 left-10 transform scale-75 opacity-80">
                <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white">
                    <BuildingOfficeIcon className="w-4 h-4" />
                </div>
            </div>

            {/* Floating Detail Card */}
            <div className="absolute top-4 right-4 w-44 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-white/50 p-3 z-30 animate-slide-up">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase tracking-wide">Active</span>
                    <XCircleIcon className="w-3 h-3 text-slate-300" />
                </div>
                <div className="h-3 w-3/4 bg-slate-800 rounded mb-1"></div>
                <div className="h-2 w-1/2 bg-slate-400 rounded mb-3"></div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                    <div>
                        <p className="text-[7px] text-slate-400 uppercase font-bold mb-0.5">Rent</p>
                        <div className="h-2.5 w-10 bg-emerald-100 rounded"></div>
                    </div>
                    <div>
                        <p className="text-[7px] text-slate-400 uppercase font-bold mb-0.5">Size</p>
                        <div className="h-2.5 w-8 bg-slate-100 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockRentRoll = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Tenant</span>
            <span>Monthly Rent</span>
        </div>
        <div className="divide-y divide-slate-100">
            {[
                { name: 'Acme Corp', rent: '$12,500', status: 'Current' },
                { name: 'Globex Inc', rent: '$8,200', status: 'Late', late: true },
                { name: 'Soylent Corp', rent: '$15,000', status: 'Current' },
                { name: 'Umbrella Corp', rent: '$22,100', status: 'Current' }
            ].map((row, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center text-sm group hover:bg-sky-50 transition-colors">
                    <div>
                        <p className="font-bold text-slate-700">{row.name}</p>
                        {row.late && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Late Payment</span>}
                    </div>
                    <span className="font-mono text-slate-600 font-medium">{row.rent}</span>
                </div>
            ))}
        </div>
    </div>
);

const MockEncumbrance = () => (
    <div className="bg-amber-50 rounded-xl shadow-xl border border-amber-200 p-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-100 rounded-full blur-2xl"></div>
        <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm text-amber-500">
                <LockClosedIcon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-lg font-bold text-amber-900">Encumbrance Detected</h4>
                <p className="text-sm text-amber-800 mt-1 mb-3">
                    <strong>Right of First Refusal (ROFR)</strong> found in Section 18.2.
                </p>
                <div className="bg-white/60 p-3 rounded-lg border border-amber-100 text-xs text-amber-900 italic">
                    "Tenant shall have the recurring right of first refusal to purchase the Premises..."
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---

export const SolutionDueDiligence: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    const steps = [
        {
            title: "Document Audit",
            description: "Automatically index data rooms. Identify missing amendments, unsigned contracts, and completeness gaps instantly.",
            visual: <MockDocumentAudit />,
            color: "text-slate-600"
        },
        {
            title: "AI Powered Lease Abstraction",
            description: "Convert unstructured PDFs into structured data. Our LLMs run parallel processing to abstract thousands of pages in minutes.",
            visual: <MockExtraction />,
            color: "text-indigo-600"
        },
        {
            title: "Digitized Abstracts",
            description: "Turn static text into queryable JSON objects. Standardize terms across your entire portfolio for apples-to-apples comparison.",
            visual: <MockDigitizedAbstract />,
            color: "text-purple-600"
        },
        {
            title: "Critical Date Report",
            description: "Visualize exposure. Automatically map out lease expirations, renewal option windows, and break clauses on a timeline.",
            visual: <MockCriticalDates />,
            color: "text-red-600"
        },
        {
            title: "Portfolio Locations",
            description: "Visualize asset distribution geographically. Instantly spot cluster risks and manage regional exposure with interactive maps.",
            visual: <MockLocationsPage />,
            color: "text-blue-600"
        },
        {
            title: "Rent Roll Reconciliation",
            description: "Compare billed rent against lease-stipulated rent steps. Identify leakage and overcharges instantly.",
            visual: <MockRentRoll />,
            color: "text-emerald-600"
        },
        {
            title: "Encumbrance Reporting",
            description: "Flag deal-killers. Automatically detect ROFRs, exclusivity clauses, and termination options that affect asset value.",
            visual: <MockEncumbrance />,
            color: "text-amber-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero */}
            <section className="relative pt-16 md:pt-20 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-bold uppercase tracking-wide mb-8 animate-fade-in shadow-lg">
                        <MagnifyingGlassIcon className="w-4 h-4 text-emerald-400" />
                        Risk & Compliance Engine
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        Accelerate M&A <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Due Diligence
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Reduce transaction risk and closing time. From chaotic data rooms to verified audit reports in one seamless AI workflow.
                    </p>
                    
                    <button onClick={onBookDemo} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        Start Audit
                    </button>
                </div>
            </section>

            {/* Workflow Steps */}
            <ScrollAnimatedSection className="py-20 px-6 max-w-7xl mx-auto relative">
                {/* Connecting Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2 hidden md:block"></div>

                <div className="space-y-24 md:space-y-32">
                    {steps.map((step, idx) => (
                        <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 relative ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            
                            {/* Step Marker (Desktop Center) */}
                            <div className="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 w-10 h-10 bg-white border-4 border-slate-200 rounded-full z-10 flex items-center justify-center font-bold text-slate-400 shadow-sm hidden md:flex">
                                {idx + 1}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className={`text-2xl font-black mb-4 ${step.color}`}>{step.title}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* Visual Content */}
                            <div className="flex-1 w-full perspective-1000">
                                <div className="transform transition-transform duration-700 hover:scale-[1.02] hover:rotate-1">
                                    {step.visual}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollAnimatedSection>

            {/* Final CTA */}
            <section className="py-24 px-6 bg-slate-900 text-white mt-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl font-bold mb-8">Ready to close deals faster?</h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                        Join top investment firms using Penaki to automate their due diligence and uncover hidden risks before they become liabilities.
                    </p>
                    <button onClick={onBookDemo} className="px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105">
                        Book a Demo
                    </button>
                </div>
            </section>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
