/**
 * PDF Validator — Security layer for file uploads
 * Validates magic bytes, file size, and MIME type before accepting PDFs.
 */

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a File object to ensure it's a legitimate PDF.
 * Checks:
 * 1. File exists and has content
 * 2. File size within limit (50MB)
 * 3. MIME type is application/pdf
 * 4. Magic bytes match PDF header (%PDF)
 */
export const validatePdfFile = async (file: File): Promise<ValidationResult> => {
    // 1. Basic existence check
    if (!file || file.size === 0) {
        return { valid: false, error: 'File is empty or missing.' };
    }

    // 2. Size check
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return { valid: false, error: `File too large (${sizeMB}MB). Maximum is 50MB.` };
    }

    // 3. MIME type check
    if (file.type && file.type !== 'application/pdf') {
        return { valid: false, error: `Invalid file type: ${file.type}. Only PDF files are accepted.` };
    }

    // 4. Magic bytes check — read first 4 bytes
    try {
        const header = await readFileHeader(file, 4);
        const isPdf = PDF_MAGIC_BYTES.every((byte, i) => header[i] === byte);
        if (!isPdf) {
            return { valid: false, error: 'File is not a valid PDF (invalid header bytes).' };
        }
    } catch {
        return { valid: false, error: 'Could not read file header for validation.' };
    }

    return { valid: true };
};

/**
 * Validates multiple files and returns results for each.
 */
export const validatePdfFiles = async (files: File[]): Promise<{ file: File; result: ValidationResult }[]> => {
    return Promise.all(files.map(async file => ({
        file,
        result: await validatePdfFile(file)
    })));
};

/**
 * Read the first N bytes of a file.
 */
const readFileHeader = (file: File, bytes: number): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(new Uint8Array(reader.result));
            } else {
                reject(new Error('Unexpected reader result type'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file.slice(0, bytes));
    });
};
