import { MergedHighlightBlock, NormalizedTextItem, SearchMatch } from '../pdf.types';

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
        span.style.left = `${item.rect.x * 100}%`;
        span.style.top = `${item.rect.y * 100}%`;
        span.style.width = `${item.rect.w * 100}%`;
        span.style.height = `${item.rect.h * 100}%`;
        // Use viewport height to scale font size roughly correctly for visual layout
        span.style.fontSize = `${item.rect.h * viewport.height}px`; 
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
    // Clear existing snippets
    const existing = highlightLayer.querySelectorAll('.snippet-highlight');
    existing.forEach(el => el.remove());

    blocks.forEach(block => {
        const div = document.createElement('div');
        div.className = 'highlight snippet-highlight';
        div.style.left = `${block.rect.x * 100}%`;
        div.style.top = `${block.rect.y * 100}%`;
        div.style.width = `${block.rect.w * 100}%`;
        div.style.height = `${block.rect.h * 100}%`;
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
        div.style.left = `${match.rect.x * 100}%`;
        div.style.top = `${match.rect.y * 100}%`;
        div.style.width = `${match.rect.w * 100}%`;
        div.style.height = `${match.rect.h * 100}%`;
        div.title = match.str;
        highlightLayer.appendChild(div);
    });
};
