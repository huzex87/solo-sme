import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';
import { TenantService } from '@/services/tenantService';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // 1. Peak at the payload to find tenantId
        let event;
        try {
            event = JSON.parse(payload);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const data = event.data || {};
        const metadata = data.metadata || {};
        const tenantId = metadata.tenantId || metadata.tenant_id;

        if (!tenantId) {
            logger.warn('Paystack webhook received without tenantId in metadata');
            return NextResponse.json({ error: 'Metadata incomplete' }, { status: 400 });
        }

        // 2. Resolve the PLATFORM or TENANT Secret
        // We resolve the tenant but do NOT act on it until signature matches.
        const tenant = await TenantService.getTenant(tenantId);
        const secret = tenant?.business_config?.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY;

        if (!secret) {
            logger.error(`No Paystack secret found for tenant ${tenantId}`);
            return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
        }

        // 3. MANDATORY: Validate signature with the resolved secret BEFORE any processing
        const hash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
        if (hash !== signature) {
            logger.warn(`Invalid Paystack signature rejected for tenant ${tenantId}`);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        logger.info('Paystack webhook verified', { type: event.event, tenantId });

        if (event.event === 'charge.success') {
            const reference = data.reference;
            const orderId = metadata.orderId || metadata.order_id;

            if (orderId) {
                // Call PaymentService to record the successful payment
                // verifyPayment also performs a server-side verify check as a safety double-tap
                const success = await PaymentService.verifyPayment(reference, 'paystack', orderId, tenantId);
                if (success) {
                    logger.info('Processed Paystack payment', { orderId, tenantId });
                } else {
                    logger.error('Failed to process Paystack payment record', { orderId, tenantId });
                }
            } else {
                logger.warn('Paystack webhook missing orderId', { reference, tenantId });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('Paystack webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

