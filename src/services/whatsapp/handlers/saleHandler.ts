import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities, ResolveProduct } from '@/services/intentEngine';
import { IntentValidator } from '@/services/intentValidator';
import { ProductService } from '@/services/productService';
import { OrderService } from '@/services/orderService';
import { ReceiptService } from '@/services/receiptService';
import { WhatsAppService } from '@/services/whatsappService';
import { WhatsAppAuthService, PendingAction } from '@/services/whatsappAuthService';
import { formatCurrency } from '@/lib/utils';

export class SaleHandler extends IntentHandler {
    intent = 'RECORD_SALE';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { entities } = result;

        // Support both single product (legacy) and multi-product
        const productList: Array<{ name: string; quantity: number; price?: number }> =
            entities.products ||
            (entities.product ? [{ name: entities.product, quantity: entities.quantity || 1, price: entities.price }] : []);

        if (productList.length === 0) {
            await WhatsAppService.sendText(from, "I couldn't identify the product. What did you sell?");
            return;
        }

        const validation = IntentValidator.validateSale(entities);
        if (!validation.valid) {
            await WhatsAppService.sendText(from, `⚠️ ${validation.error}`);
            return;
        }

        const allProducts = await ProductService.getProducts(binding.tenant_id, supabase);
        const resolved: ResolveProduct[] = [];

        for (const entry of productList) {
            const product = allProducts.find(p =>
                p.name.toLowerCase().includes(entry.name.toLowerCase())
            );
            if (!product) {
                await WhatsAppService.sendText(
                    from,
                    `I couldn't find "*${entry.name}*" in your inventory. Check the spelling or add it first.`
                );
                return;
            }
            resolved.push({
                product,
                quantity: entry.quantity || 1,
                unitPrice: entry.price || product.price
            });
        }

        const totalAmount = resolved.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
        const lineItems = resolved.map(r => `• ${r.product.name} × ${r.quantity} @ ${formatCurrency(r.unitPrice)} = ${formatCurrency(r.unitPrice * r.quantity)}`).join('\n');

        await WhatsAppAuthService.setPendingConfirmation(from, {
            type: 'RECORD_SALE',
            tenant_id: binding.tenant_id,
            resolved,
            totalAmount,
            customer_name: entities.customer_name || 'Walk-in Customer'
        });

        await WhatsAppService.sendButtons(
            from,
            `🛒 *Confirm Sale?*\n\n${lineItems}\n\n*Total: ${formatCurrency(totalAmount)}*\nCustomer: ${entities.customer_name || 'Walk-in Customer'}`,
            ['YES — Record It', 'NO — Cancel']
        );
    }

    static async commit(context: HandlerContext, pending: PendingAction): Promise<void> {
        const { from, binding, supabase } = context;
        const { resolved, totalAmount, customer_name } = pending;

        if (!resolved || totalAmount === undefined) {
            await WhatsAppService.sendText(from, "❌ Staged sale data corrupted. Please try again.");
            return;
        }

        const order = await OrderService.createOrder({
            tenant_id: binding.tenant_id,
            total_amount: totalAmount,
            status: 'paid',
            channel: 'whatsapp',
            customer_name,
            customer_email: '',
            items: (pending.resolved as ResolveProduct[]).map((r) => ({
                id: r.product.id,
                name: r.product.name,
                price: r.unitPrice,
                quantity: r.quantity
            }))
        }, supabase);

        if (!order) {
            await WhatsAppService.sendText(from, "❌ Sale failed to record. Please try again.");
            return;
        }

        const response = `✅ *Sale Recorded*\n\nTotal: ${formatCurrency(totalAmount)}\nCustomer: ${customer_name}\nRef: #${order.id.slice(0, 8).toUpperCase()}\n\n_Inventory updated automatically._`;
        await WhatsAppService.sendText(from, response);

        const receipt = await ReceiptService.generateReceipt(order.id, binding.tenant_id);
        if (receipt) {
            const receiptLink = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${receipt.id}`;
            await WhatsAppService.sendText(from, `📄 Receipt: ${receiptLink}`);
        }
    }
}
