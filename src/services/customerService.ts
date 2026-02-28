import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    total_orders: number;
    total_spend: number;
    last_order: string;
}

const DEMO_CUSTOMERS: Customer[] = [
    {
        id: 'c1',
        full_name: 'Adaeze Okonkwo',
        email: 'adaeze@example.com',
        total_orders: 12,
        total_spend: 185000,
        last_order: '2 hours ago'
    },
    {
        id: 'c2',
        full_name: 'Chidi Nnamdi',
        email: 'chidi@example.com',
        total_orders: 5,
        total_spend: 42500,
        last_order: 'Yesterday'
    },
    {
        id: 'c3',
        full_name: 'Oluwaseun Bakare',
        email: 'seun@example.com',
        total_orders: 2,
        total_spend: 12000,
        last_order: 'Feb 26'
    }
];

export class CustomerService {
    static async getCustomers(tenantId: string): Promise<Customer[]> {
        if (!isSupabaseConfigured) {
            return DEMO_CUSTOMERS;
        }

        // Aggregate customer data from orders
        const { data, error } = await supabase
            .from('orders')
            .select('customer_name, customer_email, total_amount, created_at')
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('Error fetching customers:', error);
            return DEMO_CUSTOMERS;
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
                    last_order: 'Recent'
                });
            }
        });

        return Array.from(customerMap.values());
    }

    static async getCustomer(id: string): Promise<Customer | null> {
        return DEMO_CUSTOMERS.find(c => c.id === id) || DEMO_CUSTOMERS[0];
    }
}
