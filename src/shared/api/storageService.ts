export interface UploadResult {
    storagePath: string;
    fileName: string;
    fileSize: number;
}

export const uploadDocument = async (
    file: File,
    leaseId: string,
    userId: string
): Promise<UploadResult> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${leaseId}/${safeName}`;
    return { storagePath, fileName: safeName, fileSize: file.size };
};

export const getSignedUrl = async (
    storagePath: string,
    expiresInSeconds: number = 3600
): Promise<string> => {
    return `mock-signed-url-for-${storagePath}`;
};

export const getSignedUrls = async (
    storagePaths: string[],
    expiresInSeconds: number = 3600
): Promise<Map<string, string>> => {
    const urlMap = new Map<string, string>();
    storagePaths.forEach(path => urlMap.set(path, `mock-signed-url-for-${path}`));
    return urlMap;
};

export const deleteDocument = async (storagePath: string): Promise<void> => {
    return;
};

export const getPublicUrl = (storagePath: string): string => {
    return `mock-public-url-for-${storagePath}`;
};
