import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { WhatsAppAuthService, WhatsAppBinding } from '@/services/whatsappAuthService';
import { IntentEngine, ChatTurn, normalisePhone } from '@/services/intentEngine';
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
    type?: string;
    text?: { body: string };
    echo?: boolean;
    interactive?: {
        type: string;
        button_reply?: { id: string; title: string };
        list_reply?: { id: string; title: string; description?: string };
    };
    image?: { caption?: string; link?: string; id?: string };
    video?: { caption?: string; link?: string; id?: string };
    document?: { caption?: string; link?: string; id?: string };
}

interface WhatsAppEntry {
    id: string;
    changes?: Array<{
        value?: {
            messages?: WhatsAppMessage[];
            metadata?: { display_phone_number: string };
            messaging_product: string;
        };
        field: string;
    }>;
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

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.META_WHATSAPP_VERIFY_TOKEN;
    if (mode === 'subscribe' && token === verifyToken) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    let body: WhatsAppBody;
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
    // Trimmed: a stray newline or space from pasting the secret into a dashboard
    // silently breaks the HMAC and every webhook 401s with no other symptom.
    let appSecret = (process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '').trim();

    if (wabaId) {
        const creds = await WhatsAppService.getCredentialsByWabaId(wabaId);
        if (creds?.appSecret?.trim()) {
            appSecret = creds.appSecret.trim();
        }
    }

