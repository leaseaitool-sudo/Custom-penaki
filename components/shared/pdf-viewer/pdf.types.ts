import { Document } from '../../../types';

export interface NavigationTarget {
  page: number;
  fileName: string | null;
  searchText: string | null;
}

export interface SnippetSource {
    page: number;
    snippet: string;
    fileName?: string | null;
}

export interface OcrWord {
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
}

export interface OcrLine {
    words: OcrWord[];
    text: string;
}

export interface SearchMatch {
    docIndex: number;
    pageIndex: number;
    matchIndex: number;
    str: string;
    rect: { x: number, y: number, w: number, h: number }; 
}

export interface NormalizedTextItem {
    str: string;
    rect: { x: number; y: number; w: number; h: number };
}

export interface MergedHighlightBlock {
    rect: { x: number, y: number, w: number, h: number };
    snippetIds: Set<string>;
    blockId: string;
}

export type PageStatus = 'pending' | 'processing' | 'ready' | 'error';
