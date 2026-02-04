

import React from 'react';
import { SelectionSection } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TemplateEditorProps {
  title: string;
  templateData: SelectionSection[];
  onTemplateDataChange: (newData: SelectionSection[]) => void;
  optionalSectionIds?: Set<string>;
  onRemoveOptionalSection?: (sectionId: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ title, templateData, onTemplateDataChange, optionalSectionIds, onRemoveOptionalSection }) => {
  const handleToggleField = (sectionId: string, fieldId: string) => {
    const newData = templateData.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.map(field => field.id === fieldId ? { ...field, isSelected: !field.isSelected } : field) }
        : section
    );
    onTemplateDataChange(newData);
  };

  const handleAddField = (sectionId: string) => {
    const newFieldName = prompt('Enter the name for the new custom field:');
    if (newFieldName && newFieldName.trim() !== '') {
      const newData = templateData.map(section =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, { id: `new-${Date.now()}`, label: newFieldName.trim(), isSelected: true }] }
          : section
      );
      onTemplateDataChange(newData);
    }
  };

  const handleRemoveField = (sectionId: string, fieldId: string) => {
    if (window.confirm('Are you sure you want to remove this custom field?')) {
      const newData = templateData.map(section =>
        section.id === sectionId
          ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
          : section
      );
      onTemplateDataChange(newData);
    }
  };
  
  const handleSelectAll = (sectionId: string, select: boolean) => {
    const newData = templateData.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.map(field => ({ ...field, isSelected: select })),
        };
      }
      return section;
    });
    onTemplateDataChange(newData);
  };

  return (
    <div className="space-y-6 bg-surface p-6 rounded-xl border border-border shadow-md">
      <h3 className="text-xl font-bold text-text-main">{title}</h3>
      {templateData.map(section => {
        return (
        <div key={section.id}>
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-primary">{section.title}</h4>
                {onRemoveOptionalSection && (
                    <button 
                        onClick={() => onRemoveOptionalSection(section.id)}
                        className="flex items-center text-xs font-medium text-red-500 hover:text-red-700 bg-red-100/80 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                        title="Remove this section"
                    >
                        <TrashIcon className="w-4 h-4 mr-1"/>
                        <span>Remove</span>
                    </button>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => handleSelectAll(section.id, true)} className="text-xs font-medium text-primary hover:underline transition-colors">Select All</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => handleSelectAll(section.id, false)} className="text-xs font-medium text-primary hover:underline transition-colors">Deselect All</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {section.fields.map(field => {
              const isCustom = field.id.startsWith('new-');
              return (
                <div
                  key={field.id}
                  onClick={() => handleToggleField(section.id, field.id)}
                  className={`flex items-center gap-1.5 pl-3 pr-2 py-1 text-sm font-medium rounded-full transition-all duration-200 border cursor-pointer ${
                    field.isSelected
                      ? 'bg-primary border-primary text-white hover:bg-primary-focus shadow-sm'
                      : 'bg-surface border-border text-text-light hover:border-primary hover:text-primary'
                  }`}
                  role="checkbox"
                  aria-checked={field.isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleToggleField(section.id, field.id) }}}
                >
                  <span>{field.label}</span>
                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveField(section.id, field.id);
                      }}
                      className={`p-0.5 rounded-full transition-colors ${
                        field.isSelected ? 'text-sky-200 hover:text-white hover:bg-black/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                      }`}
                      title="Remove Custom Field"
                      aria-label={`Remove ${field.label}`}
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => handleAddField(section.id)} className="mt-4 flex items-center text-sm font-medium text-primary hover:text-primary-focus">
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Custom Field
          </button>
        </div>
        );
      })}
    </div>
  );
};