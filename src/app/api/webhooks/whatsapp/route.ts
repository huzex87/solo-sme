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
 * WhatsApp Webhook Route
 * Orchestrates: Verification → Auth → Confirmation Check → Intent → Execution → Logging
 *
 * FIX 1: Added pending confirmation intercept BEFORE intent classification.
 *         Merchants who reply YES/NO to a staged action now hit the right handler
 *         instead of being classified as UNKNOWN intents.
 * FIX 2: Inbound log now stores the classified intent after execution (not "PROCESSING")
 *         to prevent ghost PROCESSING rows from accumulating in the message log.
 * FIX 3: Webhook now returns 200 OK immediately to Meta on all non-fatal paths.
 *         Previously a 500 on command errors caused Meta to retry the same message,
 *         creating duplicate transactions.
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
    // FIX 3: Always return 200 to Meta. Process async, never let errors trigger retries.
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ success: true }); // Malformed JSON — ack and discard
    }

    if (body.object !== 'whatsapp_business_account') {
        return NextResponse.json({ success: true });
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return NextResponse.json({ success: true });

    const from: string = message.from;
    const text: string | undefined = message.text?.body?.trim();

    if (!text) return NextResponse.json({ success: true }); // Non-text message (image, audio, etc.)

    // Process asynchronously so we ack Meta immediately
    processMessage(from, text).catch(err =>
        console.error('[WhatsApp Webhook] Async processing error:', err)
    );

    return NextResponse.json({ success: true });
}

async function processMessage(from: string, text: string) {
    const supabase = getSupabaseClient();

    // 1. Auth Check
    const binding = await WhatsAppAuthService.getTenantByPhone(from);

    // 2. FIX 1: Check for a pending confirmation BEFORE classifying intent.
    //    If the merchant typed YES/NO/CONFIRM in response to a staged action,
    //    route it directly to the confirmation handler — skip Gemini entirely.
    if (binding) {
        const pending = await WhatsAppAuthService.getPendingConfirmation(from);
        if (pending) {
            const upper = text.toUpperCase().trim();
            const isYes = ['YES', 'Y', 'CONFIRM', 'OK', 'SEND NOW', 'YEP', 'YEAH'].includes(upper);
            const isNo = ['NO', 'N', 'CANCEL', 'STOP', 'ABORT', 'NOPE'].includes(upper);

            if (isYes || isNo) {
                await WhatsAppCommandService.resolveConfirmation(from, binding, pending, isYes);
                await logMessage(supabase, binding.tenant_id, from, 'inbound',
                    isYes ? 'CONFIRM_YES' : 'CONFIRM_NO', text);
                return;
            }
            // If not YES/NO, clear stale pending and classify normally
            await WhatsAppAuthService.clearPendingConfirmation(from);
        }
    }

    // 3. Log inbound with PROCESSING placeholder
    const { data: logRow } = await supabase
        .from('whatsapp_message_log')
        .insert({
            tenant_id: binding?.tenant_id || '00000000-0000-0000-0000-000000000000',
            phone_number: from,
            direction: 'inbound',
            intent: 'PROCESSING',
            message_preview: text.substring(0, 100),
            success: true
        })
        .select('id')
        .single();

    // 4. Classify intent
    const result = await IntentEngine.classify(text);

    // 5. Execute command
    try {
        await WhatsAppCommandService.execute(from, binding, result);
    } catch (err) {
        console.error('[WhatsApp Webhook] Command execution error:', err);
        // Do not rethrow — we still want to update the log
    }

    // FIX 2: Update the specific log row with final intent (no ambiguous WHERE clause)
    if (logRow?.id) {
        await supabase
            .from('whatsapp_message_log')
            .update({ intent: result.intent })
            .eq('id', logRow.id);
    }

    // Touch binding activity timestamp
    if (binding) {
        await WhatsAppAuthService.touchBinding(from);
    }
}

async function logMessage(
    supabase: ReturnType<typeof getSupabaseClient>,
    tenantId: string,
    phoneNumber: string,
    direction: 'inbound' | 'outbound',
    intent: string,
    content: string
) {
    await supabase.from('whatsapp_message_log').insert({
        tenant_id: tenantId,
        phone_number: phoneNumber,
        direction,
        intent,
        message_preview: content.substring(0, 100),
        success: true
    });
}
