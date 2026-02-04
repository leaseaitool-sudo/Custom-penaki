
import React, { useState, useEffect } from 'react';
import { Footer } from '../Footer';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { View } from '../../types';
import '../../styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

const BackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute bg-sky-200 w-[40rem] h-[40rem] rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="absolute bg-indigo-200 w-[40rem] h-[40rem] rounded-full top-1/4 right-0 translate-x-1/2 mix-blend-multiply opacity-40 blur-[80px]"></div>
        <div className="hero-blob bg-cyan-100 w-[30rem] h-[30rem] rounded-full bottom-0 left-1/4 mix-blend-multiply opacity-40" style={{ animationDelay: '4s' }}></div>
    </div>
);

// --- MOCK UI COMPONENTS ---

const TypingIndicator = () => (
    <div className="flex gap-1.5 p-2 bg-white rounded-2xl rounded-bl-none w-fit border border-slate-200 shadow-sm items-center">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const MockSplitView = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => (prev + 1) % 5);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-auto min-h-[500px] md:h-[600px] w-full max-w-6xl mx-auto relative isolate">

            {/* Left Panel: Document Viewer */}
            <div className="w-full md:w-3/5 bg-slate-100 relative overflow-hidden flex flex-col border-b md:border-b-0 md:border-r border-slate-200 h-[300px] md:h-auto">
                {/* PDF Toolbar */}
                <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
                        <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-bold truncate">Lease Agreement - 100 Main St.pdf</span>
                    </div>
                    <div className="flex gap-2 text-slate-400 text-xs font-mono flex-shrink-0">
                        <span>Page 14 / 52</span>
                    </div>
                </div>

                {/* PDF Content Mock */}
                <div className="flex-1 p-6 md:p-12 overflow-hidden relative">
                    <div className="bg-white shadow-lg w-full h-[150%] p-6 md:p-12 text-[10px] md:text-xs text-slate-400 font-serif leading-loose origin-top transform scale-100 transition-transform duration-700 ease-out">
                        <h3 className="text-center font-bold text-slate-800 text-sm mb-8 uppercase tracking-widest border-b border-slate-200 pb-4">Article 14: Repair and Maintenance</h3>

                        <p className="mb-4">14.1 <strong>Landlord's Obligations.</strong> Landlord shall keep the structural portions of the Building, including the foundation, roof, and exterior walls, in good condition and repair.</p>

                        <div className={`transition-all duration-500 ${step >= 2 ? 'bg-yellow-100/50 p-1 -m-1 rounded' : ''}`}>
                            <p className="mb-4 relative">
                                14.2 <strong>Tenant's Obligations.</strong> Tenant shall, at its sole cost and expense, maintain and keep the interior of the Premises in good repair, including but not limited to,
                                <span className={`relative inline-block transition-colors duration-300 ${step >= 2 ? 'bg-yellow-300 text-slate-900 font-bold px-1 rounded mx-1' : ''}`}>
                                    HVAC systems exclusively serving the Premises
                                </span>,
                                electrical systems, and plumbing fixtures. Tenant shall maintain a service contract for the HVAC systems with a licensed contractor approved by Landlord.

                                {step >= 2 && (
                                    <div className="absolute -right-4 top-0 translate-x-full bg-indigo-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg animate-fade-in flex items-center gap-1 whitespace-nowrap z-20">
                                        <SparklesIcon className="w-3 h-3" /> Cited Source
                                    </div>
                                )}
                            </p>
                        </div>

                        <p className="mb-4">14.3 <strong>HVAC Replacement.</strong> Notwithstanding the foregoing, if the HVAC unit requires replacement during the last twelve (12) months of the Term, Landlord shall be responsible for such replacement, provided Tenant has maintained the service contract as required herein.</p>

                        {/* Decorative Skeleton Text */}
                        <div className="space-y-3 mt-8 opacity-20">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-2 bg-slate-800 rounded w-full"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: AI Chat */}
            <div className="w-full md:w-2/5 bg-white flex flex-col relative z-20 h-[300px] md:h-auto">
                {/* Chat Header */}
                <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Lease Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] text-slate-500 font-medium">Context Aware</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat History */}
                <div className="flex-1 bg-slate-50/50 p-4 space-y-4 overflow-y-auto">
                    {/* Intro */}
                    <div className="flex justify-center py-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">Today</span>
                    </div>

                    {/* User Query 1 */}
                    <div className={`flex justify-end animate-slide-up ${step >= 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-md max-w-[85%]">
                            Who pays for HVAC repairs?
                        </div>
                    </div>

                    {/* AI Response 1 (Typing -> Text) */}
                    <div className={`flex justify-start animate-slide-up ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                        {step === 1 ? (
                            <TypingIndicator />
                        ) : (
                            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm max-w-[90%] text-slate-700">
                                <p className="mb-2">The <strong>Tenant</strong> is responsible for maintenance and repair of HVAC systems exclusively serving the premises.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold transition-colors border border-indigo-100">
                                        <MagnifyingGlassIcon className="w-3 h-3" />
                                        <span>Section 14.2</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Query 2 */}
                    <div className={`flex justify-end animate-slide-up ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-md max-w-[85%]">
                            Is there an exception for replacement?
                        </div>
                    </div>

                    {/* AI Response 2 */}
                    <div className={`flex justify-start animate-slide-up ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                        {step === 4 ? (
                            <TypingIndicator />
                        ) : (
                            step > 4 && (
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm max-w-[90%] text-slate-700">
                                    <p>Yes. If replacement is required in the <strong>last 12 months</strong> of the term, the <strong>Landlord</strong> is responsible.</p>
                                    <div className="flex gap-2 mt-2">
                                        <button className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold transition-colors border border-indigo-100">
                                            <MagnifyingGlassIcon className="w-3 h-3" />
                                            <span>Section 14.3</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="relative">
                        <input
                            type="text"
                            disabled
                            placeholder="Ask a follow-up question..."
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none cursor-not-allowed"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white opacity-50">
                            <ArrowRightIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProductAiAssistant: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans bg-grid-pattern relative">
            <BackgroundBlobs />

            {/* Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-20 px-6 overflow-hidden">

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-bold uppercase tracking-wide mb-8 shadow-sm animate-fade-in bg-white/80 backdrop-blur">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            Conversational Intelligence
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                            Chat With Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Lease Documents.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Stop CTRL+F searching through 100-page PDFs.
                            Ask Penaki questions in plain English and get instant, legally-cited answers linking directly to the source clause.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <button onClick={onBookDemo} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-600 transition-all transform hover:-translate-y-1">
                                Book a Demo
                            </button>
                            <button onClick={() => onNavigate('abstract')} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all hover:shadow-lg">
                                Try it Live
                            </button>
                        </div>
                    </div>

                    <div className="animate-slide-up relative group mt-8 lg:mt-0" style={{ animationDelay: '0.3s' }}>
                        {/* Decorative background for the hero visual */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 relative">
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                                    <UserCircleIcon className="w-7 h-7" />
                                </div>
                                <div className="bg-slate-100 rounded-2xl px-4 py-3 text-slate-600 text-sm font-medium w-full relative">
                                    What are the insurance requirements for the tenant?
                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-100 transform rotate-45"></div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 flex-row-reverse">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-200 flex-shrink-0">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div className="bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4 text-slate-800 text-sm leading-relaxed w-full relative shadow-sm">
                                    <p className="mb-3">
                                        The Tenant must maintain <strong>General Liability Insurance</strong> with a minimum limit of <strong>$3,000,000</strong> per occurrence.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Source:</span>
                                        <div className="bg-white px-2 py-1 rounded border border-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-purple-100 transition-colors">
                                            <DocumentTextIcon className="w-3 h-3" /> Page 28
                                        </div>
                                    </div>
                                    <div className="absolute -right-2 top-6 w-4 h-4 bg-purple-50 border-t border-r border-purple-100 transform rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Section: The Workbench */}
            <ScrollAnimatedSection className="py-20 md:py-24 bg-slate-900 text-white">
                <div className="max-w-[90rem] mx-auto px-6">
                    <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Verify with Confidence</h2>
                        <p className="text-lg md:text-xl text-slate-400 font-light">
                            Penaki doesn't just hallucinate answers. It acts as a navigational guide,
                            instantly scrolling the document viewer to the exact sentence that answers your question.
                        </p>
                    </div>
                    <MockSplitView />
                </div>
            </ScrollAnimatedSection>

            {/* Capabilities Grid */}
            <ScrollAnimatedSection className="py-20 md:py-24 bg-slate-50 bg-grid-pattern">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Built for Commercial Real Estate Logic</h2>
                        <p className="text-slate-500 mt-2">Our model is fine-tuned on thousands of lease agreements.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group shadow-sm">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 mb-6 text-2xl font-bold border border-slate-100 group-hover:scale-110 transition-transform">
                                <DocumentTextIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Citation</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Every claim made by the AI is backed by a clickable reference link. Jump straight to the "Force Majeure" clause to verify.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group shadow-sm">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600 mb-6 text-2xl font-bold border border-slate-100 group-hover:scale-110 transition-transform">
                                <SparklesIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Complex Reasoning</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Ask multi-step questions like "If I exercise the renewal option in 2025, what is the deadline for notice and the new base rent?"
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group shadow-sm">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 mb-6 text-2xl font-bold border border-slate-100 group-hover:scale-110 transition-transform">
                                <CheckBadgeIcon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Term Comparison</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Quickly compare specific clauses against your company's standard language or across multiple documents in a bundle.
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Use Case Scenarios */}
            <ScrollAnimatedSection className="py-20 border-t border-slate-200 bg-slate-50/50 bg-grid-pattern">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                                For Asset Managers
                            </div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-4">"What are my rights?"</h4>
                            <p className="text-slate-600 mb-6">
                                Quickly clarify operational responsibilities. Who pays for HVAC replacement? Is the roof warranty transferable? Get answers in seconds during tenant negotiations.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-mono text-slate-500">
                                &gt; User: "Who maintains the parking lot?"<br />
                                &gt; AI: "Landlord is responsible for structural repairs (Section 8.1), but Tenant pays for restriping and cleaning via CAM charges (Section 4.3)."
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                                For Legal Teams
                            </div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-4">"Spot the risk."</h4>
                            <p className="text-slate-600 mb-6">
                                Rapidly audit leases for non-standard clauses during due diligence. Identify uncapped indemnities or missing holdover provisions instantly.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-mono text-slate-500">
                                &gt; User: "Summarize the Holdover clause."<br />
                                &gt; AI: "If Tenant remains past expiration, tenancy becomes Month-to-Month at 200% of the last Base Rent. (Section 18.1)"
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Final CTA */}
            <ScrollAnimatedSection className="py-24 text-center bg-indigo-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="relative z-10 px-6">
                    <h2 className="text-3xl sm:text-4xl font-black mb-8">Your documents are talking. <br />Are you listening?</h2>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={onBookDemo} className="px-10 py-4 bg-white text-indigo-900 rounded-xl font-bold shadow-xl hover:bg-indigo-50 transition-all transform hover:-translate-y-1">
                            Get Access
                        </button>
                    </div>
                </div>
            </ScrollAnimatedSection>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
