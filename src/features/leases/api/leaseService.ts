import { Lease, LeaseStatus, User, Role, AbstractedData, WorkflowStage } from '@/shared/types';

let mockLeases: Lease[] = [];

export const fetchLeases = async (user: User, limit: number = 100, offset: number = 0): Promise<Lease[]> => {
    return mockLeases;
};

export const createLease = async (
    lease: Partial<Lease>,
    userId: string,
    files: File[]
): Promise<Lease | null> => {
    const newLease: Lease = {
        ...lease,
        id: `mock-lease-${Date.now()}`,
        name: lease.name || 'New Lease',
        uploadDate: new Date(),
        status: LeaseStatus.PROCESSING,
        workflowStage: 'R1_PENDING' as WorkflowStage,
        processingMode: lease.processingMode || 'ai',
        templateType: lease.templateType,
        displayId: `LSE-${Date.now()}`,
        abstractedData: [],
        paidRentEvents: [],
        chatHistory: [],
        documents: [],
    } as Lease;
    mockLeases.unshift(newLease);
    return newLease;
};

export const updateLease = async (leaseId: string, updates: Partial<Lease>) => {
    const idx = mockLeases.findIndex(l => l.id === leaseId);
    if (idx !== -1) {
        mockLeases[idx] = { ...mockLeases[idx], ...updates, lastSaved: new Date() };
        return mockLeases[idx];
    }
    return null;
};

export const completeAIProcessingWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const markLeaseFailedWorkflow = async (leaseId: string): Promise<void> => {
    await updateLease(leaseId, { status: LeaseStatus.FAILED });
};

export const createDocumentRecord = async (...args: any[]) => {
    return;
};

export const submitReviewWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const escalateLeaseWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const assignReviewerWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const fetchAdminMetrics = async () => {
    return {
        total_leases: mockLeases.length,
        total_clients: 0,
        total_abstracted: 0,
        ai_in_process: 0,
        ai_done: 0,
        ai_failed: 0,
        human_pending: 0,
        human_in_review: 0,
        human_done: 0,
        escalated_pending: 0,
        escalated_in_review: 0,
        escalated_done: 0,
        amendment_pending: 0,
        amendment_in_review: 0,
    };
};

export const fetchReviewerMetrics = async (reviewerEmail: string) => {
    return {
        r1_pending: 0,
        r2_pending: 0,
        escalated: 0,
        completed: 0,
    };
};
