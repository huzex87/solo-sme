import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/paymentService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, email, metadata, provider } = body;
        const tenantId = metadata?.tenantId || metadata?.tenant_id;

        if (!tenantId) {
            return NextResponse.json({ error: 'Tenant ID is required in metadata' }, { status: 400 });
        }

        const intent = await PaymentService.createPaymentIntent(
            amount,
            email,
            provider,
            tenantId,
            metadata
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

