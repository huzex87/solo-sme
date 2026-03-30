import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { ProductService } from '@/services/productService';
import { InventoryService } from '@/services/inventoryService';
import { WhatsAppService } from '@/services/whatsappService';
import { formatCurrency } from '@/lib/utils';

export class InventoryHandler extends IntentHandler {
    intent = 'CHECK_INVENTORY';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { product: productName } = result.entities;

        if (productName) {
            const products = await ProductService.getProducts(binding.tenant_id, supabase);
            const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

            if (product) {
                const stock = await InventoryService.getStockLevel(product.id, binding.tenant_id, supabase);
                await WhatsAppService.sendText(
                    from,
                    `📦 *Inventory Check*\n\nProduct: ${product.name}\nPrice: ${formatCurrency(product.price)}\nStock Level: ${stock || 0} units`
                );
            } else {
                await WhatsAppService.sendText(from, `I couldn't find "${productName}" in your inventory.`);
            }
        } else {
            const products = await ProductService.getProducts(binding.tenant_id, supabase, { limit: 10 });
            const list = products.map(p => `• ${p.name}: ${formatCurrency(p.price)}`).join('\n');
            await WhatsAppService.sendText(from, `📦 *Your Top Products*\n\n${list}\n\n_Reply with a product name to check its stock._`);
        }
    }
}

export class StockUpdateHandler extends IntentHandler {
    intent = 'UPDATE_STOCK';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { product: productName, quantity } = result.entities;

        if (!productName || quantity === undefined) {
            await WhatsAppService.sendText(from, "Please specify the product and the new quantity (e.g., 'Update stock for Bread to 50').");
            return;
        }

        const products = await ProductService.getProducts(binding.tenant_id, supabase);
        const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

        if (!product) {
            await WhatsAppService.sendText(from, `I couldn't find "${productName}" in your inventory.`);
            return;
        }

        const success = await InventoryService.updateStock(product.id, binding.tenant_id, quantity, 'manual_adjustment', supabase);

        if (success) {
            const unit = (product as unknown as Record<string, unknown>).unit || 'units';
            await WhatsAppService.sendText(from, `✅ *Stock Updated*\n\n${product.name} is now set to ${quantity} ${unit}.`);
        } else {
            await WhatsAppService.sendText(from, `❌ Failed to update stock for ${product.name}. Please try again.`);
        }
    }
}
