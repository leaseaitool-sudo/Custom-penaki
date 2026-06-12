import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useLeaseManager } from '@/features/leases/hooks/useLeaseManager';
import { useNavigation } from '@/shared/hooks/useNavigation';
import { generateTemplateData } from '@/features/templates/types/templates';
import { UploadForm } from '@/features/leases/components/upload/UploadForm';
import { HistoryTable } from '@/features/leases/components/history/HistoryTable';
import { ViewSubmissionModal } from '@/features/leases/components/ViewSubmissionModal';
import { Lease, LeaseStatus, View, User, SelectionSection, AbstractedData, PendingIndividualLeaseConfig, BatchTemplateData, TemplateSet, ReviewStatus, Role, SavedTemplate, DemoBooking, Availability, LeaseAmendment, AbstractedField, ChatMessage, SupportChat, Organization, OrganizationMember, OrganizationClient, WorkflowStage } from '@/shared/types';
import { Sidebar } from '@/shared/ui/Layout/Sidebar';
import { Header } from '@/shared/ui/Layout/Header';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ChooseTemplatePage } from '@/pages/templates/ChooseTemplatePage';
import { ReviewTemplatePage } from '@/pages/templates/ReviewTemplatePage';
import { ConfigureTemplatesPage } from '@/pages/templates/ConfigureTemplatesPage';
import { BatchReviewTemplatesPage } from '@/pages/templates/BatchReviewTemplatesPage';
import { EscalationModal } from '@/features/leases/components/EscalationModal';
import { Workbench } from '@/features/leases/components/workbench/Workbench';
import { AmendmentUploadModal } from '@/features/leases/components/AmendmentUploadModal';
import { ChatModal } from '@/features/chat/components/ChatModal';
import { LoginPage } from '@/pages/auth/LoginPage';


import { MapPinIcon } from '@/shared/ui/Icons/MapPinIcon';
import { BellIcon } from '@/shared/ui/Icons/BellIcon';
import { SparklesIcon } from '@/shared/ui/Icons/SparklesIcon';
import { ChatBubbleLeftRightIcon } from '@/shared/ui/Icons/ChatBubbleLeftRightIcon';
import { ChartPieIcon } from '@/shared/ui/Icons/ChartPieIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { CircleStackIcon } from '@/shared/ui/Icons/CircleStackIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { PresentationChartLineIcon } from '@/shared/ui/Icons/PresentationChartLineIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { BookDemoModal } from '@/features/marketing/components/BookDemoModal';

import { generateSingleLeaseExcel, generateBulkLeaseExcel } from '@/shared/utils/excelGenerator';
import { generateSingleLeasePdf } from '@/shared/utils/pdfGenerator';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';

import * as templateService from '@/features/templates/api/templateService';
import { updateLease } from '@/features/leases/api/leaseService';
import { loadSupportChats, createSupportChat, assignReviewerToSupportChat, sendChatMessage } from '@/features/chat/api/chatService';
import { safeParseAbstractedData } from '@/shared/utils/parsingUtils';
import { supabase } from '@/shared/api/supabaseClient';



/**
 * Converts a File to base64 for transmission to the Edge Function.
 * Files cannot be serialized in fetch bodies directly.
 */
const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] ?? result);
        };
        reader.onerror = () => reject(new Error(`FileReader error: ${file.name}`));
        reader.readAsDataURL(file);
    });

interface PendingLease {
    files: File[];
    name: string;
    templateType?: 'us' | 'eu' | string;
    processingMode: 'ai' | 'human';
}

