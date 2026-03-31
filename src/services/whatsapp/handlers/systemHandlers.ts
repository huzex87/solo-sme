import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities, ResolveVoidItem } from '@/services/intentEngine';
import { OrderService } from '@/services/orderService';
import { InventoryService } from '@/services/inventoryService';
import { LedgerService } from '@/services/ledgerService';
import { WhatsAppService } from '@/services/whatsappService';
import { WhatsAppAuthService, PendingAction } from '@/services/whatsappAuthService';
import { formatCurrency } from '@/lib/utils';

export class VoidHandler extends IntentHandler {
    intent = 'VOID_SALE';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding } = context;
        const orders = await OrderService.getOrders(binding.tenant_id);
        const latest = orders[0];

        if (!latest) {
            await WhatsAppService.sendText(from, "No recent orders found to void.");
            return;
        }

        const target = orders.find(o => o.id === result.entities.order_id) || latest;

        await WhatsAppAuthService.setPendingConfirmation(from, {
            type: 'VOID_SALE',
            tenant_id: binding.tenant_id,
            order_id: target.id,
            order_ref: target.id.slice(0, 8).toUpperCase(),
            amount: target.total_amount,
            resolved: (target.items || []).map((item): ResolveVoidItem => ({
                product_id: item.id || '',
                product: { id: item.id || '', name: item.name || '' },
                quantity: Number(item.quantity) || 1
            }))
        });

        await WhatsAppService.sendButtons(
            from,
            `⚠️ *Void Sale?*\n\nOrder: #${target.id.slice(0, 8).toUpperCase()}\nAmount: ${formatCurrency(target.total_amount)}\nCustomer: ${target.customer_name}\n\nThis will reverse inventory and ledger entries.`,
            ['YES — Void It', 'NO — Keep It']
        );
    }

    static async commit(context: HandlerContext, pending: PendingAction): Promise<void> {
        const { from, binding, supabase } = context;
        const { order_id, order_ref, amount, resolved } = pending;

        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order_id)
            .eq('tenant_id', binding.tenant_id);

        if (error) {
            await WhatsAppService.sendText(from, "❌ Could not void the sale. Please try from the dashboard.");
            return;
        }

        if (resolved && Array.isArray(resolved)) {
            for (const item of (resolved as ResolveVoidItem[])) {
                await InventoryService.recordMovement(binding.tenant_id, {
                    product_id: item.product_id,
                    delta: Math.abs(item.quantity || 1),
                    type: 'return',
                    channel: 'whatsapp',
                    reference_id: order_id,
                    notes: `Stock restored — order #${order_ref} voided via WhatsApp`
                }, supabase);
            }
        }

        await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            order_id,
            amount: -Math.abs(amount || 0),
            type: 'revenue',
            status: 'completed',
            provider: 'WhatsApp',
            description: `REVERSAL — Order #${order_ref} voided via WhatsApp`
        }, supabase);

        await WhatsAppService.sendText(from, `🔄 *Sale Voided*\n\nOrder #${order_ref} has been cancelled.\nAmount: ${formatCurrency(Number(amount))} reversed.\n\n_Inventory and ledger updated._`);
    }
}

export class ProductHandler extends IntentHandler {
    intent = 'ADD_PRODUCT';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { product_name, quantity, amount } = result.entities;

        if (!product_name) {
            await WhatsAppService.sendText(
                from,
                "📦 *Add a New Product*\n\nSend me the product details in this format:\n\n*Add product [Name] [Price] [Qty]*\n\nExample:\n_Add product Ankara Dress 15000 10_"
            );
            return;
        }

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                tenant_id: binding.tenant_id,
                name: product_name,
                price: amount || 0,
                stock_quantity: quantity || 0,
                status: 'active',
            })
            .select()
            .single();

        if (error || !product) {
            await WhatsAppService.sendText(from, "❌ Failed to add product. Please try again.");
            return;
        }

        await WhatsAppService.sendText(from, `✅ *Product Added!*\n\n📦 *${product.name}*\n💰 Price: ${formatCurrency(amount || 0)}\n📊 Stock: ${quantity || 0} units\nID: ${product.id.slice(0, 8).toUpperCase()}\n\n_Product is now live on your store!_`);
    }
}
