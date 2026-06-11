
import React from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { ArrowDownTrayIcon } from '@/shared/ui/Icons/ArrowDownTrayIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute bg-sky-200 w-[40rem] h-[40rem] rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="absolute bg-indigo-200 w-[40rem] h-[40rem] rounded-full top-1/4 right-0 translate-x-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="absolute bg-purple-100 w-[30rem] h-[30rem] rounded-full bottom-0 left-1/4 mix-blend-multiply opacity-40 blur-[80px]"></div>
    </div>
);

// --- VISUALIZATION COMPONENTS ---

const ExtractionVisualizer = () => (
    <div className="relative w-full max-w-5xl mx-auto h-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700 flex items-center justify-center isolate group hover:shadow-indigo-500/20 transition-all duration-700">
        {/* Background Grid & Effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Central Flow */}
        <div className="relative z-10 flex items-center gap-4 md:gap-12 scale-90 md:scale-100 flex-col md:flex-row">
            
            {/* Input Node */}
            <div className="flex flex-col items-center gap-4 group/input">
                <div className="w-28 h-36 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] p-4 relative transform hover:-rotate-3 transition-transform duration-500 border border-slate-200">
                    <div className="absolute -top-3 -left-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">PDF</div>
                    <div className="h-2 w-12 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-2 opacity-40">
                        <div className="h-1.5 w-full bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-2/3 bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-full bg-slate-300 rounded"></div>
                        <div className="h-1.5 w-4/5 bg-slate-300 rounded"></div>
                    </div>
                    {/* Scanning Laser */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_3s_linear_infinite] opacity-80"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Raw Document</span>
            </div>

            {/* Processing Pipeline Visual */}
            <div className="relative w-full md:w-48 h-24 md:h-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-0.5 bg-slate-700 relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <div className="w-16 h-16 bg-slate-800 rounded-2xl border border-slate-600 flex items-center justify-center z-10 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse-slow">
                    <SparklesIcon className="w-8 h-8 text-indigo-400" />
                </div>
            </div>

            {/* Output Node (Stack) */}
            <div className="flex flex-col items-center gap-4 relative group/output">
                <div className="relative w-32 h-40">
                    {/* Excel File */}
                    <div className="absolute top-0 left-0 w-32 h-40 bg-white rounded-xl border border-emerald-200 p-4 shadow-xl transform rotate-6 transition-transform group-hover/output:rotate-12 duration-500 z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                                <TableCellsIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase">Excel</span>
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-1">
                                <div className="h-1 bg-emerald-100 rounded col-span-1"></div>
                                <div className="h-1 bg-emerald-50 rounded col-span-2"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div className="h-1 bg-emerald-100 rounded col-span-1"></div>
                                <div className="h-1 bg-emerald-50 rounded col-span-2"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div className="h-1 bg-emerald-100 rounded col-span-1"></div>
                                <div className="h-1 bg-emerald-50 rounded col-span-2"></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* PDF Summary */}
                    <div className="absolute top-0 left-0 w-32 h-40 bg-white rounded-xl border border-rose-200 p-4 shadow-lg transform -rotate-6 transition-transform group-hover/output:-rotate-12 duration-500">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-rose-100 rounded flex items-center justify-center">
                                <DocumentTextIcon className="w-4 h-4 text-rose-600" />
                            </div>
                            <span className="text-[10px] font-bold text-rose-800 uppercase">Abstract</span>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                            <div className="h-1.5 w-3/4 bg-slate-100 rounded"></div>
                            <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                        </div>
                    </div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Structured Output</span>
            </div>
        </div>
    </div>
);

