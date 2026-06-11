/**
 * RenderQueue — Priority queue + Canvas pool for PDF page rendering.
 * 
 * Manages concurrent rendering of PDF pages with:
 * - Max concurrent renders (3)
 * - Max live canvases (5) with LRU eviction
 * - Priority levels: VISIBLE (0) > BUFFER (1) > IDLE (2)
 * - Cancellation support for pages that leave the viewport
 * 
 * This enables viewing 300+ page PDFs without crashing the browser.
 */

export type RenderPriority = 0 | 1 | 2; // 0 = visible, 1 = buffer, 2 = idle

interface RenderJob {
    pageKey: string;
    priority: RenderPriority;
    execute: () => Promise<void>;
    cancel?: () => void;
}

export class RenderQueue {
    private maxConcurrent: number;
    private maxCanvases: number;
    private queue: RenderJob[] = [];
    private activeJobs = new Map<string, RenderJob>();
    private canvasOrder: string[] = []; // LRU tracking — most recent at end
    onCanvasEvict?: (pageKey: string) => void;

    constructor(
        maxConcurrent: number = 3,
        maxCanvases: number = 5,
        onCanvasEvict?: (pageKey: string) => void
    ) {
        this.maxConcurrent = maxConcurrent;
        this.maxCanvases = maxCanvases;
        this.onCanvasEvict = onCanvasEvict;
    }

    /**
     * Add a render job to the queue with a priority.
     * If the page is already queued, update its priority.
     */
    enqueue(pageKey: string, priority: RenderPriority, execute: () => Promise<void>): void {
        // If already active, skip
        if (this.activeJobs.has(pageKey)) return;

        // Check if already in queue — update priority if needed
        const existingIdx = this.queue.findIndex(j => j.pageKey === pageKey);
        if (existingIdx !== -1) {
            if (this.queue[existingIdx].priority > priority) {
                this.queue[existingIdx].priority = priority;
                this.sortQueue();
            }
            return;
        }

        this.queue.push({ pageKey, priority, execute });
        this.sortQueue();
        this.processNext();
    }

    /**
     * Cancel a queued or active render job.
     */
    cancel(pageKey: string): void {
        // Remove from queue
        this.queue = this.queue.filter(j => j.pageKey !== pageKey);

        // Cancel active job
        const active = this.activeJobs.get(pageKey);
        if (active?.cancel) {
            active.cancel();
            this.activeJobs.delete(pageKey);
        }
    }

    /**
     * Mark a canvas as actively used (moves to end of LRU).
     */
    touchCanvas(pageKey: string): void {
        this.canvasOrder = this.canvasOrder.filter(k => k !== pageKey);
        this.canvasOrder.push(pageKey);
    }

    /**
     * Release a canvas (when page scrolls out of view).
     * If at max capacity, evicts the least recently used canvas.
     */
    releaseCanvas(pageKey: string): void {
        this.canvasOrder = this.canvasOrder.filter(k => k !== pageKey);
        this.onCanvasEvict?.(pageKey);
    }

    /**
     * Check if we need to evict canvases to stay under the limit.
     * Returns array of page keys that should be evicted.
     */
    getEvictionCandidates(): string[] {
        const candidates: string[] = [];
        while (this.canvasOrder.length > this.maxCanvases) {
            const oldest = this.canvasOrder.shift();
            if (oldest) candidates.push(oldest);
        }
        return candidates;
    }

    /**
     * How many render slots are available.
     */
    get availableSlots(): number {
        return this.maxConcurrent - this.activeJobs.size;
    }

    /**
     * How many canvases are currently alive.
     */
    get activeCanvasCount(): number {
        return this.canvasOrder.length;
    }

    /**
     * Whether a specific page has an active canvas.
     */
    hasCanvas(pageKey: string): boolean {
        return this.canvasOrder.includes(pageKey);
    }

    /**
     * Clear all jobs and reset state.
     */
    clear(): void {
        this.queue = [];
        this.activeJobs.forEach(job => job.cancel?.());
        this.activeJobs.clear();
        this.canvasOrder = [];
    }

    // ─── Private ─────────────────────────────────────────────────

    private sortQueue(): void {
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    private async processNext(): Promise<void> {
        while (this.activeJobs.size < this.maxConcurrent && this.queue.length > 0) {
            const job = this.queue.shift();
            if (!job) break;

            this.activeJobs.set(job.pageKey, job);
            this.touchCanvas(job.pageKey);

            // Evict old canvases if over limit
            const toEvict = this.getEvictionCandidates();
            toEvict.forEach(key => this.onCanvasEvict?.(key));

            try {
                await job.execute();
            } catch (err) {
                console.error(`Render failed for ${job.pageKey}:`, err);
            } finally {
                this.activeJobs.delete(job.pageKey);
                // Use queueMicrotask to avoid deep call stacks (Bug 6)
                queueMicrotask(() => this.processNext());
            }
        }
    }
}

/**
 * Singleton render queue for the application.
 */
let _renderQueue: RenderQueue | null = null;

export const getRenderQueue = (onEvict?: (pageKey: string) => void): RenderQueue => {
    if (!_renderQueue) {
        _renderQueue = new RenderQueue(3, 5, onEvict);
    } else if (onEvict) {
        // Always update the eviction handler to avoid stale callbacks (Bug 7)
        _renderQueue.onCanvasEvict = onEvict;
    }
    return _renderQueue;
};

export const resetRenderQueue = (): void => {
    _renderQueue?.clear();
    _renderQueue = null;
};
