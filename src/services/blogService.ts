import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

export interface BlogPost {
    id: string;
    tenant_id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    featured_image?: string;
    status: 'published' | 'draft';
    created_at: string;
}

export class BlogService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Fetches all published blog posts for a specific tenant (storefront).
     */
    static async getPosts(tenantId: string, client?: SupabaseClient): Promise<BlogPost[]> {
        if (!isSupabaseConfigured) return [];
        const supabase = this.getClient(client);

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[BlogService] Fetch error:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Gets a single blog post by slug for the storefront.
     */
    static async getPostBySlug(tenantId: string, slug: string, client?: SupabaseClient): Promise<BlogPost | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('[BlogService] Single post fetch error:', error);
            return null;
        }

        return data;
    }

    /**
     * Creates or updates a blog post from the Merchant Hub.
     */
    static async upsertPost(post: Partial<BlogPost>, client?: SupabaseClient): Promise<BlogPost | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);

        const { data, error } = await supabase
            .from('blog_posts')
            .upsert({
                ...post,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[BlogService] Upsert error:', error);
            return null;
        }

        return data;
    }

    /**
     * Deletes a blog post.
     */
    static async deletePost(id: string, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return true;
        const supabase = this.getClient(client);

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        return !error;
    }
}
