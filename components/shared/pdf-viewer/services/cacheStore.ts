import { NormalizedTextItem, OcrLine, MergedHighlightBlock } from '../pdf.types';

export class PdfCache {
    ocr: Map<string, OcrLine[]> = new Map();
    text: Map<string, NormalizedTextItem[]> = new Map();
    highlights: Map<string, MergedHighlightBlock[]> = new Map();
    textPromises: Map<string, Promise<NormalizedTextItem[]>> = new Map();

    clear() {
        this.ocr.clear();
        this.text.clear();
        this.highlights.clear();
        this.textPromises.clear();
    }
}
