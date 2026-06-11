import { create } from 'zustand';
import { Lease, PendingLease, PendingIndividualLeaseConfig, BatchTemplateData, SelectionSection } from '@/shared/types';

interface LeaseState {
    // Current active items
    selectedLease: Lease | null;
    leaseToReview: Lease | null;
    leaseForAmendment: Lease | null;
    leaseForInsights: Lease | null;
    activeChatLease: Lease | null;
    
    // Abstract creation state
    pendingLease: PendingLease | null;
    pendingIndividualLeases: PendingIndividualLeaseConfig[] | null;
    pendingBatchTemplates: BatchTemplateData | null;
    prefilledTemplateData: SelectionSection[] | undefined;
    pendingTemplateId: string | undefined;

    // Actions
    setSelectedLease: (lease: Lease | null) => void;
    setLeaseToReview: (lease: Lease | null) => void;
    setLeaseForAmendment: (lease: Lease | null) => void;
    setLeaseForInsights: (lease: Lease | null) => void;
    setActiveChatLease: (lease: Lease | null) => void;
    
    setPendingLease: (lease: PendingLease | null) => void;
    setPendingIndividualLeases: (configs: PendingIndividualLeaseConfig[] | null) => void;
    setPendingBatchTemplates: (data: BatchTemplateData | null) => void;
    setPrefilledTemplateData: (data: SelectionSection[] | undefined) => void;
    setPendingTemplateId: (id: string | undefined) => void;
}

export const useLeaseStore = create<LeaseState>((set) => ({
    selectedLease: null,
    leaseToReview: null,
    leaseForAmendment: null,
    leaseForInsights: null,
    activeChatLease: null,
    
    pendingLease: null,
    pendingIndividualLeases: null,
    pendingBatchTemplates: null,
    prefilledTemplateData: undefined,
    pendingTemplateId: undefined,

    setSelectedLease: (lease) => set({ selectedLease: lease }),
    setLeaseToReview: (lease) => set({ leaseToReview: lease }),
    setLeaseForAmendment: (lease) => set({ leaseForAmendment: lease }),
    setLeaseForInsights: (lease) => set({ leaseForInsights: lease }),
    setActiveChatLease: (lease) => set({ activeChatLease: lease }),
    
    setPendingLease: (lease) => set({ pendingLease: lease }),
    setPendingIndividualLeases: (configs) => set({ pendingIndividualLeases: configs }),
    setPendingBatchTemplates: (data) => set({ pendingBatchTemplates: data }),
    setPrefilledTemplateData: (data) => set({ prefilledTemplateData: data }),
    setPendingTemplateId: (id) => set({ pendingTemplateId: id }),
}));
