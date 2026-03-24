import { AuditService, AuditLog } from '../auditService';
import { SupabaseClient } from '@supabase/supabase-js';

export interface OperationalInsight {
    id: string;
    type: 'inventory' | 'sales' | 'admin' | 'security';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
    metadata?: any;
}

export class AuditContextService {
    /**
     * Fetches recent audit logs and transforms them into a natural language context
     */
    static async getAuditOperationalContext(tenantId: string, limit = 15, client?: SupabaseClient): Promise<string> {
        try {
            const logs = await AuditService.getRecentLogs(tenantId, limit, client);
            
            if (!logs || logs.length === 0) {
                return "No recent operational changes recorded.";
            }

            const summaries = logs.map(log => this.summarizeLog(log));
            const uniqueSummaries = Array.from(new Set(summaries)); // Deduplicate similar actions

            return `RECENT OPERATIONAL HISTORY:\n${uniqueSummaries.map(s => `- ${s}`).join('\n')}`;
        } catch (error) {
            console.error('[AuditContextService] Failed to generate context:', error);
            return "Operational history currently unavailable.";
        }
    }

    /**
     * Translates a raw AuditLog into a human-readable sentence
     */
    private static summarizeLog(log: AuditLog): string {
        const action = log.action.toUpperCase();
        const entity = log.entity_type.toLowerCase();
        
        // Product Management
        if (action.includes('UPDATE_PRODUCT') || action.includes('EDIT_PRODUCT')) {
            const name = (log.metadata as any)?.name || 'a product';
            return `Updated details for ${name}.`;
        }
        if (action.includes('CREATE_PRODUCT')) {
            const name = (log.metadata as any)?.name || 'a new product';
            return `Added a new item: ${name}.`;
        }
        if (action.includes('UPDATE_STOCK')) {
            const name = (log.metadata as any)?.name || 'an item';
            return `Adjusted stock levels for ${name}.`;
        }

        // Sales & Orders
        if (action.includes('UPDATE_ORDER_STATUS')) {
            const status = (log.metadata as any)?.new_status || 'updated';
            return `Order #${log.entity_id?.slice(-6) || 'N/A'} marked as ${status}.`;
        }

        // Settings & Admin
        if (action.includes('UPDATE_SETTINGS')) {
            return `Modified business configuration settings.`;
        }
        if (action.includes('INVITE_STAFF')) {
            return `Sent a new staff invitation.`;
        }

        // Security
        if (action.includes('LOGIN') || action.includes('AUTH')) {
            return `System access recorded.`;
        }

        // Fallback for other actions
        const formattedAction = log.action.replace(/_/g, ' ').toLowerCase();
        return `Performed ${formattedAction} on ${entity}.`;
    }

    /**
     * Generates "Pulse" insights based on audit log patterns
     */
    static async generateIntelligencePulse(tenantId: string, client?: SupabaseClient): Promise<OperationalInsight[]> {
        const logs = await AuditService.getRecentLogs(tenantId, 30, client);
        const insights: OperationalInsight[] = [];

        // 1. Detect rapid price/stock changes
        const productUpdates = logs.filter(l => l.action.includes('PRODUCT') || l.action.includes('STOCK'));
        if (productUpdates.length > 5) {
            insights.push({
                id: 'pulse-velocity-catalog',
                type: 'inventory',
                title: 'High Catalog Velocity',
                description: `You've made ${productUpdates.length} updates to your catalog recently. Your store is active and being optimized.`,
                priority: 'low',
                timestamp: new Date().toISOString()
            });
        }

        // 2. Detect security/admin changes
        const securityLogs = logs.filter(l => l.action.includes('SETTINGS') || l.action.includes('STAFF'));
        if (securityLogs.length > 0) {
            const lastLog = securityLogs[0];
            insights.push({
                id: 'pulse-admin-audit',
                type: 'admin',
                title: 'Administrative Review',
                description: `A recent ${lastLog.action.replace(/_/g, ' ').toLowerCase()} was recorded. Ensure all staff changes are authorized.`,
                priority: 'medium',
                timestamp: lastLog.created_at
            });
        }

        return insights;
    }
}
