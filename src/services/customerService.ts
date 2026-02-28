import { isSupabaseConfigured } from '@/lib/supabase';

export interface Customer {
    id: string;
    name: string;
    email: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
}

const DEMO_CUSTOMERS: Customer[] = [
    { id: 'c1', name: 'Adaeze Okonkwo', email: 'adaeze@example.com', total_orders: 5, total_spent: 1245.50, last_order_date: '2025-02-27T09:30:00Z' },
    { id: 'c2', name: 'Chidi Nnamdi', email: 'chidi@example.com', total_orders: 3, total_spent: 567.00, last_order_date: '2025-02-26T15:20:00Z' },
    { id: 'c3', name: 'Fatima Ibrahim', email: 'fatima@example.com', total_orders: 8, total_spent: 2134.99, last_order_date: '2025-02-28T11:45:00Z' },
    { id: 'c4', name: 'Oluwaseun Bakare', email: 'seun@example.com', total_orders: 2, total_spent: 310.00, last_order_date: '2025-02-28T13:00:00Z' },
    { id: 'c5', name: 'Grace Adekunle', email: 'grace@example.com', total_orders: 12, total_spent: 4567.80, last_order_date: '2025-02-25T08:00:00Z' },
    { id: 'c6', name: 'Emeka Uche', email: 'emeka@example.com', total_orders: 1, total_spent: 89.00, last_order_date: '2025-02-20T10:00:00Z' },
];

export class CustomerService {
    static async getCustomers(_tenantId: string): Promise<Customer[]> {
        if (!isSupabaseConfigured) {
            return DEMO_CUSTOMERS;
        }

        // In production, aggregate from orders table
        return DEMO_CUSTOMERS;
    }

    static async getCustomer(id: string): Promise<Customer | null> {
        if (!isSupabaseConfigured) {
            return DEMO_CUSTOMERS.find(c => c.id === id) || null;
        }

        return DEMO_CUSTOMERS.find(c => c.id === id) || null;
    }
}
