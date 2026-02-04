import React from 'react';
import { SelectionSection } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';

interface OptionalSectionsAdderProps {
  sections: SelectionSection[];
  onAdd: (sectionId: string) => void;
}

export const OptionalSectionsAdder: React.FC<OptionalSectionsAdderProps> = ({ sections, onAdd }) => {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-muted p-6 rounded-xl border border-dashed border-border">
      <h4 className="text-lg font-semibold text-text-main mb-4">Add Optional Sections</h4>
      <p className="text-sm text-text-light mb-4">Click to add any of the following sections to your abstraction template.</p>
      <div className="flex flex-wrap gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => onAdd(section.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border bg-surface text-primary border-border hover:border-primary hover:bg-sky-50 shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>{section.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
