import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { OrderService } from './orderService';
import { AIContentService } from './aiContentService';
import { InventoryService } from './inventoryService';
import { logger } from '@/lib/logger';
import { SupabaseClient } from '@supabase/supabase-js';

/** Meta-approved template used when a cart nudge falls outside the 24h service window. */
const ABANDONED_CART_TEMPLATE = 'abandoned_cart_recovery';

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
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Triggers an automation workflow based on data analysis.
     */
    static async triggerWorkflow(trigger: AutomationTrigger, customerEmail: string, tenantId: string, client?: SupabaseClient): Promise<boolean> {
        logger.info(`Triggering ${trigger} automation`, { email: customerEmail });

        if (!isSupabaseConfigured) return false;

        const supabase = this.getClient(client);

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

            if (ltv > 500000) { // VIP threshold: 500k in local currency
                logger.info(`Sending VIP thank you to ${customerEmail}`);
                return true;
            }
        }

        return true;
    }

    /**
     * Scans for abandoned carts and triggers recovery sequences (Email & WhatsApp).
     */
    static async processAbandonedCarts(tenantId: string, client?: SupabaseClient): Promise<number> {
        logger.debug(`Scanning for abandoned carts`, { tenantId });
        if (!isSupabaseConfigured) return 0;

        const abandonedOrders = await OrderService.getAbandonedOrders(tenantId, client);
        let processedCount = 0;

        const { WhatsAppService } = await import('./whatsappService');
        const { AuditService } = await import('./auditService');

        for (const order of abandonedOrders) {
            const itemNames = order.items.map(i => i.name || 'Product');
            logger.info(`Recovering abandoned order`, { orderId: order.id });

            // 1. WhatsApp Nudge (Agentic Proactive Sales)
            //
            // Abandoned-cart nudges are business-initiated, so the customer is usually
            // outside Meta's 24h service window and a free-form send would be rejected.
            // sendOutbound falls back to the approved template when the window is shut.
            const customerPhone = order.customer_phone;
            if (customerPhone) {
                const customerName = order.customer_name || 'there';
                const storeName = order.tenant?.name || 'our store';
                const paymentLink = OrderService.generatePaymentLink(order.id);

                const result = await WhatsAppService.sendOutbound({
                    to: customerPhone,
                    tenantId,
                    text: `Hi ${customerName}! 👋 We noticed you left some of our world-class items in your cart at ${storeName}.\n\nReady to complete your order? Access your sovereign checkout here: ${paymentLink}`,
                    template: {
                        name: ABANDONED_CART_TEMPLATE,
                        params: [customerName, storeName, paymentLink]
                    }
                });

                if (result.delivered) {
                    await AuditService.logAction({
                        tenant_id: tenantId,
                        action: 'automation_whatsapp_nudge_sent',
                        entity_type: 'order',
                        entity_id: order.id,
                        metadata: { channel: 'whatsapp', phone: customerPhone, mode: result.mode }
                    }, client);
                } else {
                    logger.error('WhatsApp nudge not delivered', {
                        orderId: order.id,
                        mode: result.mode,
                        reason: result.reason
                    });
                }
            }

            // 2. Email Nudge (Legacy)
            await AIContentService.generateRecoveryEmail(
                order.customer_name || 'Valued Customer',
                itemNames as string[]
            );

            processedCount++;
        }

        return processedCount;
    }

    /**
     * Scans per-tenant inventory for low stock and triggers alerts.
     */
    static async processLowStockAlerts(tenantId: string, client?: SupabaseClient): Promise<number> {
        logger.debug(`Scanning for low stock items`, { tenantId });
        const analysis = await InventoryService.getPredictiveStockAnalysis(tenantId, client);
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
    static async processWeeklyDigest(tenantId: string, client?: SupabaseClient): Promise<boolean> {
        logger.info(`Processing weekly business digest`, { tenantId });
        const metrics = await OrderService.getWeeklyMetrics(tenantId, client);

        const digest = await AIContentService.generateWeeklyDigest(metrics);
        logger.info('Weekly digest automation complete', { tenantId, sales: metrics.sales, digest });

        return true;
    }

    /**
     * Gets all configured automation sequences from Supabase.
     */
    static async getSequences(tenantId: string, client?: SupabaseClient): Promise<AutomationSequence[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
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
    static async toggleSequence(id: string, currentStatus: string, client?: SupabaseClient): Promise<void> {
        if (!isSupabaseConfigured) return;

        const supabase = this.getClient(client);
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        await supabase
            .from('automation_sequences')
            .update({ status: newStatus })
            .eq('id', id);
    }
}
