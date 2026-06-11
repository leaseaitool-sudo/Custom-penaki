
import React, { useState, useEffect, useRef } from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { useScrollAnimation } from '@/shared/hooks/useScrollAnimation';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { QuoteIcon } from '@/shared/ui/Icons/QuoteIcon';
import { FAQSection } from '@/features/marketing/components/FAQSection';
import { User, Lease, LeaseStatus } from '@/shared/types';

import '@/features/marketing/styles/HomePage.css';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '@/shared/ui/Icons/ExclamationTriangleIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';
import { ArrowLeftRightIcon } from '@/shared/ui/Icons/ArrowLeftRightIcon';
import { ShieldCheckIcon } from '@/shared/ui/Icons/ShieldCheckIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { ChartBarIcon } from '@/shared/ui/Icons/ChartBarIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { DocumentArrowDownIcon } from '@/shared/ui/Icons/DocumentArrowDownIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { InteractiveLeaseSlider } from '@/features/leases/components/InteractiveLeaseSlider';
import { BookDemoModal } from '@/features/marketing/components/BookDemoModal';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { ArrowDownTrayIcon } from '@/shared/ui/Icons/ArrowDownTrayIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';

interface HomePageProps {
    onGetStarted: () => void;
    user?: User | null;
    leases?: Lease[];
    /** Opens the Book Demo modal — Calendly integration pending */
    onBookDemo: () => void;
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
                        <span className="text-sm font-bold text-slate-700 font-mono text-right">11/01/2002 - <br />01/21/2025</span>
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

import { ProductTourWorkflow } from './components/ProductTourWorkflow';
import { BackgroundBlobs, PerformanceMetricCard, StatCard, DashboardWidget, AnimatedCounter } from './components/HomePageWidgets';

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted, user, leases = [], onBookDemo }) => {

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
                                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
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
                            Stop Leaving Revenue <br />
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
                            From Chaos to <br />
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
                        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">Your Data, <br />Protected at Every Step.</h2>
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
            {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} />}


        </div>
    );
};
