import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import { InventoryService } from './inventoryService';
import { LedgerService } from './ledgerService';
import { LoyaltyService } from './loyaltyService';
import { AuditService } from './auditService';
import { EmailService } from './emailService';

export interface Order {
    id: string;
    tenant_id: string;
    customer_id?: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    tax_amount?: number;
    subtotal?: number;
    delivery_fee?: number;
    status: 'pending' | 'paid' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'abandoned';
    items: { id?: string; name?: string; price?: number; quantity?: number;[key: string]: unknown }[];
    channel?: 'online' | 'pos' | 'marketplace' | 'whatsapp'; // FIX O: Added 'whatsapp' channel
    delivery_method?: 'pickup' | 'delivery';
    created_at: string;
}

// Production data only

export class OrderService {
    static async getOrders(tenantId: string, startDate?: Date): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        let query = supabase
            .from('orders')
            .select('*')
            .eq('tenant_id', tenantId);

        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return data || [];
    }

    static async getOrder(id: string): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            return null;
        }

        return data;
    }

    static async createOrder(order: Partial<Order>): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('orders')
            .insert(order)
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return null;
        }

        // Record inventory movements
        if (data && data.items) {
            for (const item of (data.items as { id?: string; quantity?: number; channel?: string;[key: string]: unknown }[])) {
                if (item.id) {
                    await InventoryService.recordMovement(data.tenant_id, {
                        product_id: item.id,
                        delta: -(item.quantity || 1),
                        type: 'sale',
                        channel: data.channel || 'online',
                        reference_id: data.id,
                        // FIX V: Correctly label WhatsApp channel in movement notes
                        notes: `${data.channel === 'pos' ? 'POS' : data.channel === 'whatsapp' ? 'WhatsApp' : 'Online'} order #${data.id.slice(0, 8)}`
                    });
                }
            }

            // Record Financial Ledger Entry
            await LedgerService.recordTransaction({
                tenant_id: data.tenant_id,
                order_id: data.id,
                amount: data.total_amount,
                type: 'revenue',
                status: 'completed',
                provider: data.channel === 'pos' ? 'Retail' : 'Checkout',
                description: `Sale - Order #${data.id.slice(0, 8)} (${data.channel || 'online'})`
            });

            // Record Loyalty Points
            if (data.customer_id) {
                const points = LoyaltyService.calculatePoints(data.total_amount);
                await LoyaltyService.addPoints(
                    data.tenant_id,
                    data.customer_id,
                    points,
                    `Earned from order #${data.id.slice(0, 8)}`
                );
            }

            // Record Tax in Ledger if applicable
            if (data.tax_amount && data.tax_amount > 0) {
                await LedgerService.recordTransaction({
                    tenant_id: data.tenant_id,
                    order_id: data.id,
                    amount: data.tax_amount,
                    type: 'tax',
                    status: 'completed',
                    provider: 'system',
                    description: `Tax collect for order #${data.id.slice(0, 8)}`
                });
            }

            // Record Business Activity Log
            await AuditService.logAction({
                tenant_id: data.tenant_id,
                action: 'order_created',
                entity_type: 'order',
                entity_id: data.id,
                metadata: {
                    total: data.total_amount,
                    channel: data.channel || 'online',
                    customer: data.customer_email
                }
            });

            // 5. Send order confirmation email (async)
            EmailService.sendOrderConfirmation(data.customer_email, {
                orderId: data.id,
                customerName: data.customer_name,
                items: data.items as { name: string; quantity: number; price: number }[],
                total: data.total_amount,
                businessName: data.tenant?.name || 'Your Store'
            }).catch(err => {
                console.error('[OrderService] Email error:', err);
            });
        }

        return data;
    }

    static async getAbandonedOrders(tenantId: string): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'abandoned')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching abandoned orders:', error);
            return [];
        }

        return data || [];
    }

    static async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        // 1. Fetch order to get tenant_id for audit logging
        const order = await this.getOrder(id);
        if (!order) return false;

        // 2. Update status
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }

        // 3. Record Audit Log for status change
        await AuditService.logAction({
            tenant_id: order.tenant_id,
            action: 'order_status_updated',
            entity_type: 'order',
            entity_id: id,
            metadata: {
                new_status: status,
                old_status: order.status
            }
        });

        return true;
    }

    static generatePaymentLink(orderId: string): string {
        // In production, this would call Paystack/Flutterwave to generate a hosted URL
        // Example: https://checkout.paystack.com/xxxx
        return `https://solo-sme.com/pay/${orderId}`;
    }

    /**
     * Aggregates weekly metrics for a tenant.
     */
    static async getWeeklyMetrics(tenantId: string) {
        if (!isSupabaseConfigured) return { sales: 0, growth: 0, topProduct: 'N/A' };

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Fetch current week orders
        const { data: currentWeek } = await supabase
            .from('orders')
            .select('total_amount, items')
            .eq('tenant_id', tenantId)
            .gte('created_at', sevenDaysAgo.toISOString())
            .neq('status', 'cancelled');

        // Fetch previous week orders for growth calculation
        const { data: previousWeek } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .gte('created_at', fourteenDaysAgo.toISOString())
            .lt('created_at', sevenDaysAgo.toISOString())
            .neq('status', 'cancelled');

        const currentSales = (currentWeek || []).reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
        const previousSales = (previousWeek || []).reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

        const growth = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 100;

        // Find top product
        const productCounts: Record<string, number> = {};
        (currentWeek || []).forEach(order => {
            (order.items as Order['items']).forEach(item => {
                const name = item.name || 'Unknown';
                productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
            });
        });

        const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

        return {
            sales: currentSales,
            growth: Math.round(growth),
            topProduct
        };
    }
}
