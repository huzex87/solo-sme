import { supabase } from '@/lib/supabase';

export interface DriverOrder {
    id: string;
    tenant_id: string;
    customer_name: string;
    pickup_address: string;
    delivery_address: string;
    total_amount: number;
    delivery_fee: number;
    status: 'pending' | 'paid' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'abandoned';
}

export interface DriverEarnings {
    daily: number;
    weekly: number;
    total: number;
    balance: number;
}

export class DriverService {
    /**
     * Fetches orders that are ready for delivery.
     */
    static async getAvailableTasks(): Promise<DriverOrder[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('id, tenant_id, customer_name, pickup_address, delivery_address, total_amount, delivery_fee, status')
            .eq('status', 'processing')
            .eq('delivery_method', 'delivery');

        if (error) {
            console.error('[DriverService] Error fetching tasks:', error);
            return [];
        }

        return data as DriverOrder[];
    }

    /**
     * Updates an order's status.
     */
    static async updateTaskStatus(id: string, status: DriverOrder['status']): Promise<void> {
        await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);
    }

    /**
     * Claims a task by setting status to dispatched
     */
    static async claimTask(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'dispatched' })
            .eq('id', id);

        if (error) {
            console.error('[DriverService] Claim task error:', error);
            return false;
        }
        return true;
    }

    /**
     * Fetches real earnings based on completed delivery transactions.
     */
    static async getEarnings(tenantId: string): Promise<DriverEarnings> {
        const { data: txns, error } = await supabase
            .from('ledger_entries')
            .select('amount, created_at')
            .eq('tenant_id', tenantId)
            .eq('type', 'delivery_fee')
            .eq('status', 'completed');

        if (error || !txns) return { daily: 0, weekly: 0, total: 0, balance: 0 };

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();

        let daily = 0;
        let weekly = 0;
        let total = 0;

        txns.forEach(t => {
            const amt = Number(t.amount);
            const date = new Date(t.created_at).getTime();
            total += amt;
            if (date >= startOfDay) daily += amt;
            if (date >= startOfWeek) weekly += amt;
        });

        return { daily, weekly, total, balance: total };
    }
}
