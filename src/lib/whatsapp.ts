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
     * Normalizes a phone number into full international format (digits only, no
     * '+', no leading 0) suitable for a wa.me deep link. A wa.me link with a
     * missing or local-format number (e.g. Nigerian "0912...") is invalid and
     * makes WhatsApp open the contact picker instead of the chat.
     *
     * Returns '' when there is no usable number — callers should guard on that
     * and hide the link rather than emit a picker-opening `wa.me/` URL.
     */
    static normalizeWhatsAppNumber(phone: string | null | undefined, defaultCountryCode = '234'): string {
        if (!phone) return '';
        let digits = phone.replace(/\D/g, '');
        if (!digits) return '';
        // Strip an international access prefix like 00234...
        if (digits.startsWith('00')) digits = digits.slice(2);
        // Local format with a trunk 0 (e.g. 0912... -> 234912...)
        if (digits.startsWith('0') && digits.length === 11) {
            return defaultCountryCode + digits.slice(1);
        }
        // Bare national number without the trunk 0 (e.g. 912... -> 234912...)
        if (digits.length === 10) {
            return defaultCountryCode + digits;
        }
        // Otherwise assume it already carries a country code.
        return digits;
    }

    /**
     * Builds a wa.me chat link for a specific number, or returns null when the
     * number is unusable (so the UI can hide the button instead of opening the
     * contact picker).
     */
    static buildChatLink(phone: string | null | undefined, text?: string): string | null {
        const number = this.normalizeWhatsAppNumber(phone);
        if (!number) return null;
        const suffix = text ? `?text=${encodeURIComponent(text)}` : '';
        return `https://wa.me/${number}${suffix}`;
    }

    /**
     * Generates a wa.me deep link for Tier 1 WhatsApp ordering
     */
    static generateOrderLink(merchantPhone: string, merchantName: string, details: WhatsAppOrderDetails): string {
        const sanitizedMerchantPhone = this.normalizeWhatsAppNumber(merchantPhone);

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
