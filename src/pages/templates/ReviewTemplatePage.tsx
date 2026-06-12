
import React, { useState, useEffect } from 'react';
import { SelectionSection, SavedTemplate } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { generateTemplateData, getCanonicalSectionOrder } from '@/features/templates/types/templates';
import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { OptionalSectionsAdder } from '@/features/templates/components/OptionalSectionsAdder';
import { FloppyDiskIcon } from '@/shared/ui/Icons/FloppyDiskIcon';
import { PencilSquareIcon } from '@/shared/ui/Icons/PencilSquareIcon';

interface ReviewTemplatePageProps {
  pendingLease: {
    files: File[];
    name: string;
    templateType: 'us' | 'eu' | 'custom';
  };
  initialTemplateData?: SelectionSection[];
  existingTemplateId?: string;
  onSubmit: (finalTemplateData: SelectionSection[]) => void;
  onSaveTemplate: (name: string, type: 'us' | 'eu' | 'custom', sections: SelectionSection[]) => void;
  onUpdateTemplate: (template: SavedTemplate) => void;
  onBack: () => void;
}

export const ReviewTemplatePage: React.FC<ReviewTemplatePageProps> = ({ 
    pendingLease, 
    initialTemplateData, 
    existingTemplateId,
    onSubmit, 
    onSaveTemplate, 
    onUpdateTemplate,
    onBack 
}) => {
  const [mainTemplateData, setMainTemplateData] = useState<SelectionSection[]>([]);
  const [optionalTemplateData, setOptionalTemplateData] = useState<SelectionSection[]>([]);
  
  // Save Template State
  const [saveMode, setSaveMode] = useState<'none' | 'new' | 'update'>('none');
  const [templateName, setTemplateName] = useState('');

  // Helper to sort sections based on canonical order
  const sortSections = (sections: SelectionSection[], type: 'us' | 'eu' | 'custom') => {
      const canonicalOrder = getCanonicalSectionOrder(type);
      
      return [...sections].sort((a, b) => {
          const idxA = canonicalOrder.indexOf(a.id);
          const idxB = canonicalOrder.indexOf(b.id);
          // If not found (custom sections), put at end
          const posA = idxA === -1 ? 9999 : idxA;
          const posB = idxB === -1 ? 9999 : idxB;
          return posA - posB;
      });
  };

  useEffect(() => {
    if (initialTemplateData) {
        // Enforce order on initial load as well
        setMainTemplateData(sortSections(initialTemplateData, pendingLease.templateType));
        
        // We need to calculate what remains optional based on the type
        // This allows users to add ANY section that is not currently in the saved template
        const { main: allMain, optional: allOptional } = generateTemplateData(pendingLease.templateType);
        const allPossibleSections = [...allMain, ...allOptional];
        
        const existingIds = new Set(initialTemplateData.map(s => s.id));
        const remainingOptional = allPossibleSections.filter(s => !existingIds.has(s.id));
        
        // Optional sections also sorted
        setOptionalTemplateData(sortSections(remainingOptional, pendingLease.templateType));
    } else {
        // Standard flow
        const { main, optional } = generateTemplateData(pendingLease.templateType);
        setMainTemplateData(main); // main is already sorted in generateTemplateData but good to ensure
        setOptionalTemplateData(optional);
    }
  }, [pendingLease.templateType, initialTemplateData]);
  
  const handleAddSectionToMain = (sectionId: string) => {
    const sectionToAdd = optionalTemplateData.find(s => s.id === sectionId);
    if (sectionToAdd) {
      setMainTemplateData(prev => sortSections([...prev, sectionToAdd], pendingLease.templateType));
      setOptionalTemplateData(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  const handleRemoveSectionFromMain = (sectionId: string) => {
    const sectionToRemove = mainTemplateData.find(s => s.id === sectionId);
    if (sectionToRemove) {
      // Add back to optional and sort alphabetically or canonically
      setOptionalTemplateData(prev => sortSections([...prev, sectionToRemove], pendingLease.templateType));
      setMainTemplateData(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  const handleFinalSubmit = () => {
    if (saveMode === 'new' && templateName.trim()) {
        onSaveTemplate(templateName, pendingLease.templateType, mainTemplateData);
    } else if (saveMode === 'update' && existingTemplateId) {
        // Construct the updated template object
        const updatedTemplate: SavedTemplate = {
            id: existingTemplateId,
            name: templateName || 'Updated Template',
            type: pendingLease.templateType,
            sections: mainTemplateData,
            dateCreated: new Date(), 
            lastModified: new Date()
        };
        onUpdateTemplate(updatedTemplate);
    }
    onSubmit(mainTemplateData);
  }

  return (
    <ScrollAnimatedSection className="max-w-3xl mx-auto flex flex-col gap-8">
       <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-3">
            Configure Your Abstraction
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-text-light">
            Select the fields you want the AI to extract from your document(s).
            </p>
        </div>

      <TemplateEditor 
        title="Template Fields"
        templateData={mainTemplateData}
        onTemplateDataChange={setMainTemplateData}
        // Always pass the remove handler to allow removing ANY section
        onRemoveOptionalSection={handleRemoveSectionFromMain}
      />
      
      <OptionalSectionsAdder 
        sections={optionalTemplateData}
        onAdd={handleAddSectionToMain}
      />
      
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-4">
         {existingTemplateId ? (
            <div>
                 <h4 className="font-semibold text-text-main mb-3">Template Options</h4>
                 <div className="space-y-2">
                     <div className="flex items-center">
                         <input 
                            type="radio"
                            id="save-none"
                            name="save-mode"
                            checked={saveMode === 'none'}
                            onChange={() => setSaveMode('none')}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                         />
                         <label htmlFor="save-none" className="ml-2 text-sm text-text-main">Do not save changes</label>
                     </div>
                     <div className="flex items-center">
                         <input 
                            type="radio"
                            id="save-update"
                            name="save-mode"
                            checked={saveMode === 'update'}
                            onChange={() => setSaveMode('update')}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                         />
                         <label htmlFor="save-update" className="ml-2 text-sm text-text-main">Update existing template</label>
                     </div>
                     <div className="flex items-center">
                         <input 
                            type="radio"
                            id="save-new"
                            name="save-mode"
                            checked={saveMode === 'new'}
                            onChange={() => {
                                setSaveMode('new');
                                setTemplateName('');
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                         />
                         <label htmlFor="save-new" className="ml-2 text-sm text-text-main">Save as new template</label>
                     </div>
                 </div>
            </div>
         ) : (
             <div className="flex items-center">
                 <input 
                    id="save-template"
                    type="checkbox"
                    checked={saveMode === 'new'}
                    onChange={e => setSaveMode(e.target.checked ? 'new' : 'none')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                 />
                 <label htmlFor="save-template" className="ml-2 block text-sm font-medium text-text-main cursor-pointer select-none">
                     Save this configuration as a new template
                 </label>
             </div>
         )}

         {saveMode === 'new' && (
             <div className="animate-fade-in mt-2">
                 <label htmlFor="template-name" className="block text-sm font-medium text-text-light mb-1">New Template Name</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FloppyDiskIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        id="template-name" 
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary py-2 bg-surface-muted border"
                        placeholder="e.g., California Retail Standard"
                        autoFocus
                    />
                 </div>
             </div>
         )}
      </div>
      
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors w-full sm:w-auto"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Templates
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={saveMode === 'new' && !templateName.trim()}
            className="w-full sm:w-auto flex justify-center py-3 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary via-accent to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary-focus transition-all duration-300 transform hover:scale-105 btn-gradient disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMode !== 'none' ? 'Save & Submit' : 'Submit'}
          </button>
       </div>
    </ScrollAnimatedSection>
  );
};
