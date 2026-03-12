import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    total_orders: number;
    total_spend: number;
    last_order: string;
    last_order_at?: string;
    created_at: string;
}

// No demo customers in production

export class CustomerService {
    static async getCustomers(tenantId: string): Promise<Customer[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[CustomerService] Error fetching customers:', error);
            return [];
        }

        return (data || []).map(c => ({
            id: c.id,
            full_name: c.full_name,
            email: c.email || '',
            total_orders: c.total_orders || 0,
            total_spend: Number(c.total_spend) || 0,
            last_order: c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : 'N/A',
            last_order_at: c.last_order_at,
            created_at: c.created_at
        }));
    }

    static async getCustomer(id: string): Promise<Customer | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('[CustomerService] Error fetching customer:', error);
            return null;
        }

        return {
            id: data.id,
            full_name: data.full_name,
            email: data.email || '',
            total_orders: data.total_orders || 0,
            total_spend: Number(data.total_spend) || 0,
            last_order: data.last_order_at ? new Date(data.last_order_at).toLocaleDateString() : 'N/A',
            last_order_at: data.last_order_at,
            created_at: data.created_at
        };
    }

    static async createCustomer(tenantId: string, customer: Partial<Customer>): Promise<Customer | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('customers')
            .insert([{
                tenant_id: tenantId,
                full_name: customer.full_name,
                email: customer.email,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('[CustomerService] Error creating customer:', error);
            return null;
        }

        return {
            id: data.id,
            full_name: data.full_name,
            email: data.email || '',
            total_orders: 0,
            total_spend: 0,
            last_order: 'N/A',
            created_at: data.created_at
        };
    }
}
