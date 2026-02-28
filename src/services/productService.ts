import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Product {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock_quantity: number;
    image_url?: string;
    created_at?: string;
}

let DEMO_PRODUCTS: Product[] = [
    {
        id: 'p1',
        tenant_id: 't1',
        name: 'Midnight Silk Scarf',
        description: 'Premium hand-dyed mulberry silk scarf with deep indigo patterns.',
        price: 15500,
        category: 'Accessories',
        stock_quantity: 12,
        image_url: ''
    },
    {
        id: 'p2',
        tenant_id: 't1',
        name: 'Ceramic Horizon Mug',
        description: 'Hand-thrown stoneware with a reactive blue glaze.',
        price: 8500,
        category: 'Home',
        stock_quantity: 45,
        image_url: ''
    },
    {
        id: 'p3',
        tenant_id: 't1',
        name: 'Gilded Moon Earrings',
        description: '24k gold-plated recycled brass with hammered texture.',
        price: 22000,
        category: 'Jewelry',
        stock_quantity: 8,
        image_url: ''
    },
    {
        id: 'p4',
        tenant_id: 't1',
        name: 'Urban Linen Blazer',
        description: 'Breathable linen blend blazer for a sharp professional look.',
        price: 35000,
        category: 'Fashion',
        stock_quantity: 15,
        image_url: ''
    }
];

export class ProductService {
    static async getProducts(tenantId: string): Promise<Product[]> {
        if (!isSupabaseConfigured) {
            return DEMO_PRODUCTS;
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            return DEMO_PRODUCTS;
        }

        return data || [];
    }

    static async getProduct(id: string): Promise<Product | null> {
        if (!isSupabaseConfigured) {
            return DEMO_PRODUCTS.find(p => p.id === id) || DEMO_PRODUCTS[0];
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

    static async createProduct(product: Partial<Product>): Promise<Product | null> {
        if (!isSupabaseConfigured) {
            console.log('[ProductService] Demo mode: Product created locally (simulated)');
            const newProduct = {
                id: Math.random().toString(36).substr(2, 9),
                tenant_id: product.tenant_id || 't1',
                name: product.name || 'New Product',
                description: product.description || '',
                price: product.price || 0,
                category: product.category || 'General',
                stock_quantity: product.stock_quantity || 0,
                image_url: product.image_url,
                created_at: new Date().toISOString()
            };
            DEMO_PRODUCTS = [newProduct, ...DEMO_PRODUCTS];
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
            console.log(`[ProductService] Demo mode: Product ${id} updated locally (simulated)`);
            return null; // In demo mode we don't persist updates
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
            console.log(`[ProductService] Demo mode: Product ${id} deleted locally (simulated)`);
            return true;
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
