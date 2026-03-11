import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppAuthService } from '@/services/whatsappAuthService';
import { IntentEngine } from '@/services/intentEngine';
import { WhatsAppCommandService } from '@/services/whatsappCommandService';
import { AminaIntelligence } from '@/services/aminaIntelligence';
import { TenantService } from '@/services/tenantService';
import { ProductService } from '@/services/productService';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

/**
 * Normalises a phone number to the E.164 format WITHOUT the leading '+'.
 * Meta delivers numbers as '2348012345678' (international, no '+').
 * Merchants may register with '08012345678', '+2348012345678', or '2348012345678'.
 * This function ensures all lookups use a consistent canonical key.
 */
function normalisePhone(raw: string): string {
    const digits = raw.replace(/\D/g, ''); // Strip all non-digits
    // Nigerian local format: 08012345678 → 2348012345678
    if (digits.startsWith('0') && digits.length === 11) {
        return '234' + digits.slice(1);
    }
    return digits; // Already international (e.g. 2348012345678)
}

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

    const from: string = normalisePhone(message.from);
    const to: string = normalisePhone(change?.value?.metadata?.display_phone_number || '');
    const text: string | undefined = message.text?.body?.trim();
    const messageId: string = message.id; // Meta message ID — unique per message

    if (!text) return NextResponse.json({ success: true }); // Non-text message (image, audio, etc.)

    // FIX U: Message-level deduplication using Redis.
    // Meta may deliver the same message multiple times (retries on 5xx, timeout, etc.).
    // We use the unique Meta message ID to ensure idempotent processing.
    // TTL of 60s is sufficient — Meta retries happen within seconds of the original.
    try {
        const { default: redis } = await import('@/lib/redis');
        const dedupKey = `whatsapp:msg:${messageId}`;
        const alreadySeen = await redis.get(dedupKey);
        if (alreadySeen) {
            return NextResponse.json({ success: true }); // Duplicate — ack and discard
        }
        await redis.set(dedupKey, '1', { ex: 60 });

        // Per-merchant rate limiting: max 30 messages per 60-second window.
        // Prevents Gemini cost blowout from accidental or malicious flooding.
        const rateLimitKey = `whatsapp:rate:${from}`;
        const currentCount = await redis.incr(rateLimitKey);
        if (currentCount === 1) {
            // First message in window — set 60s TTL
            await redis.expire(rateLimitKey, 60);
        }
        if (currentCount > 30) {
            // Silently ack — do not process, do not send error (avoids feedback loop)
            console.warn(`[WhatsApp Webhook] Rate limit exceeded for ${from} (${currentCount} msgs/min)`);
            return NextResponse.json({ success: true });
        }
    } catch {
        // Redis unavailable — process anyway rather than block
    }

    // Process asynchronously so we ack Meta immediately
    processMessage(from, to, text).catch(err =>
        console.error('[WhatsApp Webhook] Async processing error:', err)
    );

    return NextResponse.json({ success: true });
}

async function processMessage(from: string, to: string, text: string) {
    const supabase = getSupabaseClient();

    // 1. Resolve Mode: Is this a MERCHANT sending a command, or a CUSTOMER sending an inquiry?

    // Check if the sender is a bound merchant
    const merchantBinding = await WhatsAppAuthService.getTenantByPhone(from);

    // Check if the recipient is a merchant's business number
    const merchantRecipient = await TenantService.getTenantByPhoneNumber(to);

    if (merchantBinding) {
        // --- MERCHANT MODE: SOLO Command Assistant ---
        await handleMerchantCommand(from, merchantBinding, text, supabase);
    } else if (merchantRecipient) {
        // --- CUSTOMER MODE: Amina Commerce Assistant ---
        await handleCustomerInquiry(from, to, merchantRecipient, text, supabase);
    } else {
        console.log(`[WhatsApp Webhook] Unrecognized message: From ${from} To ${to}`);
    }
}

async function handleMerchantCommand(from: string, binding: any, text: string, supabase: any) {
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

async function handleCustomerInquiry(from: string, to: string, tenant: any, text: string, supabase: any) {
    // 1. Fetch products for context
    const products = await ProductService.getProducts(tenant.id);

    // 2. Get history (last 5 messages)
    const { data: history } = await supabase
        .from('whatsapp_message_log')
        .select('direction, message_preview')
        .eq('phone_number', from)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const formattedHistory = history?.map((h: any) => ({
        role: h.direction === 'inbound' ? 'user' : 'assistant',
        content: h.message_preview
    })).reverse() || [];

    // 3. Process with Amina AI
    const response = await AminaIntelligence.processMessage(text, tenant.name, products, formattedHistory);

    // 4. Send response to customer
    await WhatsAppService.sendText(from, response.responseText);

    // 5. Log interaction
    await logMessage(supabase, tenant.id, from, 'inbound', response.intent, text);
    await logMessage(supabase, tenant.id, from, 'outbound', response.intent, response.responseText);
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
