import { supabase } from '@/shared/lib/supabase';

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
    
    const { error } = await supabase.storage
        .from('lease-documents')
        .upload(storagePath, file, {
            upsert: true,
            contentType: file.type || 'application/pdf',
        });

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    return { storagePath, fileName: safeName, fileSize: file.size };
};

export const getSignedUrl = async (
    storagePath: string,
    expiresInSeconds: number = 3600
): Promise<string> => {
    const { data, error } = await supabase.storage
        .from('lease-documents')
        .createSignedUrl(storagePath, expiresInSeconds);
        
    if (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
    
    return data.signedUrl;
};

export const getSignedUrls = async (
    storagePaths: string[],
    expiresInSeconds: number = 3600
): Promise<string[]> => {
    const urls = await Promise.all(
        storagePaths.map(path => getSignedUrl(path, expiresInSeconds))
    );
    return urls;
};

export const getPublicUrl = (storagePath: string): string => {
    const { data } = supabase.storage
        .from('lease-documents')
        .getPublicUrl(storagePath);
    return data.publicUrl;
};

export const deleteDocument = async (storagePath: string): Promise<boolean> => {
    const { error } = await supabase.storage
        .from('lease-documents')
        .remove([storagePath]);
        
    if (error) {
        console.error('Delete error:', error);
        return false;
    }
    return true;
};
