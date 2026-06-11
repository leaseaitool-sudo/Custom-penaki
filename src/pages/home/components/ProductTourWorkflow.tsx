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
import { MockupWindow, MockupUpload, MockupTemplates, MockupFieldSelection, MockupWorkbench, MockupDashboard, MockupExcel, MockupEscalation } from './ProductTourMockups';

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
                            className={`text-left p-4 sm:p-6 rounded-2xl transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${activeTab === step.id
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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${activeTab === step.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
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


export { ProductTourWorkflow };