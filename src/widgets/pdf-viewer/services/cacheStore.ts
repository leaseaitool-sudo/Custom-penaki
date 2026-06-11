import { NormalizedTextItem, OcrLine, MergedHighlightBlock } from '@/widgets/pdf-viewer/pdf.types';

/**
 * LRU-bounded Map. When the map exceeds `maxSize`, the oldest (least recently inserted)
 * entries are evicted. This prevents unbounded memory growth during long sessions
 * with large or numerous documents.
 */
class LRUMap<K, V> {
    private map = new Map<K, V>();
    constructor(private maxSize: number) { }

    get(key: K): V | undefined {
        const value = this.map.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.map.delete(key);
            this.map.set(key, value);
        }
        return value;
    }

    set(key: K, value: V): void {
        // If key already exists, delete it first so it moves to the end
        if (this.map.has(key)) {
            this.map.delete(key);
        }
        this.map.set(key, value);
        // Evict oldest entries if over capacity
        while (this.map.size > this.maxSize) {
            const oldestKey = this.map.keys().next().value;
            if (oldestKey !== undefined) {
                this.map.delete(oldestKey);
            }
        }
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    delete(key: K): boolean {
        return this.map.delete(key);
    }

    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    clear(): void {
        this.map.clear();
    }

    get size(): number {
        return this.map.size;
    }
}

const MAX_CACHE_PAGES = 50;
const MAX_INFLIGHT_PROMISES = 10;

export class PdfCache {
    ocr: LRUMap<string, OcrLine[]> = new LRUMap(MAX_CACHE_PAGES);
    text: LRUMap<string, NormalizedTextItem[]> = new LRUMap(MAX_CACHE_PAGES);
    highlights: LRUMap<string, MergedHighlightBlock[]> = new LRUMap(MAX_CACHE_PAGES);
    textPromises: Map<string, Promise<NormalizedTextItem[]>> = new Map();

    /** Register an in-flight text extraction promise. Bounded to prevent leak accumulation. */
    registerTextPromise(key: string, promise: Promise<NormalizedTextItem[]>): void {
        // If we're over the inflight limit, skip caching the promise (it will still resolve)
        if (this.textPromises.size >= MAX_INFLIGHT_PROMISES) {
            console.warn(`[CACHE] Inflight promise cap reached (${MAX_INFLIGHT_PROMISES}), skipping caching for ${key}`);
            return;
        }
        this.textPromises.set(key, promise);
    }

    /** Remove an inflight promise after resolution. */
    resolveTextPromise(key: string): void {
        this.textPromises.delete(key);
    }

    clear() {
        this.ocr.clear();
        this.text.clear();
        this.highlights.clear();
        this.textPromises.clear();
    }

    invalidateHighlightsForPage(pageKey: string) {
        // Collect keys first to avoid mutation during iteration
        const keysToDelete: string[] = [];
        for (const key of this.highlights.keys()) {
            if (key.startsWith(pageKey)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.highlights.delete(key));
    }
}
