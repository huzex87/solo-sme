import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAuthService } from '@/services/whatsappAuthService';
import { IntentEngine } from '@/services/intentEngine';
import { WhatsAppCommandService } from '@/services/whatsappCommandService';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * WhatsApp Webhook Route (Institutional Layer)
 * Orchestrates: Auth -> Intent -> Execution -> Logging
 */

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (body.object !== 'whatsapp_business_account') return new NextResponse('Not Found', { status: 404 });

        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!message) return NextResponse.json({ success: true });

        const from = message.from;
        const text = message.text?.body;
        if (!text) return NextResponse.json({ success: true });

        // 1. Authentication Check
        const binding = await WhatsAppAuthService.getTenantByPhone(from);

        const supabase = getSupabaseClient();
        // 2. Intent Classification (Parallel with logging for efficiency)
        const [result] = await Promise.all([
            IntentEngine.classify(text),
            supabase.from('whatsapp_message_log').insert({
                tenant_id: binding?.tenant_id || '00000000-0000-0000-0000-000000000000',
                phone_number: from,
                direction: 'inbound',
                intent: 'PROCESSING',
                message_preview: text.substring(0, 100),
                success: true
            })
        ]);

        // 3. Execute Command Logic via Orchestrator
        await WhatsAppCommandService.execute(from, binding, result);

        // 4. Update Log with final classified intent
        await supabase
            .from('whatsapp_message_log')
            .update({ intent: result.intent })
            .eq('phone_number', from)
            .eq('intent', 'PROCESSING')
            .order('created_at', { ascending: false })
            .limit(1);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[WhatsApp Webhook] Fatal Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
