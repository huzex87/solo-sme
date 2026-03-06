import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Receipt {
    id: string;
    order_id: string;
    receipt_number: string;
    data: Record<string, unknown>; // JSON representation of items, total, tax
    created_at: string;
}

export class ReceiptService {
    /**
     * Generates a unique receipt for an order.
     */
    static async generateReceipt(orderId: string, tenantId: string): Promise<Receipt | null> {
        if (!isSupabaseConfigured) return null;

        // 1. Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            console.error('[ReceiptService] Order fetch failed:', orderError);
            return null;
        }

        // 2. Create receipt data
        const receiptNumber = `SOLO-${Date.now().toString().slice(-6)}-${orderId.slice(0, 4).toUpperCase()}`;
        const receiptData = {
            id: order.id,
            tenant_id: tenantId,
            receipt_number: receiptNumber,
            date: new Date().toISOString(),
            items: order.items,
            total: order.total_amount,
            customer: {
                name: order.customer_name,
                email: order.customer_email
            }
        };

        const { data: receipt, error: receiptError } = await supabase
            .from('receipts')
            .insert({
                order_id: orderId,
                tenant_id: tenantId,
                receipt_number: receiptNumber,
                data: receiptData
            })
            .select()
            .single();

        if (receiptError) {
            console.error('[ReceiptService] Receipt creation failed:', receiptError);
            return null;
        }

        return receipt;
    }

    /**
     * Mock function for sending receipt via WhatsApp.
     */
    static async shareToWhatsApp(phoneNumber: string, receiptId: string, tenantName: string) {
        const url = `${window.location.origin}/receipt/${receiptId}`;
        const message = encodeURIComponent(`Hello! Here is your e-receipt from ${tenantName}: ${url}`);
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        return true;
    }

    /**
     * Mock function for sending receipt via Email.
     */
    static async shareToEmail(email: string, receiptId: string, tenantName: string) {
        const url = `${window.location.origin}/receipt/${receiptId}`;
        const subject = encodeURIComponent(`E-Receipt from ${tenantName}`);
        const body = encodeURIComponent(`Thank you for your purchase! You can view your digital receipt here: ${url}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        return true;
    }
}
