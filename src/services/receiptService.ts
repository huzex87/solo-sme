import { BaseService } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ChatService } from './chatService';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Receipt {
    id: string;
    order_id: string;
    receipt_number: string;
    data: Record<string, unknown>;
    created_at: string;
}

export class ReceiptService extends BaseService {
    protected static serviceName = 'ReceiptService';

    static async generateReceipt(orderId: string, tenantId: string, client?: SupabaseClient): Promise<Receipt | null> {
        if (!isSupabaseConfigured) return null;
        const supabase = await this.getClient(client);

        const { data: existing } = await supabase
            .from('receipts')
            .select('*')
            .eq('order_id', orderId)
            .eq('tenant_id', tenantId)
            .maybeSingle();

        if (existing) return existing as Receipt;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            this.error('Order fetch failed:', orderError);
            return null;
        }

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
            this.error('Receipt creation failed:', receiptError);
            return null;
        }

        return receipt;
    }

    static async shareToWhatsApp(tenantId: string, phoneNumber: string, receiptId: string, tenantName: string) {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/receipt/${receiptId}`;
        const messageText = `Hello! Here is your e-receipt from ${tenantName}: ${url}`;

        try {
            await ChatService.dispatchToMeta(tenantId, 'whatsapp', phoneNumber, messageText);
            return true;
        } catch (error) {
            this.error('WhatsApp dispatch failed:', error);
            if (typeof window !== 'undefined') {
                const message = encodeURIComponent(messageText);
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
            }
            return false;
        }
    }

    static async shareToEmail(email: string, receiptId: string, tenantName: string) {
        if (typeof window === 'undefined') return false;
        const url = `${window.location.origin}/receipt/${receiptId}`;
        const subject = encodeURIComponent(`E-Receipt from ${tenantName}`);
        const body = encodeURIComponent(`Thank you for your purchase! You can view your digital receipt here: ${url}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        return true;
    }
}
