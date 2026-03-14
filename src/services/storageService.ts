import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export class StorageService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Uploads a product image to Supabase Storage.
     * Returns the public URL of the uploaded image.
     */
    static async uploadProductImage(
        file: File,
        tenantId: string,
        productId?: string,
        client?: SupabaseClient
    ): Promise<{ url: string | null; error: string | null }> {
        if (!isSupabaseConfigured) {
            return { url: null, error: 'Storage not configured' };
        }

        const supabase = this.getClient(client);

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { url: null, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { url: null, error: 'File too large. Maximum size is 5MB' };
        }

        // Generate a unique path: tenant_id/product_id/timestamp.ext
        const ext = file.name.split('.').pop() || 'jpg';
        const timestamp = Date.now();
        const fileName = productId
            ? `${tenantId}/${productId}/${timestamp}.${ext}`
            : `${tenantId}/unsorted/${timestamp}.${ext}`;

        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type,
                });

            if (error) {
                console.error('[StorageService] Upload error:', error);
                return { url: null, error: error.message };
            }

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(data.path);

            return { url: urlData.publicUrl, error: null };
        } catch (err) {
            console.error('[StorageService] Unexpected error:', err);
            return { url: null, error: 'Upload failed. Please try again.' };
        }
    }

    /**
     * Deletes a product image from Supabase Storage.
     */
    static async deleteProductImage(filePath: string, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const supabase = this.getClient(client);

        try {
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePath]);

            if (error) {
                console.error('[StorageService] Delete error:', error);
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extracts the storage path from a full public URL.
     */
    static getPathFromUrl(publicUrl: string): string | null {
        const match = publicUrl.match(/\/storage\/v1\/object\/public\/product-images\/(.+)$/);
        return match ? match[1] : null;
    }
}
