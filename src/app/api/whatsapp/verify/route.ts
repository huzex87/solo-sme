import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsappService';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rateLimit';

/**
 * API Route: /api/whatsapp/verify
 * Tests a merchant's WhatsApp connection by sending a welcome message.
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tenantId, phone, credentials } = await req.json();

        if (!tenantId || !phone) {
            return NextResponse.json({ error: 'Tenant ID and test phone number required' }, { status: 400 });
        }

        // Verify user belongs to the tenant they're testing
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();
        if (!profile || profile.tenant_id !== tenantId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Rate limit: 5 test messages per tenant per minute
        const rl = await ratelimit.limit(`whatsapp-verify:${tenantId}`);
        if (!rl.success) {
            return NextResponse.json({ error: 'Too many requests. Please wait before sending another test message.' }, { status: 429 });
        }

        // Normalise test phone
        let normalised = phone.replace(/\D/g, '');
        if (normalised.startsWith('0') && normalised.length === 11) {
            normalised = '234' + normalised.slice(1);
        }
        if (!normalised.startsWith('234')) {
            normalised = '234' + normalised;
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
        console.error('[WhatsApp Verify] Crash:', err);
        return NextResponse.json({ error: (err as Error).message || 'Internal server error' }, { status: 500 });
    }
}
