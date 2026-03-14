import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { WhatsAppAuthService, WhatsAppBinding, PendingAction } from '@/services/whatsappAuthService';
import { IntentEngine, ChatTurn } from '@/services/intentEngine';
import { WhatsAppCommandService } from '@/services/whatsappCommandService';
import { AminaIntelligence } from '@/services/aminaIntelligence';
import { TenantService } from '@/services/tenantService';
import { createAdminClient } from '@/lib/supabase/server';
import { WhatsAppService } from '@/services/whatsappService';
import { WhatsAppOnboardingService } from '@/services/whatsappOnboardingService';
import { ProductService } from '@/services/productService';
import redis from '@/lib/redis';

interface WhatsAppMessage {
    from: string;
    id: string;
    text?: { body: string };
}

interface WhatsAppEntry {
    changes?: [{
        value?: {
            messages?: WhatsAppMessage[];
            metadata?: { display_phone_number: string };
        }
    }];
}

interface WhatsAppBody {
    object: string;
    entry?: WhatsAppEntry[];
}

export const dynamic = 'force-dynamic';

/**
 * WhatsApp Webhook Route
 * Orchestrates: Verification → Auth → Confirmation Check → Intent → Execution → Logging
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
    const payload = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // Security: Verify HMAC signature from Meta if secret is configured
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (appSecret && signature) {
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.warn('[WhatsApp Webhook] Invalid signature rejected');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
    }

    let body: WhatsAppBody;
    try {
        body = JSON.parse(payload);
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
    const supabase = await createAdminClient();

    // 1. Resolve Mode: Is this a MERCHANT sending a command, or a CUSTOMER sending an inquiry?

    // Check if the sender is a bound merchant
    const merchantBinding = await WhatsAppAuthService.getTenantByPhone(from, supabase);

    // Check if the recipient is a merchant's business number
    const merchantRecipient = await TenantService.getTenantByPhoneNumber(to, supabase);

    if (merchantBinding) {
        // --- MERCHANT MODE: SOLO Command Assistant ---
        await handleMerchantCommand(from, merchantBinding, text, supabase);
    } else if (merchantRecipient) {
        // --- CUSTOMER MODE: Amina Commerce Assistant ---
        await handleCustomerInquiry(from, to, merchantRecipient, text, supabase);
    } else {
        // --- ONBOARDING MODE: New Merchant Lead ---
        // Check if user is already in an onboarding session or explicitly wants to start
        const onboardingSession = await redis.get(`whatsapp:onboarding:${from}`);
        const isStartCommand = ['START', 'SOLO', 'SIGNUP', 'HI', 'HELLO'].includes(text.toUpperCase().trim());

        if (onboardingSession || isStartCommand) {
            await WhatsAppOnboardingService.handleMessage(from, text);
        } else {
            // Default response for unrecognized numbers not trying to sign up
            console.log(`[WhatsApp Webhook] Unrecognized message: From ${from} To ${to}`);
            await WhatsAppService.sendText(
                from,
                "Welcome to SOLO SME! 🚀\n\nI don't recognize this number. To set up your professional online store in 2 minutes, simply reply *START* or visit solosme.ng"
            );
        }
    }
}

async function handleMerchantCommand(from: string, binding: WhatsAppBinding, text: string, supabase: any) {
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
                await WhatsAppCommandService.resolveConfirmation(from, binding, pending, isYes, supabase);
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
        await WhatsAppCommandService.execute(from, binding, result, supabase);
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
        await WhatsAppAuthService.touchBinding(from, supabase);
    }
}

async function handleCustomerInquiry(from: string, to: string, tenant: { id: string; name: string }, text: string, supabase: any) {
    // 1. Fetch products for context
    const products = await ProductService.getProducts(tenant.id, supabase);

    // 2. Get history (last 5 messages)
    const { data: history } = await supabase
        .from('whatsapp_message_log')
        .select('direction, message_preview')
        .eq('phone_number', from)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const formattedHistory = history?.map((h: { direction: string; message_preview: string }) => ({
        role: (h.direction === 'inbound' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: h.message_preview
    })).reverse() || [] as ChatTurn[];

    // 3. Process with Amina AI
    const response = await AminaIntelligence.processMessage(text, tenant.name, products, formattedHistory);

    // 4. Send response to customer
    await WhatsAppService.sendText(from, response.responseText);

    // 5. Log interaction
    await logMessage(supabase, tenant.id, from, 'inbound', response.intent, text);
    await logMessage(supabase, tenant.id, from, 'outbound', response.intent, response.responseText);
}

async function logMessage(
    supabase: any,
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

/**
 * Normalises a phone number by removing all non-numeric characters.
 * Ensures consistent lookups across Meta and Supabase.
 */
function normalisePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}
