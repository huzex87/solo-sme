import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLog {
    id: string;
    tenant_id: string;
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    created_at: string;
}

export interface AuditActionParams {
    tenant_id: string;
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
}

export interface ServiceContext {
    client?: SupabaseClient;
    tenantId?: string;
    userId?: string;
}

/**
 * BaseService
 * Institutional foundation for all business logic services.
 * Handles unified client resolution, standardized logging, and context management.
 */
export abstract class BaseService {
    protected static serviceName = 'BaseService';

    /**
     * Resolves the appropriate Supabase client.
     * In server contexts (where window is undefined), an injected client is preferred.
     * Falls back to admin client if no client is injected in server context.
     */
    protected static async getClient(injectedClient?: SupabaseClient): Promise<SupabaseClient> {
        if (injectedClient) return injectedClient;

        if (typeof window === 'undefined') {
            return await createAdminClient();
        }

        return createClient();
    }

    protected static log(message: string, metadata?: unknown) {
        console.log(`[${this.serviceName}] ${message}`, metadata || '');
    }

    protected static warn(message: string, metadata?: unknown) {
        console.warn(`[${this.serviceName}] ${message}`, metadata || '');
    }

    protected static error(message: string, error?: unknown, metadata?: unknown) {
        console.error(`[${this.serviceName}] ${message}`, error || '', metadata || '');
        // Future: Integrate with Sentry here if available
    }

    /**
     * Standardized error wrapper for consistent return types
     */
    protected static handleException(operation: string, error: unknown) {
        this.error(`Operation failed: ${operation}`, error);
        return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
