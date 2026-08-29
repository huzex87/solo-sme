import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await req.json();
        const { email, metadata, provider } = body;
        const tenantId = metadata?.tenantId || metadata?.tenant_id;
        const orderId = metadata?.orderId || metadata?.order_id;

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required in metadata' }, { status: 400 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Rate limit by email for guest checkout, or by user id if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        const rateLimitKey = user ? `payment:${user.id}` : `payment:${email}`;
        const { success: rateLimitOk } = await ratelimit.limit(rateLimitKey);
        if (!rateLimitOk) {
            return NextResponse.json({ error: 'Too many requests. Please try again.' }, { status: 429 });
        }

        // PAYMENT INTEGRITY: never trust a client-supplied amount. Bind the
        // charge to the authoritative order total stored in the database. A
        // tampered request cannot lower (or raise) what is actually charged.
        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required in metadata' }, { status: 400 });
        }

        const admin = await createAdminClient();
        const { data: order, error: orderError } = await admin
            .from('orders')
            .select('id, tenant_id, total_amount, status')
            .eq('id', orderId)
            .maybeSingle();

        if (orderError || !order) {
            logger.warn('Payment init: order not found', { orderId, tenantId });
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.tenant_id !== tenantId) {
            logger.warn('Payment init: order/tenant mismatch', { orderId, tenantId, orderTenant: order.tenant_id });
            return NextResponse.json({ error: 'Order does not belong to this store' }, { status: 400 });
        }

        // Do not re-initialize payment for an order that is already settled.
        if (['paid', 'delivered', 'refunded', 'partially_refunded'].includes(order.status)) {
            return NextResponse.json({ error: 'This order has already been paid.' }, { status: 409 });
        }

        const serverAmount = Number(order.total_amount);
        if (!Number.isFinite(serverAmount) || serverAmount <= 0) {
            logger.error('Payment init: invalid stored order total', { orderId, total: order.total_amount });
            return NextResponse.json({ error: 'Order total is invalid' }, { status: 400 });
        }

        const intent = await PaymentService.createPaymentIntent(
            serverAmount,
            email,
            provider,
            tenantId,
            { ...metadata, orderId },
            supabase
        );

        return NextResponse.json({
            authorization_url: intent.checkoutUrl,
            reference: intent.reference
        });
    } catch (error) {
        console.error('[Payment API Error]:', error);
        const errMsg = error instanceof Error ? error.message : 'Internal server error';
        const isClientError = error instanceof Error && (error.message.includes('configured') || error.message.includes('required') || error.message.includes('failed'));
        return NextResponse.json({ error: errMsg }, { status: isClientError ? 400 : 500 });
    }
}
