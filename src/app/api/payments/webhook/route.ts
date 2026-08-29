import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';
import { logger } from '@/lib/logger';

/**
 * Paystack Webhook Handler
 * Standard: Hmac-SHA512 Verification
 */
export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        if (!signature) {
            return new Response('No signature', { status: 401 });
        }

        // 1. Verify Signature
        // Note: In production, the secret key should be the Paystack Secret Key
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            logger.error('PAYSTACK_SECRET_KEY not configured for webhook');
            return new Response('Configuration Error', { status: 500 });
        }

        const hash = crypto
            .createHmac('sha512', secret)
            .update(body)
            .digest('hex');

        // Constant-time comparison; never log the expected digest.
        const sigBuf = Buffer.from(signature, 'hex');
        const hashBuf = Buffer.from(hash, 'hex');
        const signatureValid =
            sigBuf.length === hashBuf.length &&
            sigBuf.length > 0 &&
            crypto.timingSafeEqual(sigBuf, hashBuf);

        if (!signatureValid) {
            logger.warn('Paystack Webhook Signature Mismatch');
            return new Response('Invalid Signature', { status: 401 });
        }

        // 2. Parse Event
        const event = JSON.parse(body);
        logger.info(`Paystack Webhook Received: ${event.event}`, { reference: event.data?.reference });

        // 3. Handle charge.success
        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const tenantId = metadata?.tenantId || metadata?.tenant_id;
            const orderId = metadata?.orderId || metadata?.order_id;

            if (reference && tenantId && orderId) {
                const { createAdminClient } = await import('@/lib/supabase/server');
                const supabase = await createAdminClient();
                const verified = await PaymentService.verifyPayment(
                    reference,
                    'paystack',
                    orderId,
                    tenantId,
                    supabase
                );

                if (verified) {
                    logger.info(`Webhook successfully verified payment: ${reference}`);
                    return NextResponse.json({ status: 'success' });
                }
            } else {
                logger.warn('Webhook payload missing critical metadata', { reference, tenantId, orderId });
            }
        }

        // Acknowledge receipt of other events to avoid retries
        return NextResponse.json({ status: 'received' });
    } catch (error) {
        logger.error('Paystack Webhook Processing Error', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
