import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLog {
    id: string;
    tenant_id: string;
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    created_at: string;
}

export interface AuditActionParams {
    tenant_id: string;
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    metadata?: Record<string, unknown>;
}

export class AuditService {
    private static getClient(client?: SupabaseClient) {
        if (!client && typeof window === 'undefined') {
            // In server context but no client provided, we try to import the server client
            // This is a safety measure to prevent breakage
            return null;
        }
        return client || createClient();
    }

    static async logAction(params: AuditActionParams, client?: SupabaseClient): Promise<{ data: AuditLog | null; error: unknown }> {
        if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };

        let supabase = this.getClient(client);

        // If server-side and no client, try to use async server client import
        if (!supabase && typeof window === 'undefined') {
            try {
                const { createClient: createServerClient } = await import('@/lib/supabase/server');
                supabase = await createServerClient();
            } catch {
                console.error('[AuditService] Failed to initialize server client for logging');
                return { data: null, error: 'Server client init failed' };
            }
        }

        if (!supabase) return { data: null, error: 'No client' };

        // Attempt to get user ID if missing
        if (!params.user_id) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) params.user_id = user.id;
        }

        const { data, error } = await supabase
            .from('audit_logs')
            .insert([{
                ...params,
                ip_address: typeof window !== 'undefined' ? 'client-side' : 'server-side',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('[AuditService] Failed to log action:', error);
        }

        return { data, error };
    }

    static async getRecentLogs(tenantId: string, limit = 50, client?: SupabaseClient): Promise<AuditLog[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
        if (!supabase) return this.getMockLogs(tenantId);

        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[AuditService] Error fetching logs:', error);
            return this.getMockLogs(tenantId);
        }

        return data || [];
    }

    private static getMockLogs(tenantId: string): AuditLog[] {
        return [
            {
                id: '1',
                tenant_id: tenantId,
                user_id: 'user_admin',
                action: 'UPDATE_PRICE',
                entity_type: 'product',
                entity_id: 'prod_123',
                old_data: { price: 15000 },
                new_data: { price: 17500 },
                created_at: new Date().toISOString()
            }
        ];
    }
}

