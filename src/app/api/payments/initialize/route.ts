import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await req.json();
        const { amount, email, metadata, provider } = body;
        const tenantId = metadata?.tenantId || metadata?.tenant_id;

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

        const intent = await PaymentService.createPaymentIntent(
            amount,
            email,
            provider,
            tenantId,
            metadata,
            supabase
        );

        return NextResponse.json({
            authorization_url: intent.checkoutUrl,
            reference: intent.reference
        });
    } catch (error) {
        console.error('[Payment API Error]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
