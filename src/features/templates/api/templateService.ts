import type { SavedTemplate, SelectionSection } from '@/shared/types';

let mockTemplates: SavedTemplate[] = [];

export const fetchTemplates = async (userId: string): Promise<SavedTemplate[]> => {
    return mockTemplates;
};

export const createTemplate = async (
    userId: string,
    template: SavedTemplate
): Promise<{ success: boolean; error?: string }> => {
    mockTemplates.push(template);
    return { success: true };
};

export const updateTemplate = async (
    template: SavedTemplate
): Promise<{ success: boolean; error?: string }> => {
    const idx = mockTemplates.findIndex(t => t.id === template.id);
    if (idx !== -1) {
        mockTemplates[idx] = template;
    }
    return { success: true };
};

export const deleteTemplate = async (
    templateId: string
): Promise<{ success: boolean; error?: string }> => {
    mockTemplates = mockTemplates.filter(t => t.id !== templateId);
    return { success: true };
};
