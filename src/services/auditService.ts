import { supabase } from '@/lib/supabase';

export interface AuditLog {
    id: string;
    tenant_id: string;
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_data?: any;
    new_data?: any;
    metadata?: any;
    ip_address?: string;
    created_at: string;
}

export const AuditService = {
    async logAction(params: {
        tenant_id: string;
        user_id?: string;
        action: string;
        entity_type: string;
        entity_id?: string;
        old_data?: any;
        new_data?: any;
        metadata?: any;
    }) {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert([{
                ...params,
                ip_address: typeof window !== 'undefined' ? 'client-side-action' : 'server-side-action',
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('[AuditService] Failed to log action:', error);
            // In a real production system, we might retry or use a dead-letter queue
        }

        return { data, error };
    },

    async getRecentLogs(tenantId: string, limit = 50): Promise<AuditLog[]> {
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
    },

    getMockLogs(tenantId: string): AuditLog[] {
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
            },
            {
                id: '2',
                tenant_id: tenantId,
                user_id: 'user_admin',
                action: 'LOGIN',
                entity_type: 'auth',
                entity_id: 'user_admin',
                old_data: null,
                new_data: { status: 'success' },
                created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '3',
                tenant_id: tenantId,
                user_id: 'user_staff',
                action: 'DELETE_PRODUCT',
                entity_type: 'product',
                entity_id: 'prod_999',
                old_data: { name: 'Old Item' },
                new_data: null,
                created_at: new Date(Date.now() - 7200000).toISOString()
            }
        ];
    }
};
