import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    total_orders: number;
    total_spend: number;
    last_order: string;
    created_at: string;
}

// No demo customers in production

export class CustomerService {
    static async getCustomers(tenantId: string): Promise<Customer[]> {
        if (!isSupabaseConfigured) return [];

        // Aggregate customer data from orders
        const { data, error } = await supabase
            .from('orders')
            .select('customer_name, customer_email, total_amount, created_at')
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('Error fetching customers:', error);
            return [];
        }

        // Map order data to unique customers
        const customerMap = new Map<string, Customer>();
        data?.forEach(order => {
            const existing = customerMap.get(order.customer_email);
            if (existing) {
                existing.total_orders += 1;
                existing.total_spend += Number(order.total_amount);
            } else {
                customerMap.set(order.customer_email, {
                    id: Math.random().toString(36).substr(2, 9),
                    full_name: order.customer_name,
                    email: order.customer_email,
                    total_orders: 1,
                    total_spend: Number(order.total_amount),
                    last_order: 'Recent',
                    created_at: order.created_at || new Date().toISOString()
                });
            }
        });

        return Array.from(customerMap.values());
    }

    static async getCustomer(id: string): Promise<Customer | null> {
        if (!isSupabaseConfigured) return null;

        // In this schema, customers are derived from profiles/orders.
        // For simplicity, we fetch by profile ID if they exist as a user, 
        // or we'd ideally have a 'customers' table.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;

        return {
            id: data.id,
            full_name: data.full_name,
            email: data.email || '',
            total_orders: 0,
            total_spend: 0,
            last_order: 'N/A',
            created_at: data.created_at || new Date().toISOString()
        };
    }
}
