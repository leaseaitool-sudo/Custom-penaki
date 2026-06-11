import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useLeaseManager } from '@/features/leases/hooks/useLeaseManager';
import { useNavigation } from '@/shared/hooks/useNavigation';
import { UploadForm } from '@/features/leases/components/upload/UploadForm';
import { HistoryTable } from '@/features/leases/components/history/HistoryTable';
import { ViewSubmissionModal } from '@/features/leases/components/ViewSubmissionModal';
import { Lease, LeaseStatus, View, User, SelectionSection, AbstractedData, PendingIndividualLeaseConfig, BatchTemplateData, TemplateSet, ReviewStatus, Role, SavedTemplate, DemoBooking, Availability, LeaseAmendment, AbstractedField, ChatMessage, SupportChat, Organization, OrganizationMember, OrganizationClient, WorkflowStage } from '@/shared/types';
import { Sidebar } from '@/shared/ui/Layout/Sidebar';
import { Header } from '@/shared/ui/Layout/Header';
import { HomePage } from '@/pages/home/HomePage';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { TermsPage } from '@/pages/marketing/TermsPage';
import { PrivacyPage } from '@/pages/marketing/PrivacyPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { Footer } from '@/shared/ui/Layout/Footer';
import { ChooseTemplatePage } from '@/pages/templates/ChooseTemplatePage';
import { ReviewTemplatePage } from '@/pages/templates/ReviewTemplatePage';
import { ConfigureTemplatesPage } from '@/pages/templates/ConfigureTemplatesPage';
import { BatchReviewTemplatesPage } from '@/pages/templates/BatchReviewTemplatesPage';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';
import { AdminReviewQueue } from '@/features/admin/components/AdminReviewQueue';
import { Workbench } from '@/features/leases/components/workbench/Workbench';
import { AdminClients } from '@/features/admin/components/AdminClients';
import { generateTemplateData } from '@/features/templates/types/templates';
import { AdminCompletedReviews } from '@/features/admin/components/AdminCompletedReviews';
import { AdminClientDetail } from '@/features/admin/components/AdminClientDetail';
import { AdminAiLeases } from '@/features/admin/components/AdminAiLeases';
import { EscalationModal } from '@/features/leases/components/EscalationModal';
import { AdminTotalActivity } from '@/features/admin/components/AdminTotalActivity';
import { AdminReviewers } from '@/features/admin/components/AdminReviewers';
import { ReviewerDashboard } from '@/features/reviewer/components/ReviewerDashboard';
import { ReviewerActivity } from '@/features/reviewer/components/ReviewerActivity';
import { AdminAnalytics } from '@/features/admin/components/AdminAnalytics';
import { PortfolioDashboard } from '@/pages/dashboard/PortfolioDashboard';
import { AdminAmendmentQueue } from '@/features/admin/components/AdminAmendmentQueue';
import { ReviewerAmendmentQueue } from '@/features/reviewer/components/ReviewerAmendmentQueue';
import { AmendmentUploadModal } from '@/features/leases/components/AmendmentUploadModal';
import { ChatModal } from '@/features/chat/components/ChatModal';
import { ChatManager } from '@/features/chat/components/ChatManager';
import { LocationsPage } from '@/pages/leases/LocationsPage';
import { EntitiesPage } from '@/pages/leases/EntitiesPage';

import { DashboardSkeleton } from '@/shared/ui/Layout/DashboardSkeleton';
import { LeaseInsightsPage } from '@/pages/leases/LeaseInsightsPage';
import { AdminLeaseDatabase } from '@/features/admin/components/AdminLeaseDatabase';
import { AssetsPage } from '@/pages/leases/AssetsPage';
import { canAccessAdminPanel, isSuperAdmin } from '@/shared/utils/roleEnforcement';
import { DeployAdminsList } from '@/features/admin/components/DeployAdminsList';
import { OrganizationDetail } from '@/features/admin/components/OrganizationDetail';
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
import { PricingPage } from '@/pages/marketing/PricingPage';
import { generateSingleLeaseExcel, generateBulkLeaseExcel } from '@/shared/utils/excelGenerator';
import { generateSingleLeasePdf } from '@/shared/utils/pdfGenerator';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';

