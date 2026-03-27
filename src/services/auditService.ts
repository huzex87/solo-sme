import { BaseService, AuditActionParams, AuditLog } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

export type { AuditActionParams, AuditLog };

export class AuditService extends BaseService {
    protected static serviceName = 'AuditService';

    static async logAction(params: AuditActionParams, client?: SupabaseClient): Promise<{ data: AuditLog | null; error: unknown }> {
        if (!isSupabaseConfigured) return { data: null, error: 'Not configured' };

        const supabase = await this.getClient(client);

        if (!supabase) {
            this.error('Supabase client is missing. Use explicit client for server-side logging.');
            return { data: null, error: 'No client' };
        }

        // Attempt to get actor ID if missing
        if (!params.actor_id) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) params.actor_id = user.id;
        }

        let ip_address = typeof window !== 'undefined' ? 'client-side' : 'server';

        if (typeof window === 'undefined') {
            try {
                // In experimental/future Next.js, headers() might be async.
                // We handle both cases gracefully.
                const { headers } = require('next/headers');
                const headerList = headers();
                
                // If it's a promise, we can't sync-await here comfortably without 
                // changing the signature, but we can check if it's a promise.
                if (headerList && typeof headerList.get === 'function') {
                    ip_address = headerList.get('x-forwarded-for')?.split(',')[0] ||
                        headerList.get('x-real-ip') ||
                        'server';
                }
            } catch (e) {
                ip_address = 'server';
            }
        }

        const { data, error } = await supabase
            .from('merchant_audit_log')
            .insert([{
                ...params,
                ip_address,
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

        const supabase = await this.getClient(client);
        if (!supabase) return this.getMockLogs(tenantId);

        const { data, error } = await supabase
            .from('merchant_audit_log')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            this.error('Error fetching logs:', error);
            return this.getMockLogs(tenantId);
        }

        return data || [];
    }

    private static getMockLogs(tenantId: string): AuditLog[] {
        return [
            {
                id: '1',
                tenant_id: tenantId,
                actor_id: 'user_admin',
                action: 'UPDATE_PRICE',
                entity_type: 'product',
                entity_id: 'prod_123',
                metadata: { 
                    old_price: 15000, 
                    new_price: 17500,
                    system: 'Core/v4'
                },
                created_at: new Date().toISOString()
            }
        ];
    }
}

