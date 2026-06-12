
import React, { useState } from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { BatchTemplateData, SelectionSection, TemplateSet } from '@/shared/types';
import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { OptionalSectionsAdder } from '@/features/templates/components/OptionalSectionsAdder';
import { FloppyDiskIcon } from '@/shared/ui/Icons/FloppyDiskIcon';
import { generateTemplateData, getCanonicalSectionOrder } from '@/features/templates/types/templates';

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
  const [templateSets, setTemplateSets] = useState<BatchTemplateData>(initialTemplates);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Helper to sort sections based on canonical order
  const sortSections = (sections: SelectionSection[], type: string) => {
      const canonicalType = (type === 'us' || type === 'eu') ? type : 'custom';
      const canonicalOrder = getCanonicalSectionOrder(canonicalType);
      
      return [...sections].sort((a, b) => {
          const idxA = canonicalOrder.indexOf(a.id);
          const idxB = canonicalOrder.indexOf(b.id);
          const posA = idxA === -1 ? 9999 : idxA;
          const posB = idxB === -1 ? 9999 : idxB;
          return posA - posB;
      });
  };

  const handleTemplateChange = (type: string, newMainData: SelectionSection[]) => {
      setTemplateSets(prev => ({ ...prev, [type]: { ...prev[type], main: newMainData } }));
  };
  
  const handleAddSection = (type: string, sectionId: string) => {
      setTemplateSets(prev => {
          const set = prev[type];
          const sectionToAdd = set.optional.find(s => s.id === sectionId);
          if (!sectionToAdd) return prev;
          return {
              ...prev,
              [type]: {
                  ...set,
                  main: sortSections([...set.main, sectionToAdd], type),
                  optional: set.optional.filter(s => s.id !== sectionId)
              }
          };
      });
  };
  
  const handleRemoveSection = (type: string, sectionId: string) => {
      setTemplateSets(prev => {
          const set = prev[type];
          const sectionToRemove = set.main.find(s => s.id === sectionId);
          if (!sectionToRemove) return prev;
          return {
              ...prev,
              [type]: {
                  ...set,
                  main: set.main.filter(s => s.id !== sectionId),
                  optional: sortSections([...set.optional, sectionToRemove], type)
              }
          };
      });
  };

  const handleFinalSubmit = () => {
    onSubmit(templateSets, saveAsTemplate ? newTemplateName : undefined);
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
        {Object.entries(templateSets).map(([type, set]) => (
          <div key={type} className="space-y-6">
            <TemplateEditor 
              title={`${type === 'us' ? 'US' : type === 'eu' ? 'UK/EU' : 'Custom'} Template Customization`} 
              templateData={set.main} 
              onTemplateDataChange={(newMainData) => handleTemplateChange(type, newMainData)} 
              optionalSectionIds={set.originalOptionalIds} 
              onRemoveOptionalSection={(sectionId) => handleRemoveSection(type, sectionId)} 
            />
            {set.optional && set.optional.length > 0 && (
                <OptionalSectionsAdder sections={set.optional} onAdd={(sectionId) => handleAddSection(type, sectionId)} />
            )}
          </div>
        ))}
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
