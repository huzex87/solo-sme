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
    id: string;
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

    let body: any;
    try {
        body = JSON.parse(payload);
    } catch {
        return NextResponse.json({ success: true }); // Malformed JSON — ack and discard
    }

    if (body.object !== 'whatsapp_business_account') {
        return NextResponse.json({ success: true });
    }

    // Dynamic Signature Verification for Sovereign Multi-tenancy
    // The top-level 'id' in the entry is the WhatsApp Business Account ID (WABA ID)
    const wabaId = body.entry?.[0]?.id;
    let appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

    if (wabaId) {
        const creds = await WhatsAppService.getCredentialsByWabaId(wabaId);
        if (creds?.appSecret) {
            appSecret = creds.appSecret;
        }
    }

    if (!appSecret) {
        console.error('[WhatsApp Webhook] No app secret found for signature verification');
        return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        console.warn('[WhatsApp Webhook] Invalid signature rejected');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return NextResponse.json({ success: true });

    // --- FIX: Ignore Echoes ---
    // Meta echoes messages sent by the business back to the webhook.
    // We ignore them to prevent infinite loops or processing our own messages.
    if ((message as any).echo) {
        return NextResponse.json({ success: true, ignored: 'echo' });
    }

    const from: string = normalisePhone(message.from || '');
    const to: string = normalisePhone(change?.value?.metadata?.display_phone_number || '');
    const text: string | undefined = message.text?.body?.trim();
    const messageId: string = message.id;

    if (!from || !text) return NextResponse.json({ success: true });

    try {
        const dedupKey = `whatsapp:msg:${messageId}`;
        const alreadySeen = await redis.get(dedupKey);
        if (alreadySeen) {
            return NextResponse.json({ success: true });
        }
        await redis.set(dedupKey, '1', { ex: 60 });

        const rateLimitKey = `whatsapp:rate:${from}`;
        const currentCount = await redis.incr(rateLimitKey);
        if (currentCount === 1) {
            await redis.expire(rateLimitKey, 60);
        }
        if (currentCount > 30) {
            console.warn(`[WhatsApp Webhook] Rate limit exceeded for ${from}`);
            return NextResponse.json({ success: true });
        }
    } catch {
        // Redis unavailable — process anyway
    }

    processMessageWithRetry(from, to, text, messageId).catch(() => {});

    return NextResponse.json({ success: true });
}

async function processMessageWithRetry(from: string, to: string, text: string, messageId: string, attempt = 1) {
    const MAX_RETRIES = 3;
    try {
        await processMessage(from, to, text);
    } catch (err) {
        console.error(`[WhatsApp Webhook] Processing error (attempt ${attempt}/${MAX_RETRIES}):`, err);
        if (attempt < MAX_RETRIES) {
            // Exponential backoff: 1s, 2s, 4s
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
            return processMessageWithRetry(from, to, text, messageId, attempt + 1);
        }
        // Dead-letter: store failed message in Redis for later inspection
        try {
            await redis.lpush('whatsapp:dlq', JSON.stringify({
                from, to, text, messageId,
                error: err instanceof Error ? err.message : String(err),
                failedAt: new Date().toISOString(),
            }));
            await redis.ltrim('whatsapp:dlq', 0, 999); // Keep last 1000 entries
        } catch {
            // Redis itself failed — nothing more we can do
        }
    }
}

async function processMessage(from: string, to: string, text: string) {
    const supabase = await createAdminClient();

    // 1. Resolve Mode: Is this a MERCHANT sending a command, or a CUSTOMER sending an inquiry?
    const merchantBinding = await WhatsAppAuthService.getTenantByPhone(from, supabase);
    const merchantRecipient = await TenantService.getTenantByPhoneNumber(to, supabase);

    if (merchantBinding) {
        // --- MERCHANT MODE: SOLO Command Assistant ---
        await handleMerchantCommand(from, merchantBinding, text, supabase);
    } else if (merchantRecipient) {
        // --- CUSTOMER MODE: Amina Commerce Assistant ---
        await handleCustomerInquiry(from, to, merchantRecipient, text, supabase);
    } else {
        // --- ONBOARDING MODE: New Merchant Lead ---
        const onboardingSession = await redis.get(`whatsapp:onboarding:${from}`);
        const isStartCommand = ['START', 'SOLO', 'SIGNUP', 'HI', 'HELLO'].includes(text.toUpperCase().trim());

        if (onboardingSession || isStartCommand) {
            await WhatsAppOnboardingService.handleMessage(from, text);
        } else {
            console.log(`[WhatsApp Webhook] Unrecognized message: From ${from} To ${to}`);
            await WhatsAppService.sendText(
                from,
                "Welcome to SOLO SME! 🚀\n\nI don't recognize this number. To set up your professional online store in 2 minutes, simply reply *START* or visit solosme.ng"
            );
        }
    }
}

async function handleMerchantCommand(from: string, binding: WhatsAppBinding, text: string, supabase: any) {
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
            await WhatsAppAuthService.clearPendingConfirmation(from);
        }
    }

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

    const result = await IntentEngine.classify(text);

    try {
        await WhatsAppCommandService.execute(from, binding, result, supabase);
    } catch (err) {
        console.error('[WhatsApp Webhook] Command execution error:', err);
    }

    if (logRow?.id) {
        await supabase
            .from('whatsapp_message_log')
            .update({ intent: result.intent })
            .eq('id', logRow.id);
    }

    if (binding) {
        await WhatsAppAuthService.touchBinding(from, supabase);
    }
}

async function handleCustomerInquiry(from: string, to: string, tenant: { id: string; name: string }, text: string, supabase: any) {
    const products = await ProductService.getProducts(tenant.id, supabase);

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

    const response = await AminaIntelligence.processMessage(text, tenant.name, products, formattedHistory);
    await WhatsAppService.sendText(from, response.responseText, tenant.id);

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

function normalisePhone(phone: string): string {
    return phone.replace(/\D/g, '');
}
