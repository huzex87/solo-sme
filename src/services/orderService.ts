import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { InventoryService } from './inventoryService';
import { LedgerService } from './ledgerService';
import { LoyaltyService } from './loyaltyService';
import { AuditService } from './auditService';
import { EmailService } from './emailService';
import { SupabaseClient } from '@supabase/supabase-js';

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
    channel?: 'online' | 'pos' | 'marketplace' | 'whatsapp';
    delivery_method?: 'pickup' | 'delivery';
    created_at: string;
    tenant?: { name: string };
}

export class OrderService {
    private static getClient(client?: SupabaseClient) {
        if (!client) {
            console.error('[OrderService] Supabase client is missing! Services should always be called with an explicit client in server contexts.');
        }
        return client || createClient();
    }

    static async getOrders(tenantId: string, startDate?: Date, client?: SupabaseClient): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
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

    static async getOrder(id: string, client?: SupabaseClient): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('orders')
            .select('*, tenant:tenants(name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching order:', error);
            return null;
        }

        return data as unknown as Order;
    }

    static async createOrder(order: Partial<Order>, client?: SupabaseClient): Promise<Order | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('orders')
            .insert(order)
            .select('*, tenant:tenants(name)')
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return null;
        }

        if (data) {
            const typedData = data as unknown as Order;
            // Record inventory movements
            if (typedData.items) {
                for (const item of (typedData.items as { id?: string; quantity?: number; channel?: string;[key: string]: unknown }[])) {
                    if (item.id) {
                        await InventoryService.recordMovement(typedData.tenant_id, {
                            product_id: item.id,
                            delta: -(item.quantity || 1),
                            type: 'sale',
                            channel: typedData.channel || 'online',
                            reference_id: typedData.id,
                            notes: `${typedData.channel === 'pos' ? 'POS' : typedData.channel === 'whatsapp' ? 'WhatsApp' : 'Online'} order #${typedData.id.slice(0, 8)}`
                        }, client);
                    }
                }
            }

            // Record Financial Ledger Entry
            await LedgerService.recordTransaction({
                tenant_id: typedData.tenant_id,
                order_id: typedData.id,
                amount: typedData.total_amount,
                type: 'revenue',
                status: 'completed',
                provider: typedData.channel === 'pos' ? 'Retail' : 'Checkout',
                description: `Sale - Order #${typedData.id.slice(0, 8)} (${typedData.channel || 'online'})`
            }, client);

            // Record Loyalty Points
            if (typedData.customer_id) {
                const points = LoyaltyService.calculatePoints(typedData.total_amount);
                await LoyaltyService.addPoints(
                    typedData.tenant_id,
                    typedData.customer_id,
                    points,
                    `Earned from order #${typedData.id.slice(0, 8)}`,
                    client
                );
            }

            // Record Tax in Ledger if applicable
            if (typedData.tax_amount && typedData.tax_amount > 0) {
                await LedgerService.recordTransaction({
                    tenant_id: typedData.tenant_id,
                    order_id: typedData.id,
                    amount: typedData.tax_amount,
                    type: 'tax',
                    status: 'completed',
                    provider: 'system',
                    description: `Tax collect for order #${typedData.id.slice(0, 8)}`
                }, client);
            }

            // Record Business Activity Log
            await AuditService.logAction({
                tenant_id: typedData.tenant_id,
                action: 'order_created',
                entity_type: 'order',
                entity_id: typedData.id,
                metadata: {
                    total: typedData.total_amount,
                    channel: typedData.channel || 'online',
                    customer: typedData.customer_email
                }
            }, client);

            EmailService.sendOrderConfirmation(typedData.customer_email, {
                orderId: typedData.id,
                customerName: typedData.customer_name,
                items: typedData.items as { name: string; quantity: number; price: number }[],
                total: typedData.total_amount,
                businessName: typedData.tenant?.name || 'Your Store'
            }).catch(err => {
                console.error('[OrderService] Email error:', err);
            });
        }

        return data as unknown as Order;
    }

    static async getAbandonedOrders(tenantId: string, client?: SupabaseClient): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
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

    static async updateOrderStatus(id: string, status: Order['status'], client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const supabase = this.getClient(client);
        // 1. Fetch order to get tenant_id for audit logging
        const order = await this.getOrder(id, client);
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
        }, client);

        return true;
    }

    static async updateBulkOrders(ids: string[], status: Order['status'], client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const supabase = this.getClient(client);

        // Update all statuses in one sweep
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .in('id', ids);

        if (error) {
            console.error('Error updating bulk orders:', error);
            return false;
        }

        // Log the bulk action for each order (could be optimized but good for audit trail granularity)
        for (const id of ids) {
            const { data: order } = await supabase.from('orders').select('tenant_id').eq('id', id).single();
            if (order) {
                await AuditService.logAction({
                    tenant_id: order.tenant_id,
                    action: 'order_status_updated_bulk',
                    entity_type: 'order',
                    entity_id: id,
                    metadata: { new_status: status }
                }, client);
            }
        }

        return true;
    }

    static generatePaymentLink(orderId: string): string {
        return `https://solo-sme.com/pay/${orderId}`;
    }

    static async getWeeklyMetrics(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return { sales: 0, growth: 0, topProduct: 'N/A' };

        const supabase = this.getClient(client);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { data: currentWeek } = await supabase
            .from('orders')
            .select('total_amount, items')
            .eq('tenant_id', tenantId)
            .gte('created_at', sevenDaysAgo.toISOString())
            .neq('status', 'cancelled');

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
