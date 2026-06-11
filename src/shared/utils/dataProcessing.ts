
import { AbstractedData, AbstractedField, SelectionSection } from '@/shared/types';

export const mergeTemplateWithAbstracted = (templateConfig: SelectionSection[] | undefined, abstractedData: AbstractedData): AbstractedData => {
    // If no template config, just return what we have (or empty array if null)
    if (!templateConfig || templateConfig.length === 0) return abstractedData || [];

    // 1. Harvest ALL fields from the incoming abstractedData that have values or appear valid.
    // We treat the incoming data as a "pool" of fields to be distributed.
    const fieldPool: AbstractedField[] = [];
    
    if (abstractedData) {
        abstractedData.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    fieldPool.push(field);
                });
            }
        });
    }

    const mergedData: AbstractedData = [];

    // 2. Iterate through the master template to ensure strict adherence to structure
    templateConfig.forEach(tplSection => {
        const mergedFields: AbstractedField[] = [];

        tplSection.fields.forEach(tplField => {
            if (!tplField.isSelected) return;

            // Find the best matching field in the pool
            // Criteria: 
            // 1. Label matches (exact or contextual)
            // 2. Has value (priority over null/empty placeholders from previous runs)
            
            const candidates = fieldPool.filter(f => {
                if (!f.label) return false;
                const poolLabel = f.label.toLowerCase().trim();
                const templateLabel = tplField.label.toLowerCase().trim();
                
                // Exact match
                if (poolLabel === templateLabel) return true;

                // Context match: e.g. Pool has "Landlord Name", Template wants "Name" inside "Landlord" section
                const contextLabel = `${tplSection.title} ${tplField.label}`.toLowerCase().trim();
                if (poolLabel === contextLabel) return true;
                
                return false;
            });

            // Pick the best candidate: Prefer one with a real value
            let bestCandidate: AbstractedField | undefined;
            
            bestCandidate = candidates.find(f => f.value !== null && f.value !== undefined && String(f.value).trim() !== '');
            
            // If no value found, take any candidate (likely an empty placeholder)
            if (!bestCandidate && candidates.length > 0) {
                bestCandidate = candidates[0];
            }

            if (bestCandidate) {
                mergedFields.push({
                    ...bestCandidate,
                    label: tplField.label, // Enforce template label
                    isVerified: bestCandidate.isVerified || false,
                    isDate: tplField.isDate // Ensure isDate is preserved/applied from template
                });
                
                // Consume the field from pool to avoid re-matching generic names like "Name" to the wrong section later
                // (Only consume if we found a value, or if it's an exact match to prevent greediness)
                const indexToRemove = fieldPool.indexOf(bestCandidate);
                if (indexToRemove > -1) fieldPool.splice(indexToRemove, 1);
            } else {
                // Parameter Miss - Create clean empty field
                mergedFields.push({
                    label: tplField.label,
                    value: null,
                    page: null,
                    snippet: null,
                    fileName: null,
                    isVerified: false,
                    isDate: tplField.isDate
                });
            }
        });

        mergedData.push({
            title: tplSection.title,
            fields: mergedFields,
            isCustom: false
        });
    });

    // 3. Collect Leftovers: Any fields in fieldPool that have meaningful data but weren't matched to the template
    const validLeftovers = fieldPool.filter(f => f.value !== null && f.value !== undefined && String(f.value).trim() !== '' && f.label !== 'Details');

    if (validLeftovers.length > 0) {
        mergedData.push({
            title: "Additional Extracted Data",
            fields: validLeftovers.map(f => ({ ...f, isCustom: true })),
            isCustom: true // Allow user to rename/delete this section
        });
    }

    return mergedData;
};
