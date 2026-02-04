
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lease, User } from '../types';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface LeaseInsightsPageProps {
  lease: Lease;
  onBack: () => void;
  onGenerateSummary: (lease: Lease) => Promise<void>;
  onAskAgent: (lease: Lease, history: { role: string, text: string }[], question: string) => Promise<string>;
  currentUser: User | null;
}

// Helper to parse key-value pairs for cards (e.g. "Base Rent: $10,000")
const parseKeyValuePairs = (text: string) => {
    return text.split('\n').map(line => {
        // Remove bullet points and numbering
        const cleanLine = line.replace(/^[-•*]|\d+\./g, '').trim();
        // Split by first colon
        const separatorIndex = cleanLine.indexOf(':');
        if (separatorIndex > 0) {
            return {
                label: cleanLine.substring(0, separatorIndex).replace(/\*\*/g, '').trim(),
                value: cleanLine.substring(separatorIndex + 1).replace(/\*\*/g, '').trim()
            };
        }
        return null;
    }).filter((item): item is { label: string, value: string } => item !== null && item.value.length > 0);
};

// Simple Markdown-like parser for the summary (handles bolding and lists)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            {lines.map((line, idx) => {
                // Headers (lines ending with :)
                if (line.trim().endsWith(':')) {
                    return <h4 key={idx} className="font-bold text-slate-800 mt-4 mb-2 text-sm uppercase tracking-wide">{line.replace(/\*\*/g, '')}</h4>;
                }
                // Bullet points
                if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
                    const content = line.replace(/^[-•\d+\.]\s*/, '');
                    return (
                        <div key={idx} className="flex gap-3 items-start">
                            <span className="text-primary mt-1.5 w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                            <span dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>') }}></span>
                        </div>
                    );
                }
                // Regular Paragraphs
                if (line.trim() === '') return null;
                return <p key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>') }}></p>;
            })}
        </div>
    );
};

