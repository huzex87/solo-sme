import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { getBaseUrl } from '@/lib/baseUrl';
import { OrderService } from '@/services/orderService';
import { ReceiptService } from '@/services/receiptService';
import { WhatsAppService } from '@/services/whatsappService';

export class ReceiptHandler extends IntentHandler {
    intent = 'SEND_RECEIPT';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding } = context;
        const { customer_phone, order_id } = result.entities;

        if (!customer_phone) {
            await WhatsAppService.sendText(from, "What is the customer's phone number to send the receipt to?");
            return;
        }

        let targetOrderId = order_id;
        if (!targetOrderId) {
            const orders = await OrderService.getOrders(binding.tenant_id);
            const latest = orders[0];
            if (!latest) {
                await WhatsAppService.sendText(from, "No orders found to generate a receipt for.");
                return;
            }
            targetOrderId = latest.id;
        }

        const receipt = await ReceiptService.generateReceipt(targetOrderId, binding.tenant_id);
        if (!receipt) {
            await WhatsAppService.sendText(from, "❌ Could not generate receipt. Please try again.");
            return;
        }

        const receiptLink = `${getBaseUrl()}/receipt/${receipt.id}`;
        await WhatsAppService.sendText(
            customer_phone,
            `🧾 *Receipt from SOLO Merchant*\n\nHere is your digital receipt:\n${receiptLink}\n\n_Powered by SOLO SME_`
        );

        await WhatsAppService.sendText(from, `✅ Receipt sent to ${customer_phone}\n\n📄 Link: ${receiptLink}`);
    }
}
