import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Order {
    id: string;
    tenant_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    created_at: string;
}

export interface OrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
}

const DEMO_ORDERS: Order[] = [
    {
        id: 'ord-001',
        tenant_id: 'demo-tenant-001',
        customer_name: 'Adaeze Okonkwo',
        customer_email: 'adaeze@example.com',
        total_amount: 389.99,
        status: 'delivered',
        items: [
            { product_id: 'p1', product_name: 'Premium Wireless Headphones', quantity: 1, unit_price: 299.99 },
            { product_id: 'p6', product_name: 'Stainless Steel Water Bottle', quantity: 1, unit_price: 35.00 },
        ],
        created_at: '2025-02-27T09:30:00Z',
    },
    {
        id: 'ord-002',
        tenant_id: 'demo-tenant-001',
        customer_name: 'Chidi Nnamdi',
        customer_email: 'chidi@example.com',
        total_amount: 134.00,
        status: 'shipped',
        items: [
            { product_id: 'p2', product_name: 'Artisan Leather Wallet', quantity: 1, unit_price: 89.00 },
            { product_id: 'p3', product_name: 'Organic Cotton T-Shirt', quantity: 1, unit_price: 45.00 },
        ],
        created_at: '2025-02-26T15:20:00Z',
    },
    {
        id: 'ord-003',
        tenant_id: 'demo-tenant-001',
        customer_name: 'Fatima Ibrahim',
        customer_email: 'fatima@example.com',
        total_amount: 199.99,
        status: 'paid',
        items: [
            { product_id: 'p4', product_name: 'Smart Fitness Watch', quantity: 1, unit_price: 199.99 },
        ],
        created_at: '2025-02-28T11:45:00Z',
    },
    {
        id: 'ord-004',
        tenant_id: 'demo-tenant-001',
        customer_name: 'Oluwaseun Bakare',
        customer_email: 'seun@example.com',
        total_amount: 75.00,
        status: 'pending',
        items: [
            { product_id: 'p5', product_name: 'Minimalist Desk Lamp', quantity: 1, unit_price: 75.00 },
        ],
        created_at: '2025-02-28T13:00:00Z',
    },
    {
        id: 'ord-005',
        tenant_id: 'demo-tenant-001',
        customer_name: 'Grace Adekunle',
        customer_email: 'grace@example.com',
        total_amount: 344.99,
        status: 'delivered',
        items: [
            { product_id: 'p1', product_name: 'Premium Wireless Headphones', quantity: 1, unit_price: 299.99 },
            { product_id: 'p3', product_name: 'Organic Cotton T-Shirt', quantity: 1, unit_price: 45.00 },
        ],
        created_at: '2025-02-25T08:00:00Z',
    },
];

export class OrderService {
    static async getOrders(tenantId: string): Promise<Order[]> {
        if (!isSupabaseConfigured) {
            return DEMO_ORDERS.filter(o => o.tenant_id === tenantId || tenantId === 'demo-tenant-001');
        }

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
        if (!isSupabaseConfigured) {
            return DEMO_ORDERS.find(o => o.id === id) || null;
        }

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

    static async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
        if (!isSupabaseConfigured) {
            const order = DEMO_ORDERS.find(o => o.id === id);
            if (order) {
                order.status = status;
                return true;
            }
            return false;
        }

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

    static async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order | null> {
        if (!isSupabaseConfigured) {
            const newOrder: Order = {
                ...order,
                id: `ord-${Date.now()}`,
                created_at: new Date().toISOString(),
            };
            DEMO_ORDERS.unshift(newOrder);
            return newOrder;
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                tenant_id: order.tenant_id,
                total_amount: order.total_amount,
                status: order.status,
                order_metadata: {
                    customer_name: order.customer_name,
                    customer_email: order.customer_email,
                    items: order.items,
                },
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating order:', error);
            return null;
        }

        return data;
    }
}
