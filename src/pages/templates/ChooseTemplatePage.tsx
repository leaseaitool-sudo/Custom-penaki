
import React from 'react';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { ArrowLeftIcon } from '@/shared/ui/Icons/ArrowLeftIcon';
import { SavedTemplate } from '@/shared/types';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';

interface ChooseTemplatePageProps {
  onSelectTemplate: (templateType: 'us' | 'eu') => void;
  onSelectSavedTemplate: (template: SavedTemplate) => void;
  savedTemplates?: SavedTemplate[];
  onBack: () => void;
}

const TemplateCard: React.FC<{
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}> = ({ title, description, buttonText, onClick, variant = 'primary' }) => (
  <div className={`bg-surface p-8 rounded-2xl border border-border shadow-lg transition-all duration-300 flex flex-col text-center ${variant === 'primary' ? 'hover:shadow-primary/20 hover:border-primary' : 'hover:shadow-secondary/20 hover:border-secondary'}`}>
    <h3 className="text-2xl font-bold text-text-main mb-4">{title}</h3>
    <p className="text-text-light mb-8 flex-grow">{description}</p>
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface transition-all duration-300 ${variant === 'primary' ? 'bg-primary hover:bg-primary-focus focus:ring-primary-focus' : 'bg-secondary hover:bg-indigo-700 focus:ring-secondary'}`}
    >
      {buttonText}
    </button>
  </div>
);

const SavedTemplateItem: React.FC<{ template: SavedTemplate; onClick: () => void }> = ({ template, onClick }) => (
    <div 
        onClick={onClick}
        className="group bg-surface p-5 rounded-xl border border-border hover:border-primary hover:shadow-md cursor-pointer transition-all duration-200"
    >
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-50 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-text-main group-hover:text-primary transition-colors">{template.name}</h4>
                    <span className="text-xs uppercase tracking-wide font-semibold text-text-light bg-surface-muted px-2 py-0.5 rounded-full border border-border mt-1 inline-block">
                        {template.type.toUpperCase()} Base
                    </span>
                </div>
            </div>
            <div className="flex items-center text-xs text-text-light" title={`Created: ${template.dateCreated.toLocaleDateString()}`}>
                 <ClockIcon className="w-3.5 h-3.5 mr-1" />
                 {template.lastModified.toLocaleDateString()}
            </div>
        </div>
        <p className="text-sm text-text-light mt-4 pl-1">
            {template.sections.reduce((acc, sec) => acc + sec.fields.filter(f => f.isSelected).length, 0)} fields configured
        </p>
    </div>
);

export const ChooseTemplatePage: React.FC<ChooseTemplatePageProps> = ({ onSelectTemplate, onSelectSavedTemplate, savedTemplates, onBack }) => {
  return (
    <ScrollAnimatedSection className="max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-main mb-3">
          Select a Template
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-text-light">
          Choose a standard template or pick from your saved custom configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TemplateCard
          title="US Template (Detailed)"
          description="Includes all lease sections for US: Landlord, Tenant, Rent, Options, Charges, Insurance, and more."
          buttonText="Use US Template"
          onClick={() => onSelectTemplate('us')}
        />
        <TemplateCard
          title="UK/EU Template (Simplified)"
          description="Optimized for European leases. Includes primary fields like Landlord, Tenant, Premises, Rent, and Term."
          buttonText="Use UK/EU Template"
          onClick={() => onSelectTemplate('eu')}
          variant="secondary"
        />
      </div>
      
      {savedTemplates && savedTemplates.length > 0 && (
          <div className="animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="flex-grow h-px bg-border"></div>
                <span className="px-4 text-sm font-semibold text-text-light uppercase tracking-wider">Or Use Saved Templates</span>
                <div className="flex-grow h-px bg-border"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTemplates.map(template => (
                      <SavedTemplateItem 
                        key={template.id} 
                        template={template} 
                        onClick={() => onSelectSavedTemplate(template)} 
                      />
                  ))}
              </div>
          </div>
      )}
      
      <div className="text-center pt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-text-light bg-surface hover:bg-surface-muted transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Upload
        </button>
      </div>
    </ScrollAnimatedSection>
  );
};
