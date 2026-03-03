import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AutomationTrigger = 'abandoned_cart' | 'recall_dormant' | 'vip_thank_you';

export interface AutomationSequence {
    id: string;
    trigger_type: AutomationTrigger;
    status: 'active' | 'paused';
    lastRan?: string;
    total_sent: number;
    conversions: number;
}

export class AutomationService {
    /**
     * Triggers an automation workflow based on data analysis.
     */
    static async triggerWorkflow(trigger: AutomationTrigger, customerEmail: string, tenantId: string): Promise<boolean> {
        console.log(`[Automation] Processing ${trigger} for ${customerEmail} (Tenant: ${tenantId})`);

        if (!isSupabaseConfigured) return false;

        // In a real production scenario, this would be handled by a Supabase Edge Function cron job.
        // Here we implement the logic that would power such a job.

        if (trigger === 'recall_dormant') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Check if customer has had any orders recently
            const { data: recentOrders } = await supabase
                .from('orders')
                .select('id')
                .eq('customer_email', customerEmail)
                .gt('created_at', thirtyDaysAgo.toISOString());

            if (!recentOrders || recentOrders.length === 0) {
                console.log(`[Automation] Customer ${customerEmail} is dormant. Sending recall campaign...`);
                // Implementation for sending email/SMS would go here
                return true;
            }
        }

        if (trigger === 'vip_thank_you') {
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('customer_email', customerEmail);

            const ltv = (orders || []).reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

            if (ltv > 500000) { // VIP threshold: ₦500k
                console.log(`[Automation] Customer ${customerEmail} is a VIP (LTV: ₦${ltv}). Sending thank you reward...`);
                return true;
            }
        }

        return true;
    }

    /**
     * Gets all configured automation sequences from Supabase.
     */
    static async getSequences(tenantId: string): Promise<AutomationSequence[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('automation_sequences')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) return [];
        return data || [];
    }

    /**
     * Toggles a sequence status.
     */
    static async toggleSequence(id: string, currentStatus: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        await supabase
            .from('automation_sequences')
            .update({ status: newStatus })
            .eq('id', id);
    }
}
