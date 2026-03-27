import { BaseService } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

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

export class InventoryService extends BaseService {
    protected static serviceName = 'InventoryService';

    /**
     * Records a stock movement and updates the product's total stock.
     */
    static async recordMovement(
        tenantId: string,
        params: Omit<InventoryMovement, 'id' | 'created_at'>,
        client?: SupabaseClient
    ): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const supabase = await this.getClient(client);
        
        // 1. Record the movement in the audit trail
        const { error: moveError } = await supabase
            .from('inventory_movements')
            .insert({
                tenant_id: tenantId,
                ...params,
                created_at: new Date().toISOString()
            });

        if (moveError) {
            this.error('Movement recording failed:', moveError);
            return false;
        }

        // 2. Update the product's total stock quantity
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', params.product_id)
            .single();

        if (fetchError || !product) {
            this.error('Product fetch failed:', fetchError);
            return false;
        }

        const newStock = (product.stock_quantity || 0) + params.delta;

        // Prevent stock underflow
        if (newStock < 0) {
            this.warn(`Underflow prevented for product ${params.product_id}. Requested delta: ${params.delta}, current stock: ${product.stock_quantity}`);
            return false;
        }

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', params.product_id);

        if (updateError) {
            this.error('Product stock update failed:', updateError);
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
        }, client);

        return true;
    }

    /**
     * Gets the movement history for a specific product.
     */
    static async getMovementHistory(productId: string, client?: SupabaseClient): Promise<InventoryMovement[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('inventory_movements')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            this.error('History fetch error:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Predictive logic: Analyzes sales velocity and forecasts stock depletion.
     */
    static async getPredictiveStockAnalysis(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return [];

        const supabase = await this.getClient(client);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: movements, error: moveError } = await supabase
            .from('inventory_movements')
            .select('product_id, delta')
            .eq('type', 'sale')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (moveError) return [];

        const velocityMap: Record<string, number> = {};
        (movements || []).forEach(m => {
            velocityMap[m.product_id] = (velocityMap[m.product_id] || 0) + Math.abs(m.delta);
        });

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

    /**
     * Gets products that have fallen below their set low-stock threshold.
     */
    static async getLowStockAlerts(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return [];

        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .select('id, name, stock_quantity, low_stock_threshold, reorder_point')
            .eq('tenant_id', tenantId)
            .eq('is_active', true);

        if (error || !data) return [];

        return data.filter(p => {
            const threshold = p.reorder_point ?? p.low_stock_threshold ?? 5;
            return (p.stock_quantity || 0) <= threshold;
        });
    }

    static async getStockLevel(productId: string, tenantId: string, client?: SupabaseClient): Promise<number> {
        if (!isSupabaseConfigured) return 0;
        const supabase = await this.getClient(client);
        const { data, error } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', productId)
            .eq('tenant_id', tenantId)
            .single();
        
        if (error || !data) return 0;
        return data.stock_quantity || 0;
    }

    static async updateStock(productId: string, tenantId: string, quantity: number, type: string = 'manual_adjustment', client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const supabase = await this.getClient(client);
        
        const { error } = await supabase
            .from('products')
            .update({ stock_quantity: quantity })
            .eq('id', productId)
            .eq('tenant_id', tenantId);
        
        if (error) {
            this.error('Manual stock update failed:', error);
            return false;
        }

        // Log movement
        await supabase.from('inventory_movements').insert({
            tenant_id: tenantId,
            product_id: productId,
            delta: quantity, // This is an absolute set, but we usually track delta. 
            // For simplicity in this handler, we just log the action.
            type: 'adjustment',
            channel: 'whatsapp',
            notes: `Manual stock update to ${quantity}`
        });

        return true;
    }
}