    if (!appSecret) {
        console.error('[WhatsApp Webhook] No app secret found. WHATSAPP_APP_SECRET and META_APP_SECRET both missing.');
        return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    // Signature verification — warn on mismatch but still process
    // Next.js/Vercel can modify the raw body (middleware, proxy, edge parsing),
    // causing HMAC mismatch even with correct secret. Log for monitoring.
    if (signature && appSecret) {
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        const isValid = sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);

        if (!isValid) {
            console.error(`[WhatsApp Webhook] Signature mismatch! Rejected request for WABA: ${wabaId}`);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
        
        console.log(`[WhatsApp Webhook] Signature verified for WABA: ${wabaId}`);
    } else {
        // Strict requirement for production
        if (process.env.NODE_ENV === 'production' && !process.env.BYPASS_WEBHOOK_SECURITY) {
            console.error(`[WhatsApp Webhook] Missing signature or secret in production. Rejecting.`);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.warn(`[WhatsApp Webhook] No signature or secret — processing in non-production for WABA: ${wabaId}`);
    }

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return NextResponse.json({ success: true });

    if (message.echo) {
        return NextResponse.json({ success: true, ignored: 'echo' });
    }

    const from: string = normalisePhone(message.from || '');
    const to: string = normalisePhone(change?.value?.metadata?.display_phone_number || '');
    const messageId: string = message.id;

    // Extract text from regular text messages, button replies, or list replies
    let text: string | undefined = message.text?.body?.trim();
    if (!text && message.interactive) {
        const interactive = message.interactive;
        text = interactive.button_reply?.title?.trim() || interactive.list_reply?.title?.trim();
    }

    // Handle image/media messages — acknowledge instead of silently dropping
    if (!text && from) {
        const msgType = message.type;
        if (msgType === 'image' || msgType === 'video' || msgType === 'document' || msgType === 'audio') {
            // Check if the caption contains text (images can have captions)
            const caption = message.image?.caption?.trim() ||
                           message.video?.caption?.trim() ||
                           message.document?.caption?.trim();
            if (caption) {
                text = caption;
            } else {
                try {
                    await WhatsAppService.sendText(
                        from,
                        "📷 I received your media! I can't process images yet, but I'm learning.\n\nFor now, please type your request as text. For example:\n• _Add product Ankara Dress 15000 10_\n• _Sold 5 bags rice 25000_\n\nType *MENU* for all options."
                    );
                } catch {
                    // Best effort
                }
                return NextResponse.json({ success: true });
            }
        }
    }

    if (!from || !text) return NextResponse.json({ success: true });

    console.log(`[WhatsApp Webhook] Incoming: from=${from}, text="${text}"`);

    const claim = await claimMessage(messageId, from);
    if (!claim.claimed) {
        console.log(`[WhatsApp Webhook] Duplicate delivery ignored via ${claim.via}: ${messageId}`);
        return NextResponse.json({ success: true, deduped: true });
    }

    if (await isRateLimited(from)) {
        console.warn(`[WhatsApp Webhook] Rate limit exceeded for ${from}`);
        return NextResponse.json({ success: true, rateLimited: true });
    }

    // Acknowledge Meta immediately and do the work afterwards.
    //
    // This used to `await` the whole pipeline, including Gemini classification
    // with its own retries and backoff. When Gemini was slow (or returning 429)
    // the handler outran Meta's webhook timeout, Meta retried delivery, and each
    // retry produced another reply. Responding first removes the trigger entirely.
    after(async () => {
        try {
            await processMessage(from, to, text);
        } catch (err) {
            // No retry here on purpose: processMessage sends WhatsApp messages, so
            // re-running it re-sends them. The previous 3-attempt retry is exactly
            // how a single failure became three identical replies.
            console.error('[WhatsApp Webhook] Processing failed:', { messageId, from, err });
            await recordFailure({ from, to, text, messageId, err });
        }
    });

    return NextResponse.json({ success: true });
}

/**
 * Claims a message exactly once.
 *
 * Redis is the fast path; Postgres is the durable backstop. The primary key on
 * whatsapp_processed_messages makes the claim atomic, so a duplicate delivery
 * loses the insert race even when the cache is entirely gone — which is what
 * happened when the Upstash database was reaped and dedup silently stopped
 * existing.
 */
async function claimMessage(messageId: string, from: string): Promise<{ claimed: boolean; via: string }> {
    if (!messageId) return { claimed: true, via: 'no-message-id' };

    try {
        const key = `whatsapp:msg:${messageId}`;
        if (await redis.get(key)) return { claimed: false, via: 'redis' };
        await redis.set(key, '1', { ex: 300 });
    } catch (err) {
        // Loud on purpose. Swallowing this is what let dedup, rate limiting and
        // the dead-letter queue disappear together without a single symptom.
        console.error('[WhatsApp Webhook] Redis unavailable — falling back to Postgres de-dup:', err);
    }

    try {
        const supabase = await createAdminClient();
        const { error } = await supabase
            .from('whatsapp_processed_messages')
            .insert({ message_id: messageId, phone_number: from });

        if (error) {
            if (error.code === '23505') return { claimed: false, via: 'postgres' };
            console.error('[WhatsApp Webhook] De-dup insert failed:', error);
            // Fail open: dropping a real message is worse than a rare duplicate.
            return { claimed: true, via: 'postgres-error' };
        }
        return { claimed: true, via: 'postgres' };
    } catch (err) {
        console.error('[WhatsApp Webhook] De-dup unavailable entirely:', err);
        return { claimed: true, via: 'unavailable' };
    }
}

/** 30 inbound messages per minute per sender. Falls back to the message log when Redis is down. */
async function isRateLimited(from: string): Promise<boolean> {
    const LIMIT = 30;
    try {
        const key = `whatsapp:rate:${from}`;
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, 60);
        return count > LIMIT;
    } catch {
        // Redis already logged as unavailable in claimMessage; count from Postgres.
    }

    try {
        const supabase = await createAdminClient();
        const since = new Date(Date.now() - 60_000).toISOString();
        const { count, error } = await supabase
            .from('whatsapp_message_log')
            .select('id', { count: 'exact', head: true })
            .eq('phone_number', from)
            .eq('direction', 'inbound')
            .gte('created_at', since);
        if (error) return false;
        return (count ?? 0) > LIMIT;
    } catch {
        return false;
    }
}

/** Records a failed message for inspection. Postgres first, since Redis may be gone. */
async function recordFailure(entry: { from: string; to: string; text: string; messageId: string; err: unknown }) {
    const message = entry.err instanceof Error ? entry.err.message : String(entry.err);
    try {
        const supabase = await createAdminClient();
        await supabase.from('whatsapp_message_log').insert({
            tenant_id: '00000000-0000-0000-0000-000000000000',
            phone_number: entry.from,
            direction: 'inbound',
            intent: 'PROCESSING_FAILED',
            message_preview: entry.text.substring(0, 100),
            success: false,
            error_message: message.substring(0, 500)
        });
    } catch (err) {
        console.error('[WhatsApp Webhook] Could not record failure:', err);
    }
}

async function processMessage(from: string, to: string, text: string) {
    const supabase = await createAdminClient();

    // 1. Resolve Mode: Is this a MERCHANT sending a command, or a CUSTOMER sending an inquiry?
    const merchantBinding = await WhatsAppAuthService.getTenantByPhone(from, supabase);
    const merchantRecipient = await TenantService.getTenantByPhoneNumber(to, supabase);

    console.log(`[WhatsApp Webhook] Resolution: fromMerchant=${!!merchantBinding}, toMerchant=${!!merchantRecipient} (to=${to})`);

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

async function handleMerchantCommand(from: string, binding: WhatsAppBinding, text: string, supabase: SupabaseClient) {
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
        try {
            await WhatsAppService.sendText(
                from,
                "⚠️ Sorry, I couldn't process that command. Please try again or rephrase your message.",
                binding.tenant_id
            );
        } catch {
            // Best-effort error notification
        }
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

async function handleCustomerInquiry(from: string, to: string, tenant: { id: string; name: string }, text: string, supabase: SupabaseClient) {
    try {
        const products = await ProductService.getProducts(tenant.id, supabase).catch(() => []);

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
    } catch (err) {
        console.error('[WhatsApp Webhook] Customer inquiry error:', err);
        try {
            await WhatsAppService.sendText(
                from,
                `Hi! Thanks for reaching out to ${tenant.name}. We're having a brief technical issue but will get back to you shortly. 🙏`
            );
        } catch {
            // Best-effort error notification
        }
    }
}

async function logMessage(
    supabase: SupabaseClient,
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

// Unified normalisePhone is now imported from @/services/intentEngine
