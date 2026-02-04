import { NormalizedTextItem, SnippetSource, MergedHighlightBlock } from '../pdf.types';

export const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

export const generateSnippetId = (docIndex: number, pageIndex: number, text: string) => 
    `${docIndex}-${pageIndex}-${normalizeStr(text).slice(0, 32)}`;

/**
 * Calculates highlights using a "Chunked Haystack" approach.
 * 1. Converts page to a continuous normalized string (haystack).
 * 2. Splits snippet into overlapping chunks (e.g. 20 chars).
 * 3. Searches for ALL chunks.
 * 4. Merges matched item indices into blocks.
 */
export const calculatePageHighlightBlocks = (
    docIndex: number, 
    pageIndex: number, 
    textItems: NormalizedTextItem[], 
    pageSnippets: SnippetSource[]
): MergedHighlightBlock[] => {
    if (textItems.length === 0 || pageSnippets.length === 0) return [];

    // 1. Build the Search Haystack & Source Map
    // 'haystack' is the continuous normalized string of the page.
    // 'haystackMap' stores which textItem index contributed to that character.
    let haystack = '';
    const haystackMap: number[] = [];

    textItems.forEach((item, idx) => {
        const norm = normalizeStr(item.str);
        if (!norm) return;
        
        for (const char of norm) {
            haystack += char;
            haystackMap.push(idx);
        }
    });

    if (haystack.length === 0) return [];

    // Track which page items match which snippet
    const itemToSnippetIds = new Map<number, Set<string>>();

    pageSnippets.forEach(snippet => {
        const normSnippet = normalizeStr(snippet.snippet);
        if (!normSnippet || normSnippet.length < 3) return;

        const snipId = generateSnippetId(docIndex, pageIndex, snippet.snippet);
        
        // Chunk Strategy:
        // For very short snippets, match exact.
        // For long snippets, match sub-chunks to handle breaks/OCR errors.
        const CHUNK_SIZE = 24;
        const searchChunks: string[] = [];
        
        if (normSnippet.length <= CHUNK_SIZE) {
            searchChunks.push(normSnippet);
        } else {
            // Create overlapping chunks
            for (let i = 0; i < normSnippet.length - 8; i += 12) {
                // Take a slice. If it's the end, just take the rest.
                const chunk = normSnippet.substr(i, Math.min(CHUNK_SIZE, normSnippet.length - i));
                if (chunk.length >= 8) searchChunks.push(chunk);
            }
        }

        // Search for all chunks
        searchChunks.forEach(chunk => {
            let searchIndex = 0;
            while (true) {
                const foundIdx = haystack.indexOf(chunk, searchIndex);
                if (foundIdx === -1) break;

                // Mark items corresponding to this match
                for (let i = foundIdx; i < foundIdx + chunk.length; i++) {
                    const itemIdx = haystackMap[i];
                    if (itemIdx !== undefined) {
                        if (!itemToSnippetIds.has(itemIdx)) {
                            itemToSnippetIds.set(itemIdx, new Set());
                        }
                        itemToSnippetIds.get(itemIdx)?.add(snipId);
                    }
                }
                searchIndex = foundIdx + 1;
            }
        });
    });

    // --- Merger: Geometric grouping ---
    // Convert the map of matched indices back into visual blocks
    const blocks: MergedHighlightBlock[] = [];
    const matchedIndices = Array.from(itemToSnippetIds.keys()).sort((a, b) => a - b);
    const processed = new Set<number>();

    for (let i = 0; i < matchedIndices.length; i++) {
        const currentIdx = matchedIndices[i];
        if (processed.has(currentIdx)) continue;

        const currentItem = textItems[currentIdx];
        const currentSnippetIds = itemToSnippetIds.get(currentIdx)!;
        
        // Start a new block
        const cluster: NormalizedTextItem[] = [currentItem];
        const clusterSnippetIds = new Set(currentSnippetIds); // Intersection of ids for the block? No, union is safer for visual continuity.
        processed.add(currentIdx);

        // Greedily expand to neighbors
        let j = i + 1;
        while (j < matchedIndices.length) {
            const nextIdx = matchedIndices[j];
            
            // Optimization: If indices are not sequential in array, they might still be visual neighbors
            // But we mostly rely on sort order.
            // Check if sequential in textItems array (adjacent words) OR close visually
            const isSequential = nextIdx === matchedIndices[j-1] + 1;
            
            const nextItem = textItems[nextIdx];
            const prevItem = cluster[cluster.length - 1];

            // Geometric checks
            const verticalDiff = Math.abs(nextItem.rect.y - prevItem.rect.y);
            const horizontalGap = nextItem.rect.x - (prevItem.rect.x + prevItem.rect.w);
            
            // Break if:
            // 1. Different line (vertical diff)
            // 2. Huge horizontal gap (column break)
            // 3. Not sequential AND gap is weird
            if (verticalDiff > prevItem.rect.h * 0.6) break; 
            if (horizontalGap > prevItem.rect.h * 4) break; // Allow spaces

            // Check if they share at least one snippet ID (continuity)
            const nextSnippetIds = itemToSnippetIds.get(nextIdx)!;
            const hasSharedSnippet = Array.from(currentSnippetIds).some(id => nextSnippetIds.has(id));
            
            if (!hasSharedSnippet && !isSequential) break; 

            cluster.push(nextItem);
            nextSnippetIds.forEach(id => clusterSnippetIds.add(id));
            processed.add(nextIdx);
            j++;
        }

        // Create Block Rect
        if (cluster.length > 0) {
            const x0 = Math.min(...cluster.map(w => w.rect.x));
            const y0 = Math.min(...cluster.map(w => w.rect.y));
            const x1 = Math.max(...cluster.map(w => w.rect.x + w.rect.w));
            const y1 = Math.max(...cluster.map(w => w.rect.y + w.rect.h));

            blocks.push({
                rect: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
                snippetIds: clusterSnippetIds,
                blockId: `block-${docIndex}-${pageIndex}-${i}`
            });
        }
        
        // Fast forward i
        i = j - 1;
    }

    return blocks;
};
