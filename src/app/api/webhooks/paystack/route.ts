import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            logger.error('Missing PAYSTACK_SECRET_KEY in production environment');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // Validate event
        const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
        if (hash !== signature) {
            logger.warn('Invalid Paystack signature rejected');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(payload);
        logger.debug('Paystack webhook event received', { type: event.event });

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
                    logger.info('Processed Paystack payment', { orderId });
                } else {
                    logger.error('Failed to process Paystack payment record', { orderId });
                }
            } else {
                logger.warn('Paystack webhook metadata incomplete', { reference });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('Paystack webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
