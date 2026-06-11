import React from 'react';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="w-64 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-32">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                            <div className="w-16 h-8 bg-slate-200 rounded"></div>
                        </div>
                        <div className="w-3/4 h-4 bg-slate-200 rounded mt-4"></div>
                        <div className="w-1/2 h-3 bg-slate-100 rounded mt-2"></div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="w-48 h-6 bg-slate-200 rounded"></div>
                    <div className="flex gap-2">
                        <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                        <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg">
                            <div className="flex items-center gap-4 w-1/3">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0"></div>
                                <div className="w-full space-y-2">
                                    <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                                    <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                            <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
                            <div className="w-32 h-4 bg-slate-200 rounded hidden md:block"></div>
                            <div className="w-20 h-8 bg-slate-200 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
