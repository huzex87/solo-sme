import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsappService';

import { normalisePhone } from '@/lib/phone';

/**
 * API Route: /api/whatsapp/verify
 * Tests a merchant's WhatsApp connection by sending a welcome message.
 */
export async function POST(req: NextRequest) {
    try {
        const { tenantId, phone, credentials } = await req.json();

        if (!tenantId || !phone) {
            return NextResponse.json({ error: 'Tenant ID and test phone number required' }, { status: 400 });
        }

        // Normalise test phone
        const normalised = normalisePhone(phone);
        if (!normalised) {
            return NextResponse.json({ error: 'Invalid test phone number format' }, { status: 400 });
        }

        console.log(`[WhatsApp Verify] Testing connection for tenant ${tenantId} to ${normalised}`);

        // If credentials are provided in the request (unsaved), use them temporarily
        // Otherwise, WhatsAppService will pull from DB
        let response;
        if (credentials && credentials.accessToken && credentials.phoneNumberId) {
            // Manual test with provided creds (not yet saved to DB)
            const META_API_URL = 'https://graph.facebook.com/v19.0';
            const res = await fetch(`${META_API_URL}/${credentials.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${credentials.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: normalised,
                    type: 'text',
                    text: { body: "✅ SOLO Connection Verified!\n\nYour WhatsApp Business account is successfully linked to your shop. You are now ready to receive automated orders and inquiries. 🚀" }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('[WhatsApp Verify] Meta Error:', errData);
                return NextResponse.json({ 
                    success: false, 
                    error: errData.error?.message || 'Failed to send verification message' 
                }, { status: 400 });
            }
            response = await res.json();
        } else {
            // Test with saved creds
            response = await WhatsAppService.sendText(
                normalised,
                "✅ SOLO Connection Verified!\n\nYour WhatsApp Business account is ready. 🚀",
                tenantId
            );
        }

        return NextResponse.json({ success: true, response });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        console.error('[WhatsApp Verify] Crash:', { message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
