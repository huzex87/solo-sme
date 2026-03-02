import { supabase } from '@/lib/supabase';

export interface DriverOrder {
    id: string;
    tenant_id: string;
    customer_name: string;
    pickup_address: string;
    delivery_address: string;
    total_amount: number;
    delivery_fee: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
}

export interface DriverEarnings {
    daily: number;
    weekly: number;
    total: number;
    balance: number;
}

export class DriverService {
    /**
     * Fetches orders that are ready for delivery (confirmed/processing).
     */
    static async getAvailableTasks(): Promise<DriverOrder[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('id, tenant_id, customer_name, delivery_address, total_amount, delivery_fee, status')
            .in('status', ['confirmed', 'processing'])
            .eq('delivery_method', 'delivery');

        if (error) {
            console.error('[DriverService] Error fetching tasks:', error);
            return [];
        }

        return data as DriverOrder[];
    }

    /**
     * Claims a task by updating its status to 'confirmed'.
     */
    static async claimTask(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'confirmed' })
            .eq('id', id);

        if (error) {
            console.error('[DriverService] Error claiming task:', error);
            return false;
        }
        return true;
    }

    /**
     * Updates an order's status to reflect driver progress.
     */
    static async updateTaskStatus(id: string, status: DriverOrder['status']): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error('[DriverService] Error updating task status:', error);
        }
    }

    /**
     * Fetches earnings based on completed transactions of type 'revenue' or 'delivery_fee'.
     * In a real system, drivers might only see delivery_fee.
     */
    static async getEarnings(tenantId: string): Promise<DriverEarnings> {
        const { data: txns, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('tenant_id', tenantId)
            .eq('type', 'delivery_fee')
            .eq('status', 'completed');

        if (error) return { daily: 0, weekly: 0, total: 0, balance: 0 };

        const total = txns.reduce((sum, t) => sum + Number(t.amount), 0);

        return {
            daily: total * 0.1, // Simulated breakdown
            weekly: total * 0.6,
            total,
            balance: total
        };
    }
}
