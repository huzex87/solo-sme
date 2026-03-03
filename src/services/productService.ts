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
    sku?: string;
    barcode?: string;
    variants?: any[];
    created_at?: string;
}

// Production data only

export class ProductService {
    static async getProducts(tenantId: string): Promise<Product[]> {
        if (!isSupabaseConfigured) return [];

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
        if (!isSupabaseConfigured) return null;

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
        if (!isSupabaseConfigured) return null;

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
        if (!isSupabaseConfigured) return null;

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
        if (!isSupabaseConfigured) return true;

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

    static async getProductByBarcode(tenantId: string, barcode: string): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('barcode', barcode)
            .maybeSingle();

        if (error) {
            console.error('[ProductService] Barcode lookup error:', error);
            return null;
        }

        return data;
    }

    static async getProductBySKU(tenantId: string, sku: string): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('sku', sku)
            .maybeSingle();

        if (error) {
            console.error('[ProductService] SKU lookup error:', error);
            return null;
        }

        return data;
    }
}
