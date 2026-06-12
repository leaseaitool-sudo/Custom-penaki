import { Lease, LeaseStatus, User, AbstractedData, WorkflowStage } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';

export const fetchLeases = async (user: User, limit: number = 100, offset: number = 0): Promise<Lease[]> => {
    const { data, error } = await supabase
        .from('leases')
        .select('*')
        .order('upload_date', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching leases:', error);
        return [];
    }

    return data.map(row => {
        let status = row.status as LeaseStatus;
        const uploadTime = new Date(row.upload_date).getTime();
        
        // ZOMBIE RECOVERY: If a lease has been processing for > 5 minutes, the client-side thread was likely killed (e.g. page refresh)
        if (status === LeaseStatus.PROCESSING && Date.now() - uploadTime > 5 * 60 * 1000) {
            status = LeaseStatus.FAILED;
            // Fire-and-forget: Self-heal the database
            supabase.from('leases').update({ status: LeaseStatus.FAILED }).eq('id', row.id).then();
        }

        return {
            id: row.id,
            name: row.name,
            status,
            workflowStage: row.workflow_stage as WorkflowStage,
        uploadDate: new Date(row.upload_date),
        templateType: row.template_type as any,
        templateConfig: row.template_config,
        abstractedData: row.abstracted_data || [],
        documents: row.documents || [],
        processingMode: row.processing_mode as any,
        chatHistory: row.chat_history || [],
        displayId: row.id.substring(0, 8).toUpperCase(),
        user: user,
        } as Lease;
    });
};

export const createLease = async (
    lease: Partial<Lease>,
    userId: string,
    files: File[]
): Promise<Lease | null> => {
    const newLeaseData = {
        user_id: userId,
        name: lease.name || 'New Lease',
        status: LeaseStatus.PROCESSING,
        workflow_stage: 'R1_PENDING',
        template_type: lease.templateType,
        template_config: lease.templateConfig,
        processing_mode: lease.processingMode || 'ai',
        documents: lease.documents || [],
    };

    const { data, error } = await supabase
        .from('leases')
        .insert([newLeaseData])
        .select()
        .single();

    if (error) {
        console.error('Error creating lease:', error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        status: data.status as LeaseStatus,
        workflowStage: data.workflow_stage as WorkflowStage,
        uploadDate: new Date(data.upload_date),
        templateType: data.template_type as any,
        templateConfig: data.template_config,
        abstractedData: data.abstracted_data || [],
        documents: data.documents || [],
        processingMode: data.processing_mode as any,
        chatHistory: data.chat_history || [],
        displayId: data.id.substring(0, 8).toUpperCase(),
        user: lease.user,
    } as Lease;
};

export const updateLease = async (leaseId: string, updates: Partial<Lease>) => {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.workflowStage) dbUpdates.workflow_stage = updates.workflowStage;
    if (updates.abstractedData) dbUpdates.abstracted_data = updates.abstractedData;
    if (updates.chatHistory) dbUpdates.chat_history = updates.chatHistory;
    if (updates.documents) dbUpdates.documents = updates.documents;
    
    const { data, error } = await supabase
        .from('leases')
        .update(dbUpdates)
        .eq('id', leaseId)
        .select()
        .single();

    if (error) {
        console.error('Error updating lease:', error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        status: data.status as LeaseStatus,
        workflowStage: data.workflow_stage as WorkflowStage,
        uploadDate: new Date(data.upload_date),
        templateType: data.template_type as any,
        templateConfig: data.template_config,
        abstractedData: data.abstracted_data || [],
        documents: data.documents || [],
        processingMode: data.processing_mode as any,
        chatHistory: data.chat_history || [],
        displayId: data.id.substring(0, 8).toUpperCase(),
    } as Lease;
};

export const completeAIProcessingWorkflow = async (leaseId: string, abstractedData: AbstractedData): Promise<any> => {
    const updated = await updateLease(leaseId, {
        abstractedData,
        status: LeaseStatus.ABSTRACTED
    });
    return { success: !!updated };
};

export const markLeaseFailedWorkflow = async (leaseId: string): Promise<void> => {
    await updateLease(leaseId, { status: LeaseStatus.FAILED });
};

export const createDocumentRecord = async (leaseId: string, name: string, storagePath: string, publicUrl: string) => {
    // In this simplified architecture, documents are stored directly on the lease JSON array
    // The useLeaseManager handles updating the document array via state, then we persist it here:
    
    const { data } = await supabase.from('leases').select('documents').eq('id', leaseId).single();
    if (data) {
        const docs = data.documents || [];
        docs.push({ name, storagePath, url: publicUrl, mimeType: 'application/pdf' });
        await supabase.from('leases').update({ documents: docs }).eq('id', leaseId);
    }
    return;
};

export const submitReviewWorkflow = async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean): Promise<any> => {
    const updated = await updateLease(leaseId, {
        abstractedData: finalData,
        status: LeaseStatus.ABSTRACTED
    });
    return { success: !!updated };
};

export const escalateLeaseWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const assignReviewerWorkflow = async (...args: any[]): Promise<any> => {
    return { success: true };
};

export const fetchAdminMetrics = async () => {
    return {
        total_leases: 0,
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
