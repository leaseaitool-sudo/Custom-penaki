import { NormalizedTextItem, SearchMatch } from '../pdf.types';
import { normalizeStr } from './highlightEngine';

export const runSearch = (
    query: string,
    pdfDocs: any[], // PDFDocumentProxy[]
    textCache: Map<string, NormalizedTextItem[]>
): SearchMatch[] => {
    const normalizedQuery = normalizeStr(query);
    if (!normalizedQuery) return [];

    const results: SearchMatch[] = [];

    for (let d = 0; d < pdfDocs.length; d++) {
        const doc = pdfDocs[d];
        for (let p = 1; p <= doc.numPages; p++) {
            const items = textCache.get(`${d}-${p}`);
            if (items) {
                items.forEach((item, idx) => {
                    if (normalizeStr(item.str).includes(normalizedQuery)) {
                        results.push({
                            docIndex: d,
                            pageIndex: p,
                            matchIndex: idx,
                            str: item.str,
                            rect: item.rect
                        });
                    }
                });
            }
        }
    }
    
    return results;
};
