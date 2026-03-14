import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { TenantService } from '@/services/tenantService';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('verif-hash');
        if (!signature) {
            logger.warn('Flutterwave webhook received without signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        const payload = await req.json();

        // Flutterwave metadata is in the 'meta' field for payments
        const meta = payload.meta || payload.data?.meta || {};
        const tenantId = meta.tenantId || meta.tenant_id;

        if (!tenantId) {
            logger.warn('Flutterwave webhook received without tenantId in metadata');
            return NextResponse.json({ error: 'Metadata incomplete' }, { status: 400 });
        }

        // Resolve the Secret Hash (signature) for verification
        const tenant = await TenantService.getTenant(tenantId);
        // Flutterwave uses a 'Secret Hash' configured in their dashboard for webhooks
        const secretHash = tenant?.business_config?.flutterwave_secret_hash || process.env.FLUTTERWAVE_SECRET_HASH;

        if (!secretHash) {
            logger.error(`No Flutterwave secret hash found for tenant ${tenantId}`);
            return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
        }

        // Validate signature
        // Flutterwave simply sends the configured secret hash in the verif-hash header
        if (signature !== secretHash) {
            logger.warn(`Invalid Flutterwave signature rejected for tenant ${tenantId}`);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        logger.info('Flutterwave webhook verified', { event: payload.event, tenantId });

        // Process successful charges
        if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
            const reference = payload.data.tx_ref;
            const orderId = meta.orderId || meta.order_id || payload.data.meta?.orderId;

            if (orderId) {
                // Call PaymentService to record the successful payment
                const success = await PaymentService.verifyPayment(reference, 'flutterwave', orderId, tenantId);
                if (success) {
                    logger.info('Processed Flutterwave payment', { orderId, tenantId, reference });
                } else {
                    logger.error('Failed to process Flutterwave payment record', { orderId, tenantId, reference });
                }
            } else {
                logger.warn('Flutterwave webhook missing orderId', { reference, tenantId });
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('Flutterwave webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
