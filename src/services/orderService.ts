import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { InventoryService } from './inventoryService';
import { LedgerService } from './ledgerService';
import { LoyaltyService } from './loyaltyService';

export interface Order {
    id: string;
    tenant_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    tax_amount?: number;
    subtotal?: number;
    delivery_fee?: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'abandoned';
    items: { id?: string; name?: string; price?: number; quantity?: number;[key: string]: unknown }[];
    channel?: 'online' | 'pos' | 'marketplace';
    created_at: string;
}

// Production data only

export class OrderService {
    static async getOrders(tenantId: string): Promise<Order[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

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
            for (const item of (data.items as any[])) {
                if (item.id) {
                    await InventoryService.recordMovement(data.tenant_id, {
                        product_id: item.id,
                        delta: -(item.quantity || 1),
                        type: 'sale',
                        channel: data.channel || 'online',
                        reference_id: data.id,
                        notes: `${data.channel === 'pos' ? 'POS' : 'Online'} order #${data.id.slice(0, 8)}`
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

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }

        return true;
    }
}
