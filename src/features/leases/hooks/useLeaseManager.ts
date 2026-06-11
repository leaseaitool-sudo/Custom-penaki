import { useState, useCallback, useEffect } from 'react';
import { Lease, LeaseStatus, ReviewStatus, WorkflowStage, AbstractedData, User } from '@/shared/types';
import { supabase } from '@/shared/api/supabaseClient';
import { fetchLeases as fetchLeasesAPI, updateLease as updateLeaseAPI, createLease as createLeaseAPI, createDocumentRecord, submitReviewWorkflow, escalateLeaseWorkflow, assignReviewerWorkflow, markLeaseFailedWorkflow } from '@/features/leases/api/leaseService';
import { uploadDocument, getPublicUrl } from '@/shared/api/storageService';
import { Role } from '@/shared/types';
import { canAccessAdminPanel } from '@/shared/utils/roleEnforcement';

/**
 * Converts a File object to a base64-encoded string for transmission to the Edge Function.
 * The Edge Function runs AI server-side so the API key never reaches the browser.
 */
const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URI prefix (e.g. 'data:application/pdf;base64,')
            resolve(result.split(',')[1] ?? result);
        };
        reader.onerror = () => reject(new Error(`FileReader failed for ${file.name}`));
        reader.readAsDataURL(file);
    });

