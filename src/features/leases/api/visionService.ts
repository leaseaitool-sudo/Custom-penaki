/**
 * Vision Service — Google Cloud Vision API for OCR on scanned PDFs.
 * 
 * Called when pdf.js can't extract native text from a page (scanned/image PDF).
 * Returns NormalizedTextItem[] matching the app's expected format.
 */
import { NormalizedTextItem } from '@/widgets/pdf-viewer/pdf.types';

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

export interface VisionOcrResult {
    items: NormalizedTextItem[];
    fullText: string;
}

/**
 * Run OCR on a canvas element using Google Cloud Vision API.
 * 
 * 1. Converts canvas to base64 PNG
 * 2. Sends to Vision API TEXT_DETECTION
 * 3. Normalizes word-level bounding boxes to 0-1 range
 */
export const runVisionOcr = async (
    canvas: HTMLCanvasElement,
    onProgress?: (msg: string) => void
): Promise<VisionOcrResult> => {
    if (!VISION_API_KEY) {
        throw new Error('VITE_GOOGLE_VISION_API_KEY is not configured');
    }

    onProgress?.('Sending to Vision API...');

    // Convert canvas to base64 (strip data:image/png;base64, prefix)
    const base64Image = canvas.toDataURL('image/png').split(',')[1];

    const requestBody = {
        requests: [{
            image: { content: base64Image },
            features: [
                { type: 'TEXT_DETECTION', maxResults: 1 },
            ],
            imageContext: {
                languageHints: ['en'],
            },
        }],
    };

    const response = await fetch(VISION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Vision API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    onProgress?.('Processing OCR results...');

    return parseVisionResponse(data, canvas.width, canvas.height);
};

/**
 * Run OCR on a base64-encoded image string.
 */
export const runVisionOcrFromBase64 = async (
    base64Image: string,
    width: number,
    height: number,
    onProgress?: (msg: string) => void
): Promise<VisionOcrResult> => {
    if (!VISION_API_KEY) {
        throw new Error('VITE_GOOGLE_VISION_API_KEY is not configured');
    }

    onProgress?.('Sending to Vision API...');

    const requestBody = {
        requests: [{
            image: { content: base64Image },
            features: [
                { type: 'TEXT_DETECTION', maxResults: 1 },
            ],
            imageContext: {
                languageHints: ['en'],
            },
        }],
    };

    const response = await fetch(VISION_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Vision API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    onProgress?.('Processing OCR results...');

    return parseVisionResponse(data, width, height);
};

/**
 * Parse Vision API response into NormalizedTextItem[].
 * 
 * Vision API returns annotations at word level with bounding polygons.
 * We normalize the bounding boxes to 0-1 range (matching pdfjs conventions).
 */
const parseVisionResponse = (
    data: any,
    imageWidth: number,
    imageHeight: number
): VisionOcrResult => {
    const items: NormalizedTextItem[] = [];
    let fullText = '';

    const responses = data?.responses;
    if (!responses || responses.length === 0) {
        return { items, fullText };
    }

    const annotations = responses[0]?.textAnnotations;
    if (!annotations || annotations.length === 0) {
        return { items, fullText };
    }

    // First annotation is the full text
    fullText = annotations[0]?.description || '';

    // Remaining annotations are individual words
    for (let i = 1; i < annotations.length; i++) {
        const annotation = annotations[i];
        const text = annotation.description;
        const vertices = annotation.boundingPoly?.vertices;

        if (!text || !vertices || vertices.length < 4) continue;

        // Get bounding box from vertices
        const xs = vertices.map((v: any) => v.x || 0);
        const ys = vertices.map((v: any) => v.y || 0);

        const x0 = Math.min(...xs);
        const y0 = Math.min(...ys);
        const x1 = Math.max(...xs);
        const y1 = Math.max(...ys);

        // Normalize to 0-1 range
        items.push({
            str: text,
            rect: {
                x: x0 / imageWidth,
                y: y0 / imageHeight,
                w: (x1 - x0) / imageWidth,
                h: (y1 - y0) / imageHeight,
            },
        });
    }

    return { items, fullText };
};

/**
 * Check if the Vision API key is configured.
 */
export const isVisionApiAvailable = (): boolean => {
    return !!VISION_API_KEY;
};
