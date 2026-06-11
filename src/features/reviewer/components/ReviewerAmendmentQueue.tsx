
import React, { useMemo } from 'react';
import { Lease, User, LeaseStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { DocumentPlusIcon } from '@/shared/ui/Icons/DocumentPlusIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';

interface ReviewerAmendmentQueueProps {
  leases: Lease[];
  currentUser: User;
  onOpenWorkbench: (lease: Lease) => void;
  onBack: () => void;
}

export const ReviewerAmendmentQueue: React.FC<ReviewerAmendmentQueueProps> = ({ leases, currentUser, onOpenWorkbench, onBack }) => {
    const assignedAmendments = useMemo(() => {
        return leases.filter(l => 
            l.status === LeaseStatus.AMENDMENT_REVIEW && 
            l.reviewer?.email === currentUser.email
        );
    }, [leases, currentUser]);

    return (
        <ScrollAnimatedSection className="space-y-8 max-w-[95rem] mx-auto px-4">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-text-light hover:text-primary transition-colors p-2 rounded-md hover:bg-slate-100 -ml-2">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
                    <DocumentPlusIcon className="w-8 h-8 text-purple-500" />
                    Amendment Queue
                </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {assignedAmendments.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-surface border border-dashed border-border rounded-xl">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-text-light">No amendments assigned for review.</p>
                    </div>
                ) : (
                    assignedAmendments.map(lease => (
                        <div key={lease.id} className="bg-surface p-6 rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-text-main truncate">{lease.name}</h4>
                                <div className="text-xs text-text-light font-mono mt-1">{lease.id}</div>
                                <div className="mt-4 flex items-center gap-2 text-purple-900 font-medium text-sm">
                                    <DocumentPlusIcon className="w-4 h-4" />
                                    Amendment Review
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-purple-100 flex justify-end">
                                <button 
                                    onClick={() => onOpenWorkbench(lease)}
                                    className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium shadow-sm transition-colors text-sm"
                                >
                                    Review Amendment
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollAnimatedSection>
    );
};
