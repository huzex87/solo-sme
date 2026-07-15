import { NextRequest, NextResponse } from 'next/server';
import { PaymentService, PaymentProvider } from '@/services/paymentService';
import { createAdminClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { reference, provider, orderId, tenantId } = body;

        if (!reference) {
            return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
        }
        if (!provider) {
            return NextResponse.json({ error: 'Payment provider is required' }, { status: 400 });
        }
        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        // Rate limit verification attempts by IP or reference
        const ip = req.headers.get('x-forwarded-for') || 'verify-ip';
        const { success: rateLimitOk } = await ratelimit.limit(`pay-verify:${ip}:${reference.substring(0, 15)}`);
        if (!rateLimitOk) {
            return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
        }

        const supabase = await createAdminClient();
        const success = await PaymentService.verifyPayment(
            reference,
            provider as PaymentProvider,
            orderId || '',
            tenantId,
            supabase
        );

        return NextResponse.json({ success });
    } catch (error) {
        console.error('[Payment Verification API Error]:', error);
        const errMsg = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
