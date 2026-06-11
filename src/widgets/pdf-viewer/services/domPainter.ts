import { MergedHighlightBlock, NormalizedTextItem, SearchMatch } from '@/widgets/pdf-viewer/pdf.types';

export const paintTextLayer = (
    textLayerDiv: HTMLDivElement,
    items: NormalizedTextItem[],
    viewport: { height: number; width: number },
    onTextClick: (e: MouseEvent, span: HTMLElement, text: string) => void
) => {
    textLayerDiv.innerHTML = '';

    items.forEach((item, idx) => {
        const span = document.createElement('span');
        span.textContent = item.str + ' ';
        span.className = 'text-word';
        span.style.position = 'absolute';
        const rectX = Number(item.rect.x) || 0;
        const rectY = Number(item.rect.y) || 0;
        const rectW = Number(item.rect.w) || 0;
        const rectH = Number(item.rect.h) || 0;

        span.style.left = `${Math.max(0, rectX * 100)}%`;
        span.style.top = `${Math.max(0, rectY * 100)}%`;
        span.style.width = `${Math.max(0, rectW * 100)}%`;
        span.style.height = `${Math.max(0, rectH * 100)}%`;
        // Use viewport height to scale font size roughly correctly for visual layout
        // SECURITY: Clamp max font size to prevent layout DoS via malformed PDF coordinates
        const calculatedSize = rectH * viewport.height;
        span.style.fontSize = `${Math.min(Math.max(calculatedSize, 0), 200)}px`;
        span.dataset.idx = idx.toString();

        span.onclick = (e) => onTextClick(e, span, item.str);
        textLayerDiv.appendChild(span);
    });
};

export const paintHighlights = (
    highlightLayer: HTMLDivElement,
    blocks: MergedHighlightBlock[],
    activeSnippetId: string | null,
    onHighlightClick: (snippetId: string) => void
) => {
    // Clear all existing snippet highlights (not search highlights)
    highlightLayer.querySelectorAll('.snippet-highlight').forEach(el => el.remove());

    blocks.forEach(block => {
        const div = document.createElement('div');
        div.className = 'highlight snippet-highlight';
        const rectX = Number(block.rect.x) || 0;
        const rectY = Number(block.rect.y) || 0;
        const rectW = Number(block.rect.w) || 0;
        const rectH = Number(block.rect.h) || 0;

        div.style.left = `${Math.max(0, rectX * 100)}%`;
        div.style.top = `${Math.max(0, rectY * 100)}%`;
        div.style.width = `${Math.max(0, rectW * 100)}%`;
        div.style.height = `${Math.max(0, rectH * 100)}%`;
        div.dataset.snippetIds = Array.from(block.snippetIds).join(',');

        div.onclick = (e) => {
            e.stopPropagation();
            const ids = Array.from(block.snippetIds);
            if (ids.length > 0) onHighlightClick(ids[0]);
        };

        if (activeSnippetId && block.snippetIds.has(activeSnippetId)) {
            div.classList.add('active');
        }

        highlightLayer.appendChild(div);
    });
};

export const paintSearchHighlights = (
    highlightLayer: HTMLDivElement,
    matches: SearchMatch[],
    activeIndex: number,
    globalResults: SearchMatch[]
) => {
    // Remove old search highlights
    highlightLayer.querySelectorAll('.search-highlight').forEach(el => el.remove());

    matches.forEach(match => {
        const globalIndex = globalResults.indexOf(match);
        const isActive = globalIndex === activeIndex;

        const div = document.createElement('div');
        div.className = `highlight search-highlight ${isActive ? 'active' : ''}`;
        const rectX = Number(match.rect.x) || 0;
        const rectY = Number(match.rect.y) || 0;
        const rectW = Number(match.rect.w) || 0;
        const rectH = Number(match.rect.h) || 0;

        div.style.left = `${Math.max(0, rectX * 100)}%`;
        div.style.top = `${Math.max(0, rectY * 100)}%`;
        div.style.width = `${Math.max(0, rectW * 100)}%`;
        div.style.height = `${Math.max(0, rectH * 100)}%`;
        div.style.zIndex = '10'; // above snippet highlights
        div.title = match.str;
        highlightLayer.appendChild(div);
    });
};
