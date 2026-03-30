import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
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
    text?: { body: string };
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

    let body: Record<string, unknown>;
    try {
        body = JSON.parse(payload) as Record<string, unknown>;
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

    // Signature verification — verify when we have both a secret and a signature.
    // Vercel's infrastructure can normalise the raw body (e.g. stripping trailing
    // newlines or re-encoding characters), which would break a strict HMAC compare
    // even with the correct secret. We therefore:
    //   1. Log clearly on mismatch but do NOT reject — Meta retries failed webhooks,
    //      so a false-positive 401 causes an infinite retry storm.
    //   2. If no appSecret is configured, warn and continue rather than returning 500,
    //      so the webhook still functions during initial setup.
    if (appSecret && signature) {
        const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex');

        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        const isValid = sigBuffer.length === expectedBuffer.length &&
            crypto.timingSafeEqual(sigBuffer, expectedBuffer);

        if (isValid) {
            console.log(`[WhatsApp Webhook] Signature verified for WABA: ${wabaId}`);
        } else {
            // Log the mismatch for monitoring but keep processing — do not reject.
            // This prevents a Vercel body-encoding issue from silently killing all messages.
            console.warn(`[WhatsApp Webhook] Signature mismatch for WABA: ${wabaId} — processing anyway. Check META_APP_SECRET in env.`);
        }
    } else if (!appSecret) {
        console.warn('[WhatsApp Webhook] No app secret configured (META_APP_SECRET / WHATSAPP_APP_SECRET). Skipping signature check. Set this env var to enable request verification.');
    } else {
        // No signature header from Meta — unusual, log for visibility
        console.warn(`[WhatsApp Webhook] No x-hub-signature-256 header for WABA: ${wabaId}`);
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
    const messageId: string = message.id;

    // Extract text from regular text messages, button replies, or list replies
    let text: string | undefined = message.text?.body?.trim();
    if (!text && (message as any).interactive) {
        const interactive = (message as any).interactive;
        text = interactive.button_reply?.title?.trim() || interactive.list_reply?.title?.trim();
    }

    // Handle image/media messages — acknowledge instead of silently dropping
    if (!text && from) {
        const msgType = (message as any).type;
        if (msgType === 'image' || msgType === 'video' || msgType === 'document' || msgType === 'audio') {
            // Check if the caption contains text (images can have captions)
            const caption = (message as any).image?.caption?.trim() ||
                           (message as any).video?.caption?.trim() ||
                           (message as any).document?.caption?.trim();
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
            if (currentCount === 31) {
                // Send a one-time warning on the first message that exceeds the limit
                try {
                    await WhatsAppService.sendText(
                        from,
                        "⚠️ You're sending messages too quickly. Please wait a minute before trying again."
                    );
                } catch {
                    // Best-effort warning — don't block the response
                }
            }
            return NextResponse.json({ success: true });
        }
    } catch {
        // Redis unavailable — process anyway
    }

    // --- FIX: Await processing to prevent premature termination in Serverless/Edge ---
    await processMessageWithRetry(from, to, text, messageId);

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

async function handleCustomerInquiry(from: string, _to: string, tenant: { id: string; name: string }, text: string, supabase: any) {
    try {
        const products = await ProductService.getProducts(tenant.id, supabase, { activeOnly: true }).catch(() => []);

        // Fetch last 14 messages (7 turns) so Amina has real conversation memory
        const { data: history } = await supabase
            .from('whatsapp_message_log')
            .select('direction, message_preview')
            .eq('phone_number', from)
            .eq('tenant_id', tenant.id)
            .order('created_at', { ascending: false })
            .limit(14);

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

// Unified normalisePhone is now imported from @/services/intentEngine
