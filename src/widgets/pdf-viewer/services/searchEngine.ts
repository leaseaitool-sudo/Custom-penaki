import { NormalizedTextItem, SearchMatch } from '@/widgets/pdf-viewer/pdf.types';
import { normalizeStr } from './highlightEngine';

/** Minimal cache read interface — compatible with both Map and LRUMap */
interface ReadableCache<K, V> { get(key: K): V | undefined; }

export const runSearch = async (
    query: string,
    pdfDocs: any[], // PDFDocumentProxy[]
    textCache: ReadableCache<string, NormalizedTextItem[]>
): Promise<SearchMatch[]> => {
    const normalizedQuery = normalizeStr(query);
    if (!normalizedQuery) return [];

    const results: SearchMatch[] = [];
    let itemsProcessed = 0;

    for (let d = 0; d < pdfDocs.length; d++) {
        const doc = pdfDocs[d];
        for (let p = 1; p <= doc.numPages; p++) {
            const items = textCache.get(`${d}-${p}`);
            if (items) {
                for (let idx = 0; idx < items.length; idx++) {
                    const item = items[idx];

                    // Yield to main thread every 500 items to prevent UI freezing
                    if (++itemsProcessed % 500 === 0) {
                        await new Promise(r => setTimeout(r, 0));
                    }

                    if (normalizeStr(item.str).includes(normalizedQuery)) {
                        results.push({
                            docIndex: d,
                            pageIndex: p,
                            matchIndex: idx,
                            str: item.str,
                            rect: item.rect
                        });
                    }
                }
            }
        }
    }

    return results;
};
