import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/services/orderService';
import { WhatsAppService } from '@/services/whatsappService';
import { logger } from '@/lib/logger';

const STATUS_MESSAGES: Record<string, (trackingId?: string) => string> = {
    dispatched: (id) => `Your order is on its way! 🚚${id ? `\n\nTracking ID: ${id}` : ''}\n\nWe'll notify you once it's delivered.`,
    delivered: () => `Your order has been delivered! ✅\n\nThank you for shopping with us. Please reach out if you have any issues.`,
    failed: (id) => `We were unable to deliver your order.${id ? ` (Tracking: ${id})` : ''}\n\nOur team will contact you to arrange a re-delivery or refund.`,
};

/**
 * Institutional Courier Webhook Handler
 * Receives status updates from carriers (GIGL, Sendbox, DHL etc.)
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const signature = req.headers.get('x-courier-signature');
        const secret = process.env.COURIER_WEBHOOK_SECRET;

        // Basic verification
        if (secret && signature !== secret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trackingId, status, orderId } = payload;

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        // Map courier status to SOLO Order Status
        let mappedStatus: string | null = null;
        const normalizedStatus = status.toLowerCase();

        if (['dispatched', 'in_transit', 'picked_up'].includes(normalizedStatus)) {
            mappedStatus = 'dispatched';
        } else if (['delivered', 'completed', 'arrived'].includes(normalizedStatus)) {
            mappedStatus = 'delivered';
        } else if (['failed', 'delivery_failed', 'undelivered', 'return_to_sender'].includes(normalizedStatus)) {
            mappedStatus = 'failed';
        }

        if (!mappedStatus) {
            logger.info(`[CourierWebhook] Unhandled status "${status}" for order ${orderId} — acknowledged`);
            return NextResponse.json({ success: true, mappedStatus: null });
        }

        // Fetch order to get customer phone and tenant context
        const order = await OrderService.getOrder(orderId, supabase);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Persist tracking ID on the order
        if (trackingId) {
            await supabase
                .from('orders')
                .update({ tracking_id: trackingId })
                .eq('id', orderId);
        }

        // Update order status (skip for 'failed' — keep as 'dispatched' to allow re-delivery)
        if (mappedStatus !== 'failed') {
            const success = await OrderService.updateOrderStatus(orderId, mappedStatus as Parameters<typeof OrderService.updateOrderStatus>[1], supabase);
            if (!success) {
                return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
            }
        }

        // Send WhatsApp notification to customer if they have a phone number
        const customerPhone = order.customer_phone;
        if (customerPhone && STATUS_MESSAGES[mappedStatus]) {
            try {
                const message = STATUS_MESSAGES[mappedStatus](trackingId);
                await WhatsAppService.sendText(customerPhone, message, order.tenant_id);
                logger.info(`[CourierWebhook] WhatsApp notification sent to ${customerPhone} for status "${mappedStatus}"`);
            } catch (waErr) {
                // Non-fatal — log and continue
                logger.warn('[CourierWebhook] WhatsApp notification failed:', waErr);
            }
        }

        logger.info(`[CourierWebhook] Order ${orderId} → ${mappedStatus} (tracking: ${trackingId})`);
        return NextResponse.json({ success: true, mappedStatus });
    } catch (err) {
        logger.error('[CourierWebhook] Process error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
