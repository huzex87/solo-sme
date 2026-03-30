import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OrderService } from '@/services/orderService';
import { logger } from '@/lib/logger';

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
        let mappedStatus: 'dispatched' | 'delivered' | null = null;
        const normalizedStatus = status.toLowerCase();

        if (['dispatched', 'in_transit', 'picked_up'].includes(normalizedStatus)) {
            mappedStatus = 'dispatched';
        } else if (['delivered', 'completed', 'arrived'].includes(normalizedStatus)) {
            mappedStatus = 'delivered';
        }

        if (mappedStatus) {
            const success = await OrderService.updateOrderStatus(orderId, mappedStatus, supabase);
            if (!success) {
                return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
            }
            logger.info(`[CourierWebhook] Order ${orderId} updated to ${mappedStatus} via tracking ${trackingId}`);
        }

        return NextResponse.json({ success: true, mappedStatus });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.error('[CourierWebhook] Process error:', { message });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
