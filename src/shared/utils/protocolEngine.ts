
import { SelectionSection, AbstractedData, AbstractedSection } from '@/shared/types';
import { systemInstructionBase, customTemplateGuidelines, usTemplateGuidelines } from '@/shared/types/constants';

export interface ProtocolItem {
    code: string;
    value: string | null;
    page: number | null;
    snippet: string | null;
    fileName?: string | null;
}

/**
 * Generates a numerical legend string to instruct the AI on which codes correspond to which fields.
 * Format: SectionID.FieldID.InstanceID
 */
export const generateProtocolPrompt = (template: SelectionSection[], templateType?: string): string => {
    let prompt = systemInstructionBase + "\n\n";

    if (templateType !== 'us' && templateType !== 'eu') {
        prompt += customTemplateGuidelines + "\n\n";
    } else if (templateType === 'us') {
        prompt += usTemplateGuidelines + "\n\n";
    }

    prompt += "OUTPUT PROTOCOL:\n";
    prompt += "You must output a JSON Array of objects. Each object represents an extracted field.\n";
    prompt += "Use the 'code' property to identify the field based on the mapping below.\n";
    prompt += "Format of code: 'SectionID.FieldID.InstanceID'\n";
    prompt += "- SectionID: The number identifying the section.\n";
    prompt += "- FieldID: The number identifying the field within that section.\n";
    prompt += "- InstanceID: '0' for the first occurrence. If a section repeats (e.g. multiple Contacts), increment this number (1, 2, etc.). MAXIMUM 5 INSTANCES PER REPEATING SECTION to prevent massive outputs.\n";
    prompt += "  Example: '1.2.0' is the first instance of field 2 in section 1. '1.2.1' is the second instance.\n\n";
    prompt += "MAPPING LEGEND:\n";

    template.forEach((section, sIdx) => {
        const sId = sIdx + 1;
        prompt += `SECTION ${sId}: ${section.title}\n`;
        section.fields.forEach((field, fIdx) => {
            if (!field.isSelected) return;
            const fId = fIdx + 1;
            prompt += `  Code ${sId}.${fId} = ${field.label}\n`;
        });
        prompt += "\n";
    });

    return prompt;
};

/**
 * Parses the raw AI response (ProtocolItems) and maps them back to the original Template structure.
 * Handles dynamic section duplication for instances > 0.
 */
export const rehydrateData = (rawItems: ProtocolItem[], template: SelectionSection[]): AbstractedData => {
    // Map key format: "sectionIndex_instanceIndex"
    const sectionsMap = new Map<string, AbstractedSection>();

    // 1. Initialize Instance 0 for all template sections to ensure complete UI structure
    template.forEach((tplSection, sIdx) => {
        sectionsMap.set(`${sIdx}_0`, {
            title: tplSection.title,
            fields: tplSection.fields.map(f => ({
                label: f.label,
                value: null,
                page: null,
                snippet: null,
                fileName: null,
                isVerified: false,
                isDate: f.isDate
            })),
            isCustom: false
        });
    });

    // 2. Process Raw Items and populate data
    rawItems.forEach(item => {
        if (!item.code) return;
        
        // Parse Code: Section.Field.Instance
        const parts = item.code.split('.').map(Number);
        if (parts.length < 3 || parts.some(isNaN)) return;

        const [sId, fId, instanceId] = parts;
        const sIdx = sId - 1;
        const fIdx = fId - 1;

        if (sIdx < 0 || sIdx >= template.length) return;

        const tplSection = template[sIdx];
        if (!tplSection) return;
        
        // Key for this specific section instance
        const sectionKey = `${sIdx}_${instanceId}`;

        // If this is a new dynamic instance (e.g. Contact #2), clone the template structure
        if (!sectionsMap.has(sectionKey)) {
            const titleSuffix = ` ${instanceId + 1}`;
            sectionsMap.set(sectionKey, {
                title: `${tplSection.title}${titleSuffix}`,
                fields: tplSection.fields.map(f => ({
                    label: f.label,
                    value: null,
                    page: null,
                    snippet: null,
                    fileName: null,
                    isVerified: false,
                    isDate: f.isDate
                })),
                isCustom: true // Mark as custom so it can be manipulated in UI if needed
            });
        }

        const section = sectionsMap.get(sectionKey)!;
        
        // Map value to the correct field index
        if (section.fields[fIdx]) {
            section.fields[fIdx].value = item.value;
            section.fields[fIdx].page = item.page;
            section.fields[fIdx].snippet = item.snippet;
            if (item.fileName) section.fields[fIdx].fileName = item.fileName;
        }
    });

    // 3. Convert Map to Array and Sort
    // Sort logic: Primary sort by Section Index (template order), Secondary by Instance Index (0, 1, 2...)
    const sortedKeys = Array.from(sectionsMap.keys()).sort((a, b) => {
        const [as, ai] = a.split('_').map(Number);
        const [bs, bi] = b.split('_').map(Number);
        if (as !== bs) return as - bs;
        return ai - bi;
    });

    return sortedKeys.map(k => sectionsMap.get(k)!);
};
