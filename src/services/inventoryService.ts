import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface InventoryMovement {
    id: string;
    product_id: string;
    location_id?: string;
    delta: number;
    type: 'sale' | 'restock' | 'adjustment' | 'return' | 'transfer';
    channel: 'online' | 'pos' | 'marketplace';
    staff_id?: string;
    reference_id?: string;
    notes?: string;
    created_at: string;
}

export class InventoryService {
    /**
     * Records a stock movement and updates the product's total stock.
     */
    static async recordMovement(
        tenantId: string,
        params: Omit<InventoryMovement, 'id' | 'created_at'>
    ): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        // 1. Record the movement in the audit trail
        const { error: moveError } = await supabase
            .from('inventory_movements')
            .insert({
                tenant_id: tenantId,
                ...params,
                created_at: new Date().toISOString()
            });

        if (moveError) {
            console.error('[InventoryService] Movement recording failed:', moveError);
            return false;
        }

        // 2. Update the product's total stock quantity
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', params.product_id)
            .single();

        if (fetchError || !product) {
            console.error('[InventoryService] Product fetch failed:', fetchError);
            return false;
        }

        const newStock = (product.stock_quantity || 0) + params.delta;

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', params.product_id);

        if (updateError) {
            console.error('[InventoryService] Product stock update failed:', updateError);
            return false;
        }

        return true;
    }

    /**
     * Gets the movement history for a specific product.
     */
    static async getMovementHistory(productId: string): Promise<InventoryMovement[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('inventory_movements')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[InventoryService] History fetch error:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Gets low stock alerts based on a threshold.
     */
    static async getLowStockAlerts(tenantId: string, threshold: number = 5) {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('products')
            .select('id, name, stock_quantity')
            .eq('tenant_id', tenantId)
            .lte('stock_quantity', threshold);

        if (error) {
            console.error('[InventoryService] Alert fetch error:', error);
            return [];
        }

        return data || [];
    }
}
