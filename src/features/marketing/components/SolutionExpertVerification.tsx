
import React from 'react';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { ChatBubbleLeftRightIcon } from '@/shared/ui/Icons/ChatBubbleLeftRightIcon';
import { ShieldCheckIcon } from '@/shared/ui/Icons/ShieldCheckIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { TableCellsIcon } from '@/shared/ui/Icons/TableCellsIcon';
import { View } from '@/shared/types';
import '@/features/marketing/styles/HomePage.css';

interface PageProps {
    onNavigate: (view: View) => void;
    onBookDemo: () => void;
}

// --- VISUALIZATION COMPONENTS ---

const MockReviewWorkbench = () => (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[550px] max-w-6xl mx-auto relative group isolate">
        {/* Toolbar */}
        <div className="absolute top-0 left-0 w-full h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
            <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" /> Lease ID: L-8821 (Expert Review Mode)
                </span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Verification Progress</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[75%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
                <span className="text-xs font-bold text-green-600">75%</span>
            </div>
        </div>

        {/* Left: Data Fields */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-200 pt-12 flex flex-col relative z-10">
            <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {/* Field 1: Verified */}
                <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Landlord</span>
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckIcon className="w-3 h-3" /> Verified
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Pinnacle Property Group</p>
                </div>

                {/* Field 2: Active/Focus */}
                <div className="bg-white p-5 rounded-xl border-2 border-indigo-500 shadow-xl relative transform scale-105 transition-transform z-20">
                    <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-500 rotate-45 transform origin-center border-r border-t border-white/20"></div>
                    <div className="relative z-10 bg-white">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">Base Rent (Monthly)</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold animate-pulse">Reviewing</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <input type="text" value="$12,500.00" className="w-full text-xl font-bold text-slate-800 border-b border-slate-200 focus:border-indigo-500 outline-none bg-transparent pb-1" readOnly />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-md flex items-center justify-center gap-1">
                                <CheckIcon className="w-3.5 h-3.5" /> Confirm
                            </button>
                            <button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 rounded-lg transition-colors">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Field 3: Pending */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Commencement Date</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">Jan 01, 2024</p>
                </div>
                
                {/* Field 4: Pending */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Security Deposit</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">$25,000.00</p>
                </div>
            </div>
        </div>

        {/* Right: Document Viewer */}
        <div className="flex-1 bg-slate-200 pt-12 relative overflow-hidden flex items-center justify-center">
            {/* Zoom Controls Mock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg flex gap-4 z-30">
                <span className="text-slate-400 cursor-pointer hover:text-slate-600 font-bold">-</span>
                <span className="text-slate-600 text-xs font-bold">120%</span>
                <span className="text-slate-400 cursor-pointer hover:text-slate-600 font-bold">+</span>
            </div>

            <div className="bg-white w-[90%] h-[95%] shadow-2xl rounded-sm p-8 md:p-16 text-[8px] md:text-[10px] text-slate-400 font-serif leading-loose relative overflow-hidden transform transition-transform duration-700">
                {/* Document Content */}
                <div className="space-y-6 max-w-3xl mx-auto opacity-80">
                    <h3 className="text-center text-slate-800 font-bold text-sm mb-8 uppercase tracking-widest border-b border-slate-200 pb-4">Commercial Lease Agreement</h3>
                    <p>THIS LEASE AGREEMENT is made and entered into this 1st day of January, 2024, by and between Pinnacle Property Group ("Landlord"), and TechFlow Systems Inc. ("Tenant").</p>
                    <p>1. <strong>PREMISES</strong>. Landlord hereby leases to Tenant and Tenant hereby leases from Landlord the premises located at 100 Innovation Blvd, Suite 400.</p>
                    <p>
                        2. <strong>TERM</strong>. The term of this Lease shall be for five (5) years commencing on January 1, 2024 and ending on December 31, 2028.
                    </p>
                    <p className="relative">
                        3. <strong>RENT</strong>. Tenant agrees to pay to Landlord as Base Rent the sum of <span className="bg-indigo-100 text-indigo-900 border-b-2 border-indigo-500 font-bold px-1 py-0.5 rounded-sm relative z-20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            Twelve Thousand Five Hundred Dollars ($12,500.00)
                        </span> per month, payable in advance on the first day of each month.
                        
                        {/* Connecting Line Visual */}
                        <svg className="absolute top-1/2 left-0 w-0 h-0 overflow-visible z-30 pointer-events-none hidden md:block">
                            <path d="M -300 0 C -150 0, -100 0, 0 0" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-dash-flow opacity-60" />
                            <circle cx="0" cy="0" r="3" fill="#6366f1" />
                        </svg>
                    </p>
                    <p>4. <strong>SECURITY DEPOSIT</strong>. Upon execution of this Lease, Tenant shall deposit the sum of Twenty Five Thousand Dollars ($25,000.00) as security for the performance of Tenant's obligations.</p>
                    
                    <div className="space-y-2 mt-8 opacity-20">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-2 bg-slate-800 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const MockChatInteraction = () => (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-md mx-auto relative flex flex-col h-[320px]">
        <div className="bg-slate-900 p-4 flex items-center gap-3 shrink-0">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-slate-800">
                    SJ
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div>
                <h4 className="font-bold text-white text-sm">Sarah Jenkins</h4>
                <p className="text-slate-400 text-xs">Senior CRE Analyst</p>
            </div>
        </div>
        
        <div className="flex-1 p-4 space-y-4 bg-slate-50 overflow-hidden relative">
            <div className="flex justify-end animate-slide-up">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[85%] shadow-md">
                    <p>Hey Sarah, the Rent Commencement Date seems to be missing from the AI extract. Can you check?</p>
                    <span className="text-[9px] text-indigo-200 block text-right mt-1 opacity-80">10:42 AM</span>
                </div>
            </div>
            
            <div className="flex justify-start animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="bg-white border border-slate-200 text-slate-700 p-3 rounded-2xl rounded-tl-none text-xs max-w-[85%] shadow-sm">
                    <p className="mb-2">Good catch. It was hidden in the <strong>3rd Amendment</strong> rather than the main lease.</p>
                    <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 text-slate-500 italic mb-2 border-l-2 border-l-indigo-400">
                        "Rent shall commence 90 days following the delivery of possession..."
                    </div>
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-1.5 rounded-lg border border-green-100">
                        <CheckBadgeIcon className="w-4 h-4" />
                        <span>Updated to April 01, 2024</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">10:45 AM</span>
                </div>
            </div>
        </div>
        
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="h-9 bg-slate-100 rounded-full w-full text-xs text-slate-400 flex items-center px-4">
                Type a message...
            </div>
        </div>
    </div>
);

export const SolutionExpertVerification: React.FC<PageProps> = ({ onNavigate, onBookDemo }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 bg-grid-pattern relative">
            {/* Hero Section */}
            <section className="relative pt-16 md:pt-20 pb-20 px-6 overflow-hidden bg-grid-pattern">
                <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl z-0"></div>
                <div className="absolute -top-40 right-0 w-[800px] h-[800px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-[120px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900 text-white text-sm font-bold uppercase tracking-wide mb-8 animate-fade-in shadow-xl shadow-indigo-900/20">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                        Human-in-the-Loop Verification
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight animate-slide-up">
                        AI Speed. <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Expert Precision.
                        </span>
                    </h1>
                    
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
                        For complex portfolios and high-stakes assets, rely on our managed service. 
                        Our CRE experts validate every clause extracted by <strong>Penaki AI</strong>, ensuring 100% data integrity before it touches your ERP.
                    </p>
                    
                    <button onClick={onBookDemo} className="px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 animate-slide-up" style={{animationDelay: '0.2s'}}>
                        Book a Demo
                    </button>
                </div>
            </section>

            {/* Feature 1: The Workbench */}
            <ScrollAnimatedSection className="py-20 px-6 max-w-[95rem] mx-auto">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">The Verification Workbench</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        See exactly how our experts ensure accuracy. Every data point is visually linked to its source in the document, allowing for rapid audit and validation by our team before final delivery.
                    </p>
                </div>
                <div className="animate-slide-up">
                    <MockReviewWorkbench />
                </div>
            </ScrollAnimatedSection>

            {/* Feature 2: Collaborative Resolution */}
            <ScrollAnimatedSection className="py-24 bg-white border-y border-slate-200 bg-grid-pattern">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-200 rounded-full blur-[80px] opacity-20"></div>
                            <MockChatInteraction />
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider mb-4 text-xs bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                            <ChatBubbleLeftRightIcon className="w-4 h-4" /> Direct Communication
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Direct Line to Your Reviewer</h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Don't leave ambiguity in a spreadsheet comment. Chat directly with the abstractor working on your lease. 
                            Resolve missing pages, clarify complex clauses, and approve exceptions in real-time within the platform.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Context-aware chat history linked to specific leases', 
                                'Instant notifications for clarifications', 
                                'Escalation path for legal review',
                                'Audit trail of all decisions'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium group">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Feature 3: Quality Process Pipeline */}
            <ScrollAnimatedSection className="py-24 px-6 bg-slate-50 bg-grid-pattern">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900">4-Step Quality Assurance Pipeline</h2>
                        <p className="text-slate-600 mt-4 text-lg">From raw PDF to verified ERP upload in 12-36 hours.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-slate-200 -z-10">
                            <div className="h-full bg-gradient-to-r from-slate-900 via-indigo-600 to-green-500 w-full rounded-full"></div>
                        </div>

                        {[
                            { 
                                title: 'Penaki AI Extraction', 
                                desc: 'Penaki AI parses documents and proposes initial data instantly.', 
                                icon: <ClockIcon className="w-6 h-6" />, 
                                color: 'bg-slate-900',
                                badge: 'Automated' 
                            },
                            { 
                                title: 'Expert Review', 
                                desc: 'CRE professionals validate every field against the source.', 
                                icon: <UserCircleIcon className="w-6 h-6" />, 
                                color: 'bg-indigo-600',
                                badge: 'Human-in-Loop' 
                            },
                            { 
                                title: 'Quality Check', 
                                desc: 'Senior reviewers audit complex clauses and financials.', 
                                icon: <ShieldCheckIcon className="w-6 h-6" />, 
                                color: 'bg-purple-600',
                                badge: 'Final Audit' 
                            },
                            { 
                                title: 'Verified Delivery', 
                                desc: 'Clean JSON, Excel, or PDF report ready for integration.', 
                                icon: <TableCellsIcon className="w-6 h-6" />, 
                                color: 'bg-green-600',
                                badge: 'Ready' 
                            },
                        ].map((step, idx) => (
                            <div key={idx} className="relative group">
                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center h-full hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-primary/50 transition-all"></div>
                                    
                                    <div className={`w-16 h-16 mx-auto rounded-2xl ${step.color} text-white flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                                        {step.icon}
                                    </div>
                                    
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border border-slate-100 rounded-full px-2 py-0.5 bg-slate-50">
                                        Step 0{idx + 1}: {step.badge}
                                    </span>
                                    
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollAnimatedSection>

            {/* Final CTA */}
            <section className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -ml-32 -mb-32"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Trust your data completely.</h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Combine the blazing speed of <strong>Penaki AI</strong> with the certainty of human expertise. 
                        Get your first verified lease abstract in 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={onBookDemo} className="px-10 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center gap-2">
                            Book a Demo
                        </button>
                    </div>
                </div>
            </section>

            <Footer onNavigate={onNavigate} />
        </div>
    );
};
