import React, { useState } from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { PendingIndividualLeaseConfig, SavedTemplate } from '@/shared/types';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';

interface ConfigureTemplatesPageProps {
  initialLeases: PendingIndividualLeaseConfig[];
  savedTemplates?: SavedTemplate[];
  onContinue: (leases: PendingIndividualLeaseConfig[]) => void;
  onBack: () => void;
}

const TemplateSelector: React.FC<{
    selectedValue: string;
    savedTemplates?: SavedTemplate[];
    onChange: (value: 'us' | 'eu' | string) => void;
}> = ({ selectedValue, savedTemplates, onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            <select 
                value={selectedValue}
                onChange={(e) => onChange(e.target.value as any)}
                className="block w-full rounded-md border-border bg-surface-muted px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
            >
                <optgroup label="Base Templates">
                    <option value="us">US Template (Base)</option>
                    <option value="eu">UK/EU Template (Base)</option>
                </optgroup>
                {savedTemplates && savedTemplates.length > 0 && (
                    <optgroup label="My Saved Templates">
                        {savedTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    );
};

export const ConfigureTemplatesPage: React.FC<ConfigureTemplatesPageProps> = ({ initialLeases, savedTemplates, onContinue, onBack }) => {
    const [leases, setLeases] = useState<PendingIndividualLeaseConfig[]>(initialLeases);

    const handleTemplateChange = (fileName: string, templateType: 'us' | 'eu' | string) => {
        setLeases(prevLeases =>
            prevLeases.map(lease =>
                lease.file.name === fileName ? { ...lease, templateType: templateType as any } : lease
            )
        );
    };
    
    const handleSubmit = () => {
        onContinue(leases);
    };

    return (
        <ScrollAnimatedSection className="max-w-3xl mx-auto flex flex-col gap-8">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-3">
                    Configure Templates for Each Lease
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-text-light">
                    Assign the appropriate base or saved template to each uploaded document.
                </p>
            </div>

            <div className="space-y-4">
                {leases.map(lease => (
                    <div key={lease.file.name} className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 flex-grow w-full sm:w-auto overflow-hidden">
                           <DocumentTextIcon className="w-6 h-6 text-primary flex-shrink-0" />
                           <p className="font-medium text-text-main truncate" title={lease.file.name}>{lease.file.name}</p>
                        </div>
                        <div className="w-full sm:w-64 flex-shrink-0">
                            <TemplateSelector 
                                selectedValue={lease.templateType}
                                savedTemplates={savedTemplates}
                                onChange={(newType) => handleTemplateChange(lease.file.name, newType)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-6 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors w-full sm:w-auto"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Upload
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-focus transition-all duration-300 transform hover:scale-105 btn-gradient"
                >
                    Continue & Review Fields
                </button>
            </div>
        </ScrollAnimatedSection>
    );
};
