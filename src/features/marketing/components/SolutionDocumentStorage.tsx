
import React from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { CircleStackIcon } from '@/shared/ui/Icons/CircleStackIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { FolderIcon } from '@/shared/ui/Icons/FolderIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { ArrowDownTrayIcon } from '@/shared/ui/Icons/ArrowDownTrayIcon';
import { CloudArrowUpIcon } from '@/shared/ui/Icons/CloudArrowUpIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

// Additional Icons needed for this page
const CloudArrowUpIconComponent = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>;
const ShieldCheckIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>;

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

// --- MOCK COMPONENTS ---

const MockDashboardWidget = () => (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-2xl transform transition-all hover:scale-[1.01] hover:shadow-primary/10 w-full">
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">My Leases</h3>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md shadow-sm flex items-center gap-1 hover:bg-indigo-700 transition-colors">
                    <ArrowDownTrayIcon className="w-3 h-3" /> <span className="hidden sm:inline">Export All</span>
                </button>
            </div>
        </div>
        <div className="p-2 sm:p-4 bg-slate-50/50 flex-1 relative overflow-hidden">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden relative z-10 w-full">
                <div className="overflow-x-auto">
                    <div className="min-w-[600px]"> {/* Ensures table doesn't crush on mobile */}
                        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-6">Lease Name</div>
                            <div className="col-span-3">Status</div>
                            <div className="col-span-3 text-right">Action</div>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50 transition-colors cursor-pointer group animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <div className="col-span-6">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate">Skyline Tower - Floor 12</p>
                                    <p className="text-[10px] text-slate-400 font-mono">ID: lease_8291</p>
                                </div>
                                <div className="col-span-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 shadow-sm">
                                        <CheckIcon className="w-3 h-3 stroke-[3]" /> Abstracted
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline flex items-center justify-end gap-1 ml-auto">
                                        <EyeIcon className="w-3.5 h-3.5" /> View
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50 transition-colors cursor-pointer group animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <div className="col-span-6">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate">Tech Park Building A</p>
                                    <p className="text-[10px] text-slate-400 font-mono">ID: lease_8292</p>
                                </div>
                                <div className="col-span-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 shadow-sm">
                                        <PencilSquareIcon className="w-3 h-3" /> In Review
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    <button className="text-slate-400 cursor-not-allowed font-medium text-xs">Processing...</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50 transition-colors cursor-pointer group animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <div className="col-span-6">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate">Warehouse 4B</p>
                                    <p className="text-[10px] text-slate-400 font-mono">ID: lease_8290</p>
                                </div>
                                <div className="col-span-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 shadow-sm">
                                        <CheckIcon className="w-3 h-3 stroke-[3]" /> Abstracted
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline flex items-center justify-end gap-1 ml-auto">
                                        <EyeIcon className="w-3.5 h-3.5" /> View
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-12 items-center py-3 px-4 hover:bg-sky-50 transition-colors cursor-pointer group animate-slide-up" style={{ animationDelay: '0.4s' }}>
                                <div className="col-span-6">
                                    <p className="font-bold text-sm text-slate-700 group-hover:text-indigo-600 transition-colors truncate">Midtown Retail Center</p>
                                    <p className="text-[10px] text-slate-400 font-mono">ID: lease_8288</p>
                                </div>
                                <div className="col-span-3">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 shadow-sm">
                                        <CheckIcon className="w-3 h-3 stroke-[3]" /> Abstracted
                                    </span>
                                </div>
                                <div className="col-span-3 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline flex items-center justify-end gap-1 ml-auto">
                                        <EyeIcon className="w-3.5 h-3.5" /> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Background elements to signify depth */}
            <div className="absolute top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-10 -left-10 w-40 h-40 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
        
        {/* Floating Upload Status */}
        <div className="absolute bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up border border-slate-700 z-20 max-w-[200px] sm:max-w-none">
            <div className="relative shrink-0">
                <svg className="w-6 h-6 transform -rotate-90">
                    <circle cx="12" cy="12" r="10" stroke="#475569" strokeWidth="2" fill="transparent" />
                    <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="2" fill="transparent" strokeDasharray="62.8" strokeDashoffset="10" className="animate-[dash_1.5s_ease-in-out_infinite]" />
                </svg>
            </div>
            <div>
                <p className="text-xs font-bold">Uploading Bundle...</p>
                <p className="text-[10px] text-slate-400">4 of 5 processed</p>
            </div>
        </div>
    </div>
);

