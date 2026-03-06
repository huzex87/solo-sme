import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuditLogEntry {
    tenant_id: string;
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
}

export class AuditService {
    /**
     * Records a critical merchant or system action for observability.
     */
    static async logAction(entry: AuditLogEntry): Promise<void> {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase
            .from('merchant_audit_log')
            .insert({
                ...entry,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('[AuditService] Failed to record audit log:', error);
        }
    }

    /**
     * Fetches audit logs for a specific tenant (Administrative view).
     */
    static async getLogs(tenantId: string, limit = 100): Promise<Record<string, unknown>[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('merchant_audit_log')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('[AuditService] Fetch error:', error);
            return [];
        }

        return data || [];
    }
}
