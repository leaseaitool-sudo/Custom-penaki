import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import { Lease, AbstractedData, AbstractedField, Role, User } from '@/shared/types';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { CheckIcon } from '@/shared/ui/Icons/CheckIcon';
import { SpinnerIcon } from '@/shared/ui/Icons/SpinnerIcon';
import { UserIcon } from '@/shared/ui/Icons/UserIcon';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { CurrencyEuroIcon } from '@/shared/ui/Icons/CurrencyEuroIcon';
import { CalendarDaysIcon } from '@/shared/ui/Icons/CalendarDaysIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { ProgressBar } from '@/shared/ui/Controls/ProgressBar';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { InformationCircleIcon } from '@/shared/ui/Icons/InformationCircleIcon';
import { ConfirmationModal } from '@/shared/ui/Modal/ConfirmationModal';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { DocumentDuplicateIcon } from '@/shared/ui/Icons/DocumentDuplicateIcon';
import { TrashIcon } from '@/shared/ui/Icons/TrashIcon';
import { ChevronDownIcon } from '@/shared/ui/Icons/ChevronDownIcon';
import { PdfViewer, NavigationTarget, SnippetSource } from '@/widgets/pdf-viewer/PdfViewer';
import { CalendarIcon } from '@/shared/ui/Icons/CalendarIcon';
import { ChatBubbleLeftEllipsisIcon } from '@/shared/ui/Icons/ChatBubbleLeftEllipsisIcon';
import { useWorkbench } from '@/features/leases/hooks/useWorkbench';

interface WorkbenchProps {
    mode: 'admin' | 'reviewer';
    lease: Lease | null;
    onBack: () => void;
    onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
    onSubmitReview: (leaseId: string, data: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean) => Promise<{ success: boolean; }>;
    onEscalate?: (leaseId: string, notes: string) => void;
    onCancel?: () => void;
    currentUser?: User | null;
    isR2Context?: boolean;
}

const ExpandableValueInput = ({
    value,
    onChange,
    onFocus,
    isVerified,
    isNotFound,
    placeholder,
    disabled
}: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFocus: () => void;
    isVerified?: boolean;
    isNotFound?: boolean;
    placeholder: string;
    disabled?: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpand, setShowExpand] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const DEFAULT_HEIGHT = 38;

    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = 'auto';
        const hasOverflow = el.scrollHeight > DEFAULT_HEIGHT;
        setShowExpand(hasOverflow);

        if (isExpanded) {
            el.style.height = `${el.scrollHeight}px`;
        } else {
            el.style.height = `${DEFAULT_HEIGHT}px`;
        }
    }, [value, isExpanded]);

    return (
        <>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                rows={1}
                disabled={disabled}
                className={`block w-full rounded-lg border border-slate-200 bg-white shadow-inner focus:border-primary focus:ring-primary text-base py-1.5 px-3 pr-12 transition-all resize-none overflow-hidden leading-normal ${disabled ? 'bg-slate-50 text-slate-500' : isVerified ? 'text-green-800' : isNotFound ? 'text-red-700 font-medium italic' : 'text-text-main font-semibold'}`}
                placeholder={placeholder}
                style={{
                    minHeight: `${DEFAULT_HEIGHT}px`,
                    height: `${DEFAULT_HEIGHT}px`
                }}
            />
            {showExpand && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    className={`absolute right-2 top-2 text-slate-400 hover:text-primary bg-white/50 rounded p-0.5 transition-all z-10 ${isExpanded ? 'rotate-180 bg-slate-100' : ''}`}
                    title={isExpanded ? "Collapse" : "Expand full content"}
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
            )}
        </>
    );
};

