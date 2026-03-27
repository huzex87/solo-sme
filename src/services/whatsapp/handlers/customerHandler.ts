import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { CustomerService } from '@/services/customerService';
import { LoyaltyService } from '@/services/loyaltyService';
import { SegmentationService } from '@/services/segmentationService';
import { WhatsAppService } from '@/services/whatsappService';
import { WhatsAppAuthService, PendingAction } from '@/services/whatsappAuthService';
import { formatCurrency } from '@/lib/utils';
import { normalisePhone } from '@/services/intentEngine';

export class CustomerHandler extends IntentHandler {
    intent = 'ADD_CUSTOMER';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { name, phone, email } = result.entities;

        if (!name) {
            await WhatsAppService.sendText(from, "What is the customer's full name?");
            return;
        }

        const contactIdentifier = email || phone || '';
        const customer = await CustomerService.createCustomer(binding.tenant_id, {
            full_name: name,
            email: contactIdentifier
        }, supabase);

        if (!customer) {
            await WhatsAppService.sendText(from, "❌ Error creating customer profile. Please try again.");
            return;
        }

        await WhatsAppService.sendText(from, `👤 *Customer Registered*\n\nName: ${customer.full_name}\nID: ${customer.id.slice(0, 8).toUpperCase()}\n\n_You can now track sales and loyalty for this customer._`);
    }
}

export class LoyaltyHandler extends IntentHandler {
    intent = 'CHECK_LOYALTY';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { customer_name, customer_phone } = result.entities;

        const customers = await CustomerService.getCustomers(binding.tenant_id, supabase);
        const customer = customers.find(c =>
            (customer_name && c.full_name.toLowerCase().includes(customer_name.toLowerCase())) ||
            (customer_phone && c.email === customer_phone)
        );

        if (!customer) {
            await WhatsAppService.sendText(from, "I couldn't find a matching customer.");
            return;
        }

        const loyalty = await LoyaltyService.getAccount(customer.id);
        const discountValue = LoyaltyService.getDiscountValue(loyalty.points);
        await WhatsAppService.sendText(from, `🏅 *Loyalty: ${customer.full_name}*\n\nTier: ${loyalty.tier}\nPoints: ${loyalty.points}\nRedeemable: ${formatCurrency(discountValue)}`);
    }
}

export class PromoHandler extends IntentHandler {
    intent = 'SEND_PROMO';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { segment, message } = result.entities;

        if (!segment) {
            await WhatsAppService.sendButtons(
                from,
                "Which customer segment would you like to target?",
                ['VIP', 'Dormant', 'All Customers']
            );
            return;
        }

        const stats = await SegmentationService.getSegmentStats(binding.tenant_id, supabase);
        const target = stats.find(s => s.segment.toLowerCase() === segment.toLowerCase());

        if (!target || target.count === 0) {
            await WhatsAppService.sendText(from, `No customers found in the "${segment}" segment.`);
            return;
        }

        await WhatsAppAuthService.setPendingConfirmation(from, {
            type: 'SEND_PROMO',
            tenant_id: binding.tenant_id,
            segment: target.segment,
            count: target.count,
            message: message || undefined
        });

        await WhatsAppService.sendButtons(
            from,
            `📢 *Confirm Broadcast?*\n\nSegment: ${target.segment}\nRecipients: ${target.count} customers\n\nMeta messaging charges apply. Confirm to send.`,
            ['YES — Send Now', 'NO — Cancel']
        );
    }

    static async commit(context: HandlerContext, pending: PendingAction): Promise<void> {
        const { from, binding, supabase } = context;
        const customers = await CustomerService.getCustomers(binding.tenant_id, supabase);
        const now = new Date();

        const isPhoneLike = (val: string) => /^\d{7,15}$/.test(val.replace(/[\s+\-()+]/g, ''));

        const segmentedPhones = customers
            .filter(c => {
                const lastDate = c.last_order_at ? new Date(c.last_order_at) : new Date(c.created_at);
                const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (pending.segment === 'VIP') return c.total_spend > 100000;
                if (pending.segment === 'Dormant') return daysSince > 30;
                return true; 
            })
            .map(c => {
                const raw = c.whatsapp_phone || c.phone || (c.email && isPhoneLike(c.email) ? c.email : null);
                return raw ? normalisePhone(raw.replace(/[\s+\-()]/g, '')) : null;
            })
            .filter((p): p is string => !!p);

        if (segmentedPhones.length === 0) {
            await WhatsAppService.sendText(from, `⚠️ No customers in the "${pending.segment}" segment have a WhatsApp phone number on file.`);
            return;
        }

        const promoMessage = pending.message || `Hello! ${binding.tenant_name} has a special offer for you today. 🎉`;

        let sent = 0;
        for (const recipientPhone of segmentedPhones) {
            try {
                await WhatsAppService.sendText(recipientPhone, `📢 *Message from ${binding.tenant_name}*\n\n${promoMessage}\n\n_Reply STOP to opt out._`);
                sent++;
                await new Promise(r => setTimeout(r, 15));
            } catch { /* skip */ }
        }

        await WhatsAppService.sendText(from, `✅ *Broadcast Complete*\n\nSegment: ${pending.segment}\nSent: ${sent} messages\n\n_Full delivery stats in your dashboard._`);
    }
}
