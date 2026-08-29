import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';
import { TenantService } from '@/services/tenantService';
import { logger } from '@/lib/logger';
import { createAdminClient } from '@/lib/supabase/server';

/** Constant-time equality for two secret strings to avoid a timing side channel. */
function timingSafeEqualStr(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length || bufA.length === 0) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get('verif-hash');
        if (!signature) {
            logger.warn('Flutterwave webhook received without signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 1. Signature Verification EARLIER (Metadata-agnostic)
        // This allows Flutterwave validation pings to succeed.
        const globalSecretHash = process.env.FLUTTERWAVE_SECRET_HASH;

        let payload;
        try {
            payload = await req.json();
        } catch {
            // Handle cases where body might be empty or invalid during probe
            payload = {};
        }

        const meta = payload.meta || payload.data?.meta || {};
        const tenantId = meta.tenantId || meta.tenant_id;

        // Resolve secret hash: specific tenant config OR global environment variable
        let secretHash = globalSecretHash;
        if (tenantId) {
            // Service-role read: the base `tenants` table is not anon-readable.
            const tenant = await TenantService.getTenant(tenantId, await createAdminClient());
            if (tenant?.business_config?.flutterwave_secret_hash) {
                secretHash = tenant.business_config.flutterwave_secret_hash;
            }
        }

        if (!secretHash) {
            logger.error(`No Flutterwave secret hash configured (global or for tenant ${tenantId})`);
            return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
        }

        if (!timingSafeEqualStr(signature, secretHash)) {
            logger.warn(`Invalid Flutterwave signature rejected`, { tenantId });
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Metadata Check (Only required for actual processing)
        if (!tenantId) {
            logger.info('Flutterwave validation ping received and verified (no tenantId)');
            return NextResponse.json({ status: 'success', message: 'Validation successful' });
        }

        logger.info('Flutterwave webhook verified', { event: payload.event, tenantId });

        // Process successful charges
        if (payload.event === 'charge.completed' && payload.data?.status === 'successful') {
            const reference = payload.data.tx_ref;
            const orderId = meta.orderId || meta.order_id || payload.data.meta?.orderId;

            if (orderId) {
                const success = await PaymentService.verifyPayment(reference, 'flutterwave', orderId, tenantId);
                if (success) {
                    logger.info('Processed Flutterwave payment', { orderId, tenantId, reference });
                }
            }
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('Flutterwave webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
