import { BaseService } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { AuditService } from './auditService';
import { Product } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export type { Product };

export class ProductService extends BaseService {
    protected static serviceName = 'ProductService';

    static async getProducts(
        tenantId: string,
        client?: SupabaseClient,
        options: { limit?: number; offset?: number; activeOnly?: boolean } = {}
    ): Promise<Product[]> {
        if (!isSupabaseConfigured) {
            return [];
        }

        const { limit, offset = 0, activeOnly = false } = options;
        const supabase = await this.getClient(client);

        let query = supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        if (limit != null) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            this.error('Error fetching products:', error);
            return [];
        }

        return data || [];
    }

    static async getProduct(id: string, client?: SupabaseClient): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            this.error('Error fetching product:', error);
            return null;
        }

        return data;
    }

    static async createProduct(product: Partial<Product>, client?: SupabaseClient): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) {
            this.error('Error creating product:', error);
            return null;
        }

        if (data) {
            // Fire-and-forget: don't block product creation response on audit write
            AuditService.logAction({
                tenant_id: data.tenant_id,
                action: 'create_product',
                entity_type: 'product',
                entity_id: data.id,
                metadata: { name: data.name, price: data.price }
            }, client).catch(() => {});
        }

        return data;
    }

    static async updateProduct(id: string, updates: Partial<Product>, client?: SupabaseClient): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.error('Error updating product:', error);
            return null;
        }

        if (data) {
            await AuditService.logAction({
                tenant_id: data.tenant_id,
                action: 'update_product',
                entity_type: 'product',
                entity_id: data.id,
                metadata: updates
            }, client);
        }

        return data;
    }

    static async deleteProduct(id: string, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const supabase = await this.getClient(client);
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            this.error('Error deleting product:', error);
            return false;
        }

        await AuditService.logAction({
            tenant_id: 'unknown',
            action: 'delete_product',
            entity_type: 'product',
            entity_id: id
        }, client);

        return true;
    }

    static async getProductByBarcode(tenantId: string, barcode: string, client?: SupabaseClient): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('barcode', barcode)
            .maybeSingle();

        if (error) {
            this.error('Barcode lookup error:', error);
            return null;
        }

        return data;
    }

    static async getProductBySKU(tenantId: string, sku: string, client?: SupabaseClient): Promise<Product | null> {
        if (!isSupabaseConfigured) return null;

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('sku', sku)
            .maybeSingle();

        if (error) {
            this.error('SKU lookup error:', error);
            return null;
        }

        return data;
    }
}
