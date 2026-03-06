import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            console.error('[Paystack Webhook] Missing PAYSTACK_SECRET_KEY');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // Validate event
        const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
        if (hash !== signature) {
            console.error('[Paystack Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(payload);
        console.log(`[Paystack Webhook] Received event: ${event.event}`);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;
            const metadata = data.metadata || {};

            // Expected metadata: { orderId: '...', tenantId: '...' }
            const orderId = metadata.orderId || metadata.order_id;
            const tenantId = metadata.tenantId || metadata.tenant_id;

            if (orderId && tenantId) {
                // Call PaymentService to record the successful payment
                const success = await PaymentService.verifyPayment(reference, 'paystack', orderId, tenantId);
                if (success) {
                    console.log(`[Paystack Webhook] Successfully processed payment for order ${orderId}`);
                } else {
                    console.error(`[Paystack Webhook] Failed to process payment record for order ${orderId}`);
                }
            } else {
                console.warn(`[Paystack Webhook] Missing orderId or tenantId in metadata for reference ${reference}`);
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('[Paystack Webhook Error]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