import * as templateService from '@/features/templates/api/templateService';
import { updateLease } from '@/features/leases/api/leaseService';
import { fetchOrganizations, fetchOrgMembers, fetchOrgClients, createOrganization, addReviewerToOrg, removeMemberFromOrg, mapClientToOrg, unmapClientFromOrg } from '@/features/admin/api/organizationService';
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



    // Derived State for Security Scope
    const isDeployAdmin = currentUser?.role === Role.ADMIN;

    const currentOrgId = useMemo(() => {
        if (isDeployAdmin) {
            const memberRecord = orgMembers.find(m => m.userId === currentUser?.email);
            return memberRecord?.organizationId;
        }
        return null;
    }, [currentUser, orgMembers, isDeployAdmin]);

    // SCOPING LOGIC: Filter data based on role context
    const scopedLeases = useMemo(() => {
        if (isSuperAdmin(currentUser)) return leases;
        if (isDeployAdmin && currentOrgId) {
            const clientEmails = orgClients
                .filter(oc => oc.organizationId === currentOrgId && oc.status === 'Active')
                .map(oc => oc.clientUserId);
            return leases.filter(l => l.user && clientEmails.includes(l.user.email));
        }
        if (currentUser?.role === Role.REVIEWER) {
            return leases.filter(l => l.reviewer?.id === currentUser.id || l.reviewerR2?.id === currentUser.id);
        }
        return leases;
    }, [leases, currentUser, isDeployAdmin, currentOrgId, orgClients]);

    const scopedClients = useMemo(() => {
        if (isSuperAdmin(currentUser)) return users.filter(u => u.role === Role.USER);
        if (isDeployAdmin && currentOrgId) {
            const clientEmails = orgClients
                .filter(oc => oc.organizationId === currentOrgId && oc.status === 'Active')
                .map(oc => oc.clientUserId);
            return users.filter(c => c.role === Role.USER && clientEmails.includes(c.email));
        }
        return [];
    }, [users, currentUser, isDeployAdmin, currentOrgId, orgClients]);

    const scopedReviewers = useMemo(() => {
        if (isSuperAdmin(currentUser)) return users.filter(u => u.role === Role.REVIEWER);
        if (isDeployAdmin && currentOrgId) {
            const memberEmails = orgMembers
                .filter(om => om.organizationId === currentOrgId && om.role === Role.REVIEWER && om.status === 'Active')
                .map(om => om.userId);
            return users.filter(u => memberEmails.includes(u.email));
        }
        return [];
    }, [users, currentUser, isDeployAdmin, currentOrgId, orgMembers]);

    // Load Org Data, Chat Data — scoped by role to avoid leaking org data to basic users
    useEffect(() => {
        if (!currentUser?.id) return;
        let mounted = true;

        const loadGlobalData = async () => {
            if (currentUser.role === Role.USER) {
                // Basic clients only need their own support chat — no org data needed
                await createSupportChat(currentUser.id, currentUser.email, currentUser.username);
                const chats = await loadSupportChats();
                if (mounted) setSupportChats(chats);
                return;
            }

            // Admin, Super Admin, Reviewer all need org + chat data
            const [orgs, members, clients, chats] = await Promise.all([
                fetchOrganizations(),
                fetchOrgMembers(),
                fetchOrgClients(),
                loadSupportChats()
            ]);
            if (mounted) {
                setOrganizations(orgs);
                setOrgMembers(members);
                setOrgClients(clients);
                setSupportChats(chats);
            }
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
    // Previously `users` was always initialized as [] and never populated from DB.
    useEffect(() => {
        if (!currentUser?.id) return;
        if (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN) return;
        let cancelled = false;
        import('@/features/admin/api/userManagementService').then(({ listAllUsers }) => {
            listAllUsers().then(result => {
                if (cancelled || !result.success) return;
                setUsers(result.users);
            });
        });
        return () => { cancelled = true; };
    }, [currentUser?.id, currentUser?.role]);

    // Realtime subscriptions removed

    const leasesForCurrentUser = useMemo(() => {
        if (currentUser?.role === Role.SUPER_ADMIN) return leases;
        if (currentUser?.role === Role.ADMIN) return scopedLeases;
        if (currentUser?.role === Role.REVIEWER) return leases.filter(lease => lease.reviewer?.id === currentUser.id || lease.reviewerR2?.id === currentUser.id);
        if (currentUser) return leases.filter(lease => lease.user?.email === currentUser.email);
        return [];
    }, [leases, currentUser, scopedLeases]);

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
        const baseType = (templateType === 'us' || templateType === 'eu') ? templateType : (currentUser.savedTemplates?.find(t => t.id === templateType)?.type || 'us');

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
            templateType: baseType as any,
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
                const baseType = (config.templateType === 'us' || config.templateType === 'eu')
                    ? config.templateType
                    : (currentUser.savedTemplates?.find(t => t.id === config.templateType)?.type || 'us');

                // handleCreateLease: creates DB record, uploads to storage, triggers AI via Edge Function
                await handleCreateLease({
                    name: config.name,
                    status: LeaseStatus.PROCESSING,
                    processingMode: config.processingMode,
                    templateConfig: templateSet?.main,
                    templateType: baseType as any,
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
    const handleRetryLease = (lease: Lease) => processLeaseWithAI(lease, lease.documents?.map(d => ({ name: d.name, storagePath: d.storagePath || '', mimeType: 'application/pdf' })) || []);
    const handleViewLease = (lease: Lease) => { if (lease.status === LeaseStatus.ABSTRACTED) { setSelectedLease(lease); if (lease.isUpdateSeen === false) setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, isUpdateSeen: true } : l)); } };
    const handleCloseModal = () => setSelectedLease(null);

    // Auth is now handled by AuthContext. These handlers manage navigation after auth events.
    const handleAuthSuccess = () => {
        // After successful login/signup, navigate based on role
        if (currentUser) {
            if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) setActiveView('admin-dashboard');
            else if (currentUser.role === Role.REVIEWER) setActiveView('reviewer-dashboard');
            else setActiveView('abstract');
        }
        setIsAuthModalOpen(false);
    };

    // Navigate to role-appropriate view after auth state changes
    useEffect(() => {
        if (!isAuthLoading && currentUser && activeView === 'home') {
            if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN) setActiveView('admin-dashboard');
            else if (currentUser.role === Role.REVIEWER) setActiveView('reviewer-dashboard');
            else setActiveView('abstract');
        }
    }, [currentUser, isAuthLoading]);

    const handleLogout = async () => {
        if (impersonationOrigin) {
            setCurrentUser(impersonationOrigin);
            setImpersonationOrigin(null);
            setActiveView('deploy-admins');
            return;
        }
        await authSignOut();
        setActiveView('home'); setIsSidebarOpen(false);
    };
    const handleUpdateUser = (updatedUser: User) => setCurrentUser(updatedUser);
    const handleStartReview = (lease: Lease) => { setLeaseToReview(lease); if (currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) setActiveView('admin-workbench'); else if (currentUser?.role === Role.REVIEWER) setActiveView('reviewer-workbench'); };

    const localHandleSubmitReview = async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean) => {
        const { success } = await handleSubmitReview(leaseId, finalData, notes, timeSpent, skipR2);
        if (success) {
            setLeaseToReview(null);
            setActiveView((currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) ? 'admin-review-queue' : 'reviewer-dashboard');
        }
    };

    const localHandleSubmitEscalation = (leaseId: string, notes: string) => {
        handleSubmitEscalation(leaseId, notes);
        setLeaseToReview(null);
    };

    const handleDownloadExcel = useCallback((lease: Lease) => generateSingleLeaseExcel(lease), []);
    const handleDownloadAllExcel = useCallback(() => { const abstractedLeases = leasesForCurrentUser.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData); generateBulkLeaseExcel(abstractedLeases); }, [leasesForCurrentUser]);
    const handleDownloadPdf = useCallback((lease: Lease) => generateSingleLeasePdf(lease), []);

    const handleSelectClient = (client: User) => { setSelectedClient(client); setActiveView('admin-client-detail'); };

    /**
     * Phase 2 Fix: The reviewer object now comes from the Edge Function (real Supabase user ID).
     * Removed the duplicate setUsers call that was adding the reviewer twice.
     */
    const handleAddReviewer = (user: User) => {
        if (isDeployAdmin && currentOrgId) {
            const newMember: OrganizationMember = { id: `mem_${Date.now()}`, organizationId: currentOrgId, userId: user.email, role: Role.REVIEWER, status: 'Active' };
            setOrgMembers(prev => [...prev, newMember]);
        }
        // FIXED: single setUsers call (was duplicated before)
        setUsers(prev => [...prev.filter(u => u.email !== user.email), user]);
        setNotification({ type: 'success', message: `Reviewer "${user.username}" created in Supabase Auth and activated.` });
        setTimeout(() => setNotification(null), 3000);
    };


    const handleDeleteReviewer = (email: string) => { setLeases(prev => prev.map(l => { if (l.reviewer?.email === email && l.reviewStatus !== ReviewStatus.COMPLETED) { return { ...l, reviewer: undefined, reviewStatus: ReviewStatus.PENDING }; } return l; })); setUsers(prev => prev.filter(u => u.email !== email)); setNotification({ type: 'success', message: `Reviewer account deleted and workload unassigned.` }); setTimeout(() => setNotification(null), 3000); };
    /**
     * Phase 2 Fix: Persist reviewer capacity/goal changes to Supabase profiles table.
     * Previously only updated local state.
     */
    const handleUpdateReviewerSettings = async (email: string, updates: Partial<User>) => {
        // Update local state immediately for snappy UI
        setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updates } : u));
        // Find the user to get their ID for the DB update
        const reviewer = users.find(u => u.email === email);
        if (reviewer?.id) {
            const { updateManagedUserProfile } = await import('@/features/admin/api/userManagementService');
            const result = await updateManagedUserProfile(reviewer.id, {
                daily_capacity: updates.dailyCapacity,
                daily_goal: updates.dailyGoal,
            });
            if (!result.success) {
                console.error('[handleUpdateReviewerSettings] Failed to persist to DB:', result.error);
            }
        }
    };

    const handleOpenChat = (lease: Lease) => { setActiveChatLease(lease); };


    const handleSendMessage = async (chatId: string, message: string) => {
        if (!currentUser) return;

        let senderName = currentUser.username;
        if (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN) senderName = "Team Penaki";

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

    const handleAssignReviewerToSupport = async (chatId: string, reviewerEmail: string) => {
        const success = await assignReviewerToSupportChat(chatId, reviewerEmail);
        if (success) {
            setSupportChats(prev => prev.map(sc => {
                if (sc.id === chatId && !sc.allowedReviewers.includes(reviewerEmail)) {
                    return { ...sc, allowedReviewers: [...sc.allowedReviewers, reviewerEmail] };
                }
                return sc;
            }));
            setNotification({ type: 'success', message: 'Reviewer added to support chat.' });
        } else {
            setNotification({ type: 'error', message: 'Failed to assign reviewer.' });
        }
        setTimeout(() => setNotification(null), 3000);
    };



    const handleCreateOrg = async (name: string, adminName: string, adminEmail: string, adminPass: string) => {
        const newOrgId = `org_${Date.now()}`;
        const newOrg: Organization = { id: newOrgId, name, status: 'Active', planType: 'Standard', createdAt: new Date(), maxReviewers: 5, maxClients: 20 };

        const success = await createOrganization(newOrg, adminEmail);
        if (success) {
            setOrganizations(prev => [...prev, newOrg]);
            const adminMember: OrganizationMember = { id: `mem_${Date.now()}`, organizationId: newOrgId, userId: adminEmail, role: Role.ADMIN, status: 'Active' };
            setOrgMembers(prev => [...prev, adminMember]);
            setNotification({ type: 'success', message: `Organization ${name} created.` });
        } else {
            setNotification({ type: 'error', message: `Failed to create organization.` });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleManageOrg = (org: Organization) => { setSelectedOrgForDetail(org); setActiveView('org-detail'); };

    const handleLoginAs = (org: Organization) => {
        const adminMember = orgMembers.find(m => m.organizationId === org.id && m.role === Role.ADMIN);
        if (!adminMember) { setNotification({ type: 'error', message: 'No admin found for this organization.' }); return; }
        const adminUser = users.find(u => u.email === adminMember.userId);
        if (adminUser && currentUser) {
            setImpersonationOrigin(currentUser);
            setCurrentUser(adminUser);
            setActiveView('admin-dashboard');
            setNotification({ type: 'success', message: `Impersonating admin of ${org.name}` });
        }
    };

    const handleMapClient = async (clientUserId: string) => {
        if (!selectedOrgForDetail) return;
        const success = await mapClientToOrg(selectedOrgForDetail.id, clientUserId);
        if (success) {
            const mapping: OrganizationClient = { id: `map_${Date.now()}`, organizationId: selectedOrgForDetail.id, clientUserId, assignedAt: new Date(), status: 'Active' };
            setOrgClients(prev => [...prev, mapping]);
            setNotification({ type: 'success', message: 'Client mapped successfully.' });
        } else {
            setNotification({ type: 'error', message: 'Failed to map client.' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUnmapClient = async (clientUserId: string) => {
        if (!selectedOrgForDetail) return;
        const success = await unmapClientFromOrg(selectedOrgForDetail.id, clientUserId);
        if (success) {
            setOrgClients(prev => prev.filter(c => !(c.organizationId === selectedOrgForDetail.id && c.clientUserId === clientUserId)));
            setNotification({ type: 'success', message: 'Client unmapped.' });
        } else {
            setNotification({ type: 'error', message: 'Failed to unmap client.' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleRemoveOrgMember = async (userId: string) => {
        if (!selectedOrgForDetail) return;
        const success = await removeMemberFromOrg(selectedOrgForDetail.id, userId);
        if (success) {
            setOrgMembers(prev => prev.filter(m => !(m.organizationId === selectedOrgForDetail.id && m.userId === userId)));
            setNotification({ type: 'success', message: 'Member removed.' });
        } else {
            setNotification({ type: 'error', message: 'Failed to remove member.' });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    
    const renderContent = () => {
        return (
            <Routes>
                <Route path="/" element={<HomePage onGetStarted={() => setActiveView('abstract')} user={currentUser} leases={leasesForCurrentUser} onBookDemo={() => setIsDemoModalOpen(true)} />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/portfolio" element={<PortfolioDashboard leases={leasesForCurrentUser} />} />
                <Route path="/assets" element={<AssetsPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />} />
                <Route path="/abstract" element={<UploadForm onUploadSuccess={handleUploadSuccess} />} />
                
                <Route path="/templates/choose" element={<ChooseTemplatePage onSelectTemplate={handleSelectBaseTemplate} onProceedToReview={() => setActiveView('review-template')} />} />
                <Route path="/templates/review" element={<ReviewTemplatePage baseTemplate={selectedBaseTemplate} onProceedToConfigure={() => setActiveView('configure-templates')} onBack={() => setActiveView('choose-template')} />} />
                <Route path="/templates/configure" element={<ConfigureTemplatesPage prefilledData={prefilledTemplateData} onSave={handleSaveTemplate} onBack={() => setActiveView('review-template')} />} />
                <Route path="/templates/batch-review" element={<BatchReviewTemplatesPage batchData={pendingBatchTemplates!} onConfirm={handleConfirmBatchTemplates} onBack={() => setActiveView('abstract')} />} />
                
                <Route path="/history" element={<HistoryTable leases={leasesForCurrentUser} onViewSubmission={handleViewSubmission} onEditLease={handleEditLease} onGenerateExcel={handleDownloadExcel} onViewInsights={(lease) => { setLeaseForInsights(lease); setActiveView('lease-insights'); }} />} />
                <Route path="/locations" element={<LocationsPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />} />
                <Route path="/entities" element={<EntitiesPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />} />
                <Route path="/chats" element={currentUser ? <ChatManager leases={leasesForCurrentUser} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} /> : null} />
                <Route path="/insights" element={leaseForInsights ? <LeaseInsightsPage lease={leases.find(l => l.id === leaseForInsights.id) || leaseForInsights} onBack={() => setActiveView('lease-summaries')} onGenerateSummary={handleGenerateLeaseSummary} onAskAgent={handleAskLeaseAgent} currentUser={currentUser} /> : null} />
                
                <Route path="/profile" element={currentUser ? <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} onDeleteTemplate={handleDeleteTemplate} onUpdateTemplate={handleUpdateTemplate} /> : null} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={canAccessAdminPanel(currentUser) ? <AdminDashboard leases={scopedLeases} users={scopedClients} onNavigate={handleAdminNavigate} demoBookings={[]} /> : null} />
                <Route path="/admin/analytics" element={canAccessAdminPanel(currentUser) ? <AdminAnalytics leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} /> : null} />
                <Route path="/admin/queue" element={canAccessAdminPanel(currentUser) ? <AdminReviewQueue leases={scopedLeases} reviewers={scopedReviewers} onStartReview={handleStartReview} onAssignLease={handleAssignLease} currentUser={currentUser} notification={notification} onClearNotification={() => setNotification(null)} /> : null} />
                <Route path="/admin/amendments" element={canAccessAdminPanel(currentUser) ? <AdminAmendmentQueue leases={scopedLeases} reviewers={scopedReviewers} onStartReview={handleStartReview} onAssignLease={handleAssignLease} currentUser={currentUser} notification={notification} onClearNotification={() => setNotification(null)} /> : null} />
                <Route path="/admin/workbench" element={canAccessAdminPanel(currentUser) ? <Workbench mode="admin" lease={leaseToReview} onBack={() => { setLeaseToReview(null); setActiveView(leaseToReview?.status === LeaseStatus.AMENDMENT_REVIEW ? 'admin-amendments' : 'admin-review-queue'); }} onSaveDraft={handleSaveDraft} onSubmitReview={handleSubmitReview} /> : null} />
                <Route path="/admin/clients" element={canAccessAdminPanel(currentUser) ? <AdminClients clients={scopedClients} leases={scopedLeases} onSelectClient={handleSelectClient} /> : null} />
                <Route path="/admin/completed-reviews" element={canAccessAdminPanel(currentUser) ? <AdminCompletedReviews leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} /> : null} />
                <Route path="/admin/ai-leases" element={canAccessAdminPanel(currentUser) ? <AdminAiLeases leases={scopedLeases} onViewLease={handleViewLease} onBack={() => setActiveView('admin-dashboard')} initialFilter={adminFilter} /> : null} />
                <Route path="/admin/activity" element={canAccessAdminPanel(currentUser) ? <AdminTotalActivity leases={scopedLeases} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onBack={() => setActiveView('admin-dashboard')} initialFilter={adminFilter} /> : null} />
                <Route path="/admin/client" element={selectedClient && canAccessAdminPanel(currentUser) ? <AdminClientDetail client={selectedClient} leases={scopedLeases.filter(l => l.user?.email === selectedClient.email)} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onBack={() => setActiveView('admin-clients')} /> : null} />
                <Route path="/admin/reviewers" element={canAccessAdminPanel(currentUser) ? <AdminReviewers reviewers={scopedReviewers} allLeases={scopedLeases} onAddReviewer={handleAddReviewer} onDeleteReviewer={handleDeleteReviewer} onUpdateReviewerSettings={handleUpdateReviewerSettings} /> : null} />
                <Route path="/admin/chats" element={currentUser && canAccessAdminPanel(currentUser) ? <ChatManager leases={scopedLeases} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} onAssignReviewer={handleAssignReviewerToSupport} reviewers={scopedReviewers} /> : null} />
                <Route path="/admin/database" element={canAccessAdminPanel(currentUser) ? <AdminLeaseDatabase leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} /> : null} />

                {/* Super Admin */}
                <Route path="/superadmin/deploy" element={isSuperAdmin(currentUser) ? <DeployAdminsList organizations={organizations} users={users} onCreateOrg={handleCreateOrg} onManageOrg={handleManageOrg} onLoginAs={handleLoginAs} /> : null} />
                <Route path="/superadmin/org" element={selectedOrgForDetail && isSuperAdmin(currentUser) ? <OrganizationDetail org={selectedOrgForDetail} orgMembers={orgMembers.filter(m => m.organizationId === selectedOrgForDetail.id)} orgClients={orgClients.filter(c => c.organizationId === selectedOrgForDetail.id)} allUsers={users} onBack={() => setActiveView('deploy-admins')} onMapClient={handleMapClient} onUnmapClient={handleUnmapClient} onRemoveMember={handleRemoveOrgMember} onAddMember={() => { }} /> : null} />

                {/* Reviewer */}
                <Route path="/reviewer/dashboard" element={currentUser?.role === Role.REVIEWER ? <ReviewerDashboard leases={leases} currentUser={currentUser} onOpenWorkbench={handleStartReview} onNavigateToActivity={(filter) => handleAdminNavigate('reviewer-activity', filter)} /> : null} />
                <Route path="/reviewer/workbench" element={currentUser?.role === Role.REVIEWER ? <Workbench mode="reviewer" lease={leaseToReview} onBack={() => { setLeaseToReview(null); setActiveView(leaseToReview?.status === LeaseStatus.AMENDMENT_REVIEW ? 'reviewer-amendments' : 'reviewer-dashboard'); }} onSaveDraft={handleSaveDraft} onSubmitReview={handleSubmitReview} /> : null} />
                <Route path="/reviewer/activity" element={currentUser?.role === Role.REVIEWER ? <ReviewerActivity leases={leases} currentUser={currentUser} onBack={() => setActiveView('reviewer-dashboard')} initialFilter={adminFilter} /> : null} />
                <Route path="/reviewer/amendments" element={currentUser?.role === Role.REVIEWER ? <ReviewerAmendmentQueue leases={leases} currentUser={currentUser} onOpenWorkbench={handleStartReview} onBack={() => setActiveView('reviewer-dashboard')} /> : null} />
                <Route path="/reviewer/chats" element={currentUser?.role === Role.REVIEWER ? <ChatManager leases={leases} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} /> : null} />
                
                {/* Fallback */}
                <Route path="*" element={<HomePage onGetStarted={() => setActiveView('abstract')} user={currentUser} leases={leasesForCurrentUser} onBookDemo={() => setIsDemoModalOpen(true)} />} />
            </Routes>
        );
    };
const isWorkbenchActive = activeView === 'admin-workbench' || activeView === 'reviewer-workbench';
    const isHomeActive = activeView === 'home';
    const isChatActive = activeView === 'admin-chats' || activeView === 'reviewer-chats' || activeView === 'client-chats';
    const isAssetsActive = activeView === 'assets';
    const isFullWidthView = isWorkbenchActive || isHomeActive || isChatActive || isAssetsActive || activeView === 'lease-insights' || activeView.startsWith('product-') || activeView.startsWith('solution-') || activeView === 'pricing';

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col">
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
            <div className={`flex-1 flex flex-col transition-all duration-300 ${currentUser && !selectedLease && !isWorkbenchActive ? 'md:ml-20' : ''}`}>
                <Header activeView={activeView} user={currentUser} onProfileClick={() => { setAuthModalInitialView('signup'); setIsAuthModalOpen(true); }} onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setActiveView} onBookDemo={() => setIsDemoModalOpen(true)} isSidebarOpen={isSidebarOpen} />

                <main className={`flex-1 ${isFullWidthView ? 'overflow-y-auto' : 'p-4 sm:p-8 overflow-y-auto'}`}>
                    <div key={activeView} className={`animate-fade-in ${isWorkbenchActive || isChatActive || isAssetsActive || activeView === 'lease-insights' ? 'h-full' : ''} ${isHomeActive ? 'min-h-full' : ''}`}>{renderContent()}</div>
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