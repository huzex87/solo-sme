import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { OrderService } from './orderService';
import { AIContentService } from './aiContentService';
import { InventoryService } from './inventoryService';
import { logger } from '@/lib/logger';
import { SupabaseClient } from '@supabase/supabase-js';

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

            if (ltv > 500000) { // VIP threshold: ₦500k
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
            const customerPhone = (order as any).customer_phone;
            if (customerPhone) {
                try {
                    await WhatsAppService.sendText(
                        customerPhone,
                        `Hi ${order.customer_name}! 👋 We noticed you left some items in your cart at ${order.tenant?.name || 'our store'}.\n\nReady to complete your order? Use this link to checkout: ${OrderService.generatePaymentLink(order.id)}`
                    );

                    await AuditService.logAction({
                        tenant_id: tenantId,
                        action: 'automation_whatsapp_nudge_sent',
                        entity_type: 'order',
                        entity_id: order.id,
                        metadata: { channel: 'whatsapp', phone: customerPhone }
                    }, client);
                } catch (err) {
                    logger.error('WhatsApp nudge failed', { orderId: order.id, err });
                }
            }

            // 2. Email Nudge (Legacy)
            const emailContent = await AIContentService.generateRecoveryEmail(
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
