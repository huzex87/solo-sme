export interface WhatsAppOrderDetails {
    orderId: string;
    customerName: string;
    customerPhone: string;
    items: Array<{ name: string; quantity: number }>;
    totalAmount: number;
    currency: string;
    deliveryType: 'delivery' | 'pickup';
    address?: string;
}

export class WhatsAppUtils {
    /**
     * Sanitizes a phone number for Meta/WhatsApp API (removes non-digits)
     */
    static sanitizePhoneNumber(phone: string): string {
        return phone.replace(/\D/g, '');
    }

    /**
     * Generates a wa.me deep link for Tier 1 WhatsApp ordering
     */
    static generateOrderLink(merchantPhone: string, merchantName: string, details: WhatsAppOrderDetails): string {
        const sanitizedMerchantPhone = this.sanitizePhoneNumber(merchantPhone);

        const itemsList = details.items
            .map(i => `• ${i.name} (x${i.quantity})`)
            .join('\n');

        const amountFormatted = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: details.currency,
        }).format(details.totalAmount);

        const message = `Hello ${merchantName}! 👋

I'd like to complete my order from your SOLO store:

Order ID: #${details.orderId.slice(0, 8)}

Items:
${itemsList}

Total: ${amountFormatted}

My Details:
Name: ${details.customerName}
Phone: ${details.customerPhone}
${details.deliveryType === 'delivery' ? `Address: ${details.address}` : 'Method: Pickup'}

Looking forward to hearing from you!`;

        return `https://wa.me/${sanitizedMerchantPhone}?text=${encodeURIComponent(message)}`;
    }
}