const LeaseSummariesPage: React.FC<{ leases: Lease[], onViewSummary: (lease: Lease) => void }> = ({ leases, onViewSummary }) => {
    const abstractedLeases = leases.filter(l => l.status === LeaseStatus.ABSTRACTED);

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 space-y-8 pb-20">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <h2 className="text-3xl font-bold text-text-main flex items-center gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary" />
                    Lease Summaries
                </h2>
                <span className="text-sm text-text-light bg-surface-muted px-3 py-1 rounded-full border border-border">
                    {abstractedLeases.length} Reports
                </span>
            </div>

            {abstractedLeases.length === 0 ? (
                <div className="text-center py-20 bg-surface border border-dashed border-border rounded-2xl">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-text-main">No summaries available</h3>
                    <p className="text-text-light mt-1">Complete abstraction to generate summaries.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {abstractedLeases.map(lease => (
                        <div key={lease.id} className="bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full" onClick={() => onViewSummary(lease)}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                {lease.aiSummary && (
                                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 border border-purple-200">
                                        <SparklesIcon className="w-3 h-3" /> AI Ready
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg text-text-main mb-1 line-clamp-1" title={lease.name}>{lease.name}</h3>
                            <p className="text-xs text-text-light font-mono mb-6 bg-surface-muted px-2 py-1 rounded w-fit">{lease.id}</p>

                            <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-text-light">{lease.uploadDate.toLocaleDateString()}</span>
                                <button className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    View Report <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ScrollAnimatedSection>
    );
};

const App: React.FC = () => {
    const { currentUser, setCurrentUser, isAuthLoading, signOut: authSignOut } = useAuth();

    // Core custom hooks
    const {
        activeView,
        setActiveView,
        adminFilter,
        handleAdminNavigate
    } = useNavigation('home');

    const {
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
    } = useLeaseManager(currentUser, isAuthLoading);

    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [authModalInitialView, setAuthModalInitialView] = useState<'login' | 'signup'>('signup');
    const [pendingLease, setPendingLease] = useState<PendingLease | null>(null);
    const [pendingIndividualLeases, setPendingIndividualLeases] = useState<PendingIndividualLeaseConfig[] | null>(null);
    const [pendingBatchTemplates, setPendingBatchTemplates] = useState<BatchTemplateData | null>(null);
    const [leaseToReview, setLeaseToReview] = useState<Lease | null>(null);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [leaseForAmendment, setLeaseForAmendment] = useState<Lease | null>(null);
    const [prefilledTemplateData, setPrefilledTemplateData] = useState<SelectionSection[] | undefined>(undefined);
    const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>(undefined);
    const [leaseForInsights, setLeaseForInsights] = useState<Lease | null>(null);

    // Organization State
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([]);
    const [orgClients, setOrgClients] = useState<OrganizationClient[]>([]);
    const [selectedOrgForDetail, setSelectedOrgForDetail] = useState<Organization | null>(null);
    const [impersonationOrigin, setImpersonationOrigin] = useState<User | null>(null);

    // Chat State
    const [activeChatLease, setActiveChatLease] = useState<Lease | null>(null);
    const [supportChats, setSupportChats] = useState<SupportChat[]>([]);

    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);



    // SCOPING LOGIC: Filter data based on role context
    const scopedLeases = leases;
    const scopedClients = users;
    const scopedReviewers = users;

    // Load Org Data, Chat Data — scoped by role to avoid leaking org data to basic users
    useEffect(() => {
        if (!currentUser?.id) return;
        let mounted = true;

        const loadGlobalData = async () => {
            // Basic clients only need their own support chat — no org data needed
            await createSupportChat(currentUser.id, currentUser.email, currentUser.username);
            const chats = await loadSupportChats();
            if (mounted) setSupportChats(chats);
        };

        loadGlobalData();
        return () => { mounted = false; };

        // Use currentUser?.id not currentUser to avoid re-fires when user object changes shallowly
    }, [currentUser?.id, currentUser?.role]);

    // Load saved templates from Supabase when user logs in
    useEffect(() => {
        if (!currentUser?.id) return;
        let cancelled = false;
        templateService.fetchTemplates(currentUser.id).then(templates => {
            if (cancelled || templates.length === 0) return;
            setCurrentUser(prev => {
                if (!prev) return prev;
                // Merge: DB templates replace local ones if IDs match, add new ones
                const localIds = new Set((prev.savedTemplates || []).map(t => t.id));
                const newFromDb = templates.filter(t => !localIds.has(t.id));
                const merged = [...(prev.savedTemplates || []).map(local => {
                    const fromDb = templates.find(t => t.id === local.id);
                    return fromDb || local;
                }), ...newFromDb];
                return { ...prev, savedTemplates: merged };
            });
        });
        return () => { cancelled = true; };
    }, [currentUser?.id]);

    // Phase 2 Fix: Load all users from Supabase when an admin/super_admin logs in.
    // Deprecated: No longer loading all users.

    // Realtime subscriptions removed

    const leasesForCurrentUser = useMemo(() => {
        if (currentUser) return leases.filter(lease => lease.user?.email === currentUser.email);
        return [];
    }, [leases, currentUser]);

    // fileToGenerativePart imported from processingService (Bug 14 — removed duplicate)



    /**
     * Process an amendment through the Edge Function (server-side AI).
     * After AI extraction, merges changed fields into the existing abstractedData
     * and persists the updated data + new workflow stage to Supabase.
     */
    const processAmendmentWithAI = useCallback(async (lease: Lease, amendmentFile: File, amendmentName: string) => {
        const amendmentId = `amend_${Date.now()}`;
        const documentId = `${Date.now()}-${amendmentFile.name}`;
        const newAmendment: LeaseAmendment = {
            id: amendmentId,
            name: amendmentName,
            date: new Date(),
            document: { id: documentId, name: amendmentFile.name, url: URL.createObjectURL(amendmentFile) },
        };

        // Optimistic UI: show amendment + set status to PROCESSING immediately
        setLeases(prev => prev.map(l => l.id === lease.id ? {
            ...l,
            status: LeaseStatus.PROCESSING,
            amendments: [...(l.amendments || []), newAmendment],
            documents: [...l.documents, newAmendment.document],
        } : l));

        // Upload the amendment file to storage (fire-and-forget — doesn't block AI processing)
        uploadLeaseFilesToStorage(lease.id, [amendmentFile]);

        const processingStartedAt = new Date().toISOString();

        try {
            if (!lease.templateConfig || lease.templateConfig.length === 0) {
                throw new Error('Lease has no template configuration — cannot process amendment.');
            }

            // Convert file to base64 for Edge Function
            const base64 = await fileToBase64(amendmentFile);

            // Invoke Edge Function server-side — keeps AI API key off the client
            const { data, error: fnError } = await supabase.functions.invoke('process-lease', {
                body: {
                    leaseId: lease.id,
                    files: [{ name: amendmentFile.name, mimeType: amendmentFile.type || 'application/pdf', base64 }],
                    templateConfig: lease.templateConfig,
                    templateType: lease.templateType || 'us',
                    processingMode: 'human', // Amendments always go through human review
                    processingStartedAt,
                    isAmendment: true, // Signal to Edge Function this is an amendment
                },
            });

            if (fnError || !data?.success) {
                throw new Error(fnError?.message || data?.error || 'Amendment processing failed in Edge Function');
            }

            // Merge amendment fields into the existing abstractedData.
            // Amendment fields override matching existing fields; new fields are appended.
            const existingData: AbstractedData = lease.abstractedData || [];
            const amendmentData: AbstractedData = data.abstractedData || [];

            const mergedData: AbstractedData = existingData.map(section => {
                const amendSection = amendmentData.find(a => a.title === section.title);
                if (!amendSection) return section;
                return {
                    ...section,
                    fields: section.fields.map((field, idx) => {
                        const amendField = amendSection.fields[idx];
                        // Override with amendment value only if the amendment extracted a non-null value
                        if (amendField && amendField.value !== null) {
                            return { ...field, value: amendField.value, page: amendField.page, snippet: amendField.snippet, fileName: amendmentFile.name };
                        }
                        return field;
                    }),
                };
            });

            // Add any new sections that only appear in the amendment
            const newSections = amendmentData.filter(a => !existingData.some(e => e.title === a.title));
            const finalData = [...mergedData, ...newSections];

            // PERSIST: Save merged abstractedData + updated workflow stage to Supabase
            // This is the critical fix — previously this was never called.
            await updateLease(lease.id, { abstractedData: finalData });

            // Update local state with the merged result
            setLeases(prev => prev.map(l => l.id === lease.id ? {
                ...l,
                status: LeaseStatus.AMENDMENT_REVIEW,
                reviewStatus: ReviewStatus.PENDING,
                workflowStage: 'R1_PENDING' as WorkflowStage,
                processingMode: 'human',
                abstractedData: finalData,
            } : l));

            setNotification({ type: 'success', message: 'Amendment processed and saved. Sent to review.' });
            setTimeout(() => setNotification(null), 4000);

        } catch (error: any) {
            console.error('[processAmendmentWithAI] Failed:', error);
            // Revert to pre-amendment state on failure
            setLeases(prev => prev.map(l => l.id === lease.id ? {
                ...l,
                status: LeaseStatus.ABSTRACTED,
                amendments: (l.amendments || []).filter(a => a.id !== amendmentId),
                documents: l.documents.filter(d => d.id !== documentId),
            } : l));
            setNotification({ type: 'error', message: `Amendment processing failed: ${error.message || 'Unknown error'}` });
        }
    }, [uploadLeaseFilesToStorage]);


    /**
     * Generate an AI-powered lease summary via the ai-assistant Edge Function.
     * Previously ran browser-side with an exposed API key.
     * Now fully server-side. Also properly awaits the DB write (was fire-and-forget before).
     */
    const handleGenerateLeaseSummary = async (lease: Lease) => {
        if (!lease.abstractedData || lease.abstractedData.length === 0) {
            setNotification({ type: 'error', message: 'No abstraction data found. Cannot summarize.' });
            return;
        }
        try {
            const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
                body: { action: 'summarize', abstractedData: lease.abstractedData },
            });

            if (fnError || !data?.success) {
                throw new Error(fnError?.message || data?.error || 'Summary generation failed');
            }

            // data.summary is already a JSON string returned from Gemini
            const summary = data.summary;

            // FIXED: await the DB write instead of fire-and-forget
            await updateLease(lease.id, { aiSummary: summary });
            setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, aiSummary: summary } : l));
        } catch (e: any) {
            console.error('[handleGenerateLeaseSummary] Failed:', e);
            setNotification({ type: 'error', message: 'Failed to generate AI summary. Please try again.' });
        }
    };

    /**
     * Ask a question to the lease AI agent via the ai-assistant Edge Function.
     * Previously ran browser-side with an exposed API key.
     */
    const handleAskLeaseAgent = async (lease: Lease, history: { role: string, text: string }[], question: string): Promise<string> => {
        const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
            body: { action: 'ask', abstractedData: lease.abstractedData, history, question },
        });

        if (fnError || !data?.success) {
            throw new Error(fnError?.message || data?.error || 'Chat agent failed');
        }

        return data.text as string;
    };


    const handleOpenLeaseInsights = (lease: Lease) => { setLeaseForInsights(lease); setActiveView('lease-insights'); };
    const handleAddAmendment = (lease: Lease, file: File, name: string) => processAmendmentWithAI(lease, file, name);
    const handleProceedToTemplatesSingle = useCallback((formData: { files: File[]; name: string; processingMode: 'ai' | 'human' }) => { if (!currentUser) { setAuthModalInitialView('login'); setIsAuthModalOpen(true); return; } setPendingLease(formData); setActiveView('choose-template'); }, [currentUser]);
    const handleProceedToTemplatesMultiple = useCallback((leasesData: { file: File; name: string; processingMode: 'ai' | 'human' }[]) => { if (!currentUser) { setAuthModalInitialView('login'); setIsAuthModalOpen(true); return; } setPendingIndividualLeases(leasesData.map(lease => ({ ...lease, templateType: 'us' as any }))); setActiveView('configure-templates'); }, [currentUser]);
    const handleProceedToBatchReview = (configuredLeases: PendingIndividualLeaseConfig[]) => { setPendingIndividualLeases(configuredLeases); const templates: BatchTemplateData = {}; const processedTemplateTypes = new Set(configuredLeases.map(l => l.templateType)); processedTemplateTypes.forEach(type => { const saved = currentUser?.savedTemplates?.find(t => t.id === type); if (saved) { const { optional } = generateTemplateData(saved.type); templates[type as any] = { main: saved.sections, optional, originalOptionalIds: new Set(optional.map(s => s.id)) }; } else if (type === 'us' || type === 'eu') { const { main, optional } = generateTemplateData(type as any); templates[type as any] = { main, optional, originalOptionalIds: new Set(optional.map(s => s.id)) }; } }); setPendingBatchTemplates(templates); setActiveView('batch-review-templates'); };
    const handleSelectTemplate = (templateType: 'us' | 'eu') => { if (!pendingLease) return; setPendingLease(prev => ({ ...prev!, templateType })); setPrefilledTemplateData(undefined); setPendingTemplateId(undefined); setActiveView('review-template'); };
    const handleSelectSavedTemplate = (template: SavedTemplate) => { if (!pendingLease) return; setPendingLease(prev => ({ ...prev!, templateType: template.id })); setPrefilledTemplateData(template.sections); setPendingTemplateId(template.id); setActiveView('review-template'); };
    const handleSaveTemplate = async (name: string, type: 'us' | 'eu' | string, sections: SelectionSection[]) => { if (!currentUser) return; const baseType = (type === 'us' || type === 'eu') ? type : (currentUser.savedTemplates?.find(t => t.id === type)?.type || 'us'); const newTemplate: SavedTemplate = { id: `tpl_${Date.now()}`, name, type: baseType as any, sections, dateCreated: new Date(), lastModified: new Date() }; const updatedUser = { ...currentUser, savedTemplates: [...(currentUser.savedTemplates || []), newTemplate] }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); setNotification({ type: 'success', message: `Template "${name}" saved!` }); if (currentUser.id) { const result = await templateService.createTemplate(currentUser.id, newTemplate); if (!result.success) console.error('Failed to persist template:', result.error); } };
    const handleUpdateTemplate = async (updatedTemplate: SavedTemplate) => { if (!currentUser) return; const updatedUser = { ...currentUser, savedTemplates: (currentUser.savedTemplates || []).map(t => t.id === updatedTemplate.id ? updatedTemplate : t) }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); const result = await templateService.updateTemplate(updatedTemplate); if (!result.success) console.error('Failed to persist template update:', result.error); };
    const handleDeleteTemplate = async (templateId: string) => { if (!currentUser) return; const updatedUser = { ...currentUser, savedTemplates: (currentUser.savedTemplates || []).filter(t => t.id !== templateId) }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); const result = await templateService.deleteTemplate(templateId); if (!result.success) console.error('Failed to persist template deletion:', result.error); };
    const handleFinalSubmit = async (finalTemplateData: SelectionSection[]) => {
        if (!pendingLease || !pendingLease.templateType || !currentUser) { setActiveView('abstract'); return; }

        const { name, files, templateType, processingMode } = pendingLease;

        // Optimistic Navigation: Jump to history immediately
        setActiveView('history');
        setPendingLease(null);
        setPrefilledTemplateData(undefined);
        setPendingTemplateId(undefined);

        // Async creation in background
        handleCreateLease({
            name,
            status: LeaseStatus.PROCESSING,
            processingMode,
            templateConfig: finalTemplateData,
            templateType: templateType,
            fileObjects: files
        }, files);
    };
    /**
     * Handle batch lease submission.
     * FIXED: Previously used locally-generated IDs and called setLeases directly,
     * meaning batch leases were NEVER persisted to Supabase. Now calls handleCreateLease
     * for each config which writes to the DB, uploads files, and triggers AI processing.
     */
    const handleFinalBatchSubmit = useCallback(async (editedTemplates: BatchTemplateData, saveTemplateName?: string) => {
        if (!pendingIndividualLeases || !currentUser) { setActiveView('abstract'); return; }

        // Optionally save the template for reuse
        if (saveTemplateName) {
            const typeToSave = editedTemplates.us ? 'us' : (editedTemplates.eu ? 'eu' : Object.keys(editedTemplates)[0]);
            const set = editedTemplates[typeToSave as any];
            if (set) handleSaveTemplate(saveTemplateName, typeToSave, set.main);
        }

        // Navigate to history immediately so user can see progress
        setActiveView('history');
        setPendingIndividualLeases(null);
        setPendingBatchTemplates(null);

        // Process each lease sequentially (to avoid DB connection storms) with proper Supabase persistence
        const errors: string[] = [];
        for (const config of pendingIndividualLeases) {
            try {
                const templateSet = editedTemplates[config.templateType as any];

                // handleCreateLease: creates DB record, uploads to storage, triggers AI via Edge Function
                await handleCreateLease({
                    name: config.name,
                    status: LeaseStatus.PROCESSING,
                    processingMode: config.processingMode,
                    templateConfig: templateSet?.main,
                    templateType: config.templateType as any,
                    fileObjects: [config.file],
                }, [config.file]);
            } catch (err: any) {
                console.error(`[handleFinalBatchSubmit] Failed to create lease for "${config.name}":`, err);
                errors.push(config.name);
            }
        }

        if (errors.length > 0) {
            setNotification({ type: 'error', message: `${errors.length} lease(s) failed to submit: ${errors.join(', ')}` });
        } else {
            setNotification({ type: 'success', message: `${pendingIndividualLeases?.length || 0} leases submitted and processing.` });
        }
        setTimeout(() => setNotification(null), 5000);
    }, [currentUser, pendingIndividualLeases, handleCreateLease, handleSaveTemplate]);
    const handleRetryLease = async (lease: Lease) => {
        // Retry logic currently requires fetching the file from storage if not present, stub for now.
        console.warn('Retry not implemented for remote files yet.');
    };
    const handleViewLease = (lease: Lease) => { if (lease.status === LeaseStatus.ABSTRACTED) { setSelectedLease(lease); if (lease.isUpdateSeen === false) setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, isUpdateSeen: true } : l)); } };
    const handleCloseModal = () => setSelectedLease(null);

    // Auth is now handled by AuthContext. These handlers manage navigation after auth events.
    const handleAuthSuccess = () => {
        // After successful login/signup, navigate based on role
        if (currentUser) {
            setActiveView('abstract');
        }
        setIsAuthModalOpen(false);
    };

    // Navigate to role-appropriate view after auth state changes
    useEffect(() => {
        if (!isAuthLoading && currentUser && activeView === 'home') {
            setActiveView('abstract');
        }
    }, [currentUser, isAuthLoading]);

    const handleLogout = async () => {
        await authSignOut();
        setActiveView('abstract');
        setIsSidebarOpen(false);
    };
    const handleUpdateUser = (updatedUser: User) => setCurrentUser(updatedUser);
    const handleStartReview = (lease: Lease) => { setLeaseToReview(lease); setActiveView('workbench'); };

    const localHandleSubmitReview = async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean): Promise<{ success: boolean }> => {
        await handleSubmitReview(leaseId, finalData, notes, timeSpent, skipR2);
        setLeaseToReview(null);
        setActiveView('history');
        return { success: true };
    };

    const localHandleSubmitEscalation = (leaseId: string, notes: string) => {
        handleSubmitEscalation(leaseId, notes);
        setLeaseToReview(null);
    };

    const handleDownloadExcel = useCallback((lease: Lease) => generateSingleLeaseExcel(lease), []);
    const handleDownloadAllExcel = useCallback(() => { const abstractedLeases = leasesForCurrentUser.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData); generateBulkLeaseExcel(abstractedLeases); }, [leasesForCurrentUser]);
    const handleDownloadPdf = useCallback((lease: Lease) => generateSingleLeasePdf(lease), []);

    const handleSelectClient = (client: User) => { setSelectedClient(client); };

    const handleSendMessage = async (chatId: string, message: string) => {
        if (!currentUser) return;

        let senderName = currentUser.username;
        const type = chatId.startsWith('support_') ? 'support' : 'lease';

        // Optimistic UI Update first for snappiness, then DB write
        const optimisticMsg: ChatMessage = {
            id: `msg_${Date.now()}_opt`,
            referenceId: chatId,
            type: type,
            senderRole: currentUser.role,
            senderName: senderName,
            content: message,
            timestamp: new Date()
        };

        if (type === 'support') {
            setSupportChats(prev => prev.map(sc => sc.id === chatId ? { ...sc, messages: [...sc.messages, optimisticMsg], lastUpdated: new Date() } : sc));
        } else {
            setLeases(prev => prev.map(l => l.id === chatId ? { ...l, chatHistory: [...(l.chatHistory || []), optimisticMsg] } : l));
            if (activeChatLease && activeChatLease.id === chatId) {
                setActiveChatLease(prev => prev ? { ...prev, chatHistory: [...(prev.chatHistory || []), optimisticMsg] } : null);
            }
        }

        // DATABASE: Atomic Insert
        const savedMsg = await sendChatMessage(chatId, type, currentUser.role, senderName, message);
        if (savedMsg) {
            // Replace optimistic message with canonical ID
            if (type === 'support') {
                setSupportChats(prev => prev.map(sc => sc.id === chatId ? { ...sc, messages: sc.messages.map(m => m.id === optimisticMsg.id ? savedMsg : m) } : sc));
            } else {
                setLeases(prev => prev.map(l => l.id === chatId ? { ...l, chatHistory: (l.chatHistory || []).map(m => m.id === optimisticMsg.id ? savedMsg : m) } : l));
                if (activeChatLease && activeChatLease.id === chatId) {
                    setActiveChatLease(prev => prev ? { ...prev, chatHistory: (prev.chatHistory || []).map(m => m.id === optimisticMsg.id ? savedMsg : m) } : null);
                }
            }
        } else {
            // Revert optimistic insert on failure
            setNotification({ type: 'error', message: 'Message failed to send.' });
            if (type === 'support') {
                setSupportChats(prev => prev.map(sc => sc.id === chatId ? { ...sc, messages: sc.messages.filter(m => m.id !== optimisticMsg.id) } : sc));
            } else {
                setLeases(prev => prev.map(l => l.id === chatId ? { ...l, chatHistory: (l.chatHistory || []).filter(m => m.id !== optimisticMsg.id) } : l));
                if (activeChatLease && activeChatLease.id === chatId) {
                    setActiveChatLease(prev => prev ? { ...prev, chatHistory: (prev.chatHistory || []).filter(m => m.id !== optimisticMsg.id) } : null);
                }
            }
        }
    };
    // Admin functions removed

    
    const renderContent = () => {
        return (
            <Routes>
                <Route path="/" element={<Navigate to={currentUser ? "/history" : "/abstract"} replace />} />
                <Route path="/abstract" element={<UploadForm onContinueSingle={handleProceedToTemplatesSingle} onContinueMultiple={handleProceedToTemplatesMultiple} />} />
                
                <Route path="/templates/choose" element={<ChooseTemplatePage onSelectTemplate={handleSelectTemplate} onSelectSavedTemplate={handleSelectSavedTemplate} onBack={() => setActiveView('abstract')} />} />
                <Route path="/templates/review" element={pendingLease ? <ReviewTemplatePage pendingLease={pendingLease as any} initialTemplateData={prefilledTemplateData} existingTemplateId={pendingTemplateId} onSubmit={handleFinalSubmit} onSaveTemplate={handleSaveTemplate} onUpdateTemplate={handleUpdateTemplate} onBack={() => setActiveView('choose-template')} /> : <Navigate to="/" replace />} />
                <Route path="/templates/configure" element={<ConfigureTemplatesPage initialLeases={pendingIndividualLeases || []} savedTemplates={currentUser?.savedTemplates} onContinue={handleProceedToBatchReview} onBack={() => setActiveView('abstract')} />} />
                <Route path="/templates/batch-review" element={<BatchReviewTemplatesPage initialTemplates={pendingBatchTemplates!} onSubmit={handleFinalBatchSubmit} onBack={() => setActiveView('configure-templates')} leaseCount={pendingIndividualLeases?.length || 0} />} />
                
                <Route path="/history" element={<HistoryTable leases={leasesForCurrentUser} onRetry={handleRetryLease} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onDownloadAllExcel={handleDownloadAllExcel} onDownloadPdf={handleDownloadPdf} onChat={setActiveView as any} onAddAmendment={handleAddAmendment as any} onOpenInsights={handleOpenLeaseInsights} onOpenWorkbench={handleStartReview} />} />
                
                <Route path="/profile" element={currentUser ? <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} onDeleteTemplate={handleDeleteTemplate} onUpdateTemplate={handleUpdateTemplate} /> : null} />
                <Route path="/workbench" element={currentUser && leaseToReview ? <Workbench mode="reviewer" lease={leaseToReview} onBack={() => { setLeaseToReview(null); setActiveView('portfolio'); }} onSaveDraft={handleSaveDraft} onSubmitReview={localHandleSubmitReview} /> : <Navigate to="/history" replace />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    };
    const isWorkbenchActive = activeView === 'workbench';
    const isHomeActive = activeView === 'home';
    const isChatActive = activeView === 'client-chats';
    const isAssetsActive = activeView === 'assets';
    const isFullWidthView = isWorkbenchActive || isHomeActive || isChatActive || isAssetsActive || activeView === 'lease-insights' || activeView.startsWith('product-') || activeView.startsWith('solution-') || activeView === 'pricing';

    if (isAuthLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    return (
        <div className={`${isWorkbenchActive ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background font-sans flex flex-col`}>
            {impersonationOrigin && (
                <div className="bg-red-600 text-white text-xs font-bold text-center py-1 sticky top-0 z-[60]">
                    IMPERSONATING: {currentUser?.username}. <button onClick={handleLogout} className="underline ml-2">Click here to return to Super Admin</button>
                </div>
            )}
            {!selectedLease && !isWorkbenchActive && (
                <Sidebar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    currentUser={currentUser}
                    leases={leasesForCurrentUser}
                    onLogin={() => { setAuthModalInitialView('login'); setIsAuthModalOpen(true); }}
                />
            )}
            <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${currentUser && !selectedLease && !isWorkbenchActive ? 'md:ml-20' : ''}`}>
                {!isWorkbenchActive && <Header activeView={activeView} user={currentUser} onProfileClick={() => { setAuthModalInitialView('signup'); setIsAuthModalOpen(true); }} onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setActiveView} onBookDemo={() => setIsDemoModalOpen(true)} isSidebarOpen={isSidebarOpen} />}

                <main className={`flex-1 flex flex-col min-h-0 ${isWorkbenchActive ? 'overflow-hidden' : isFullWidthView ? 'overflow-y-auto' : 'p-4 sm:p-8 overflow-y-auto'}`}>
                    <div key={activeView} className={`flex-1 flex flex-col min-h-0 animate-fade-in ${isWorkbenchActive || isChatActive || isAssetsActive || activeView === 'lease-insights' ? 'h-full' : ''} ${isHomeActive ? 'min-h-full' : ''}`}>{renderContent()}</div>
                </main>
            </div>
            {activeView === 'home' && <Footer onNavigate={setActiveView} />}
            {selectedLease && <ViewSubmissionModal lease={selectedLease} onClose={handleCloseModal} onDownloadExcel={handleDownloadExcel} onDownloadPdf={handleDownloadPdf} />}
            {isAuthModalOpen && <AuthModal initialView={authModalInitialView} onClose={() => setIsAuthModalOpen(false)} onNavigate={setActiveView} onAuthSuccess={handleAuthSuccess} />}
            {leaseForAmendment && <AmendmentUploadModal lease={leaseForAmendment} onClose={() => setLeaseForAmendment(null)} onSubmit={(file, name) => { handleAddAmendment(leaseForAmendment, file, name); setLeaseForAmendment(null); }} />}
            {activeChatLease && currentUser && (<ChatModal lease={activeChatLease} currentUser={currentUser} onClose={() => setActiveChatLease(null)} onSendMessage={handleSendMessage} onEscalate={handleSubmitEscalation} />)}
            {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} />}

        </div>
    );
};

export default App;