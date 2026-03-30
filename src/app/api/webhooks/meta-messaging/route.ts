import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/services/chatService';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            logger.info('Meta webhook verified successfully');
            return new NextResponse(challenge, { status: 200 });
        } else {
            return new NextResponse('Forbidden', { status: 403 });
        }
    }
    return new NextResponse('Bad Request', { status: 400 });
}

interface MetaMessage {
    from?: string;
    sender?: { id: string };
    text?: { body: string };
    message?: { text: string };
}

interface MetaContact {
    profile?: { name: string };
}

interface MetaWebhookBody {
    object: string;
    entry: Array<{
        id: string;
        changes?: Array<{ value?: { messages?: MetaMessage[]; contacts?: MetaContact[]; metadata?: { display_phone_number: string } } }>;
        messaging?: MetaMessage[];
    }>;
}

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    let body: MetaWebhookBody;
    try {
        body = JSON.parse(payload) as MetaWebhookBody;
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
        if (body.object === 'whatsapp_business_account' || body.object === 'instagram' || body.object === 'page') {
            const entry = body.entry?.[0];
            const wabaId = body.object === 'whatsapp_business_account' ? entry?.id : null;

            // Security: Signature Verification for Sovereign WABA
            if (wabaId && signature) {
                const { WhatsAppService } = await import('@/services/whatsappService');
                const creds = await WhatsAppService.getCredentialsByWabaId(wabaId);
                const appSecret = creds?.appSecret || process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;

                if (appSecret) {
                    const crypto = await import('crypto');
                    const expectedSignature = 'sha256=' + crypto
                        .createHmac('sha256', appSecret)
                        .update(payload)
                        .digest('hex');

                    if (signature !== expectedSignature) {
                        logger.error(`[Meta Webhook] Signature mismatch for WABA: ${wabaId}`);
                        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                    }
                }
            }

            for (const entry of body.entry) {
                const isWhatsapp = body.object === 'whatsapp_business_account';
                const channel = isWhatsapp ? 'whatsapp' : 'instagram';

                const messages = isWhatsapp ? entry.changes?.[0]?.value?.messages : entry.messaging;
                const contacts = isWhatsapp ? entry.changes?.[0]?.value?.contacts : null;

                if (messages && messages.length > 0) {
                    for (const msg of messages) {
                        const senderId = isWhatsapp ? msg.from : msg.sender.id;
                        const text = isWhatsapp ? msg.text?.body : msg.message?.text;
                        const customerName = isWhatsapp && contacts ? contacts[0]?.profile?.name : `User ${senderId.slice(-4)}`;

                        // Look up tenant based on the receiver ID (the business number/page ID)
                        const recipientId = isWhatsapp ? entry.changes?.[0]?.value?.metadata?.display_phone_number : entry.id;

                        // We resolve the tenant using the recipient platform ID
                        const { TenantService } = await import('@/services/tenantService');
                        const { createAdminClient } = await import('@/lib/supabase/server');
                        const supabase = await createAdminClient();
                        const tenant = await TenantService.getTenantByMetaId(recipientId || '', supabase);
                        const tenantId = tenant?.id || 'demo';

                        if (text && senderId) {
                            logger.debug('Processing Meta message', { channel, senderId });

                            // Ensure conversation exists
                            const conversation = await ChatService.findOrCreateConversation(
                                tenantId,
                                senderId,
                                customerName || 'Valued Customer',
                                channel,
                                supabase
                            );

                            // Save incoming message
                            await ChatService.sendMessage(
                                tenantId,
                                conversation.id,
                                text,
                                'customer',
                                supabase
                            );
                        }
                    }
                }
            }
            return NextResponse.json({ status: 'success' });
        }

        return NextResponse.json({ status: 'ignored' }, { status: 404 });
    } catch (error) {
        logger.error('Meta messaging webhook error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