export const useLeaseManager = (currentUser: User | null, isAuthLoading: boolean) => {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [isLoadingLeases, setIsLoadingLeases] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Initial load from Supabase
    useEffect(() => {
        if (!currentUser || isAuthLoading) {
            setLeases([]);
            return;
        }

        const loadLeases = async () => {
            setIsLoadingLeases(true);
            try {
                const fetched = await fetchLeasesAPI(currentUser);
                setLeases(fetched);
            } catch (e) {
                console.error("Failed to load leases from Supabase:", e);
                setNotification({ type: 'error', message: 'Failed to load lease data.' });
            } finally {
                setIsLoadingLeases(false);
            }
        };

        loadLeases();

        // Realtime subscription removed
    }, [currentUser, isAuthLoading]);

    /**
     * Upload lease files to Supabase Storage.
     * Updates the lease's document entries with storagePath for persistence.
     * Returns an array of successfully uploaded files to be passed to Edge Functions.
     */
    const uploadLeaseFilesToStorage = async (leaseId: string, files: File[]): Promise<Array<{name: string, storagePath: string, mimeType: string}>> => {
        const uploadedFiles: Array<{name: string, storagePath: string, mimeType: string}> = [];
        try {
            const userId = currentUser?.id;
            if (!userId) { console.warn('No auth session — skipping storage upload'); return []; }

            console.log(`[PIPELINE TRACE] Starting uploadLeaseFilesToStorage for leaseId=${leaseId}, count=${files.length}`);

            for (const file of files) {
                try {
                    const result = await uploadDocument(file, leaseId, userId);
                    console.log(`[PIPELINE TRACE] Storage success: ${file.name} -> ${result.storagePath}`);
                    const publicUrl = getPublicUrl(result.storagePath);
                    // DATABASE: Create document record in Supabase
                    await createDocumentRecord(
                        leaseId,
                        file.name,
                        result.storagePath,
                        publicUrl
                    );
                    console.log(`[PIPELINE TRACE] Document DB record created for: ${file.name}`);

                    uploadedFiles.push({
                        name: file.name,
                        storagePath: result.storagePath,
                        mimeType: file.type || 'application/pdf'
                    });

                    // Update local state to reflect successful storage
                    setLeases(prev => prev.map(l => {
                        if (l.id !== leaseId) return l;
                        return {
                            ...l,
                            documents: l.documents.map(d =>
                                d.name === file.name ? { ...d, storagePath: result.storagePath, url: publicUrl } : d
                            ),
                            amendments: l.amendments?.map(a =>
                                a.document.name === file.name ? { ...a, document: { ...a.document, storagePath: result.storagePath, url: publicUrl } } : a
                            ),
                        };
                    }));
                } catch (e) {
                    console.error(`[PIPELINE ERROR] Failed to upload ${file.name} to storage:`, e);
                }
            }
        } catch (e) {
            console.error('[PIPELINE ERROR] Storage upload failed entirely:', e);
        }
        return uploadedFiles;
    };

    const processLeaseWithAI = useCallback(async (leaseToProcess: Lease, uploadedFiles: Array<{name: string, storagePath: string, mimeType: string}>, retryAttempt = 0) => {
        const { templateConfig, templateType } = leaseToProcess;
        if (!uploadedFiles || uploadedFiles.length === 0 || !templateConfig || !templateType) {
            console.error('[processLeaseWithAI] Missing required fields for lease:', leaseToProcess.id);
            setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.FAILED } : l));
            await markLeaseFailedWorkflow(leaseToProcess.id).catch(console.error);
            return;
        }

        // Mark as processing immediately for responsive UI
        setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.PROCESSING } : l));

        // Capture processing start timestamp from the server-side authoritative lastSaved 
        // fallback to current time ONLY if it doesn't exist (should always exist for persisted leases)
        const processingStartedAt = leaseToProcess.lastSaved ? leaseToProcess.lastSaved.toISOString() : new Date().toISOString();

        console.log(`[PIPELINE TRACE] Calling processLeaseWithAI. leaseId=${leaseToProcess.id}, files=${uploadedFiles.length}, retry=${retryAttempt}, time=${processingStartedAt}`);

        try {
            // ── Invoke the server-side Edge Function ─────────────────────────────
            // We now pass the Supabase Storage paths instead of full Base64 payloads.
            // This prevents PayloadTooLarge errors for large PDFs.
            console.log(`[PIPELINE TRACE] Invoking supabase edge function 'process-lease'...`);
            const { data, error: fnError } = await supabase.functions.invoke('process-lease', {
                body: {
                    leaseId: leaseToProcess.id,
                    files: uploadedFiles,
                    templateConfig,
                    templateType,
                    processingMode: leaseToProcess.processingMode,
                    processingStartedAt,
                },
            });

            if (fnError) {
                console.error(`[PIPELINE ERROR] Edge Function invocation failed for leaseId=${leaseToProcess.id}:`, fnError);
                throw new Error(fnError.message || 'Edge Function invocation failed');
            }

            if (!data?.success) {
                if (data?.error === 'CONFLICT') {
                    console.log(`[PIPELINE TRACE] AI results discarded for leaseId=${leaseToProcess.id} due to CONFLICT`);
                    setNotification({ type: 'error', message: 'AI results discarded: lease was edited during processing.' });
                    if (currentUser) {
                        const refreshed = await fetchLeasesAPI(currentUser);
                        setLeases(refreshed);
                    }
                    return;
                }
                console.error(`[PIPELINE ERROR] Edge Function returned failure flag for leaseId=${leaseToProcess.id}:`, data?.error);
                throw new Error(data?.error || 'Unknown error from Edge Function');
            }

            console.log(`[PIPELINE TRACE] Edge Function returned success for leaseId=${leaseToProcess.id}. Patching local state.`);
            // ── Patch local state with results from Edge Function ─────
            const localUpdates: Partial<Lease> = {
                status: leaseToProcess.processingMode === 'human' ? LeaseStatus.IN_REVIEW : LeaseStatus.ABSTRACTED,
                abstractedData: data.abstractedData,
                reviewStatus: leaseToProcess.processingMode === 'human' ? ReviewStatus.PENDING : undefined,
                workflowStage: leaseToProcess.processingMode === 'human'
                    ? ('R1_PENDING' as WorkflowStage)
                    : ('COMPLETED' as WorkflowStage),
                aiModelLatency: data.aiModelLatency,
            };

            setLeases(prev => prev.map(l => l.id !== leaseToProcess.id ? l : { ...l, ...localUpdates }));

        } catch (error: any) {
            console.error('[PIPELINE ERROR] [processLeaseWithAI] Exception caught:', error);

            // Retry only once (avoid sending the same large PDF 3 times)
            if (retryAttempt < 1) {
                console.warn(`[PIPELINE TRACE] Retrying (attempt ${retryAttempt + 1}/1) for leaseId=${leaseToProcess.id}`);
                await new Promise(r => setTimeout(r, 3000));
                return processLeaseWithAI(leaseToProcess, uploadedFiles, retryAttempt + 1);
            }

            // All retries exhausted — marking as failed deterministically
            console.error('[PIPELINE ERROR] Client-side retries exhausted for leaseId:', leaseToProcess.id);
            setNotification({ type: 'error', message: 'Processing permanently failed after retries.' });
            
            // Critical fix: Ensure lease does not become stuck in "Processing" UI state
            setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.FAILED } : l));
            await markLeaseFailedWorkflow(leaseToProcess.id).catch(e => console.error('[PIPELINE ERROR] DB fallback failed:', e));
        } finally {
            // ── Safety net: always re-fetch authoritative state from DB ──────────
            // This catches the case where the Edge Function succeeded server-side
            // but the response timed out on the client.
            if (currentUser) {
                try {
                    const refreshed = await fetchLeasesAPI(currentUser);
                    setLeases(refreshed);
                } catch (e) {
                    console.warn('[processLeaseWithAI] Post-processing re-fetch failed:', e);
                }
            }
        }
    }, [currentUser]);

    const handleSaveDraft = useCallback(async (leaseId: string, updatedData: AbstractedData, timeSpent?: number): Promise<void> => {
        const leaseToUpdate = leases.find(l => l.id === leaseId);
        if (!leaseToUpdate) return;

        // SECURITY: Verify the caller is actually assigned to this lease
        if (currentUser) {
            const isAssignedReviewer =
                leaseToUpdate.reviewer?.id === currentUser.id ||
                leaseToUpdate.reviewerR2?.id === currentUser.id ||
                currentUser.role === Role.ADMIN ||
                currentUser.role === Role.SUPER_ADMIN;
            if (!isAssignedReviewer) {
                console.warn('[SECURITY] handleSaveDraft blocked: user is not the assigned reviewer.');
                return;
            }
        }

        const isR2 = leaseToUpdate.reviewerR2?.email === currentUser?.email || leaseToUpdate.workflowStage?.startsWith('R2') || leaseToUpdate.workflowStage === 'ESCALATED';
        const updates: Partial<Lease> = {
            abstractedData: updatedData,
            timeSpentR1: !isR2 && timeSpent !== undefined ? timeSpent : leaseToUpdate.timeSpentR1,
            timeSpentR2: isR2 && timeSpent !== undefined ? timeSpent : leaseToUpdate.timeSpentR2,
            workflowStage: (isR2 ? (leaseToUpdate.workflowStage === 'ESCALATED' ? 'ESCALATED' : 'R2_IN_PROGRESS') : 'R1_IN_PROGRESS') as WorkflowStage
        };

        try {
            // DATABASE: Persist draft with await
            await updateLeaseAPI(leaseId, updates);

            // Explicitly set the timestamp to now for local update to avoid waiting for DB timestamp reflection
            const localUpdates = { ...updates, lastSaved: new Date() };

            setLeases(prev => prev.map(l => l.id === leaseId ? { ...l, ...localUpdates } : l));
        } catch (e) {
            console.error("Failed to save draft:", e);
            setNotification({ type: 'error', message: 'Failed to save draft automatically.' });
        }
    }, [currentUser, leases]);

    const handleSubmitReview = useCallback(async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean): Promise<{ success: boolean }> => {
        try {
            if (!currentUser) throw new Error('No authenticated user.');
            const leaseToUpdate = leases.find(l => l.id === leaseId);
            if (!leaseToUpdate) throw new Error("Lease not found in state");

            const isR2 = leaseToUpdate.reviewerR2?.email === currentUser?.email || (leaseToUpdate.workflowStage === 'R2_ASSIGNED' || leaseToUpdate.workflowStage === 'R2_IN_PROGRESS' || leaseToUpdate.workflowStage === 'ESCALATED');

            // AUTHORITATIVE: Delegate to service-layer workflow function
            await submitReviewWorkflow(
                leaseId,
                currentUser.id,
                currentUser.role,
                finalData,
                notes,
                timeSpent,
                isR2,
                !!skipR2
            );

            // Derive local state updates from the known outcome
            const isCompleting = isR2 || !!skipR2;
            const localUpdates: Partial<Lease> = {
                abstractedData: finalData,
                lastSaved: new Date(),
                ...(isCompleting ? {
                    reviewStatusR2: ReviewStatus.COMPLETED,
                    status: LeaseStatus.ABSTRACTED,
                    workflowStage: 'COMPLETED' as WorkflowStage,
                    isEscalated: false,
                    ...(notes !== undefined ? { reviewerNotesR2: notes } : {}),
                    ...(timeSpent !== undefined ? { timeSpentR2: timeSpent } : {}),
                } : {
                    reviewStatus: ReviewStatus.COMPLETED,
                    workflowStage: (leaseToUpdate.reviewerR2 ? 'R2_ASSIGNED' : 'R1_COMPLETED') as WorkflowStage,
                    ...(notes !== undefined ? { reviewerNotes: notes } : {}),
                    ...(timeSpent !== undefined ? { timeSpentR1: timeSpent } : {}),
                }),
            };

            setLeases(prev => prev.map(l => l.id === leaseId ? { ...l, ...localUpdates } : l));

            setNotification({ type: 'success', message: `Review submitted.` });
            return { success: true };
        } catch (e) {
            console.error("Review failed", e);
            setNotification({ type: 'error', message: `Review submission failed.` });
            throw e;
        }
    }, [currentUser, leases]);

    const handleAssignLease = useCallback(async (leaseToAssign: Lease, reviewer: User, targetRole: 'R1' | 'R2' = 'R1') => {
        if (!currentUser || !canAccessAdminPanel(currentUser)) return;

        try {
            // AUTHORITATIVE: Delegate to service-layer workflow function
            await assignReviewerWorkflow(
                leaseToAssign.id,
                currentUser.role,
                reviewer,
                targetRole
            );

            // Derive local state updates from the known outcome
            const localUpdates: Partial<Lease> = targetRole === 'R1'
                ? {
                    status: LeaseStatus.IN_REVIEW,
                    reviewStatus: ReviewStatus.IN_PROGRESS,
                    reviewer: reviewer,
                    assignedDate: new Date(),
                    workflowStage: 'R1_ASSIGNED' as WorkflowStage
                }
                : {
                    reviewerR2: reviewer,
                    assignedDateR2: new Date(),
                    reviewStatusR2: ReviewStatus.IN_PROGRESS,
                    workflowStage: 'R2_ASSIGNED' as WorkflowStage
                };

            setLeases(prev => prev.map(l => l.id === leaseToAssign.id ? { ...l, ...localUpdates } : l));
        } catch (e) {
            console.error("Failed to assign lease:", e);
            setNotification({ type: 'error', message: 'Failed to assign lease.' });
        }
    }, [currentUser]);

    const handleSubmitEscalation = useCallback(async (leaseId: string, notes: string) => {
        if (!currentUser) return;

        try {
            // AUTHORITATIVE: Delegate to service-layer workflow function
            await escalateLeaseWorkflow(
                leaseId,
                currentUser.id,
                currentUser.role,
                notes
            );

            // Derive local state updates from the known outcome
            const localUpdates: Partial<Lease> = {
                status: LeaseStatus.IN_REVIEW,
                reviewStatusR2: ReviewStatus.PENDING,
                processingMode: 'human',
                isEscalated: true,
                workflowStage: 'ESCALATED' as WorkflowStage,
                escalationNotes: notes
            };

            setLeases(prev => prev.map(l => l.id === leaseId ? { ...l, ...localUpdates } : l));
            setNotification({ type: 'success', message: 'Escalated to expert review.' });
            setTimeout(() => setNotification(null), 3000);
        } catch (e) {
            console.error("Failed to escalate:", e);
            setNotification({ type: 'error', message: 'Failed to escalate.' });
        }
    }, [currentUser]);

    const handleCreateLease = useCallback(async (leaseData: Partial<Lease>, files: File[]) => {
        if (!currentUser) return null;

        // OPTIMISTIC: Add a temporary placeholder to the UI immediately
        const tempId = `temp-${Date.now()}`;
        const tempLease: Lease = {
            id: tempId,
            name: leaseData.name || 'New Lease',
            uploadDate: new Date(),
            status: LeaseStatus.PROCESSING,
            workflowStage: 'R1_PENDING' as WorkflowStage,
            processingMode: leaseData.processingMode || 'ai',
            templateType: leaseData.templateType,
            templateConfig: leaseData.templateConfig,
            documents: files.map((f, i) => ({ id: `temp-doc-${i}`, name: f.name, url: '', storagePath: '' })),
            abstractedData: [],
            paidRentEvents: [],
            chatHistory: [],
        } as any;

        setLeases(prev => [tempLease, ...prev]);

        try {
            const createdLease = await createLeaseAPI(leaseData as any, currentUser.id, files);
            if (!createdLease) throw new Error("Failed to create lease record");

            // Replace placeholder with authoritative server data
            setLeases(prev => prev.map(l => l.id === tempId ? createdLease : l));

            // ATOMICITY: Track upload success. Upload files sequentially BEFORE invoking AI.
            console.log(`[PIPELINE TRACE] Uploading files for leaseId=${createdLease.id}`);
            const uploadedFiles = await uploadLeaseFilesToStorage(createdLease.id, files);
            
            // If all uploads failed, mark lease as FAILED to prevent zombie records
            if (!uploadedFiles || uploadedFiles.length === 0) {
                console.error('[PIPELINE ERROR] All uploads failed for lease:', createdLease.id);
                await markLeaseFailedWorkflow(createdLease.id).catch(console.error);
                setLeases(prev => prev.map(l => l.id === createdLease.id ? { ...l, status: LeaseStatus.FAILED } : l));
                setNotification({ type: 'error', message: 'Lease created but all document uploads failed.' });
                return createdLease;
            }

            console.log(`[PIPELINE TRACE] Continuing to AI Processing for leaseId=${createdLease.id}`);
            // Start async processes with successfully uploaded file references
            processLeaseWithAI(createdLease, uploadedFiles);

            return createdLease;
        } catch (e) {
            console.error("[PIPELINE ERROR] Lease creation failed:", e);
            setNotification({ type: 'error', message: "Failed to create lease." });
            return null;
        }
    }, [currentUser, processLeaseWithAI]);

    const handleMarkRentAsPaid = useCallback(async (leaseId: string, eventId: string) => {
        const leaseContext = leases.find(l => l.id === leaseId);
        if (!leaseContext) return;

        const currentPaid = leaseContext.paidRentEvents || [];
        if (currentPaid.includes(eventId)) return;

        const newPaidEvents = [...currentPaid, eventId];

        try {
            // AUTHORITATIVE: Await backend confirmation and merge the true returned state
            const updatedData = await updateLeaseAPI(leaseId, { paidRentEvents: newPaidEvents });
            if (updatedData) {
                setLeases(prev => prev.map(l => l.id === leaseId ? { ...l, paidRentEvents: updatedData.paid_rent_events || newPaidEvents } : l));
            }
        } catch (e) {
            console.error("Failed to mark rent as paid:", e);
        }
    }, [leases]);

    const clearNotification = useCallback(() => setNotification(null), []);

    return {
        leases,
        setLeases,
        isLoadingLeases,
        notification,
        setNotification,
        clearNotification,
        handleSaveDraft,
        handleSubmitReview,
        processLeaseWithAI,
        handleAssignLease,
        handleSubmitEscalation,
        uploadLeaseFilesToStorage,
        handleCreateLease,
        handleMarkRentAsPaid
    };
};
