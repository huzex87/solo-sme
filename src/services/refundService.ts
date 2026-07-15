import { BaseService } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LedgerService } from './ledgerService';
import { AuditService } from './auditService';
import { InventoryService } from './inventoryService';
import { OrderService, Order } from './orderService';
import { SupabaseClient } from '@supabase/supabase-js';

export type RefundReason =
    | 'customer_request'
    | 'damaged_item'
    | 'wrong_item'
    | 'not_delivered'
    | 'duplicate_order'
    | 'other';

export interface RefundRequest {
    orderId: string;
    tenantId: string;
    amount: number;
    reason: RefundReason;
    notes?: string;
    actorId?: string;
    restoreInventory?: boolean;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    error?: string;
}

export class RefundService extends BaseService {
    protected static serviceName = 'RefundService';

    static async processRefund(
        request: RefundRequest,
        client?: SupabaseClient
    ): Promise<RefundResult> {
        if (!isSupabaseConfigured) return { success: false, error: 'Service unavailable' };

        const supabase = await this.getClient(client);

        const order = await OrderService.getOrder(request.orderId, supabase);
        if (!order) return { success: false, error: 'Order not found' };

        if (order.status === 'refunded') {
            return { success: false, error: 'Order has already been fully refunded' };
        }

        if (!['paid', 'delivered', 'processing', 'dispatched', 'partially_refunded'].includes(order.status)) {
            return { success: false, error: `Cannot refund an order with status: ${order.status}` };
        }

        const isPartial = request.amount < order.total_amount;
        const newStatus: Order['status'] = isPartial ? 'partially_refunded' : 'refunded';

        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', request.orderId);

        if (updateError) {
            this.error('Failed to update order status for refund:', updateError);
            return { success: false, error: 'Failed to update order status' };
        }

        const { data: ledgerEntry, error: ledgerError } = await supabase
            .from('ledger_entries')
            .insert({
                tenant_id: request.tenantId,
                order_id: request.orderId,
                amount: -Math.abs(request.amount),
                type: 'refund',
                status: 'completed',
                provider: 'manual',
                description: `Refund for order #${request.orderId.slice(0, 8)} — ${request.reason}${request.notes ? `: ${request.notes}` : ''}`,
            })
            .select('id')
            .single();

        if (ledgerError) {
            this.error('Failed to record refund ledger entry:', ledgerError);
        }

        if (request.restoreInventory && order.items?.length) {
            for (const item of order.items) {
                if (item.id) {
                    await InventoryService.recordMovement(request.tenantId, {
                        product_id: item.id,
                        delta: item.quantity || 1,
                        type: 'return',
                        channel: order.channel || 'online',
                        reference_id: request.orderId,
                        notes: `Refund — order #${request.orderId.slice(0, 8)}`
                    }, supabase);
                }
            }
        }

        await AuditService.logAction({
            tenant_id: request.tenantId,
            actor_id: request.actorId,
            action: isPartial ? 'ORDER_PARTIALLY_REFUNDED' : 'ORDER_REFUNDED',
            entity_type: 'order',
            entity_id: request.orderId,
            metadata: {
                amount: request.amount,
                reason: request.reason,
                notes: request.notes,
                restore_inventory: request.restoreInventory,
            },
        });

        return { success: true, refundId: ledgerEntry?.id };
    }

    static async getRefunds(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return [];

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('orders')
            .select('id, customer_name, customer_email, total_amount, status, created_at, channel, items')
            .eq('tenant_id', tenantId)
            .in('status', ['refunded', 'partially_refunded'])
            .order('created_at', { ascending: false });

        if (error) {
            this.error('Error fetching refunds:', error);
            return [];
        }

        return data || [];
    }

    static async getLedgerRefunds(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return [];

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('ledger_entries')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('type', 'refund')
            .order('created_at', { ascending: false });

        if (error) {
            this.error('Error fetching refund ledger entries:', error);
            return [];
        }

        return data || [];
    }
}
