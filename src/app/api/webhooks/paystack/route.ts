import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PaymentService } from '@/services/paymentService';
import { TenantService } from '@/services/tenantService';
import { logger } from '@/lib/logger';
import { createClient, createAdminClient } from '@/lib/supabase/server';

/**
 * Constant-time comparison of two hex-encoded HMAC digests.
 * Falls back to `false` on any length mismatch, avoiding the timing side
 * channel of a naive `===` string comparison.
 */
function timingSafeEqualHex(a: string, b: string): boolean {
    try {
        const bufA = Buffer.from(a, 'hex');
        const bufB = Buffer.from(b, 'hex');
        if (bufA.length !== bufB.length || bufA.length === 0) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

async function handleDisputeEvent(event: { event: string }, data: Record<string, unknown>, tenantId: string) {
    try {
        const supabase = await createClient();
        const disputeRef = (data.transaction as Record<string, unknown>)?.reference as string | undefined || data.reference as string | undefined;
        const amount = (data.transaction as Record<string, unknown>)?.amount as number | undefined || data.amount as number | undefined;
        const resolution = data.resolution as string | undefined;
        const dueDate = data.due_date as string | undefined;

        const disputeStatus =
            event.event === 'dispute.create' ? 'open' :
            event.event === 'dispute.remind' ? 'awaiting_merchant_response' :
            'resolved';

        // Upsert dispute record keyed by transaction reference + tenantId
        const { error } = await supabase
            .from('disputes')
            .upsert({
                tenant_id: tenantId,
                payment_ref: disputeRef,
                amount: amount ? amount / 100 : null, // Paystack amounts are in kobo
                status: disputeStatus,
                resolution: resolution || null,
                due_date: dueDate || null,
                raw_payload: data,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'tenant_id,payment_ref',
                ignoreDuplicates: false,
            });

        if (error) {
            // Table may not exist yet — log and continue rather than crashing the webhook
            logger.warn('[Paystack] Could not upsert dispute record (table may be pending migration):', error.message);
        } else {
            logger.info(`[Paystack] Dispute ${disputeStatus} recorded`, { tenantId, disputeRef });
        }
    } catch (err) {
        logger.error('[Paystack] handleDisputeEvent failed:', err);
    }
}

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
            if (timingSafeEqualHex(platformHash, signature)) {
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

            // Read the tenant secret with the service-role client — the base
            // `tenants` table is not readable by the anon role.
            const tenant = await TenantService.getTenant(tenantId, await createAdminClient());
            const tenantSecret = tenant?.business_config?.paystack_secret_key;

            if (!tenantSecret) {
                logger.warn(`Paystack webhook: no tenant secret for ${tenantId}, platform verification also failed`);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            const tenantHash = crypto.createHmac('sha512', tenantSecret).update(payload).digest('hex');
            if (!timingSafeEqualHex(tenantHash, signature)) {
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
        } else if (
            event.event === 'dispute.create' ||
            event.event === 'dispute.remind' ||
            event.event === 'dispute.resolve'
        ) {
            await handleDisputeEvent(event, data, tenantId);
        } else if (event.event === 'subscription.create' || event.event === 'subscription.enable') {
            const planName = data.plan?.name?.toLowerCase() || '';
            const planCode = data.plan?.plan_code || '';
            
            let tier = 'starter';
            if (planName.includes('growth') || planCode === process.env.PAYSTACK_GROWTH_PLAN_CODE) {
                tier = 'growth';
            } else if (planName.includes('enterprise') || planCode === process.env.PAYSTACK_ENTERPRISE_PLAN_CODE) {
                tier = 'enterprise';
            }

            await TenantService.updateTenant(tenantId, {
                platform_tier: tier,
                is_active: true
            });
            logger.info(`Platform subscription activated for tenant ${tenantId}`, { tier, planCode });
        } else if (event.event === 'subscription.disable') {
            await TenantService.updateTenant(tenantId, {
                platform_tier: 'starter'
            });
            logger.info(`Platform subscription disabled for tenant ${tenantId}. Degraded to starter tier.`);
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('Paystack webhook error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

