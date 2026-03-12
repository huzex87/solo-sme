import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import { OrderService } from './orderService';
import { AIContentService } from './aiContentService';
import { InventoryService } from './inventoryService';
import { logger } from '@/lib/logger';

export type AutomationTrigger =
    | 'abandoned_cart'
    | 'recall_dormant'
    | 'vip_thank_you'
    | 'low_stock_restock'
    | 'weekly_business_digest';

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

        if (trigger === 'recall_dormant') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: recentOrders } = await supabase
                .from('orders')
                .select('id')
                .eq('customer_email', customerEmail)
                .gt('created_at', thirtyDaysAgo.toISOString());

            if (!recentOrders || recentOrders.length === 0) {
                logger.info(`Sending dormant recall to ${customerEmail}`);
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
            const itemNames = order.items.map(i => i.name || 'Product');
            logger.info(`Recovering abandoned order`, { orderId: order.id });

            const emailContent = await AIContentService.generateRecoveryEmail(
                order.customer_name || 'Valued Customer',
                itemNames as string[]
            );

            // Enhance with one-click recovery logic
            const recoveryLink = OrderService.generatePaymentLink(order.id);
            logger.debug('Recovery link generated', { recoveryLink, preview: emailContent.slice(0, 50) });

            processedCount++;
        }

        return processedCount;
    }

    /**
     * Scans per-tenant inventory for low stock and triggers alerts.
     */
    static async processLowStockAlerts(tenantId: string): Promise<number> {
        logger.debug(`Scanning for low stock items`, { tenantId });
        const analysis = await InventoryService.getPredictiveStockAnalysis(tenantId);
        const criticalItems = analysis.filter(i => i.status === 'CRITICAL' || i.status === 'LOW');

        let alertsSent = 0;
        for (const item of criticalItems) {
            const alert = await AIContentService.generateRestockAlert(item.name, item.stock);
            logger.info('Low stock automation triggered', { item: item.name, currentStock: item.stock, alert });
            alertsSent++;
        }

        return alertsSent;
    }

    /**
     * Generates and "sends" the weekly business digest.
     */
    static async processWeeklyDigest(tenantId: string): Promise<boolean> {
        logger.info(`Processing weekly business digest`, { tenantId });
        const metrics = await OrderService.getWeeklyMetrics(tenantId);

        const digest = await AIContentService.generateWeeklyDigest(metrics);
        logger.info('Weekly digest automation complete', { tenantId, sales: metrics.sales, digest });

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