const SummaryWidget: React.FC<{ lease: Lease; isGenerating: boolean; onGenerate: () => void }> = ({ lease, isGenerating, onGenerate }) => {
    const [activeSection, setActiveSection] = useState<string>('Executive Summary');

    // Parse the AI summary into sections
    const sections = useMemo(() => {
        if (!lease.aiSummary) return [];
        
        let parsedSections: { title: string, content: string }[] = [];

        try {
            // 1. Clean Markdown Code Fences (Fixing the "Code Showing" issue)
            let cleanJson = lease.aiSummary.trim();
            // Remove ```json and ``` wrap if present
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```(json)?|```$/g, '');
            }
            
            // 2. Parse JSON
            const json = JSON.parse(cleanJson);
            
            // 3. Map Schema Keys to UI Titles
            const keyMap: Record<string, string> = {
                executiveSummary: 'Executive Summary',
                criticalDates: 'Critical Dates',
                financials: 'Financials',
                clauses: 'Key Clauses',
                riskAssessment: 'Risk Assessment'
            };

            // Order we want them in the sidebar
            const orderedKeys = ['executiveSummary', 'criticalDates', 'financials', 'clauses', 'riskAssessment'];

            orderedKeys.forEach(key => {
                if (json[key]) {
                    // Ensure content is string for rendering
                    const content = typeof json[key] === 'string' 
                        ? json[key] 
                        : Array.isArray(json[key]) 
                            ? json[key].join('\n') // Fallback if schema sends array
                            : JSON.stringify(json[key]); 
                    
                    parsedSections.push({
                        title: keyMap[key] || key,
                        content: content
                    });
                }
            });

        } catch (e) {
            console.error("JSON Parse Error in SummaryWidget", e);
            // Fallback for legacy text format or failed JSON
            return [{ title: 'Overview', content: lease.aiSummary }];
        }

        return parsedSections;
    }, [lease.aiSummary]);

    // Set initial active section
    useEffect(() => {
        if (sections.length > 0 && !sections.find(s => s.title === activeSection)) {
            setActiveSection(sections[0].title);
        }
    }, [sections]);

    const activeContent = sections.find(s => s.title === activeSection)?.content || '';

    // Specialized Renderers
    const renderContent = () => {
        // Card View for Financials & Critical Dates if parsable
        if (activeSection === 'Financials' || activeSection === 'Critical Dates') {
            const items = parseKeyValuePairs(activeContent);
            if (items.length > 0) {
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                        {items.map((item, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all hover:shadow-sm">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">{item.label}</p>
                                <p className="text-lg font-bold text-slate-800 break-words">{item.value}</p>
                            </div>
                        ))}
                    </div>
                );
            }
        }
        
        // Default Text View
        return (
            <div className="animate-fade-in">
                <FormattedText text={activeContent} />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden relative">
            {/* Widget Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-800 truncate">Lease Abstract: {lease.name}</h3>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            {isGenerating ? 'AI Generating...' : `Generated by Penaki AI • ${new Date().toLocaleDateString()}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isGenerating && <SpinnerIcon className="w-4 h-4 animate-spin text-primary" />}
                    {!isGenerating && lease.aiSummary && (
                        <button className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-primary transition-colors border border-transparent hover:border-slate-200" title="Export Summary">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Split View */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-48 bg-slate-50 border-r border-slate-200 p-4 hidden md:flex flex-col gap-1 overflow-y-auto flex-shrink-0">
                    {sections.length > 0 ? (
                        sections.map(section => (
                            <button
                                key={section.title}
                                onClick={() => setActiveSection(section.title)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all flex justify-between items-center ${
                                    activeSection === section.title 
                                    ? 'bg-white text-primary border border-slate-200 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                            >
                                {section.title}
                                {activeSection === section.title && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                            </button>
                        ))
                    ) : (
                        // Loading Skeletons
                        [1,2,3,4].map(i => (
                            <div key={i} className="h-8 w-full bg-slate-200/50 rounded-lg animate-pulse"></div>
                        ))
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto bg-white relative custom-scrollbar">
                    {/* AI Badge */}
                    {!isGenerating && lease.aiSummary && (
                        <div className="absolute top-6 right-8 flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100 shadow-sm z-10">
                            <SparklesIcon className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Generated</span>
                        </div>
                    )}

                    {isGenerating && !lease.aiSummary ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-primary animate-spin"></div>
                                <SparklesIcon className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">Analyzing Lease Data</h3>
                                <p className="text-slate-500 text-sm mt-1">Our AI is reading extracted clauses to build your summary...</p>
                            </div>
                        </div>
                    ) : !lease.aiSummary ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <DocumentTextIcon className="w-12 h-12 mb-2 opacity-20" />
                            <p>Summary could not be generated.</p>
                            <button onClick={onGenerate} className="mt-4 text-xs font-bold text-primary hover:underline">Try Again</button>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 pr-32">
                                {activeSection}
                            </h2>
                            {renderContent()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const LeaseInsightsPage: React.FC<LeaseInsightsPageProps> = ({ lease, onBack, onGenerateSummary, onAskAgent, currentUser }) => {
    // Summary State
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    
    // Chat State
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: "Hello! I'm your lease assistant. Ask me anything about the lease terms, dates, or financial obligations." }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Load - Generate Summary if not exists
    useEffect(() => {
        if (!lease.aiSummary && !isGeneratingSummary) {
            const generate = async () => {
                setIsGeneratingSummary(true);
                try {
                    await onGenerateSummary(lease);
                } catch (e) {
                    console.error("Failed to generate summary", e);
                } finally {
                    setIsGeneratingSummary(false);
                }
            };
            generate();
        }
    }, [lease.id]); // Only run on lease ID change/mount

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAgentTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isAgentTyping) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsAgentTyping(true);

        try {
            // Prepare history for context
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            const response = await onAskAgent(lease, history, userMsg);
            
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble analyzing the data right now. Please try again." }]);
        } finally {
            setIsAgentTyping(false);
        }
    };

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 pb-12 flex flex-col h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-border pb-4 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-800 transition-all">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-text-main flex items-center gap-2">
                        {lease.name}
                        <span className="text-primary bg-sky-50 p-1 rounded-full"><SparklesIcon className="w-5 h-5" /></span>
                    </h1>
                    <p className="text-sm text-text-light font-mono opacity-70 ml-0.5">{lease.id}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                
                {/* LEFT: Executive Summary Widget */}
                <div className="lg:w-7/12 flex flex-col h-full">
                    <SummaryWidget 
                        lease={lease} 
                        isGenerating={isGeneratingSummary} 
                        onGenerate={() => onGenerateSummary(lease)} 
                    />
                </div>

                {/* RIGHT: AI Agent Chat */}
                <div className="lg:w-5/12 flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden h-full relative">
                    <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shadow-sm z-10 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md border border-white text-white">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-sm">Lease Assistant</h2>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Context Aware
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                                        isUser 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                    }`}>
                                        {isUser ? (
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                        ) : (
                                            <FormattedText text={msg.text} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {isAgentTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef}></div>
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about rent, dates, or clauses..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-inner"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isAgentTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-focus disabled:opacity-50 disabled:hover:bg-primary transition-colors shadow-md"
                            >
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </ScrollAnimatedSection>
    );
};