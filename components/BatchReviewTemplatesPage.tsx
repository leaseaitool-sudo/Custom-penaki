
import React, { useState } from 'react';
import { ScrollAnimatedSection } from './ScrollAnimatedSection';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BatchTemplateData, SelectionSection, TemplateSet } from '../types';
import { TemplateEditor } from './TemplateEditor';
import { OptionalSectionsAdder } from './OptionalSectionsAdder';
import { FloppyDiskIcon } from './icons/FloppyDiskIcon';
import { generateTemplateData, getCanonicalSectionOrder } from '../templates';

interface BatchReviewTemplatesPageProps {
  initialTemplates: BatchTemplateData;
  onSubmit: (finalTemplates: BatchTemplateData, saveTemplateName?: string) => void;
  onBack: () => void;
  leaseCount: number;
}

export const BatchReviewTemplatesPage: React.FC<BatchReviewTemplatesPageProps> = ({
  initialTemplates,
  onSubmit,
  onBack,
  leaseCount
}) => {
  const [usTemplateSet, setUsTemplateSet] = useState<TemplateSet | undefined>(initialTemplates.us);
  const [euTemplateSet, setEuTemplateSet] = useState<TemplateSet | undefined>(initialTemplates.eu);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Helper to sort sections based on canonical order
  const sortSections = (sections: SelectionSection[], type: 'us' | 'eu') => {
      const canonicalOrder = getCanonicalSectionOrder(type);
      
      return [...sections].sort((a, b) => {
          const idxA = canonicalOrder.indexOf(a.id);
          const idxB = canonicalOrder.indexOf(b.id);
          const posA = idxA === -1 ? 9999 : idxA;
          const posB = idxB === -1 ? 9999 : idxB;
          return posA - posB;
      });
  };

  const handleUsTemplateChange = (newMainData: SelectionSection[]) => {
    if (usTemplateSet) setUsTemplateSet(prev => ({ ...prev!, main: newMainData }));
  };
  
  const handleAddUsSection = (sectionId: string) => {
    if (!usTemplateSet) return;
    const sectionToAdd = usTemplateSet.optional.find(s => s.id === sectionId);
    if (sectionToAdd) {
        setUsTemplateSet(prev => ({ 
            ...prev!, 
            main: sortSections([...prev!.main, sectionToAdd], 'us'), 
            optional: prev!.optional.filter(s => s.id !== sectionId) 
        }));
    }
  };
  
  const handleRemoveUsSection = (sectionId: string) => {
    if (!usTemplateSet) return;
    const sectionToRemove = usTemplateSet.main.find(s => s.id === sectionId);
    if (sectionToRemove) {
        setUsTemplateSet(prev => ({ 
            ...prev!, 
            main: prev!.main.filter(s => s.id !== sectionId), 
            optional: sortSections([...prev!.optional, sectionToRemove], 'us')
        }));
    }
  };
  
  const handleEuTemplateChange = (newMainData: SelectionSection[]) => {
    if (euTemplateSet) setEuTemplateSet(prev => ({ ...prev!, main: newMainData }));
  };

  const handleFinalSubmit = () => {
    const finalTemplates: BatchTemplateData = {};
    if (usTemplateSet) finalTemplates.us = { ...usTemplateSet };
    if (euTemplateSet) finalTemplates.eu = { ...euTemplateSet };
    onSubmit(finalTemplates, saveAsTemplate ? newTemplateName : undefined);
  };

  return (
    <ScrollAnimatedSection className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-3">
          Review & Customize Fields
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-text-light">
          Your selections here will apply to all leases using the corresponding template in this batch.
        </p>
      </div>

      <div className="space-y-8">
        {usTemplateSet && (
          <div className="space-y-6">
            <TemplateEditor title="US Template Customization" templateData={usTemplateSet.main} onTemplateDataChange={handleUsTemplateChange} optionalSectionIds={usTemplateSet.originalOptionalIds} onRemoveOptionalSection={handleRemoveUsSection} />
            <OptionalSectionsAdder sections={usTemplateSet.optional} onAdd={handleAddUsSection} />
          </div>
        )}
        {euTemplateSet && (
          <TemplateEditor title="UK/EU Template Customization" templateData={euTemplateSet.main} onTemplateDataChange={handleEuTemplateChange} />
        )}
      </div>

      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
          <div className="flex items-center">
              <input id="save-batch-tpl" type="checkbox" checked={saveAsTemplate} onChange={e => setSaveAsTemplate(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
              <label htmlFor="save-batch-tpl" className="ml-2 block text-sm font-medium text-text-main cursor-pointer select-none">Save this batch configuration as a reusable template</label>
          </div>
          {saveAsTemplate && (
              <div className="animate-fade-in mt-2">
                  <label className="block text-sm font-medium text-text-light mb-1">New Template Name</label>
                  <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FloppyDiskIcon className="h-5 w-5 text-gray-400" /></div>
                      <input type="text" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary py-2 bg-surface-muted border" placeholder="e.g., Portfolio Batch Standard" autoFocus />
                  </div>
              </div>
          )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
        <button onClick={onBack} className="inline-flex items-center px-6 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors w-full sm:w-auto"><ArrowLeftIcon className="w-5 h-5 mr-2" />Back</button>
        <button onClick={handleFinalSubmit} disabled={saveAsTemplate && !newTemplateName.trim()} className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-focus transition-all duration-300 transform hover:scale-105 btn-gradient disabled:opacity-50">Submit All ({leaseCount})</button>
      </div>
    </ScrollAnimatedSection>
  );
};