const MockSourceLinking = () => (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:h-[450px] relative transform transition-all hover:shadow-indigo-500/10 duration-700 group/container w-full">
        
        {/* Floating Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-xl z-30 flex items-center gap-2 opacity-0 group-hover/container:opacity-100 transition-opacity delay-300 hidden lg:flex">
            <ArrowRightIcon className="w-3 h-3 text-green-400" />
            <span>Click to verify source</span>
        </div>

        {/* Left: Extracted Data */}
        <div className="w-full lg:w-1/3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 space-y-4 z-10 relative overflow-y-auto lg:overflow-visible flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TableCellsIcon className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Extracted Data</h4>
                </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-all cursor-pointer hover:border-indigo-300 group">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex justify-between">
                    Landlord
                    <CheckBadgeIcon className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-semibold text-slate-700 text-sm">Summit Holdings LLC</div>
            </div>

            {/* Active Field */}
            <div className="bg-white p-4 rounded-xl border-2 border-indigo-500 shadow-xl relative transform scale-105 transition-transform z-20">
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-t-2 border-r-2 border-indigo-500"></div>
                
                <div className="flex justify-between items-center mb-2">
                    <div className="text-[9px] text-indigo-600 uppercase font-bold tracking-wider">Monthly Base Rent</div>
                    <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckBadgeIcon className="w-3 h-3" /> 99.8%
                    </div>
                </div>
                <div className="text-xl font-black text-slate-900 tracking-tight mb-2">$12,500.00</div>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-indigo-500 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                    <DocumentTextIcon className="w-3 h-3" /> 
                    <span>Jump to Source (Page 3)</span>
                </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-all cursor-pointer hover:border-indigo-300 group">
                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex justify-between">
                    Lease Expiration
                    <CheckBadgeIcon className="w-3 h-3 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-semibold text-slate-700 text-sm">Dec 31, 2028</div>
            </div>
        </div>

        {/* Right: PDF View */}
        <div className="flex-1 bg-slate-200 p-6 overflow-hidden relative flex items-center justify-center">
            {/* Document Surface */}
            <div className="bg-white w-full max-w-[500px] h-[550px] shadow-2xl p-8 text-[10px] md:text-xs text-slate-500 font-serif leading-loose relative border border-slate-300 transform scale-100 overflow-hidden">
                
                {/* Header of Doc */}
                <div className="flex justify-between items-start mb-8 opacity-50">
                    <div className="w-24 h-8 bg-slate-100"></div>
                    <div className="text-right">
                        <div className="h-2 w-16 bg-slate-200 mb-1"></div>
                        <div className="h-2 w-12 bg-slate-200 ml-auto"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p>
                        <strong>1. PREMISES.</strong> Landlord hereby leases to Tenant and Tenant hereby hires from Landlord the premises described in Exhibit A.
                    </p>
                    <p>
                        <strong>2. TERM.</strong> The term of this Lease shall be for a period commencing on the Commencement Date and ending on the Expiration Date.
                    </p>
                    <div className="relative">
                        <p>
                            <strong>3. RENT PAYMENT SCHEDULE.</strong>
                        </p>
                        <p className="mt-1">
                            (a) <strong>Base Rent</strong>. Tenant shall pay to Landlord as Base Rent for the Premises the sum of 
                            <span className="relative inline-block mx-1 group/highlight">
                                <span className="relative z-10 bg-indigo-100 text-indigo-900 font-bold px-1 rounded border-b-2 border-indigo-500 cursor-pointer shadow-sm">
                                    Twelve Thousand Five Hundred Dollars ($12,500.00)
                                </span>
                                {/* Highlight Pulse Effect */}
                                <span className="absolute inset-0 bg-indigo-400/20 rounded animate-ping opacity-75"></span>
                                
                                {/* Connecting Line Visualization (Desktop) */}
                                <svg className="absolute top-1/2 right-full w-32 h-[100px] pointer-events-none hidden lg:block overflow-visible -translate-y-1/2 z-0 -mr-1">
                                    <path d="M 0 0 C -20 0, -50 0, -200 0" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dashFlow_1s_linear_infinite]" />
                                    <circle cx="0" cy="0" r="3" fill="#6366f1" />
                                </svg>
                            </span>
                            per month, payable in advance on the first day of each calendar month during the Term.
                        </p>
                    </div>
                    <p>
                        (b) <strong>Operating Expenses</strong>. In addition to Base Rent, Tenant shall pay its pro-rata share of Operating Expenses, which includes but is not limited to real estate taxes, insurance premiums, and common area maintenance costs.
                    </p>
                    <p>
                        (c) <strong>Security Deposit</strong>. Tenant shall deposit with Landlord the sum of $25,000.00 as security for the faithful performance of Tenant's obligations hereunder.
                    </p>
                </div>

                {/* Bottom Fader */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                
                {/* Signed Stamp */}
                <div className="absolute top-6 right-6 opacity-30 rotate-12 border-2 border-slate-400 p-2 rounded">
                    <span className="text-xs font-bold uppercase text-slate-400">Executed Copy</span>
                </div>
            </div>
        </div>
    </div>
);

