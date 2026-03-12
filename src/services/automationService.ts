import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import { OrderService } from './orderService';
import { AIContentService } from './aiContentService';
import { logger } from '@/lib/logger';

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
        logger.info(`Triggering ${trigger} automation`, { email: customerEmail });

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
                logger.info(`Sending dormant recall to ${customerEmail}`);
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
                logger.info(`Sending VIP thank you to ${customerEmail}`);
                return true;
            }
        }

        return true;
    }

    /**
     * Scans for abandoned carts and triggers recovery sequences.
     */
    static async processAbandonedCarts(tenantId: string): Promise<number> {
        logger.debug(`Scanning for abandoned carts`, { tenantId });
        if (!isSupabaseConfigured) return 0;

        const abandonedOrders = await OrderService.getAbandonedOrders(tenantId);
        let processedCount = 0;

        for (const order of abandonedOrders) {
            // In production, we'd check if we already sent an email for this order recently
            const itemNames = order.items.map(i => i.name || 'Product');

            logger.info(`Recovering abandoned order`, { orderId: order.id });

            // Generate world-class recovery content
            const emailContent = await AIContentService.generateRecoveryEmail(
                order.customer_name || 'Valued Customer',
                itemNames as string[]
            );

            // In a real system, this would trigger an email provider (Postmark/SendGrid)
            // For now, we log the success of the AI generation and logic sequence

            processedCount++;
        }

        return processedCount;
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
