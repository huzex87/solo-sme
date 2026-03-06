import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, email, reference, metadata, provider, callback_url } = body;

        if (provider !== 'paystack') {
            // Forward to stripe or others if implemented later
            return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
        if (!PAYSTACK_SECRET_KEY) {
            console.warn('[Paystack API] Missing PAYSTACK_SECRET_KEY. Returning fallback.');
            return NextResponse.json({
                authorization_url: `https://checkout.paystack.com/${reference}`,
                reference: reference,
                fallback: true
            });
        }

        // Paystack expects amount in Kobo (NGN * 100)
        const paystackAmount = Math.round(amount * 100);

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: paystackAmount,
                reference,
                metadata,
                callback_url
            })
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error('[Paystack API] Initialization failed:', data);
            return NextResponse.json({ error: data.message || 'Failed to initialize payment' }, { status: 400 });
        }

        return NextResponse.json({
            authorization_url: data.data.authorization_url,
            reference: data.data.reference
        });
    } catch (error) {
        console.error('[Payment API Error]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
