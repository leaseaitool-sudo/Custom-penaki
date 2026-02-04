

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UploadForm } from './components/UploadForm';
import { HistoryTable } from './components/HistoryTable';
import { ViewSubmissionModal } from './components/ViewSubmissionModal';
import { Lease, LeaseStatus, View, User, SelectionSection, AbstractedData, PendingIndividualLeaseConfig, BatchTemplateData, TemplateSet, ReviewStatus, Role, SavedTemplate, DemoBooking, Availability, LeaseAmendment, AbstractedField, ChatMessage, SupportChat, Organization, OrganizationMember, OrganizationClient, WorkflowStage } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ProfilePage } from './components/ProfilePage';
import { Footer } from './components/Footer';
import { ChooseTemplatePage } from './components/ChooseTemplatePage';
import { ReviewTemplatePage } from './components/ReviewTemplatePage';
import { ConfigureTemplatesPage } from './components/ConfigureTemplatesPage';
import { BatchReviewTemplatesPage } from './components/BatchReviewTemplatesPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminReviewQueue } from './components/admin/AdminReviewQueue';
import { Workbench } from './components/shared/Workbench';
import { AdminClients } from './components/admin/AdminClients';
import { generateTemplateData } from './templates';
import { GoogleGenAI, Type } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import { AdminCompletedReviews } from './components/admin/AdminCompletedReviews';
import { AdminClientDetail } from './components/admin/AdminClientDetail';
import { AdminAiLeases } from './components/admin/AdminAiLeases';
import { EscalationModal } from './components/EscalationModal';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminTotalActivity } from './components/admin/AdminTotalActivity';
import { isAdminEmail, isReviewerEmail } from './utils/auth';
import { AdminReviewers } from './components/admin/AdminReviewers';
import { ReviewerDashboard } from './components/reviewer/ReviewerDashboard';
import { ReviewerActivity } from './components/reviewer/ReviewerActivity';
import { generateProtocolPrompt, rehydrateData } from './utils/protocolEngine';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { PortfolioDashboard } from './components/client/PortfolioDashboard';
import { AdminAmendmentQueue } from './components/admin/AdminAmendmentQueue';
import { ReviewerAmendmentQueue } from './components/reviewer/ReviewerAmendmentQueue';
import { usTemplateGuidelines, systemInstructionBase } from './constants';
import { AmendmentUploadModal } from './components/AmendmentUploadModal';
import { ChatModal } from './components/ChatModal';
import { ChatManager } from './components/ChatManager';
import { LocationsPage } from './components/LocationsPage';
import { EntitiesPage } from './components/EntitiesPage';
import { RemindersPage } from './components/RemindersPage';
import { LeaseInsightsPage } from './components/LeaseInsightsPage';
import { AdminLeaseDatabase } from './components/admin/AdminLeaseDatabase';
import { AssetsPage } from './components/AssetsPage';
import { DeployAdminsList } from './components/super-admin/DeployAdminsList';
import { OrganizationDetail } from './components/super-admin/OrganizationDetail';
import { MapPinIcon } from './components/icons/MapPinIcon';
import { BellIcon } from './components/icons/BellIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ChatBubbleLeftRightIcon } from './components/icons/ChatBubbleLeftRightIcon';
import { ChartPieIcon } from './components/icons/ChartPieIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { CircleStackIcon } from './components/icons/CircleStackIcon';
import { CheckBadgeIcon } from './components/icons/CheckBadgeIcon';
import { PresentationChartLineIcon } from './components/icons/PresentationChartLineIcon';
import { MagnifyingGlassIcon } from './components/icons/MagnifyingGlassIcon';
import { BookDemoModal } from './components/BookDemoModal';
import { PricingPage } from './components/PricingPage';
import { generateSingleLeaseExcel, generateBulkLeaseExcel } from './utils/excelGenerator';
import { generateSingleLeasePdf } from './utils/pdfGenerator';
import { ScrollAnimatedSection } from './components/ScrollAnimatedSection';
import { ArrowRightIcon } from './components/icons/ArrowRightIcon';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const [activeView, setActiveView] = useState<View>('home');
    const [leases, setLeases] = useState<Lease[]>([]);
    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([
        { username: 'Pinaki Super', email: 'pinaki@gmail.com', role: Role.SUPER_ADMIN, savedTemplates: [] },
        { username: 'Penaki Reviewer', email: 'penaki@gmail.com', role: Role.REVIEWER, savedTemplates: [] },
        { username: 'Second Reviewer', email: 'reviewer2@gmail.com', role: Role.REVIEWER, savedTemplates: [] }
    ]);
    const [authModalInitialView, setAuthModalInitialView] = useState<'login' | 'signup'>('signup');
    const [pendingLease, setPendingLease] = useState<PendingLease | null>(null);
    const [pendingIndividualLeases, setPendingIndividualLeases] = useState<PendingIndividualLeaseConfig[] | null>(null);
    const [pendingBatchTemplates, setPendingBatchTemplates] = useState<BatchTemplateData | null>(null);
    const [leaseToReview, setLeaseToReview] = useState<Lease | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [leaseForAmendment, setLeaseForAmendment] = useState<Lease | null>(null);
    const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([]);
    const [availability, setAvailability] = useState<Availability>({});
    const [prefilledTemplateData, setPrefilledTemplateData] = useState<SelectionSection[] | undefined>(undefined);
    const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>(undefined);
    const [adminFilter, setAdminFilter] = useState<string>('All');
    const [leaseForInsights, setLeaseForInsights] = useState<Lease | null>(null);

    // Organization State
    const [organizations, setOrganizations] = useState<Organization[]>([
        { id: 'org_global', name: 'Global Services (Default)', status: 'Active', planType: 'Enterprise', createdAt: new Date(), maxClients: 100, maxReviewers: 50 }
    ]);
    const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([
        { id: 'mem_1', organizationId: 'org_global', userId: 'penaki@gmail.com', role: Role.REVIEWER, status: 'Active' },
        { id: 'mem_2', organizationId: 'org_global', userId: 'reviewer2@gmail.com', role: Role.REVIEWER, status: 'Active' }
    ]);
    const [orgClients, setOrgClients] = useState<OrganizationClient[]>([]);
    const [selectedOrgForDetail, setSelectedOrgForDetail] = useState<Organization | null>(null);
    const [impersonationOrigin, setImpersonationOrigin] = useState<User | null>(null);

    // Chat State
    const [activeChatLease, setActiveChatLease] = useState<Lease | null>(null);
    const [supportChats, setSupportChats] = useState<SupportChat[]>([]);

    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    // Persistence Logic: Load from LocalStorage
    useEffect(() => {
        const savedLeases = localStorage.getItem('penaki_leases');
        if (savedLeases) {
            try {
                const parsed = JSON.parse(savedLeases);
                // Re-hydrate dates
                const hydrated = parsed.map((l: any) => ({
                    ...l,
                    uploadDate: new Date(l.uploadDate),
                    lastSaved: l.lastSaved ? new Date(l.lastSaved) : undefined,
                    assignedDate: l.assignedDate ? new Date(l.assignedDate) : undefined,
                    assignedDateR2: l.assignedDateR2 ? new Date(l.assignedDateR2) : undefined,
                }));
                setLeases(hydrated);
            } catch (e) {
                console.error("Failed to hydrate leases", e);
            }
        }
    }, []);

    // Persistence Logic: Save to LocalStorage
    useEffect(() => {
        if (leases.length > 0) {
            localStorage.setItem('penaki_leases', JSON.stringify(leases));
        }
    }, [leases]);

    // Derived State for Security Scope
    const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN;
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
        if (isSuperAdmin) return leases;
        if (isDeployAdmin && currentOrgId) {
            const clientEmails = orgClients
                .filter(oc => oc.organizationId === currentOrgId && oc.status === 'Active')
                .map(oc => oc.clientUserId);
            return leases.filter(l => l.user && clientEmails.includes(l.user.email));
        }
        if (currentUser?.role === Role.REVIEWER) {
            return leases.filter(l => l.reviewer?.email === currentUser.email || l.reviewerR2?.email === currentUser.email);
        }
        return leases;
    }, [leases, currentUser, isSuperAdmin, isDeployAdmin, currentOrgId, orgClients]);

    const scopedClients = useMemo(() => {
        if (isSuperAdmin) return users.filter(u => u.role === Role.USER);
        if (isDeployAdmin && currentOrgId) {
            const clientEmails = orgClients
                .filter(oc => oc.organizationId === currentOrgId && oc.status === 'Active')
                .map(oc => oc.clientUserId);
            return users.filter(c => c.role === Role.USER && clientEmails.includes(c.email));
        }
        return [];
    }, [users, isSuperAdmin, isDeployAdmin, currentOrgId, orgClients]);

    const scopedReviewers = useMemo(() => {
        if (isSuperAdmin) return users.filter(u => u.role === Role.REVIEWER);
        if (isDeployAdmin && currentOrgId) {
            const memberEmails = orgMembers
                .filter(om => om.organizationId === currentOrgId && om.role === Role.REVIEWER && om.status === 'Active')
                .map(om => om.userId);
            return users.filter(u => memberEmails.includes(u.email));
        }
        return [];
    }, [users, isSuperAdmin, isDeployAdmin, currentOrgId, orgMembers]);

    // Ensure support chat exists for current user on login
    useEffect(() => {
        if (currentUser && currentUser.role === Role.USER) {
            const supportId = `support_${currentUser.email}`;
            setSupportChats(prev => {
                if (prev.some(sc => sc.id === supportId)) return prev;
                return [...prev, {
                    id: supportId,
                    clientEmail: currentUser.email,
                    clientName: currentUser.username,
                    messages: [{
                        id: 'welcome',
                        senderRole: Role.ADMIN,
                        senderName: 'Team Penaki',
                        content: 'Welcome to Penaki Support. How can we help you today?',
                        timestamp: new Date()
                    }],
                    allowedReviewers: [],
                    lastUpdated: new Date()
                }];
            });
        }
    }, [currentUser]);

    const leasesForCurrentUser = useMemo(() => {
        if (currentUser?.role === Role.SUPER_ADMIN) return leases;
        if (currentUser?.role === Role.ADMIN) return scopedLeases;
        if (currentUser?.role === Role.REVIEWER) return leases.filter(lease => lease.reviewer?.email === currentUser.email || lease.reviewerR2?.email === currentUser.email);
        if (currentUser) return leases.filter(lease => lease.user?.email === currentUser.email);
        return [];
    }, [leases, currentUser, scopedLeases]);

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => { const reader = new FileReader(); reader.onloadend = () => resolve((reader.result as string).split(',')[1]); reader.readAsDataURL(file); });
        return { inlineData: { data: await base64EncodedDataPromise, mimeType: file.type } };
    };

    const processLeaseWithAI = useCallback(async (leaseToProcess: Lease, retryAttempt = 0) => {
        const { fileObjects, templateConfig, templateType } = leaseToProcess;
        if (!fileObjects || !templateConfig || !templateType) { setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.FAILED } : l)); return; }
        setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.PROCESSING } : l));
        try {
            const startTime = Date.now();
            const contents = [];
            for (const file of fileObjects) { contents.push({ text: `[START OF DOCUMENT: ${file.name}]` }); contents.push(await fileToGenerativePart(file)); contents.push({ text: `[END OF DOCUMENT: ${file.name}]` }); }
            const protocolLegend = generateProtocolPrompt(templateConfig);
            let systemInstruction = systemInstructionBase;
            if (templateType === 'us') systemInstruction += `\n\nGUIDELINES:\n\n${usTemplateGuidelines}`;
            systemInstruction += `\n\n${protocolLegend}`;
            const userPrompt = `Extract information according to the PROTOCOL LEGEND provided. Return ONLY the JSON Array of ProtocolItems.`;
            contents.push({ text: userPrompt });
            const isBundle = fileObjects.length > 1;
            const schemaProperties: any = { code: { type: Type.STRING }, value: { type: Type.STRING, nullable: true }, page: { type: Type.INTEGER, nullable: true }, snippet: { type: Type.STRING, nullable: true }, };
            const requiredFields = ['code', 'value', 'page', 'snippet'];
            if (isBundle) { schemaProperties.fileName = { type: Type.STRING, nullable: true }; requiredFields.push('fileName'); }
            const responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: schemaProperties, required: requiredFields } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: responseSchema } });
            const duration = Date.now() - startTime;
            let rawData;
            try { rawData = JSON.parse(response.text); } catch (parseError) { console.error("JSON Parse Error:", parseError, response.text); throw new Error("Failed to parse AI response"); }
            const abstractedData = rehydrateData(rawData, templateConfig);
            setLeases(prev => prev.map(l => l.id !== leaseToProcess.id ? l : { ...l, status: leaseToProcess.processingMode === 'human' ? LeaseStatus.IN_REVIEW : LeaseStatus.ABSTRACTED, abstractedData, reviewStatus: leaseToProcess.processingMode === 'human' ? ReviewStatus.PENDING : undefined, workflowStage: leaseToProcess.processingMode === 'human' ? 'R1_PENDING' : 'COMPLETED', aiModelLatency: duration }));
        } catch (error) {
            console.error("AI Processing Error:", error);
            if (retryAttempt < 3) { await new Promise(r => setTimeout(r, 2000)); processLeaseWithAI(leaseToProcess, retryAttempt + 1); }
            else { setLeases(prev => prev.map(l => l.id === leaseToProcess.id ? { ...l, status: LeaseStatus.FAILED } : l)); }
        }
    }, []);

    const processAmendmentWithAI = useCallback(async (lease: Lease, amendmentFile: File, amendmentName: string) => {
        const newAmendment: LeaseAmendment = { id: `amend_${Date.now()}`, name: amendmentName, date: new Date(), document: { id: `${Date.now()}-${amendmentFile.name}`, name: amendmentFile.name, url: URL.createObjectURL(amendmentFile) } };
        setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, status: LeaseStatus.PROCESSING, amendments: [...(l.amendments || []), newAmendment], documents: [...l.documents, newAmendment.document] } : l));
        try {
            const contents = [];
            contents.push({ text: `[START OF AMENDMENT DOCUMENT: ${amendmentFile.name}]` });
            contents.push(await fileToGenerativePart(amendmentFile));
            contents.push({ text: `[END OF AMENDMENT DOCUMENT]` });
            const systemInstruction = `You are an expert legal analyst processing a LEASE AMENDMENT.\nOBJECTIVE: Extract new or changed data.\nPROTOCOL: Use provided codes.\n${generateProtocolPrompt(lease.templateConfig || [])}`;
            const schemaProperties: any = { code: { type: Type.STRING }, value: { type: Type.STRING, nullable: true }, page: { type: Type.INTEGER, nullable: true }, snippet: { type: Type.STRING, nullable: true }, fileName: { type: Type.STRING, nullable: true } };
            const responseSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: schemaProperties, required: ['code', 'value', 'page', 'snippet'] } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: contents, config: { systemInstruction, responseMimeType: 'application/json', responseSchema: responseSchema } });
            setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, status: LeaseStatus.AMENDMENT_REVIEW, reviewStatus: ReviewStatus.PENDING, workflowStage: 'R1_PENDING', processingMode: 'human', abstractedData: lease.abstractedData } : l));
            setNotification({ type: 'success', message: 'Amendment processed.' }); setTimeout(() => setNotification(null), 4000);
        } catch (error) {
            console.error("Amendment processing failed", error);
            setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, status: LeaseStatus.ABSTRACTED } : l));
            setNotification({ type: 'error', message: 'Failed to process amendment.' });
        }
    }, []);

    const handleGenerateLeaseSummary = async (lease: Lease) => {
        if (!lease.abstractedData) return;
        const systemInstruction = `Role: Senior Real Estate Analyst. Task: Analyze the provided lease abstraction data and return a structured JSON summary object. REQUIREMENTS: 1. Output must be a valid JSON object. 2. Use Markdown headers (e.g. "**Landlord:**") within the content strings to separate distinct topics/entities inside a section. 3. Format specific sections as strings containing "Label: Value" lists separated by newlines for 'criticalDates' and 'financials' to allow card rendering. 4. 'executiveSummary', 'clauses', and 'riskAssessment' should be concise paragraphs or bullet points with bold headers for key terms.`;
        const summarySchema = {
            type: Type.OBJECT,
            properties: {
                executiveSummary: { type: Type.STRING },
                criticalDates: { type: Type.STRING },
                financials: { type: Type.STRING },
                clauses: { type: Type.STRING },
                riskAssessment: { type: Type.STRING },
            },
            required: ["executiveSummary", "criticalDates", "financials", "clauses", "riskAssessment"]
        };

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ parts: [{ text: `Generate summary based on this data: ${JSON.stringify(lease.abstractedData)}` }] }],
                config: { systemInstruction, responseMimeType: 'application/json', responseSchema: summarySchema }
            });
            const summary = response.text;
            setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, aiSummary: summary } : l));
        } catch (e) {
            console.error("Summary failed", e);
            setNotification({ type: 'error', message: "Failed to generate AI summary." });
        }
    };

    const handleAskLeaseAgent = async (lease: Lease, history: { role: string, text: string }[], question: string) => {
        const systemInstruction = `Role: Lease Assistant AI.\nData Context: ${JSON.stringify(lease.abstractedData)}`;
        const historyContents = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
        try {
            const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction }, history: historyContents });
            const result = await chat.sendMessage({ message: question });
            return result.text;
        } catch (e) { console.error("Agent failed", e); throw e; }
    };

    const handleOpenLeaseInsights = (lease: Lease) => { setLeaseForInsights(lease); setActiveView('lease-insights'); };
    const handleAddAmendment = (lease: Lease, file: File, name: string) => processAmendmentWithAI(lease, file, name);
    const handleProceedToTemplatesSingle = useCallback((formData: { files: File[]; name: string; processingMode: 'ai' | 'human' }) => { if (!currentUser) { setAuthModalInitialView('login'); setIsAuthModalOpen(true); return; } setPendingLease(formData); setActiveView('choose-template'); }, [currentUser]);
    const handleProceedToTemplatesMultiple = useCallback((leasesData: { file: File; name: string; processingMode: 'ai' | 'human' }[]) => { if (!currentUser) { setAuthModalInitialView('login'); setIsAuthModalOpen(true); return; } setPendingIndividualLeases(leasesData.map(lease => ({ ...lease, templateType: 'us' as any }))); setActiveView('configure-templates'); }, [currentUser]);
    const handleProceedToBatchReview = (configuredLeases: PendingIndividualLeaseConfig[]) => { setPendingIndividualLeases(configuredLeases); const templates: BatchTemplateData = {}; const processedTemplateTypes = new Set(configuredLeases.map(l => l.templateType)); processedTemplateTypes.forEach(type => { const saved = currentUser?.savedTemplates?.find(t => t.id === type); if (saved) { const { optional } = generateTemplateData(saved.type); templates[type as any] = { main: saved.sections, optional, originalOptionalIds: new Set(optional.map(s => s.id)) }; } else if (type === 'us' || type === 'eu') { const { main, optional } = generateTemplateData(type as any); templates[type as any] = { main, optional, originalOptionalIds: new Set(optional.map(s => s.id)) }; } }); setPendingBatchTemplates(templates); setActiveView('batch-review-templates'); };
    const handleSelectTemplate = (templateType: 'us' | 'eu') => { if (!pendingLease) return; setPendingLease(prev => ({ ...prev!, templateType })); setPrefilledTemplateData(undefined); setPendingTemplateId(undefined); setActiveView('review-template'); };
    const handleSelectSavedTemplate = (template: SavedTemplate) => { if (!pendingLease) return; setPendingLease(prev => ({ ...prev!, templateType: template.id })); setPrefilledTemplateData(template.sections); setPendingTemplateId(template.id); setActiveView('review-template'); };
    const handleSaveTemplate = (name: string, type: 'us' | 'eu' | string, sections: SelectionSection[]) => { if (!currentUser) return; const baseType = (type === 'us' || type === 'eu') ? type : (currentUser.savedTemplates?.find(t => t.id === type)?.type || 'us'); const newTemplate: SavedTemplate = { id: `tpl_${Date.now()}`, name, type: baseType as any, sections, dateCreated: new Date(), lastModified: new Date() }; const updatedUser = { ...currentUser, savedTemplates: [...(currentUser.savedTemplates || []), newTemplate] }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); setNotification({ type: 'success', message: `Template "${name}" saved!` }); };
    const handleUpdateTemplate = (updatedTemplate: SavedTemplate) => { if (!currentUser) return; const updatedUser = { ...currentUser, savedTemplates: (currentUser.savedTemplates || []).map(t => t.id === updatedTemplate.id ? updatedTemplate : t) }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); };
    const handleDeleteTemplate = (templateId: string) => { if (!currentUser) return; const updatedUser = { ...currentUser, savedTemplates: (currentUser.savedTemplates || []).filter(t => t.id !== templateId) }; setCurrentUser(updatedUser); setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u)); };
    const handleFinalSubmit = (finalTemplateData: SelectionSection[]) => { if (!pendingLease || !pendingLease.templateType || !currentUser) { setActiveView('abstract'); return; } const { name, files, templateType, processingMode } = pendingLease; const userLeases = leases.filter(l => l.user?.email === currentUser.email); const highestId = userLeases.length > 0 ? Math.max(0, ...userLeases.map(l => parseInt(l.id.split('_').pop() || '0', 10))) : 0; const numericId = (highestId + 1).toString().padStart(6, '0'); const newLeaseId = `${currentUser.username.toLowerCase().replace(/\s+/g, '')}_${numericId}`; const baseType = (templateType === 'us' || templateType === 'eu') ? templateType : (currentUser.savedTemplates?.find(t => t.id === templateType)?.type || 'us'); const newLease: Lease = { id: newLeaseId, name, documents: files.map(file => ({ id: `${Date.now()}-${file.name}`, name: file.name, url: URL.createObjectURL(file) })), uploadDate: new Date(), status: LeaseStatus.PROCESSING, abstractedData: [], processingMode, user: currentUser, fileObjects: files, templateConfig: finalTemplateData, templateType: baseType as any, timeSpent: 0, timeSpentR1: 0, timeSpentR2: 0 }; setLeases(prev => [newLease, ...prev]); setPendingLease(null); setPrefilledTemplateData(undefined); setPendingTemplateId(undefined); setActiveView('history'); processLeaseWithAI(newLease); };
    const handleFinalBatchSubmit = (editedTemplates: BatchTemplateData, saveTemplateName?: string) => { if (!pendingIndividualLeases || !currentUser) { setActiveView('abstract'); return; } if (saveTemplateName) { const typeToSave = editedTemplates.us ? 'us' : (editedTemplates.eu ? 'eu' : Object.keys(editedTemplates)[0]); const set = editedTemplates[typeToSave as any]; if (set) handleSaveTemplate(saveTemplateName, typeToSave, set.main); } const userLeases = leases.filter(l => l.user?.email === currentUser.email); let highestId = userLeases.length > 0 ? Math.max(0, ...userLeases.map(l => parseInt(l.id.split('_').pop() || '0', 10))) : 0; const newLeasesToProcess: Lease[] = pendingIndividualLeases.map((config) => { highestId++; const numericId = String(highestId).padStart(6, '0'); const newLeaseId = `${currentUser.username.toLowerCase().replace(/\s+/g, '')}_${numericId}`; const templateSet = editedTemplates[config.templateType as any]; const baseType = (config.templateType === 'us' || config.templateType === 'eu') ? config.templateType : (currentUser.savedTemplates?.find(t => t.id === config.templateType)?.type || 'us'); return { id: newLeaseId, name: config.name, documents: [{ id: `${Date.now()}-${config.file.name}`, name: config.file.name, url: URL.createObjectURL(config.file) }], uploadDate: new Date(), status: LeaseStatus.PROCESSING, abstractedData: [], processingMode: config.processingMode, user: currentUser, fileObjects: [config.file], templateConfig: templateSet?.main, templateType: baseType as any, timeSpent: 0, timeSpentR1: 0, timeSpentR2: 0 }; }); setLeases(prev => [...newLeasesToProcess, ...prev]); setActiveView('history'); newLeasesToProcess.forEach(lease => processLeaseWithAI(lease)); setPendingIndividualLeases(null); setPendingBatchTemplates(null); };
    const handleRetryLease = (lease: Lease) => processLeaseWithAI(lease);
    const handleViewLease = (lease: Lease) => { if (lease.status === LeaseStatus.ABSTRACTED) { setSelectedLease(lease); if (lease.isUpdateSeen === false) setLeases(prev => prev.map(l => l.id === lease.id ? { ...l, isUpdateSeen: true } : l)); } };
    const handleCloseModal = () => setSelectedLease(null);

    const handleLogin = (user: User) => {
        if (isReviewerEmail(user.email) && user.role !== Role.REVIEWER && user.role !== Role.SUPER_ADMIN) {
            user = { ...user, role: Role.REVIEWER };
        }
        if (isAdminEmail(user.email) && user.role !== Role.SUPER_ADMIN) user = { ...user, role: Role.SUPER_ADMIN };
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        if (user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN) setActiveView('admin-dashboard');
        else if (user.role === Role.REVIEWER) setActiveView('reviewer-dashboard');
        else setActiveView('abstract');
    };

    const handleSignUp = (user: User) => {
        if (isReviewerEmail(user.email)) user = { ...user, role: Role.REVIEWER };
        if (isAdminEmail(user.email)) user = { ...user, role: Role.SUPER_ADMIN };
        setUsers(prev => [...prev, user]);
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        if (user.role === Role.REVIEWER) setActiveView('reviewer-dashboard');
        else if (user.role === Role.SUPER_ADMIN) setActiveView('admin-dashboard');
        else setActiveView('abstract');
    };

    const handleLogout = () => {
        if (impersonationOrigin) {
            setCurrentUser(impersonationOrigin);
            setImpersonationOrigin(null);
            setActiveView('deploy-admins');
            return;
        }
        setCurrentUser(null); setActiveView('home'); setIsSidebarOpen(false);
    };
    const handleUpdateUser = (updatedUser: User) => setCurrentUser(updatedUser);
    const handleStartReview = (lease: Lease) => { setLeaseToReview(lease); if (currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) setActiveView('admin-workbench'); else if (currentUser?.role === Role.REVIEWER) setActiveView('reviewer-workbench'); };

    const handleAssignLease = (leaseToAssign: Lease, reviewer: User, targetRole: 'R1' | 'R2' = 'R1') => {
        if (!currentUser || (currentUser.role !== Role.ADMIN && currentUser.role !== Role.SUPER_ADMIN)) return;
        setLeases(prev => prev.map(l => {
            if (l.id === leaseToAssign.id) {
                if (targetRole === 'R1') {
                    return { ...l, status: LeaseStatus.IN_REVIEW, reviewStatus: ReviewStatus.IN_PROGRESS, reviewer, assignedDate: new Date(), workflowStage: 'R1_ASSIGNED' };
                } else {
                    // Direct routing for escalated or ready-for-R2 items
                    const nextStage = (l.workflowStage === 'R1_COMPLETED' || l.workflowStage === 'ESCALATED') ? 'R2_ASSIGNED' : l.workflowStage;
                    return { ...l, reviewerR2: reviewer, assignedDateR2: new Date(), reviewStatusR2: ReviewStatus.IN_PROGRESS, workflowStage: nextStage };
                }
            }
            return l;
        }));
    };

    const handleSaveDraft = async (leaseId: string, updatedData: AbstractedData, timeSpent?: number): Promise<void> => {
        setLeases(prev => prev.map(l => {
            if (l.id === leaseId) {
                const isR2 = l.reviewerR2?.email === currentUser?.email || l.workflowStage?.startsWith('R2') || l.workflowStage === 'ESCALATED';
                return {
                    ...l,
                    abstractedData: updatedData,
                    lastSaved: new Date(),
                    timeSpentR1: !isR2 && timeSpent !== undefined ? timeSpent : l.timeSpentR1,
                    timeSpentR2: isR2 && timeSpent !== undefined ? timeSpent : l.timeSpentR2,
                    workflowStage: isR2 ? (l.workflowStage === 'ESCALATED' ? 'ESCALATED' : 'R2_IN_PROGRESS') : 'R1_IN_PROGRESS'
                };
            }
            return l;
        }));
        await new Promise(r => setTimeout(r, 50));
    };

    const handleSubmitReview = async (leaseId: string, finalData: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean): Promise<void> => {
        try {
            setLeases(prev => prev.map(l => {
                if (l.id === leaseId) {
                    const isAdminSubmission = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;
                    const isR2 = l.reviewerR2?.email === currentUser?.email || (l.workflowStage === 'R2_ASSIGNED' || l.workflowStage === 'R2_IN_PROGRESS' || l.workflowStage === 'ESCALATED');

                    if (isR2 || (isAdminSubmission && skipR2)) {
                        return {
                            ...l,
                            abstractedData: finalData,
                            reviewStatusR2: ReviewStatus.COMPLETED,
                            status: LeaseStatus.ABSTRACTED,
                            workflowStage: 'COMPLETED',
                            lastSaved: new Date(),
                            isUpdateSeen: false,
                            isEscalated: false,
                            wasEscalated: l.isEscalated || l.wasEscalated,
                            reviewerNotesR2: (isAdminSubmission && skipR2) ? (notes || l.reviewerNotesR2) : notes,
                            timeSpentR2: isR2 && timeSpent !== undefined ? timeSpent : l.timeSpentR2,
                            timeSpentR1: !isR2 && isAdminSubmission && skipR2 && timeSpent !== undefined ? timeSpent : l.timeSpentR1
                        };
                    } else {
                        const nextStage = l.reviewerR2 ? 'R2_ASSIGNED' : 'R1_COMPLETED';
                        return {
                            ...l,
                            abstractedData: finalData,
                            reviewStatus: ReviewStatus.COMPLETED,
                            workflowStage: nextStage,
                            lastSaved: new Date(),
                            reviewerNotes: notes,
                            timeSpentR1: timeSpent !== undefined ? timeSpent : l.timeSpentR1
                        };
                    }
                }
                return l;
            }));
            await new Promise(r => setTimeout(r, 75));
            setLeaseToReview(null);
            setActiveView((currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN) ? 'admin-review-queue' : 'reviewer-dashboard');
            setNotification({ type: 'success', message: `Review submitted.` });
        } catch (e) { console.error("Review failed", e); throw e; }
    };

    const handleSubmitEscalation = (leaseId: string, notes: string) => {
        setLeases(prev => prev.map(l => l.id === leaseId ? {
            ...l,
            status: LeaseStatus.IN_REVIEW,
            reviewStatusR2: ReviewStatus.PENDING,
            processingMode: 'human',
            isEscalated: true,
            workflowStage: 'ESCALATED',
            escalationNotes: notes
        } : l));
        setLeaseToReview(null);
        setNotification({ type: 'success', message: 'Escalated to expert review.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDownloadExcel = useCallback((lease: Lease) => generateSingleLeaseExcel(lease), []);
    const handleDownloadAllExcel = useCallback(() => { const abstractedLeases = leasesForCurrentUser.filter(l => l.status === LeaseStatus.ABSTRACTED && l.abstractedData); generateBulkLeaseExcel(abstractedLeases); }, [leasesForCurrentUser]);
    const handleDownloadPdf = useCallback((lease: Lease) => generateSingleLeasePdf(lease), []);

    const handleSelectClient = (client: User) => { setSelectedClient(client); setActiveView('admin-client-detail'); };

    const handleAddReviewer = (user: User) => {
        if (isDeployAdmin && currentOrgId) {
            const newMember: OrganizationMember = { id: `mem_${Date.now()}`, organizationId: currentOrgId, userId: user.email, role: Role.REVIEWER, status: 'Active' };
            setOrgMembers(prev => [...prev, newMember]);
        }
        setUsers(prev => [...prev, user]);
        setNotification({ type: 'success', message: `Reviewer added.` }); setTimeout(() => setNotification(null), 3000);
    };

    const handleDeleteReviewer = (email: string) => { setLeases(prev => prev.map(l => { if (l.reviewer?.email === email && l.reviewStatus !== ReviewStatus.COMPLETED) { return { ...l, reviewer: undefined, reviewStatus: ReviewStatus.PENDING }; } return l; })); setUsers(prev => prev.filter(u => u.email !== email)); setNotification({ type: 'success', message: `Reviewer account deleted and workload unassigned.` }); setTimeout(() => setNotification(null), 3000); };
    const handleUpdateReviewerSettings = (email: string, updates: Partial<User>) => { setUsers(prev => prev.map(u => u.email === email ? { ...u, ...updates } : u)); };
    const handleBookDemo = (bookingData: Omit<DemoBooking, 'id' | 'status' | 'createdAt'>) => { const newBooking: DemoBooking = { ...bookingData, id: `bk_${Date.now()}`, status: 'Pending', createdAt: new Date() }; setDemoBookings(prev => [...prev, newBooking]); };
    const handleUpdateBookingStatus = (id: string, status: 'Confirmed' | 'Cancelled') => { setDemoBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)); };
    const handleAdminNavigate = (view: View, filter: string = 'All') => { setAdminFilter(filter); setActiveView(view); };

    const handleOpenChat = (lease: Lease) => { setActiveChatLease(lease); };

    const handleSendMessage = (chatId: string, message: string) => {
        if (!currentUser) return;

        let senderName = currentUser.username;
        if (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN) senderName = "Team Penaki";

        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            senderRole: currentUser.role,
            senderName: senderName,
            content: message,
            timestamp: new Date()
        };

        if (chatId.startsWith('support_')) {
            setSupportChats(prev => prev.map(sc => {
                if (sc.id === chatId) {
                    return { ...sc, messages: [...sc.messages, newMessage], lastUpdated: new Date() };
                }
                return sc;
            }));
        } else {
            setLeases(prev => prev.map(l => {
                if (l.id === chatId) {
                    return { ...l, chatHistory: [...(l.chatHistory || []), newMessage] };
                }
                return l;
            }));
            if (activeChatLease && activeChatLease.id === chatId) {
                setActiveChatLease(prev => prev ? { ...prev, chatHistory: [...(prev.chatHistory || []), newMessage] } : null);
            }
        }
    };

    const handleAssignReviewerToSupport = (chatId: string, reviewerEmail: string) => {
        setSupportChats(prev => prev.map(sc => {
            if (sc.id === chatId && !sc.allowedReviewers.includes(reviewerEmail)) {
                return { ...sc, allowedReviewers: [...sc.allowedReviewers, reviewerEmail] };
            }
            return sc;
        }));
        setNotification({ type: 'success', message: 'Reviewer added to support chat.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleMarkRentAsPaid = (leaseId: string, eventId: string) => {
        setLeases(prev => prev.map(l => {
            if (l.id === leaseId) {
                const currentPaid = l.paidRentEvents || [];
                if (currentPaid.includes(eventId)) return l;
                return { ...l, paidRentEvents: [...currentPaid, eventId] };
            }
            return l;
        }));
    };

    const handleCreateOrg = (name: string, adminName: string, adminEmail: string, adminPass: string) => {
        const newOrgId = `org_${Date.now()}`;
        const newOrg: Organization = { id: newOrgId, name, status: 'Active', planType: 'Standard', createdAt: new Date(), maxReviewers: 5, maxClients: 20 };
        const adminUser: User = { username: adminName, email: adminEmail, password: adminPass, role: Role.ADMIN, savedTemplates: [] };
        const adminMember: OrganizationMember = { id: `mem_${Date.now()}`, organizationId: newOrgId, userId: adminEmail, role: Role.ADMIN, status: 'Active' };
        setOrganizations(prev => [...prev, newOrg]);
        setUsers(prev => [...prev, adminUser]);
        setOrgMembers(prev => [...prev, adminMember]);
        setNotification({ type: 'success', message: `Organization ${name} created.` });
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

    const handleMapClient = (clientUserId: string) => {
        if (!selectedOrgForDetail) return;
        const mapping: OrganizationClient = { id: `map_${Date.now()}`, organizationId: selectedOrgForDetail.id, clientUserId, assignedAt: new Date(), status: 'Active' };
        setOrgClients(prev => [...prev, mapping]);
        setNotification({ type: 'success', message: 'Client mapped successfully.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUnmapClient = (clientUserId: string) => {
        if (!selectedOrgForDetail) return;
        setOrgClients(prev => prev.filter(c => !(c.organizationId === selectedOrgForDetail.id && c.clientUserId === clientUserId)));
        setNotification({ type: 'success', message: 'Client unmapped.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleRemoveOrgMember = (userId: string) => {
        if (!selectedOrgForDetail) return;
        setOrgMembers(prev => prev.filter(m => !(m.organizationId === selectedOrgForDetail.id && m.userId === userId)));
        setNotification({ type: 'success', message: 'Member removed.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const renderContent = () => {
        switch (activeView) {
            case 'home': return <HomePage onGetStarted={() => setActiveView('abstract')} user={currentUser} leases={leasesForCurrentUser} onBookDemo={handleBookDemo} availability={availability} />;
            case 'pricing': return <PricingPage onNavigate={setActiveView} onBookDemo={() => setIsDemoModalOpen(true)} />;
            case 'portfolio': return <PortfolioDashboard leases={leasesForCurrentUser} onNavigate={setActiveView} onViewLease={handleViewLease} />;
            case 'assets': return <AssetsPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />;
            case 'abstract': return <UploadForm onContinueSingle={handleProceedToTemplatesSingle} onContinueMultiple={handleProceedToTemplatesMultiple} />;
            case 'choose-template': return <ChooseTemplatePage onSelectTemplate={handleSelectTemplate} onSelectSavedTemplate={handleSelectSavedTemplate} savedTemplates={currentUser?.savedTemplates} onBack={() => setActiveView('abstract')} />;
            case 'review-template': { if (!pendingLease || !pendingLease.templateType) { setActiveView('abstract'); return null; } const resolvedBaseType = (pendingLease.templateType === 'us' || pendingLease.templateType === 'eu') ? pendingLease.templateType as 'us' | 'eu' : (currentUser?.savedTemplates?.find(t => t.id === pendingLease.templateType)?.type || 'us'); return <ReviewTemplatePage pendingLease={{ files: pendingLease.files, name: pendingLease.name, templateType: resolvedBaseType }} initialTemplateData={prefilledTemplateData} existingTemplateId={pendingTemplateId} onSubmit={handleFinalSubmit} onSaveTemplate={handleSaveTemplate} onUpdateTemplate={handleUpdateTemplate} onBack={() => setActiveView('choose-template')} />; }
            case 'configure-templates': if (!pendingIndividualLeases) { setActiveView('abstract'); return null; } return <ConfigureTemplatesPage initialLeases={pendingIndividualLeases} savedTemplates={currentUser?.savedTemplates} onContinue={handleProceedToBatchReview} onBack={() => setActiveView('abstract')} />;
            case 'batch-review-templates': if (!pendingBatchTemplates || !pendingIndividualLeases) { setActiveView('abstract'); return null; } return <BatchReviewTemplatesPage initialTemplates={pendingBatchTemplates} onSubmit={handleFinalBatchSubmit} onBack={() => setActiveView('configure-templates')} leaseCount={pendingIndividualLeases.length} />;
            case 'history': return <HistoryTable leases={leasesForCurrentUser} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onDownloadAllExcel={handleDownloadAllExcel} onDownloadPdf={handleDownloadPdf} onChat={handleOpenChat} onRetry={handleRetryLease} onAddAmendment={(lease) => setLeaseForAmendment(lease)} onOpenInsights={handleOpenLeaseInsights} />;
            case 'lease-summaries': return <LeaseSummariesPage leases={leasesForCurrentUser} onViewSummary={handleOpenLeaseInsights} />;
            case 'locations': return <LocationsPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />;
            case 'entities': return <EntitiesPage leases={leasesForCurrentUser} onViewLease={handleViewLease} />;
            case 'reminders': return <RemindersPage leases={leasesForCurrentUser} onViewLease={handleViewLease} onMarkAsPaid={handleMarkRentAsPaid} />;
            case 'client-chats': if (!currentUser) return null; return <ChatManager leases={leasesForCurrentUser} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} />;
            case 'lease-insights': { if (!leaseForInsights) { setActiveView('history'); return null; } const liveLease = leases.find(l => l.id === leaseForInsights.id) || leaseForInsights; return <LeaseInsightsPage lease={liveLease} onBack={() => setActiveView('lease-summaries')} onGenerateSummary={handleGenerateLeaseSummary} onAskAgent={handleAskLeaseAgent} currentUser={currentUser} />; }
            case 'profile': if (!currentUser) { setActiveView('home'); return null; } return <ProfilePage user={currentUser} onUpdateUser={handleUpdateUser} onDeleteTemplate={handleDeleteTemplate} onUpdateTemplate={handleUpdateTemplate} />;
            case 'terms': return <TermsPage />; case 'privacy': return <PrivacyPage />;

            case 'admin-dashboard': return <AdminDashboard leases={scopedLeases} users={scopedClients} onNavigate={handleAdminNavigate} demoBookings={demoBookings} />;
            case 'admin-analytics': return <AdminAnalytics leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} />;
            case 'admin-review-queue': return <AdminReviewQueue leases={scopedLeases} reviewers={scopedReviewers} onStartReview={handleStartReview} onAssignLease={handleAssignLease} currentUser={currentUser} notification={notification} onClearNotification={() => setNotification(null)} />;
            case 'admin-amendments': return <AdminAmendmentQueue leases={scopedLeases} reviewers={scopedReviewers} onStartReview={handleStartReview} onAssignLease={handleAssignLease} currentUser={currentUser} notification={notification} onClearNotification={() => setNotification(null)} />;
            case 'admin-workbench': return <Workbench mode="admin" lease={leaseToReview} onBack={() => { setLeaseToReview(null); setActiveView(leaseToReview?.status === LeaseStatus.AMENDMENT_REVIEW ? 'admin-amendments' : 'admin-review-queue'); }} onSaveDraft={handleSaveDraft} onSubmitReview={handleSubmitReview} />;
            case 'admin-clients': return <AdminClients clients={scopedClients} leases={scopedLeases} onSelectClient={handleSelectClient} />;
            case 'admin-completed-reviews': return <AdminCompletedReviews leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} />;
            case 'admin-ai-leases': return <AdminAiLeases leases={scopedLeases} onViewLease={handleViewLease} onBack={() => setActiveView('admin-dashboard')} initialFilter={adminFilter} />;
            case 'admin-total-activity': return <AdminTotalActivity leases={scopedLeases} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onBack={() => setActiveView('admin-dashboard')} initialFilter={adminFilter} />;
            case 'admin-client-detail': if (!selectedClient) { setActiveView('admin-clients'); return null; } return <AdminClientDetail client={selectedClient} leases={scopedLeases.filter(l => l.user?.email === selectedClient.email)} onView={handleViewLease} onDownloadExcel={handleDownloadExcel} onBack={() => setActiveView('admin-clients')} />;
            case 'admin-bookings': return <AdminBookings bookings={demoBookings} onUpdateStatus={handleUpdateBookingStatus} availability={availability} setAvailability={setAvailability} />;
            case 'admin-reviewers': return <AdminReviewers reviewers={scopedReviewers} allLeases={scopedLeases} onAddReviewer={handleAddReviewer} onDeleteReviewer={handleDeleteReviewer} onUpdateReviewerSettings={handleUpdateReviewerSettings} />;
            case 'admin-chats': if (!currentUser) return null; return <ChatManager leases={scopedLeases} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} onAssignReviewer={handleAssignReviewerToSupport} reviewers={scopedReviewers} />;
            case 'admin-lease-database': return <AdminLeaseDatabase leases={scopedLeases} onBack={() => setActiveView('admin-dashboard')} />;

            case 'deploy-admins': if (!isSuperAdmin) return null; return <DeployAdminsList organizations={organizations} users={users} onCreateOrg={handleCreateOrg} onManageOrg={handleManageOrg} onLoginAs={handleLoginAs} />;
            case 'org-detail': if (!selectedOrgForDetail) { setActiveView('deploy-admins'); return null; } return <OrganizationDetail org={selectedOrgForDetail} orgMembers={orgMembers.filter(m => m.organizationId === selectedOrgForDetail.id)} orgClients={orgClients.filter(c => c.organizationId === selectedOrgForDetail.id)} allUsers={users} onBack={() => setActiveView('deploy-admins')} onMapClient={handleMapClient} onUnmapClient={handleUnmapClient} onRemoveMember={handleRemoveOrgMember} onAddMember={() => { }} />;

            case 'reviewer-dashboard': if (!currentUser) return null; return <ReviewerDashboard leases={leases} currentUser={currentUser} onOpenWorkbench={handleStartReview} onNavigateToActivity={(filter) => handleAdminNavigate('reviewer-activity', filter)} />;
            case 'reviewer-workbench': return <Workbench mode="reviewer" lease={leaseToReview} onBack={() => { setLeaseToReview(null); setActiveView(leaseToReview?.status === LeaseStatus.AMENDMENT_REVIEW ? 'reviewer-amendments' : 'reviewer-dashboard'); }} onSaveDraft={handleSaveDraft} onSubmitReview={handleSubmitReview} />;
            case 'reviewer-activity': if (!currentUser) return null; return <ReviewerActivity leases={leases} currentUser={currentUser} onBack={() => setActiveView('reviewer-dashboard')} initialFilter={adminFilter} />;
            case 'reviewer-amendments': if (!currentUser) return null; return <ReviewerAmendmentQueue leases={leases} currentUser={currentUser} onOpenWorkbench={handleStartReview} onBack={() => setActiveView('reviewer-dashboard')} />;
            case 'reviewer-chats': if (!currentUser) return null; return <ChatManager leases={leases} supportChats={supportChats} currentUser={currentUser} onSendMessage={handleSendMessage} onViewLease={handleViewLease} />;

            default: return <HomePage onGetStarted={() => setActiveView('abstract')} user={currentUser} leases={leasesForCurrentUser} onBookDemo={handleBookDemo} availability={availability} />;
        }
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
                <Header activeView={activeView} user={currentUser} onProfileClick={() => { setAuthModalInitialView('signup'); setIsAuthModalOpen(true); }} onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setActiveView} onBookDemo={handleBookDemo} availability={availability} isSidebarOpen={isSidebarOpen} />
                <main className={`flex-1 ${isFullWidthView ? 'overflow-y-auto' : 'p-4 sm:p-8 overflow-y-auto'}`}>
                    <div key={activeView} className={`animate-fade-in ${isWorkbenchActive || isChatActive || isAssetsActive || activeView === 'lease-insights' ? 'h-full' : ''} ${isHomeActive ? 'min-h-full' : ''}`}>{renderContent()}</div>
                </main>
            </div>
            {activeView === 'home' && <Footer onNavigate={setActiveView} />}
            {selectedLease && <ViewSubmissionModal lease={selectedLease} onClose={handleCloseModal} onDownloadExcel={handleDownloadExcel} onDownloadPdf={handleDownloadPdf} />}
            {isAuthModalOpen && <AuthModal users={users} initialView={authModalInitialView} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLogin} onSignUp={handleSignUp} onNavigate={setActiveView} />}
            {leaseForAmendment && <AmendmentUploadModal lease={leaseForAmendment} onClose={() => setLeaseForAmendment(null)} onSubmit={(file, name) => { handleAddAmendment(leaseForAmendment, file, name); setLeaseForAmendment(null); }} />}
            {activeChatLease && currentUser && (<ChatModal lease={activeChatLease} currentUser={currentUser} onClose={() => setActiveChatLease(null)} onSendMessage={handleSendMessage} onEscalate={handleSubmitEscalation} />)}
            {isDemoModalOpen && <BookDemoModal onClose={() => setIsDemoModalOpen(false)} onBook={handleBookDemo} availability={availability} />}
        </div>
    );
};

export default App;