export const ProductAiAbstraction: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans bg-grid-pattern relative">
            <BackgroundBlobs />
            
            {/* Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-sm font-bold uppercase tracking-wide mb-8 animate-fade-in shadow-sm bg-white/80 backdrop-blur">
                        <SparklesIcon className="w-5 h-5" />
                        Automated & Verified
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        Automated Extraction. <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Human Precision.
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Turn unstructured PDF leases into a structured, queryable database. 
                        Penaki abstracts over <strong>200 parameters</strong> in just <strong>2-5 minutes</strong> with unmatched accuracy.
                    </p>
                    
                    <div className="flex justify-center gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <button onClick={onBookDemo} className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all transform hover:-translate-y-1">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature 1: The Process Visualizer */}
            <ScrollAnimatedSection className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <ExtractionVisualizer />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
                        <div className="p-6 hover:-translate-y-1 transition-transform duration-300 bg-white/60 backdrop-blur rounded-2xl">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-indigo-100">
                                <DocumentTextIcon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Any PDF Format</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Scanned images, digital docs, or messy photocopies. Our OCR handles it all.</p>
                        </div>
                        <div className="p-6 hover:-translate-y-1 transition-transform duration-300 bg-white/60 backdrop-blur rounded-2xl">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-purple-100">
                                <SparklesIcon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Contextual AI</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Understands complex legal clauses, rent tables, and amendments.</p>
                        </div>
                        <div className="p-6 hover:-translate-y-1 transition-transform duration-300 bg-white/60 backdrop-blur rounded-2xl">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-emerald-100">
                                <ArrowDownTrayIcon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900">Excel & PDF Exports</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">Data is normalized and ready for your ERP or portfolio dashboard.</p>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Stats Bar */}
            <ScrollAnimatedSection className="py-20 bg-slate-900 text-white border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="group">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white mb-3 group-hover:scale-110 transition-transform duration-500">200+</div>
                        <p className="text-indigo-200 font-bold uppercase tracking-widest text-sm">Data Points Extracted</p>
                    </div>
                    <div className="group">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white mb-3 group-hover:scale-110 transition-transform duration-500">2 min</div>
                        <p className="text-purple-200 font-bold uppercase tracking-widest text-sm">Average Processing Time</p>
                    </div>
                    <div className="group">
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-white mb-3 group-hover:scale-110 transition-transform duration-500">99%</div>
                        <p className="text-green-200 font-bold uppercase tracking-widest text-sm">Verified Accuracy</p>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 2: Source Linking */}
            <ScrollAnimatedSection className="py-24 px-6 bg-white/80 backdrop-blur">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-6">
                            <CheckBadgeIcon className="w-4 h-4" /> Audit Ready
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Trust, but Verify. Instantly.</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            AI is fast, but accuracy is paramount. Penaki creates a <strong>Source-Linked Audit Trail</strong> for every single data point. 
                            Click any extracted field—like Rent, Dates, or Options—and the system immediately scrolls the PDF to the exact clause.
                        </p>
                    </div>
                    
                    <div className="relative w-full">
                        <MockSourceLinking />
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 3: Comparison */}
            <ScrollAnimatedSection className="py-24 bg-slate-50/50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900">The Penaki Advantage</h2>
                        <p className="text-slate-600 mt-4 text-lg">See how we stack up against traditional methods.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden opacity-90 hover:opacity-100 transition-all hover:shadow-xl group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ClockIcon className="w-32 h-32 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-700 mb-8">Manual Abstraction</h3>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 text-slate-600 text-lg">
                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div> 4-6 hours per lease
                                </li>
                                <li className="flex items-center gap-4 text-slate-600 text-lg">
                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div> High risk of human error
                                </li>
                                <li className="flex items-center gap-4 text-slate-600 text-lg">
                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div> No direct link to source
                                </li>
                                <li className="flex items-center gap-4 text-slate-600 text-lg">
                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div> Expensive ($100-300 per lease)
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border-4 border-indigo-500 shadow-2xl relative overflow-hidden transform md:-translate-y-6 hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-md">PENAKI AI</div>
                            <h3 className="text-3xl font-black text-indigo-900 mb-8">Penaki Automation</h3>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 text-slate-800 font-bold text-lg">
                                    <CheckBadgeIcon className="w-6 h-6 text-green-500" /> 2-5 minutes per lease
                                </li>
                                <li className="flex items-center gap-4 text-slate-800 font-bold text-lg">
                                    <CheckBadgeIcon className="w-6 h-6 text-green-500" /> 99% accuracy with HITL review
                                </li>
                                <li className="flex items-center gap-4 text-slate-800 font-bold text-lg">
                                    <CheckBadgeIcon className="w-6 h-6 text-green-500" /> Instant source linking
                                </li>
                                <li className="flex items-center gap-4 text-slate-800 font-bold text-lg">
                                    <CheckBadgeIcon className="w-6 h-6 text-green-500" /> Fraction of the cost
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Final CTA */}
            <ScrollAnimatedSection className="py-24 bg-indigo-900 text-white text-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black mb-8">Ready to accelerate your workflow?</h2>
                    <p className="text-indigo-200 mb-10 max-w-xl mx-auto text-lg">
                        Join forward-thinking real estate teams who are saving thousands of hours with Penaki.
                    </p>
                    <button onClick={onBookDemo} className="px-12 py-5 bg-white text-indigo-900 rounded-xl font-bold shadow-xl hover:bg-indigo-50 transition-all transform hover:-translate-y-1 text-lg">
                        Get Started Now
                    </button>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
