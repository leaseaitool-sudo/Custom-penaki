import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AbstractedData, Lease, AbstractedField } from '@/shared/types';
import { NavigationTarget, SnippetSource } from '@/widgets/pdf-viewer/PdfViewer';

export interface UseWorkbenchProps {
    lease: Lease | null;
    isR2Context: boolean;
    onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
}

export const useWorkbench = ({ lease, isR2Context, onSaveDraft }: UseWorkbenchProps) => {
    const [data, setData] = useState<AbstractedData>([]);
    const [activeSectionId, setActiveSectionId] = useState<string>('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [fieldSearchTerm, setFieldSearchTerm] = useState('');
    const [scrollToSectionTitle, setScrollToSectionTitle] = useState<string | null>(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [activeFieldCoords, setActiveFieldCoords] = useState<{ sIdx: number, fIdx: number } | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<NavigationTarget | null>(null);

    const currentLeaseIdRef = useRef<string | null>(lease?.id || null);

    // Timer
    useEffect(() => {
        if (!lease) return;
        const sessionStartTime = Date.now();
        const initialPassTime = isR2Context ? (lease.timeSpentR2 || 0) : (lease.timeSpentR1 || 0);

        setTimeSpent(initialPassTime);
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - sessionStartTime) / 1000);
            setTimeSpent(initialPassTime + elapsed);
        }, 1000);
        return () => clearInterval(interval);
    }, [lease?.id, isR2Context]);

    // Data Hydration
    useEffect(() => {
        if (lease && lease.id !== currentLeaseIdRef.current) {
            setData(lease.abstractedData || []);
            if (lease.abstractedData && lease.abstractedData.length > 0) setActiveSectionId(lease.abstractedData[0].title);
            currentLeaseIdRef.current = lease.id;
        } else if (lease && data.length === 0) {
            setData(lease.abstractedData || []);
            if (lease.abstractedData && lease.abstractedData.length > 0) setActiveSectionId(lease.abstractedData[0].title);
        }
    }, [lease, isR2Context]);

    // Auto-save logic
    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);
    const isSavingRef = useRef(false);
    const isMountedRef = useRef(true);
    const saveVersionRef = useRef(0);

    // Track mount/unmount to abort inflight saves
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (isDirty) {
            const timeout = setTimeout(async () => {
                if (isSavingRef.current || !isMountedRef.current) return;
                isSavingRef.current = true;
                setIsAutoSaving(true);

                // Capture version at save start to detect concurrent edits
                saveVersionRef.current += 1;
                const thisVersion = saveVersionRef.current;
                const snapshotData = dataRef.current;

                try {
                    await onSaveDraft(lease?.id || '', snapshotData, timeSpent);
                } finally {
                    isSavingRef.current = false;
                    // Only clear dirty/saving flags if no newer edit occurred during the save
                    if (isMountedRef.current && saveVersionRef.current === thisVersion) {
                        setIsAutoSaving(false);
                        setIsDirty(false);
                    } else if (isMountedRef.current) {
                        // A newer edit happened during save — keep dirty, clear saving indicator
                        setIsAutoSaving(false);
                    }
                }
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [data, isDirty, lease?.id, onSaveDraft, timeSpent]);

    const handleFieldChange = useCallback((sectionIndex: number, fieldIndex: number, fieldKey: keyof AbstractedField, value: any) => {
        setData(prevData => {
            const newData = [...prevData];
            const newSection = { ...newData[sectionIndex] };
            const newFields = [...newSection.fields];
            newFields[fieldIndex] = { ...newFields[fieldIndex], [fieldKey]: value };
            newSection.fields = newFields;
            newData[sectionIndex] = newSection;
            return newData;
        });
        setIsDirty(true);
    }, []);

    const handleBatchFieldChange = useCallback((sectionIndex: number, fieldIndex: number, updates: Partial<AbstractedField>) => {
        setData(prevData => {
            const newData = [...prevData];
            const newSection = { ...newData[sectionIndex] };
            const newFields = [...newSection.fields];
            newFields[fieldIndex] = { ...newFields[fieldIndex], ...updates };
            newSection.fields = newFields;
            newData[sectionIndex] = newSection;
            return newData;
        });
        setIsDirty(true);
    }, []);

    const toggleFieldVerification = useCallback((sectionIndex: number, fieldIndex: number, pass: 'R1' | 'R2' = 'R1') => {
        if (pass === 'R2' && !isR2Context) {
            console.warn("Security Alert: Attempted R2 verification in non-R2 context.");
            return;
        }

        setData(prevData => {
            const newData = [...prevData];
            const newSection = { ...newData[sectionIndex] };
            const newFields = [...newSection.fields];
            const field = newFields[fieldIndex];
            if (pass === 'R1') {
                newFields[fieldIndex] = { ...field, isVerified: !field.isVerified };
            } else {
                newFields[fieldIndex] = { ...field, isVerifiedR2: !field.isVerifiedR2 };
            }
            newSection.fields = newFields;
            newData[sectionIndex] = newSection;
            return newData;
        });
        setIsDirty(true);
    }, [isR2Context]);

    const toggleSectionVerification = useCallback((sectionIndex: number) => {
        setData(prevData => {
            const newData = [...prevData];
            const section = newData[sectionIndex];
            const pass = isR2Context ? 'R2' : 'R1';
            const allVerified = section.fields.every(f => pass === 'R2' ? f.isVerifiedR2 : f.isVerified);
            const newFields = section.fields.map(f => {
                return { ...f, [pass === 'R2' ? 'isVerifiedR2' : 'isVerified']: !allVerified };
            });
            newData[sectionIndex] = { ...section, fields: newFields };
            return newData;
        });
        setIsDirty(true);
    }, [isR2Context]);

    const duplicateSection = useCallback((sectionIndex: number) => {
        setData(prevData => {
            const sectionToDuplicate = prevData[sectionIndex];
            if (!sectionToDuplicate) return prevData;

            let newTitle = `${sectionToDuplicate.title} (Copy)`;
            let counter = 1;
            while (prevData.some(s => s.title === newTitle)) {
                counter++;
                newTitle = `${sectionToDuplicate.title} (Copy ${counter})`;
            }

            const newData = [...prevData];
            const newFields = sectionToDuplicate.fields.map(f => ({ ...f, value: '', isVerified: false, isVerifiedR2: false, page: null, snippet: null, fileName: null }));
            const newSection = { ...sectionToDuplicate, title: newTitle, isCustom: true, fields: newFields };
            newData.splice(sectionIndex + 1, 0, newSection);

            setScrollToSectionTitle(newTitle);
            setIsDirty(true);
            return newData;
        });
    }, []);

    const deleteSection = useCallback((index: number) => {
        setData(prev => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    }, []);

    const handleSectionTitleChange = useCallback((sectionIndex: number, newTitle: string) => {
        setData(prevData => {
            const newData = [...prevData];
            newData[sectionIndex] = { ...newData[sectionIndex], title: newTitle };
            return newData;
        });
        setIsDirty(true);
    }, []);

    const handlePdfTextSelection = useCallback((text: string, page: number, fileName: string | null) => {
        if (activeFieldCoords) {
            const { sIdx, fIdx } = activeFieldCoords;
            setData(prevData => {
                const newData = [...prevData];
                const newSection = { ...newData[sIdx] };
                const newFields = [...newSection.fields];
                newFields[fIdx] = {
                    ...newFields[fIdx],
                    snippet: text,
                    page: page,
                    ...(fileName ? { fileName } : {})
                };
                newSection.fields = newFields;
                newData[sIdx] = newSection;
                return newData;
            });
            setIsDirty(true);
        }
    }, [activeFieldCoords]);

    const handleFieldClick = useCallback((page: number, fileName: string | null, snippet: string | null) => {
        setNavigationTarget(null);
        setTimeout(() => setNavigationTarget({ page, fileName, searchText: snippet }), 50);
    }, []);

    const progressStats = useMemo(() => {
        let totalFields = 0, verifiedFields = 0;
        data.forEach(section => {
            section.fields.forEach(field => {
                const hasData = field.value !== null && field.value !== undefined && String(field.value).trim() !== '';
                if (hasData) {
                    totalFields++;
                    if (isR2Context ? field.isVerifiedR2 : field.isVerified) verifiedFields++;
                }
            });
        });
        return { total: totalFields, verified: verifiedFields, percent: totalFields > 0 ? (verifiedFields / totalFields) * 100 : 0 };
    }, [data, isR2Context]);

    const filteredSections = useMemo(() => {
        if (!fieldSearchTerm) return data;
        const lowerTerm = fieldSearchTerm.toLowerCase();
        return data.filter(section => section.title.toLowerCase().includes(lowerTerm) || section.fields.some(f => f.label.toLowerCase().includes(lowerTerm)));
    }, [data, fieldSearchTerm]);

    return {
        data,
        activeSectionId,
        setActiveSectionId,
        isAutoSaving,
        fieldSearchTerm,
        setFieldSearchTerm,
        scrollToSectionTitle,
        setScrollToSectionTitle,
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
    };
};
