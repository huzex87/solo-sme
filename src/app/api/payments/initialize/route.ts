import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await ratelimit.limit(`payment:${user.id}`);
    if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again.' }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { amount, email, metadata, provider } = body;
        const tenantId = metadata?.tenantId || metadata?.tenant_id;

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required in metadata' }, { status: 400 });
        }

        // Verify the user belongs to this tenant
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        if (!profile || profile.tenant_id !== tenantId) {
            return NextResponse.json({ error: 'Forbidden: tenant mismatch' }, { status: 403 });
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