const RefinedViewerInteraction = () => (
    <div className="bg-white w-full h-[600px] rounded-xl shadow-2xl border border-slate-200 flex flex-col md:flex-row overflow-hidden relative group isolate">
        {/* Left Panel: Abstracted Data */}
        <div className="w-full md:w-[40%] flex-shrink-0 h-full flex flex-col border-r border-slate-200 bg-slate-50 z-10">
            <header className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Abstraction Report</h2>
                    <p className="text-xs text-slate-500">Skyline Tower - Floor 12</p>
                </div>
                <button className="text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                    Download Excel
                </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Section 1 */}
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><DocumentTextIcon className="w-4 h-4"/></div>
                        <h3 className="font-bold text-slate-700 text-sm">Key Terms</h3>
                    </div>
                    <div className="space-y-3 pl-2">
                        {/* Selected Field - Highlighting Source */}
                        <div className="group cursor-pointer relative">
                            {/* Active Indicator */}
                            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-600 rounded-r-lg shadow-sm"></div>
                            
                            <p className="text-xs font-bold text-indigo-700 mb-1 uppercase tracking-wide">Commencement Date</p>
                            <div className="bg-indigo-50 border-2 border-indigo-500 rounded-lg p-3 shadow-md ring-4 ring-indigo-500/10 transition-all relative">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-900 text-base">January 01, 2024</p>
                                    <CheckBadgeIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="mt-2 pt-2 border-t border-indigo-200 flex items-center gap-1.5 text-[10px] text-indigo-700 font-medium">
                                    <EyeIcon className="w-3 h-3" />
                                    <span>Viewing Page 1...</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                            <p className="text-xs font-medium text-slate-500 mb-1">Expiration Date</p>
                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 group-hover:border-indigo-300 transition-colors">
                                <p className="font-bold text-slate-800 text-sm">December 31, 2028</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                        <div className="p-1.5 bg-emerald-100 rounded text-emerald-600"><CircleStackIcon className="w-4 h-4"/></div>
                        <h3 className="font-bold text-slate-700 text-sm">Financials</h3>
                    </div>
                    <div className="space-y-3 pl-2">
                        <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                            <p className="text-xs font-medium text-slate-500 mb-1">Base Rent (Monthly)</p>
                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 group-hover:border-emerald-300 transition-colors">
                                <p className="font-bold text-slate-800 text-sm">$12,500.00</p>
                            </div>
                        </div>
                        <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                            <p className="text-xs font-medium text-slate-500 mb-1">Security Deposit</p>
                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 group-hover:border-emerald-300 transition-colors">
                                <p className="font-bold text-slate-800 text-sm">$25,000.00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Panel: PDF Viewer */}
        <div className="flex-1 bg-slate-200 relative overflow-hidden flex flex-col items-center pt-8 z-0">
            <div className="absolute top-4 bg-slate-800/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-mono z-20 shadow-lg border border-slate-600">
                Page 1 / 42
            </div>
            
            <div className="w-[90%] bg-white shadow-2xl min-h-[800px] p-8 md:p-12 text-[10px] md:text-xs text-slate-400 font-serif leading-loose relative transform scale-100 origin-top border border-slate-300">
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-center font-bold text-slate-800 text-sm mb-8 uppercase tracking-widest border-b border-slate-200 pb-4">Lease Agreement</h3>
                    <p>THIS LEASE is made this 20th day of December, 2023, by and between...</p>
                    <br/>
                    <p>
                        1. <strong>TERM</strong>. The term of this Lease shall commence on 
                        <span className="relative inline-block mx-1">
                            <span className="relative z-10 font-bold text-slate-900 bg-yellow-200 px-1 rounded-sm border-b-2 border-indigo-600 shadow-sm">
                                January 01, 2024
                            </span>
                            {/* Connecting Line Visual - Only visible on desktop */}
                            <svg className="absolute top-1/2 right-full w-[400px] h-[300px] pointer-events-none overflow-visible -translate-y-1/2 z-20 hidden md:block">
                                {/* Bezier curve from text to left edge */}
                                <path 
                                    d="M 0 0 C -50 0, -150 -50, -380 -150" 
                                    stroke="#4f46e5" 
                                    strokeWidth="2" 
                                    fill="none" 
                                    strokeDasharray="4 4" 
                                    className="animate-[dashFlow_2s_linear_infinite]" 
                                />
                                <circle cx="0" cy="0" r="3" fill="#4f46e5" />
                                <circle cx="-380" cy="-150" r="4" fill="#4f46e5" className="animate-ping opacity-75" />
                            </svg>
                        </span>
                        (the "Commencement Date") and shall continue for a period of five (5) years...
                    </p>
                    <br/>
                    <p>2. <strong>RENT</strong>. Tenant agrees to pay Base Rent in the amount of $12,500.00 per month, payable in advance on the first day of each month.</p>
                    <br/>
                    <p>3. <strong>USE</strong>. The Premises shall be used for general office purposes...</p>
                    
                    <div className="space-y-4 mt-8 opacity-20 select-none">
                        <div className="h-2 bg-slate-800 rounded w-full"></div>
                        <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                        <div className="h-2 bg-slate-800 rounded w-full"></div>
                        <div className="h-2 bg-slate-800 rounded w-4/5"></div>
                        <div className="h-2 bg-slate-800 rounded w-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockSearchUI = () => (
    <div className="relative group max-w-2xl mx-auto">
        {/* Document Background */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 h-64 p-8 overflow-hidden relative transform group-hover:scale-[1.01] transition-transform duration-500">
            <div className="space-y-3 opacity-30 blur-[1px]">
                <div className="h-2 w-full bg-slate-800 rounded"></div>
                <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                <div className="h-2 w-full bg-slate-800 rounded"></div>
                <div className="h-2 w-4/5 bg-slate-800 rounded"></div>
                <div className="h-2 w-full bg-slate-800 rounded"></div>
                <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
            </div>
            
            {/* Highlighted Match */}
            <div className="absolute top-20 left-8 right-8 h-6 bg-yellow-300/50 border border-yellow-400 rounded flex items-center px-2 animate-[pulse_2s_infinite]">
                <span className="text-xs font-bold text-slate-800 truncate">...force majeure event occurring for more than 30 days...</span>
            </div>
        </div>

        {/* Search Bar Overlay */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-3/4 bg-white rounded-xl shadow-2xl border border-indigo-100 p-2 flex items-center gap-2 animate-[float_4s_ease-in-out_infinite]">
            <MagnifyingGlassIcon className="w-5 h-5 text-indigo-500 ml-2 shrink-0" />
            <div className="flex-1 text-sm text-slate-800 font-medium truncate">force majeure</div>
            <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">1 of 3</div>
            <div className="flex shrink-0">
                <button className="p-1 hover:bg-slate-100 rounded"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                <button className="p-1 hover:bg-slate-100 rounded"><svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
            </div>
        </div>
    </div>
);

export const SolutionDocumentStorage: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden bg-grid-pattern relative">
            {/* Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold uppercase tracking-wide mb-8 animate-fade-in border border-indigo-200 shadow-sm">
                        <LockClosedIcon className="w-4 h-4" />
                        SOC-2 Aligned Infrastructure
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        The Ultimate <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
                            Digital Lease Vault
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up px-4" style={{animationDelay: '0.1s'}}>
                        Centralize your entire portfolio in an unlimited, searchable, and secure cloud environment. 
                        Access any document, from any device, instantly.
                    </p>
                    
                    <button onClick={onBookDemo} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all animate-slide-up transform hover:-translate-y-1" style={{animationDelay: '0.2s'}}>
                        Book a Demo
                    </button>
                </div>
            </section>

            {/* Feature 1: The Repository */}
            <ScrollAnimatedSection className="py-20 px-6 max-w-[90rem] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    <div className="order-2 lg:order-1 relative group perspective-1000 w-full">
                        <div className="absolute -inset-4 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                        <div className="transform transition-transform duration-700 hover:rotate-y-1">
                            <MockDashboardWidget />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-primary mb-6 animate-float">
                            <CircleStackIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Unlimited, Organized Storage</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Stop relying on fragmented shared drives. Penaki provides a purpose-built repository for lease documents. 
                            Upload bundles, amendments, and estoppels without storage limits. Everything is indexed automatically.
                        </p>
                        <ul className="mt-6 space-y-3">
                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                <CheckBadgeIcon className="w-5 h-5 text-green-500" /> Auto-categorization of amendments
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                <CheckBadgeIcon className="w-5 h-5 text-green-500" /> Bulk upload capabilities
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                <CheckBadgeIcon className="w-5 h-5 text-green-500" /> Version control history
                            </li>
                        </ul>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 2: Instant Viewing */}
            <ScrollAnimatedSection className="py-24 bg-white border-y border-slate-200 bg-grid-pattern">
                <div className="max-w-[95rem] mx-auto px-6">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wide mb-4 border border-purple-100">
                            <EyeIcon className="w-4 h-4" /> Zero-Latency Viewing
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Instant Context. No Downloads.</h2>
                        <p className="text-lg text-slate-600">
                            View documents side-by-side with their extracted data. Click any data point to jump directly to the source clause in the PDF.
                        </p>
                    </div>
                    <div className="shadow-2xl rounded-2xl overflow-hidden animate-slide-up transform hover:scale-[1.005] transition-transform duration-700 ring-1 ring-slate-100">
                        <RefinedViewerInteraction />
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 3: OCR Search */}
            <ScrollAnimatedSection className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Deep OCR Search</h2>
                        <p className="text-lg text-slate-600">
                            Find "force majeure" or "termination option" across thousands of pages in milliseconds. 
                            Our OCR engine makes every scanned PDF fully searchable.
                        </p>
                    </div>
                    <MockSearchUI />
                </div>
            </ScrollAnimatedSection>

            {/* Security Footer */}
            <ScrollAnimatedSection className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="p-6 group">
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                            <ShieldCheckIcon className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">SOC-2 Aligned</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Penaki follows SOC 2-aligned security best practices. Formal SOC 2 certification is planned as part of our enterprise compliance roadmap.
                        </p>
                    </div>
                    <div className="p-6 group">
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                            <LockClosedIcon className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">End-to-End Encryption</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your data is encrypted in transit (TLS 1.2+) and at rest (AES-256).
                        </p>
                    </div>
                    <div className="p-6 group">
                        <div className="transform group-hover:scale-110 transition-transform duration-300">
                            <CloudArrowUpIconComponent className="w-16 h-16 text-sky-400 mx-auto mb-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">99.9% Uptime</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Redundant backups and high-availability architecture ensure your documents are always there.
                        </p>
                    </div>
                </div>
                
                <div className="mt-20 text-center border-t border-slate-800 pt-16">
                    <h2 className="text-3xl md:text-4xl font-black mb-8">Ready to organize your portfolio?</h2>
                    <button onClick={onBookDemo} className="px-12 py-5 bg-emerald-500 text-white rounded-xl font-bold shadow-xl hover:bg-emerald-600 transition-all transform hover:-translate-y-1 text-lg">
                        Book a Demo
                    </button>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
