
import React from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { Footer } from './Footer';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { BoltIcon } from './icons/BoltIcon';
import { View } from '../types';
import '../styles/HomePage.css'; // Import for bg-grid-pattern

// Importing icons needed for Value Section
import { MapPinIcon } from './icons/MapPinIcon';
import { BellIcon } from './icons/BellIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CircleStackIcon } from './icons/CircleStackIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon';

interface PricingPageProps {
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

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-start gap-3 text-sm text-slate-600">
        <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckIcon className="w-3 h-3 stroke-[3]" />
        </div>
        <span className="flex-1 font-medium">{text}</span>
    </li>
);

const PricingCard: React.FC<{
    title: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    onBookDemo: () => void;
    accentColor: string;
    baseColor: string; 
}> = ({ title, price, period, description, features, isPopular, buttonText, onBookDemo, accentColor, baseColor }) => (
    <div className={`relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full group ${isPopular ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-xl' : 'border-slate-200 shadow-lg'}`}>
        
        {isPopular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <SparklesIcon className="w-3 h-3" /> Best Value
            </div>
        )}

        <div className="mb-8">
            <h3 className={`text-xl font-black uppercase tracking-wide mb-3 ${accentColor}`}>{title}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{price}</span>
                {period && <span className="text-slate-500 font-medium text-sm">{period}</span>}
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex-1 mb-8">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>
            <ul className="space-y-4">
                {features.map((feature, idx) => (
                    <FeatureItem key={idx} text={feature} />
                ))}
            </ul>
        </div>

        <button 
            onClick={onBookDemo}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-slate-500/25'}`}
        >
            {buttonText}
        </button>
    </div>
);

const FeatureHighlightCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    delay: string; 
    colorClass: string 
}> = ({ title, description, icon, delay, colorClass }) => (
    <div 
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group animate-slide-up"
        style={{ animationDelay: delay }}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorClass}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6 text-white' })}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
);

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden bg-grid-pattern relative">
            <BackgroundBlobs />
            
            {/* Hero - Matching SolutionAnalytics Style */}
            <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-slate-900 text-white z-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold uppercase tracking-wide mb-6 animate-fade-in">
                        <BoltIcon className="w-5 h-5" />
                        Flexible & Transparent
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight animate-slide-up">
                        Transparent Price, <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Exponential Value.
                        </span>
                    </h1>
                    
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        Choose the speed of AI or the certainty of human verification. 
                        No hidden fees, just value delivered.
                    </p>
                </div>
            </section>

            {/* Category 1: Penaki Pro (AI) */}
            <ScrollAnimatedSection className="px-6 py-16 max-w-7xl mx-auto relative z-10">
                {/* Visual anchor for the grid background */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-sky-50/50 to-transparent -z-10 rounded-[3rem] blur-3xl"></div>
                
                <div className="relative mb-12 text-center">
                    <div className="inline-flex p-4 bg-white/80 backdrop-blur rounded-2xl text-sky-600 mb-6 shadow-sm border border-sky-100">
                        <SparklesIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 bg-transparent">Penaki Pro</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        Pure AI speed. Ideal for portfolio scanning, preliminary data extraction, and low-risk document processing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:px-12">
                    {/* Pay-As-You-Go ($19) */}
                    <PricingCard 
                        title="Pay-As-You-Go"
                        price="$19"
                        period="/ lease"
                        description="Access the full power of the Penaki AI suite. Perfect for individual assets or small batches."
                        baseColor="bg-sky-500"
                        accentColor="text-sky-600"
                        buttonText="Start Abstracting"
                        onBookDemo={onBookDemo}
                        features={[
                            "Instant AI Extraction",
                            "200+ Data Point Extraction",
                            "Asset Mapping & Geolocation",
                            "Critical Event Reminders",
                            "AI Lease Assistant (Chat)",
                            "Portfolio Analytics Dashboard",
                            "Unlimited Document Storage",
                            "Rent Roll Automation",
                            "Instant PDF & Excel Export"
                        ]}
                    />

                    {/* Annual Contract */}
                    <PricingCard 
                        title="Annual Contract"
                        price="Custom"
                        description="For high-volume portfolios needing consistent throughput and support."
                        baseColor="bg-indigo-600"
                        accentColor="text-indigo-600"
                        buttonText="Contact Sales"
                        onBookDemo={onBookDemo}
                        isPopular={false}
                        features={[
                            "Everything in Pay-As-You-Go",
                            "Unlimited runs of all workflows per agreement",
                            "Volume-based per-agreement pricing",
                            "Priority Support",
                            "Lock in predictable annual pricing",
                            "Dedicated Success Manager",
                            "SSO & Advanced Security"
                        ]}
                    />
                </div>
            </ScrollAnimatedSection>

            {/* Category 2: Penaki Apex (Human) */}
            <ScrollAnimatedSection className="px-6 pb-24 max-w-7xl mx-auto relative z-10">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent -z-10 rounded-[3rem] blur-3xl"></div>

                <div className="relative mb-16 text-center">
                    <div className="inline-flex p-4 bg-white/80 backdrop-blur rounded-2xl text-emerald-600 mb-6 shadow-sm border border-emerald-100">
                        <ShieldCheckIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4 bg-transparent">Penaki Apex</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        AI + Human Expert Review. 100% data integrity for critical assets, amendments, and estoppels.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:px-12">
                    {/* Pay-As-You-Go ($69) */}
                    <PricingCard 
                        title="Pay-As-You-Go"
                        price="$69"
                        period="/ lease"
                        description="Expert review on demand. We verify the AI output for total peace of mind."
                        baseColor="bg-emerald-600"
                        accentColor="text-emerald-600"
                        buttonText="Get Verified"
                        onBookDemo={onBookDemo}
                        isPopular={true}
                        features={[
                            "Everything in Penaki Pro",
                            "Verified by Senior CRE Experts",
                            "Includes Master Lease + Amendments",
                            "Includes Estoppels & Rent Letters",
                            "12-36 Hour Turnaround",
                            "Source-Linked Audit Trail",
                            "100% Accuracy Guarantee"
                        ]}
                    />

                    {/* Annual Contract */}
                    <PricingCard 
                        title="Annual Contract"
                        price="Custom"
                        description="Complete outsourcing of your lease administration data entry department."
                        baseColor="bg-slate-800"
                        accentColor="text-slate-800"
                        buttonText="Talk to an Expert"
                        onBookDemo={onBookDemo}
                        features={[
                            "Everything in Pay-As-You-Go",
                            "Unlimited runs of all workflows per agreement",
                            "Volume-based per-agreement pricing",
                            "Priority Support",
                            "Lock in predictable annual pricing",
                            "12-36 Hour Turnaround",
                            "Multi-Team Collaboration Workflows"
                        ]}
                    />
                </div>
            </ScrollAnimatedSection>

            {/* Which Plan is Right? */}
            <ScrollAnimatedSection className="py-20 px-6 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Find Your Perfect Fit</h2>
                        <p className="text-slate-500 text-lg">Match your needs to the right abstraction strategy.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-50/80 backdrop-blur p-8 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-sky-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-sky-600">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Penaki Pro</h3>
                            </div>
                            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                Best for rapid portfolio ingestion, searchability, and preliminary due diligence. Use this when speed is the priority and you need structured data instantly for analysis.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> Instant Results
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> High Volume Back-filling
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> Search & Discovery
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 backdrop-blur p-8 rounded-3xl border border-slate-200 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Penaki Apex</h3>
                            </div>
                            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                Essential for system migration and critical date tracking. Use this when accuracy is non-negotiable and you need a legally reliable abstract verified by humans.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> System Migration Ready
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> Financial Auditing
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <CheckIcon className="w-4 h-4 text-green-500 stroke-[3]" /> Liability Protection
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Why We Win - Value Section */}
            <ScrollAnimatedSection className="py-24 px-6 relative overflow-hidden z-20">
                <div className="absolute inset-0 bg-slate-900 skew-y-3 transform origin-bottom-left scale-110 -z-10"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Why Penaki Wins on Value</h2>
                        <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            We don't just extract data; we empower your entire portfolio. 
                            Our platform is a complete operating system for lease intelligence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureHighlightCard 
                            title="AI-Powered Extraction"
                            description="Proprietary models tuned for commercial real estate extract 200+ data points in minutes, not hours."
                            icon={<SparklesIcon />}
                            colorClass="bg-indigo-500"
                            delay="0s"
                        />
                        <FeatureHighlightCard 
                            title="Human-in-the-Loop"
                            description="Penaki Apex ensures 100% accuracy with senior CRE experts reviewing every field against the source."
                            icon={<ShieldCheckIcon />}
                            colorClass="bg-emerald-500"
                            delay="0.1s"
                        />
                        <FeatureHighlightCard 
                            title="Portfolio Analytics"
                            description="Visualize occupancy costs, revenue forecasts, and expiration risk across your entire global footprint."
                            icon={<ChartBarIcon />}
                            colorClass="bg-blue-500"
                            delay="0.2s"
                        />
                        <FeatureHighlightCard 
                            title="Critical Date Alerts"
                            description="Never miss a renewal option or rent escalation. Automated reminders keep your team proactive."
                            icon={<BellIcon />}
                            colorClass="bg-rose-500"
                            delay="0.3s"
                        />
                        <FeatureHighlightCard 
                            title="Document Repository"
                            description="Unlimited, secure cloud storage for all your leases, amendments, and estoppels. Fully searchable."
                            icon={<CircleStackIcon />}
                            colorClass="bg-slate-600"
                            delay="0.4s"
                        />
                        <FeatureHighlightCard 
                            title="Interactive Chat"
                            description="Ask complex questions about your leases in plain English and get instant citations."
                            icon={<ChatBubbleLeftRightIcon />}
                            colorClass="bg-purple-500"
                            delay="0.5s"
                        />
                        <FeatureHighlightCard 
                            title="Asset Mapping"
                            description="Geospatial visualization of your assets with automated address verification and clustering."
                            icon={<MapPinIcon />}
                            colorClass="bg-sky-500"
                            delay="0.6s"
                        />
                        <FeatureHighlightCard 
                            title="Fast Turnaround"
                            description="Get AI results instantly and verified abstracts within 12-36 hours. Speed meets certainty."
                            icon={<ClockIcon />}
                            colorClass="bg-orange-500"
                            delay="0.7s"
                        />
                        <FeatureHighlightCard 
                            title="Due Diligence"
                            description="Accelerate M&A with automated document auditing and encumbrance detection."
                            icon={<MagnifyingGlassIcon />}
                            colorClass="bg-teal-500"
                            delay="0.8s"
                        />
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Trust Section */}
            <ScrollAnimatedSection className="py-24 px-6 text-center relative overflow-hidden z-10">
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                        Ready to modernize your portfolio?
                    </h2>
                    <p className="text-xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto">
                        Join forward-thinking asset managers who are saving 80% on abstraction costs and eliminating data risk.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button onClick={onBookDemo} className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                            Book a Demo <span className="opacity-70">→</span>
                        </button>
                    </div>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
