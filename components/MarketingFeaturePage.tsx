
import React from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MarketingFeaturePageProps {
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    onBack: () => void;
    onGetStarted: () => void;
    icon?: React.ReactNode;
}

export const MarketingFeaturePage: React.FC<MarketingFeaturePageProps> = ({ 
    title, 
    subtitle, 
    description, 
    features, 
    onBack, 
    onGetStarted,
    icon 
}) => {
    return (
        <div className="min-h-full bg-white">
            {/* Hero Section */}
            <section className="relative pt-20 pb-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 bg-sky-50 rounded-full blur-3xl opacity-60"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <button 
                        onClick={onBack}
                        className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
                    >
                        <div className="p-1 rounded-full bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                            <ArrowLeftIcon className="w-4 h-4" />
                        </div>
                        Back to Home
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                                {icon || <SparklesIcon className="w-4 h-4" />}
                                Feature Spotlight
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                                {title}
                            </h1>
                            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8">
                                {subtitle}
                            </p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={onGetStarted}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1"
                                >
                                    Get Started
                                </button>
                                <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                                    Book Demo
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative animate-slide-up">
                            <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-white border border-slate-200 shadow-2xl p-8 flex flex-col justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4">
                                        {icon && React.cloneElement(icon as React.ReactElement<any>, { className: 'w-8 h-8' })}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Why choose {title}?</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {description}
                                    </p>
                                    <div className="pt-6 border-t border-slate-200/60 grid grid-cols-1 gap-3">
                                        {features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <CheckIcon className="w-3 h-3 text-green-600 stroke-[3]" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-20 -z-10"></div>
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-sky-500 rounded-full blur-3xl opacity-20 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <ScrollAnimatedSection className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Transforming Commercial Real Estate</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Penaki leverages advanced AI to deliver {title.toLowerCase()} with unprecedented speed and accuracy. 
                        Whether you are managing a single asset or a global portfolio, our platform scales to meet your needs, 
                        ensuring you never miss a critical date or financial obligation.
                    </p>
                </div>
            </ScrollAnimatedSection>
        </div>
    );
};
    