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

        // 1. SECURITY FIRST: Try platform secret before any DB access.
        //    This prevents DoS via crafted payloads forcing DB lookups.
        const platformSecret = process.env.PAYSTACK_SECRET_KEY;
        let signatureVerified = false;

        if (platformSecret) {
            const platformHash = crypto.createHmac('sha512', platformSecret).update(payload).digest('hex');
            if (platformHash === signature) {
                signatureVerified = true;
            }
        }

        // 2. Parse payload — only after attempting platform verification
        let event;
        try {
            event = JSON.parse(payload);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const data = event.data || {};
        const metadata = data.metadata || {};
        const tenantId = metadata.tenantId || metadata.tenant_id;

        // 3. If platform secret didn't match, try tenant-specific secret (tenant uses own Paystack account)
        if (!signatureVerified) {
            if (!tenantId) {
                logger.warn('Paystack webhook: signature invalid and no tenantId in metadata');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            const tenant = await TenantService.getTenant(tenantId);
            const tenantSecret = tenant?.business_config?.paystack_secret_key;

            if (!tenantSecret) {
                logger.warn(`Paystack webhook: no tenant secret for ${tenantId}, platform verification also failed`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            const tenantHash = crypto.createHmac('sha512', tenantSecret).update(payload).digest('hex');
            if (tenantHash !== signature) {
                logger.warn(`Paystack webhook: invalid signature rejected for tenant ${tenantId}`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            signatureVerified = true;
        }

        if (!signatureVerified) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        if (!tenantId) {
            logger.warn('Paystack webhook received without tenantId in metadata');
            return NextResponse.json({ error: 'Metadata incomplete' }, { status: 400 });
        }

        logger.info('Paystack webhook verified', { type: event.event, tenantId });

        if (event.event === 'charge.success') {
            const reference = data.reference;
            const orderId = metadata.orderId || metadata.order_id;

            if (orderId) {
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

