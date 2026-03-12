import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';

export interface InventoryMovement {
    id: string;
    product_id: string;
    location_id?: string;
    delta: number;
    type: 'sale' | 'restock' | 'adjustment' | 'return' | 'transfer';
    channel: 'online' | 'pos' | 'marketplace' | 'whatsapp';
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

        // Prevent stock underflow
        if (newStock < 0) {
            console.warn(`[InventoryService] Underflow prevented for product ${params.product_id}. Requested delta: ${params.delta}, current stock: ${product.stock_quantity}`);
            return false;
        }

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', params.product_id);

        if (updateError) {
            console.error('[InventoryService] Product stock update failed:', updateError);
            return false;
        }

        // 3. Record audit action
        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: params.delta > 0 ? 'restock_product' : 'sell_product',
            entity_type: 'product',
            entity_id: params.product_id,
            metadata: { delta: params.delta, type: params.type, channel: params.channel }
        } as any);

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
     * Predictive logic: Analyzes sales velocity and forecasts stock depletion.
     */
    static async getPredictiveStockAnalysis(tenantId: string) {
        if (!isSupabaseConfigured) return [];

        // 1. Get deliveries/sales for the last 7 days to calculate velocity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: movements, error: moveError } = await supabase
            .from('inventory_movements')
            .select('product_id, delta')
            .eq('type', 'sale')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (moveError) return [];

        // 2. Calculate average daily velocity per product
        const velocityMap: Record<string, number> = {};
        movements.forEach(m => {
            velocityMap[m.product_id] = (velocityMap[m.product_id] || 0) + Math.abs(m.delta);
        });

        // 3. Get current products to compare stock vs velocity
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name, stock_quantity')
            .eq('tenant_id', tenantId);

        if (prodError || !products) return [];

        return products.map(p => {
            const weeklyVelocity = velocityMap[p.id] || 0;
            const dailyVelocity = weeklyVelocity / 7;
            const runwayDays = dailyVelocity > 0 ? Math.floor(p.stock_quantity / dailyVelocity) : 999;

            return {
                id: p.id,
                name: p.name,
                stock: p.stock_quantity,
                runwayDays,
                dailyVelocity,
                status: runwayDays < 3 ? 'CRITICAL' : (runwayDays < 7 ? 'LOW' : 'STABLE')
            };
        });
    }
}
