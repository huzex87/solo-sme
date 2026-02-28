import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Product {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
    category: string;
    metadata?: Record<string, any>;
    created_at: string;
}

// Demo products for when Supabase is not configured
const DEMO_PRODUCTS: Product[] = [
    {
        id: 'p1',
        tenant_id: 'demo-tenant-001',
        name: 'Premium Wireless Headphones',
        description: 'Noise-cancelling over-ear headphones with 30h battery life. Crystal-clear audio with deep bass.',
        price: 299.99,
        stock_quantity: 45,
        image_url: undefined,
        category: 'Electronics',
        created_at: '2025-02-20T10:00:00Z',
    },
    {
        id: 'p2',
        tenant_id: 'demo-tenant-001',
        name: 'Artisan Leather Wallet',
        description: 'Handcrafted genuine leather wallet with RFID blocking technology. Slim bifold design.',
        price: 89.00,
        stock_quantity: 120,
        image_url: undefined,
        category: 'Accessories',
        created_at: '2025-02-18T14:30:00Z',
    },
    {
        id: 'p3',
        tenant_id: 'demo-tenant-001',
        name: 'Organic Cotton T-Shirt',
        description: '100% organic cotton crew neck tee. Sustainably sourced, pre-shrunk, and incredibly soft.',
        price: 45.00,
        stock_quantity: 200,
        image_url: undefined,
        category: 'Apparel',
        created_at: '2025-02-15T09:00:00Z',
    },
    {
        id: 'p4',
        tenant_id: 'demo-tenant-001',
        name: 'Smart Fitness Watch',
        description: 'Track heart rate, sleep, and 50+ exercises. Water resistant to 50m with 7-day battery.',
        price: 199.99,
        stock_quantity: 78,
        image_url: undefined,
        category: 'Electronics',
        created_at: '2025-02-12T16:00:00Z',
    },
    {
        id: 'p5',
        tenant_id: 'demo-tenant-001',
        name: 'Minimalist Desk Lamp',
        description: 'Adjustable LED desk lamp with 5 brightness levels and wireless charging base.',
        price: 75.00,
        stock_quantity: 60,
        image_url: undefined,
        category: 'Home',
        created_at: '2025-02-10T11:00:00Z',
    },
    {
        id: 'p6',
        tenant_id: 'demo-tenant-001',
        name: 'Stainless Steel Water Bottle',
        description: 'Double-walled vacuum insulated. Keeps drinks cold 24h or hot 12h. 750ml capacity.',
        price: 35.00,
        stock_quantity: 300,
        image_url: undefined,
        category: 'Accessories',
        created_at: '2025-02-08T08:00:00Z',
    },
];

export class ProductService {
    static async getProducts(tenantId: string): Promise<Product[]> {
        if (!isSupabaseConfigured) {
            return DEMO_PRODUCTS.filter(p => p.tenant_id === tenantId || tenantId === 'demo-tenant-001');
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data || [];
    }

    static async getProduct(id: string): Promise<Product | null> {
        if (!isSupabaseConfigured) {
            return DEMO_PRODUCTS.find(p => p.id === id) || null;
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            return null;
        }

        return data;
    }

    static async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
        if (!isSupabaseConfigured) {
            const newProduct: Product = {
                ...product,
                id: `p${Date.now()}`,
                created_at: new Date().toISOString(),
            };
            DEMO_PRODUCTS.unshift(newProduct);
            return newProduct;
        }

        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return null;
        }

        return data;
    }

    static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
        if (!isSupabaseConfigured) {
            const idx = DEMO_PRODUCTS.findIndex(p => p.id === id);
            if (idx >= 0) {
                DEMO_PRODUCTS[idx] = { ...DEMO_PRODUCTS[idx], ...updates };
                return DEMO_PRODUCTS[idx];
            }
            return null;
        }

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            return null;
        }

        return data;
    }

    static async deleteProduct(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) {
            const idx = DEMO_PRODUCTS.findIndex(p => p.id === id);
            if (idx >= 0) {
                DEMO_PRODUCTS.splice(idx, 1);
                return true;
            }
            return false;
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            return false;
        }

        return true;
    }
}