const getIconForSection = (title: string): React.ReactNode => {
    const lowerCaseTitle = title.toLowerCase();
    if (lowerCaseTitle.includes('landlord')) return <UserIcon className="w-5 h-5" />;
    if (lowerCaseTitle.includes('tenant')) return <BuildingOfficeIcon className="w-5 h-5" />;
    if (lowerCaseTitle.includes('rent')) return <CurrencyEuroIcon className="w-5 h-5" />;
    if (lowerCaseTitle.includes('term')) return <CalendarDaysIcon className="w-5 h-5" />;
    return <DocumentTextIcon className="w-5 h-5" />;
};

const ReviewTimer = ({ seconds }: { seconds: number }) => {
    const format = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };
    return (
        <div className="flex items-center gap-1 text-xs font-mono text-text-light bg-surface-muted px-2 py-1 rounded border border-border shadow-inner" title="Session Duration">
            <ClockIcon className="w-3 h-3" />
            {format(seconds)}
        </div>
    );
};

export const Workbench: React.FC<WorkbenchProps> = ({ mode, lease, onBack, onSaveDraft, onSubmitReview, currentUser }) => {
    // Determine R2 Context (from props or computed from workflowStage)
    const isR2Active = useMemo(() => {
        if (!lease) return false;
        return lease.workflowStage === 'R1_COMPLETED' || lease.workflowStage === 'R2_ASSIGNED' || lease.workflowStage === 'R2_IN_PROGRESS' || lease.workflowStage === 'ESCALATED';
    }, [lease]);

    // Use Custom Hook for core logic and state
    const {
        data,
        activeSectionId,
        setActiveSectionId,
        isAutoSaving,
        fieldSearchTerm,
        setFieldSearchTerm,
        timeSpent,
        activeFieldCoords,
        setActiveFieldCoords,
        navigationTarget,
        setNavigationTarget,
        progressStats,
        filteredSections,
        handleFieldChange,
        handleBatchFieldChange,
        toggleFieldVerification,
        toggleSectionVerification,
        duplicateSection,
        deleteSection,
        handleSectionTitleChange,
        handlePdfTextSelection,
        handleFieldClick
    } = useWorkbench({ lease, isR2Context: isR2Active, onSaveDraft });

    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [skipR2, setSkipR2] = useState(false);
    const [reviewerNotes, setReviewerNotes] = useState(isR2Active ? lease?.reviewerNotesR2 || '' : lease?.reviewerNotes || '');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [hasFocusedInitial, setHasFocusedInitial] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean, index: number | null }>({ isOpen: false, index: null });
    const [isEscalationNoteOpen, setIsEscalationNoteOpen] = useState(false);
    const [isR1InternalNoteOpen, setIsR1InternalNoteOpen] = useState(true);
    const [openDateMenu, setOpenDateMenu] = useState<string | null>(null);

    const formContainerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const isBundle = useMemo(() => lease && lease.documents?.length > 1, [lease]);

    const isAdmin = mode === 'admin';

    useEffect(() => {
        setReviewerNotes(isR2Active ? lease?.reviewerNotesR2 || '' : lease?.reviewerNotes || '');
    }, [lease?.id, isR2Active]);

    const availableDates = useMemo(() => {
        const dates: { label: string, value: string, page: number | null, snippet: string | null, fileName?: string | null }[] = [];
        data.forEach(section => {
            section.fields.forEach(field => {
                const hasValue = field.value !== null && field.value !== undefined && String(field.value).trim() !== '';
                const isLikelyDate = field.isDate || field.label.toLowerCase().includes('date') || (hasValue && String(field.value).match(/\d{1,2}\/\d{1,2}\/\d{2,4}/));
                if (hasValue && isLikelyDate) {
                    if (!dates.some(d => d.label === field.label && d.value === field.value)) {
                        dates.push({
                            label: field.label,
                            value: String(field.value),
                            page: field.page,
                            snippet: field.snippet,
                            fileName: field.fileName
                        });
                    }
                }
            });
        });
        return dates.slice(0, 10);
    }, [data]);

    const allSnippets = useMemo<SnippetSource[]>(() => {
        const snippets: SnippetSource[] = [];
        data.forEach(section => {
            section.fields.forEach(field => {
                if (field.page && field.snippet) {
                    snippets.push({
                        page: field.page,
                        snippet: field.snippet,
                        fileName: field.fileName
                    });
                }
            });
        });
        return snippets;
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDateMenu && !(event.target as Element).closest('.date-menu-container')) {
                setOpenDateMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDateMenu]);

    const focusField = useCallback((sIdx: number, fIdx: number) => {
        const id = `field-${sIdx}-${fIdx}`;
        const element = document.getElementById(id);
        const input = element?.querySelector('textarea, input[type="text"]') as HTMLElement;
        if (input) {
            input.focus();
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setActiveFieldCoords({ sIdx, fIdx });
    }, []);

    const findValidField = useCallback((startS: number, startF: number, direction: 1 | -1) => {
        let currS = startS;
        let currF = startF;
        let loops = 0;
        if (!data[currS]) return null;
        const totalF = data.reduce((acc, s) => acc + s.fields.length, 0);
        while (loops <= totalF) {
            currF += direction;
            if (direction === 1) { if (currF >= data[currS].fields.length) { currS++; if (currS >= data.length) currS = 0; currF = 0; } }
            else { if (currF < 0) { currS--; if (currS < 0) currS = data.length - 1; currF = data[currS].fields.length - 1; } }
            const field = data[currS]?.fields[currF];
            const hasData = field && field.value !== null && field.value !== undefined && String(field.value).trim() !== '';
            if (hasData) return { s: currS, f: currF };
            loops++;
        }
        return null;
    }, [data]);

    useEffect(() => {
        if (!hasFocusedInitial && data.length > 0) {
            const firstValid = findValidField(0, -1, 1);
            if (firstValid) setTimeout(() => focusField(firstValid.s, firstValid.f), 150);
            setHasFocusedInitial(true);
        }
    }, [data, hasFocusedInitial, focusField, findValidField]);



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const container = activeElement?.closest('[id^="field-"]');

            // Allow shortcuts even if focus is purely visual (box clicked but input not focused)
            const currentCoords = activeFieldCoords;
            if (!container && !currentCoords) return;

            let sIdx: number, fIdx: number;
            if (container) {
                const parts = container.id.split('-');
                sIdx = parseInt(parts[1]);
                fIdx = parseInt(parts[2]);
            } else {
                sIdx = currentCoords!.sIdx;
                fIdx = currentCoords!.fIdx;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                toggleFieldVerification(sIdx, fIdx, isR2Active ? 'R2' : 'R1');
            }
            if (e.key === 'ArrowDown') { e.preventDefault(); const next = findValidField(sIdx, fIdx, 1); if (next) focusField(next.s, next.f); }
            if (e.key === 'ArrowUp') { e.preventDefault(); const prev = findValidField(sIdx, fIdx, -1); if (prev) focusField(prev.s, prev.f); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                const field = data[sIdx].fields[fIdx];
                if (field.page && field.snippet) handleFieldClick(field.page, field.fileName || null, field.snippet);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data, focusField, findValidField, isR2Active, activeFieldCoords, toggleFieldVerification, handleFieldClick]);

    const handleScroll = useCallback(() => {
        if (!formContainerRef.current) return;
        const container = formContainerRef.current;
        const triggerTop = container.scrollTop + 150;
        let currentSection = activeSectionId;
        for (const section of data) {
            const el = document.getElementById(`section-${section.title}`);
            if (el) { if (el.offsetTop <= triggerTop) currentSection = section.title; else break; }
        }
        if (currentSection !== activeSectionId) {
            setActiveSectionId(currentSection);
            if (sidebarRef.current) {
                const activeBtn = sidebarRef.current.querySelector(`[data-section-title="${currentSection}"]`);
                if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [data, activeSectionId]);



    const handleDeleteClick = (e: React.MouseEvent, index: number) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmation({ isOpen: true, index }); };
    const executeDelete = () => { if (deleteConfirmation.index !== null) { deleteSection(deleteConfirmation.index); setDeleteConfirmation({ isOpen: false, index: null }); } };

    const scrollToSection = (title: string) => { setActiveSectionId(title); const element = document.getElementById(`section-${title}`); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

    const handleCompleteReview = () => {
        if (progressStats.percent < 100) {
            let targetId = '';
            for (let s = 0; s < data.length; s++) {
                for (let f = 0; f < data[s].fields.length; f++) {
                    const field = data[s].fields[f];
                    const hasData = field.value !== null && field.value !== undefined && String(field.value).trim() !== '';
                    const verified = isR2Active ? field.isVerifiedR2 : field.isVerified;
                    if (hasData && !verified) { targetId = `field-${s}-${f}`; break; }
                } if (targetId) break;
            }
            if (targetId) { const el = document.getElementById(targetId); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('pulse-error-animate'); setTimeout(() => el.classList.remove('pulse-error-animate'), 1500); } }
            return;
        }
        setShowSubmitConfirm(true);
    };

    const handleBackWithSave = async () => {
        await onSaveDraft(lease.id, data, timeSpent);
        onBack();
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-surface">
            {/* Header */}
            <div className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={handleBackWithSave} className="text-text-light hover:text-text-main transition-colors"><ArrowLeftIcon className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-lg font-bold text-text-main truncate max-w-xs sm:max-w-md">{lease.name}</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-text-light font-mono">{lease.id}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isR2Active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {isR2Active ? 'SECOND PASS' : 'FIRST PASS'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <ReviewTimer seconds={timeSpent} />
                    <button onClick={() => setShowShortcuts(true)} className="text-xs font-medium text-text-light hover:text-primary transition-colors bg-surface-muted px-2 py-1 rounded border border-border">Keyboard Shortcuts</button>
                    <button onClick={() => setIsFocusMode(!isFocusMode)} className={`text-xs font-medium transition-colors px-2 py-1 rounded border ${isFocusMode ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-surface-muted text-text-light border-border hover:text-primary'}`}>{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</button>
                    <div className="h-6 w-px bg-border mx-1"></div>
                    <button onClick={handleCompleteReview} className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors ${progressStats.percent < 100 ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}><CheckIcon className="w-4 h-4 mr-2" />{isR2Active ? 'Complete Final Pass' : 'Complete Review'}</button>
                    <div className="text-xs text-text-light flex items-center min-w-[70px] justify-end">{(isSaving || isAutoSaving) ? <><SpinnerIcon className="w-3 h-3 animate-spin mr-1.5 text-primary" /><span className="text-primary font-medium">Saving...</span></> : <span className="text-gray-400 flex items-center"><CheckIcon className="w-3 h-3 mr-1" /> Saved</span>}</div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden relative">
                {/* Sidebar Navigation */}
                {!isFocusMode && (
                    <nav ref={sidebarRef} className="flex-shrink-0 border-r border-border bg-surface-muted/50 backdrop-blur-sm overflow-y-auto overflow-x-hidden hidden md:block transition-[width] duration-300 ease-out w-16 hover:w-64 group z-20 hover:shadow-xl flex flex-col">
                        <div className="px-2 py-3 sticky top-0 bg-surface-muted/95 backdrop-blur z-10 border-b border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="relative"><MagnifyingGlassIcon className="w-3 h-3 absolute left-2 top-2 text-gray-400" /><input type="text" placeholder="Find field..." value={fieldSearchTerm} onChange={(e) => setFieldSearchTerm(e.target.value)} className="w-full pl-7 pr-2 py-1 text-xs border border-border rounded-md focus:ring-primary focus:border-primary outline-none" /></div>
                        </div>
                        <div className="px-1 py-2 space-y-1 flex-1 overflow-y-auto">
                            <p className="px-3 text-xs font-semibold text-text-light uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">Sections</p>
                            {filteredSections.map((section) => (
                                <button key={section.title} data-section-title={section.title} onClick={() => scrollToSection(section.title)} className={`w-full flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 overflow-hidden whitespace-nowrap ${activeSectionId === section.title ? 'bg-white text-primary shadow-sm ring-1 ring-border' : 'text-text-light hover:bg-white/60 hover:text-text-main'}`} title={section.title}>
                                    <div className={`flex-shrink-0 p-1.5 rounded-md ${activeSectionId === section.title ? 'bg-primary/10' : 'bg-transparent'}`}>{getIconForSection(section.title)}</div>
                                    <span className="opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                )}

                {/* Form Area */}
                <div className={`${isFocusMode ? 'w-1/2 max-w-3xl' : 'w-[500px]'} transition-all duration-300 flex-shrink-0 flex flex-col min-h-0 border-r border-border bg-white z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
                    <div className="px-6 py-4 border-b border-border bg-white/95 backdrop-blur z-10 sticky top-0">
                        <div className="flex justify-between items-end mb-2"><div><h3 className="text-sm font-bold text-text-main">{isR2Active ? 'Verification Progress (R2)' : 'Review Progress'}</h3><p className="text-xs text-text-light">{progressStats.verified} of {progressStats.total} fields verified</p></div><span className="text-xl font-bold text-primary">{Math.round(progressStats.percent)}%</span></div>
                        <ProgressBar progress={progressStats.percent} />
                    </div>
                    <div ref={formContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                        {/* Internal Handover Notes from R1 (Visible only in R2 stage) */}
                        {isR2Active && lease.reviewerNotes && (
                            <div className="mb-2">
                                <button
                                    onClick={() => setIsR1InternalNoteOpen(!isR1InternalNoteOpen)}
                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${isR1InternalNoteOpen ? 'bg-indigo-50 border-indigo-200 rounded-b-none shadow-sm' : 'bg-white border-indigo-200 hover:bg-indigo-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-indigo-600" />
                                        <span className="text-sm font-bold text-indigo-800">Internal Note from R1</span>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 text-indigo-600 transition-transform ${isR1InternalNoteOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isR1InternalNoteOpen && (
                                    <div className="p-4 bg-indigo-50/50 border-x border-b border-indigo-200 rounded-b-lg text-sm text-indigo-900 animate-slide-up whitespace-pre-wrap italic">
                                        "{lease.reviewerNotes}"
                                    </div>
                                )}
                            </div>
                        )}

                        {lease.isEscalated && (
                            <div className="mb-6">
                                <button
                                    onClick={() => setIsEscalationNoteOpen(!isEscalationNoteOpen)}
                                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${isEscalationNoteOpen ? 'bg-red-50 border-red-200 rounded-b-none' : 'bg-white border-red-200 hover:bg-red-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <InformationCircleIcon className="w-5 h-5 text-red-600" />
                                        <span className="text-sm font-bold text-red-800">Escalation Note</span>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 text-red-600 transition-transform ${isEscalationNoteOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isEscalationNoteOpen && (
                                    <div className="p-4 bg-red-50 border-x border-b border-red-200 rounded-b-lg text-sm text-red-800 animate-slide-up">
                                        {lease.escalationNotes}
                                    </div>
                                )}
                            </div>
                        )}
                        {data.map((section, sIdx) => (
                            <div key={section.title} id={`section-${section.title}`} className="scroll-mt-6 bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-8">
                                <div className="sticky top-0 z-10 py-4 px-6 bg-gray-50 border-b border-border flex items-center justify-between group/header">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="p-2 bg-white rounded-lg border border-border text-primary shadow-sm flex-shrink-0">
                                            {getIconForSection(section.title)}
                                        </div>
                                        {section.isCustom ? (
                                            <input type="text" defaultValue={section.title} onBlur={(e) => e.target.value !== section.title && e.target.value.trim() !== "" && handleSectionTitleChange(sIdx, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} className="text-lg font-extrabold text-text-main bg-transparent border-b-2 border-transparent hover:border-primary/30 focus:border-primary focus:outline-none px-1 w-full uppercase tracking-tight" placeholder="Section Name" />
                                        ) : (
                                            <h3 className="text-lg font-extrabold text-text-main uppercase tracking-tight">{section.title}</h3>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <button type="button" onClick={() => toggleSectionVerification(sIdx)} className="text-xs font-bold text-primary hover:text-primary-focus hover:underline mr-2 uppercase tracking-wide">Verify All</button>
                                        <button type="button" onClick={() => duplicateSection(sIdx)} className="p-1.5 bg-white border border-border rounded-lg text-text-light hover:text-primary transition-all shadow-sm opacity-60 group-hover/header:opacity-100" title="Duplicate"><DocumentDuplicateIcon className="w-4 h-4" /></button>
                                        {(section.title.includes('(Copy)') || section.isCustom) && (
                                            <button type="button" onClick={(e) => handleDeleteClick(e, sIdx)} className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-400 hover:text-red-600 transition-all shadow-sm opacity-60 group-hover/header:opacity-100" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {section.fields.map((field, fIdx) => {
                                        const isNotFound = !field.value || field.value.toLowerCase().trim() === 'not found' || field.value.toLowerCase().trim() === 'n/a';

                                        // Verification Logic Requirements
                                        const isValueFilled = field.value !== null && field.value !== undefined && String(field.value).trim() !== '';
                                        const isPageFilled = field.page !== null && field.page !== undefined && String(field.page).trim() !== '';
                                        const isSnippetFilled = field.snippet !== null && field.snippet !== undefined && String(field.snippet).trim() !== '';
                                        const isFileFilled = !isBundle || (field.fileName !== null && field.fileName !== undefined && String(field.fileName).trim() !== '');

                                        const isReadyToVerify = isValueFilled && isPageFilled && isSnippetFilled && isFileFilled;

                                        const isActive = activeFieldCoords?.sIdx === sIdx && activeFieldCoords?.fIdx === fIdx;
                                        const uniqueFieldId = `field-${sIdx}-${fIdx}`;

                                        return (
                                            <div
                                                key={fIdx}
                                                id={uniqueFieldId}
                                                onClick={() => focusField(sIdx, fIdx)}
                                                className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${isActive ? 'ring-2 ring-primary/50 border-primary shadow-indigo-100' : (isR2Active ? field.isVerifiedR2 : field.isVerified) ? 'bg-green-50/40 border-green-200' : isNotFound ? 'bg-red-50/30 border-red-100' : 'bg-white border-border shadow-sm'} focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary focus-within:shadow-md`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {/* Pass-Specific Ticks */}
                                                        {/* Green Tick: Reviewer 1 Pass (ReadOnly for R2) */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); if (!isR2Active) toggleFieldVerification(sIdx, fIdx, 'R1'); }}
                                                            disabled={!isReadyToVerify || isR2Active}
                                                            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${field.isVerified ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'bg-white border-gray-300 text-transparent'} ${!isReadyToVerify ? 'invisible' : ''} ${isR2Active ? 'cursor-not-allowed opacity-80' : 'hover:border-primary'}`}
                                                            title={isR2Active ? "Reviewer 1 Pass (Fixed)" : "Mark as verified"}
                                                        >
                                                            <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                                                        </button>

                                                        {/* Blue Tick: Reviewer 2 Pass (Only active in R2 context) */}
                                                        {isR2Active && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); toggleFieldVerification(sIdx, fIdx, 'R2'); }}
                                                                disabled={!isReadyToVerify}
                                                                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${field.isVerifiedR2 ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-300 text-transparent hover:border-blue-600'} ${!isReadyToVerify ? 'invisible' : ''}`}
                                                                title={field.isVerifiedR2 ? "Final Pass Confirmed" : "Mark Final Pass"}
                                                            >
                                                                <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                                                            </button>
                                                        )}

                                                        <label
                                                            className="text-xs font-bold text-text-light uppercase tracking-wider cursor-pointer select-none"
                                                            onClick={(e) => { e.stopPropagation(); if (isReadyToVerify) toggleFieldVerification(sIdx, fIdx, isR2Active ? 'R2' : 'R1'); }}
                                                        >
                                                            {field.label}
                                                        </label>
                                                        {isNotFound && !field.isVerified && (
                                                            <div title="Parameter Miss" className="text-red-400">
                                                                <ExclamationCircleIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Visual hint for unverified field that has a value */}
                                                    {!(isR2Active ? field.isVerifiedR2 : field.isVerified) && field.value && !isNotFound && <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm" title="Unverified modification"></span>}
                                                </div>

                                                <div className="relative date-menu-container">
                                                    <ExpandableValueInput
                                                        value={field.value || ''}
                                                        onChange={(e) => handleFieldChange(sIdx, fIdx, 'value', e.target.value)}
                                                        onFocus={() => setActiveFieldCoords({ sIdx, fIdx })}
                                                        isVerified={field.isVerified}
                                                        isNotFound={isNotFound}
                                                        placeholder={isNotFound ? "Enter missing value..." : "Value..."}
                                                    />

                                                    {field.isDate && availableDates.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setOpenDateMenu(openDateMenu === uniqueFieldId ? null : uniqueFieldId); }}
                                                            className="absolute right-9 top-2 text-slate-400 hover:text-primary bg-white/80 rounded p-0.5 z-10"
                                                            title="Pick Extracted Date"
                                                        >
                                                            <CalendarIcon className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {openDateMenu === uniqueFieldId && (
                                                        <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white rounded-lg shadow-xl border border-border animate-fade-in max-h-60 overflow-y-auto">
                                                            <div className="px-3 py-2 bg-slate-50 border-b border-border text-xs font-bold text-slate-500 uppercase">Available Dates</div>
                                                            {availableDates.map((date, idx) => (
                                                                <button
                                                                    key={`${date.label}-${idx}`}
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleBatchFieldChange(sIdx, fIdx, {
                                                                            value: date.value,
                                                                            page: date.page,
                                                                            snippet: date.snippet,
                                                                            fileName: date.fileName
                                                                        });
                                                                        setOpenDateMenu(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 transition-colors border-b border-slate-50 last:border-0"
                                                                >
                                                                    <span className="block font-semibold text-text-main">{date.value}</span>
                                                                    <span className="block text-text-light text-[10px]">{date.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-2 flex items-center gap-2 transition-opacity">
                                                    <div className="w-16 flex-shrink-0" title="Page Number">
                                                        <input
                                                            type="number"
                                                            value={field.page || ''}
                                                            onChange={(e) => handleFieldChange(sIdx, fIdx, 'page', e.target.value ? parseInt(e.target.value) : null)}
                                                            onFocus={() => setActiveFieldCoords({ sIdx, fIdx })}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full rounded border-slate-200 text-[11px] font-bold py-1.5 px-2 text-center focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400 shadow-sm bg-white"
                                                            placeholder="Pg"
                                                        />
                                                    </div>

                                                    {isBundle && (
                                                        <div className="w-20 flex-shrink-0" title="Source Document">
                                                            <input
                                                                type="text"
                                                                value={field.fileName || ''}
                                                                onChange={(e) => handleFieldChange(sIdx, fIdx, 'fileName', e.target.value)}
                                                                onFocus={() => setActiveFieldCoords({ sIdx, fIdx })}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="block w-full rounded border-slate-200 text-[11px] font-medium py-1.5 px-2 focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400 shadow-sm truncate bg-white"
                                                                placeholder="Doc"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0" title="Source Snippet">
                                                        <input
                                                            type="text"
                                                            value={field.snippet || ''}
                                                            onChange={(e) => handleFieldChange(sIdx, fIdx, 'snippet', e.target.value)}
                                                            onFocus={() => setActiveFieldCoords({ sIdx, fIdx })}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="block w-full rounded border-slate-200 text-[11px] font-medium py-1.5 px-2 focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400 shadow-sm italic bg-white"
                                                            placeholder="Paste snippet or click PDF..."
                                                        />
                                                    </div>

                                                    {field.page && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleFieldClick(field.page!, field.fileName || null, field.snippet || null); }}
                                                            className="flex-shrink-0 p-1.5 rounded border border-slate-200 bg-white hover:bg-primary/10 text-slate-400 hover:text-primary transition-all shadow-sm group/btn"
                                                            title="Highlight in PDF"
                                                        >
                                                            <EyeIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 h-full bg-gray-500 relative min-w-0">
                    <PdfViewer
                        documents={lease.documents}
                        navigationTarget={navigationTarget}
                        onTextSelection={handlePdfTextSelection}
                        allSnippets={allSnippets}
                    />
                </div>
            </div>

            <ConfirmationModal isOpen={showSubmitConfirm} onClose={() => setShowSubmitConfirm(false)} onConfirm={async () => { setIsSubmitting(true); await onSubmitReview(lease.id, data, reviewerNotes, timeSpent, skipR2); setIsSubmitting(false); setShowSubmitConfirm(false); }} title={isR2Active ? "Finalize Pass 2" : "Finalize Pass 1"} message={isR2Active ? "Submit your final verification? This note will be visible to the client." : "Finalize this review? This note will be sent to the second pass reviewer."} confirmText={isR2Active ? "Complete Final Review" : "Submit Report"} isConfirming={isSubmitting}>
                <div className="mt-4 p-4 bg-white rounded-xl border border-border shadow-sm space-y-4">
                    {isAdmin && !isR2Active && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <input
                                type="checkbox"
                                id="skip-r2-verification"
                                checked={skipR2}
                                onChange={(e) => setSkipR2(e.target.checked)}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="skip-r2-verification" className="text-xs font-bold text-indigo-900 cursor-pointer select-none">
                                Mark as Final (Bypass R2 Verification)
                            </label>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-text-light uppercase tracking-widest mb-2 ml-1">
                            {isR2Active ? 'Message to Client' : 'Internal Note for Reviewer 2'}
                        </label>
                        <textarea
                            className="block w-full rounded-xl border-border bg-slate-50 shadow-inner focus:border-primary focus:ring-primary sm:text-sm py-3 px-4 text-text-main min-h-[120px]"
                            value={reviewerNotes}
                            onChange={e => setReviewerNotes(e.target.value)}
                            placeholder={isR2Active || skipR2 ? "Provide summary notes for the client..." : "Provide details for the second pass reviewer..."}
                        />
                    </div>
                </div>
            </ConfirmationModal>

            <ConfirmationModal isOpen={deleteConfirmation.isOpen} onClose={() => setDeleteConfirmation({ isOpen: false, index: null })} onConfirm={executeDelete} title="Delete Section" message="Confirm deletion of this entire data group? This cannot be undone." confirmText="Delete" cancelText="Cancel" />

            {showShortcuts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowShortcuts(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-border animate-slide-up" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-extrabold text-text-main mb-6 flex items-center gap-3">
                            <ClockIcon className="w-6 h-6 text-primary" /> Shortcuts
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-text-light">Cycle Valid Params</span><span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">Arrow Down/Up</span></div>
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-text-light">Toggle Verification</span><span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">Ctrl + Enter</span></div>
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-text-light">Jump to PDF Source</span><span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">Ctrl + P</span></div>
                            <div className="flex justify-between items-center text-sm font-medium"><span className="text-text-light">Capture Source to Field</span><span className="font-mono bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">Shift + Select</span></div>
                        </div>
                        <button onClick={() => setShowShortcuts(false)} className="w-full mt-8 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-focus transition-all shadow-md active:scale-95">Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};
