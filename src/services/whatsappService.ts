import axios, { AxiosError } from 'axios';
import { normalisePhone } from '@/lib/phone';
// Admin client is dynamically imported to avoid breaking client-side builds

/** Meta's customer service window: free-form sends are only allowed within 24h of the last inbound message. */
const SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** A template Meta has actually approved, usable right now. */
export interface ApprovedTemplate {
    template_name: string;
    body_text: string | null;
    param_count: number;
    language: string;
}

/** Outcome of a proactive (business-initiated) send. */
export interface OutboundResult {
    delivered: boolean;
    /** 'freeform' = sent inside the service window; 'template' = pre-approved template; 'skipped' = nothing sent. */
    mode: 'freeform' | 'template' | 'skipped';
    reason?: string;
}

export interface WhatsAppAccountCredentials {
    accessToken: string;
    phoneNumberId: string;
    wabaId?: string;
    verifyToken?: string;
    appSecret?: string;
}

/**
 * WhatsApp Business Cloud API Service
 * Centralized sender for text, interactive buttons, lists, and templates.
 *
 * FIX G: Added error handling with structured logging — silent failures were
 *        swallowing send errors and leaving merchants with no response.
 * FIX H: Added sendList() for commands that return more than 3 options
 *        (Meta button limit is 3; list messages support up to 10 rows).
 * FIX I: Added sendImage() for receipt and report sharing via image URL.
 * FIX J: HEADERS are now computed at call-time, not at module load time,
 *        so env vars are read after Next.js initialises them.
 */

export interface WhatsAppResponse {
    messaging_product: string;
    contacts: Array<{ input: string; wa_id: string }>;
    messages: Array<{ id: string }>;
}

export class WhatsAppService {

    private static async getCredentials(tenantId?: string): Promise<WhatsAppAccountCredentials> {
        if (tenantId) {
            // Only import server logic when actually running in a server context
            const { createAdminClient } = await import('@/lib/supabase/server');
            const supabase = await createAdminClient();
            const { data: account } = await supabase
                .from('whatsapp_accounts')
                .select('access_token, phone_number_id, verify_token, waba_id, app_secret')
                .eq('tenant_id', tenantId)
                .eq('is_default', true)
                .maybeSingle();

            if (account) {
                return {
                    accessToken: (account.access_token || '').trim(),
                    phoneNumberId: (account.phone_number_id || '').trim(),
                    wabaId: (account.waba_id || '').trim(),
                    verifyToken: (account.verify_token || '').trim(),
                    appSecret: (account.app_secret || '').trim()
                };
            }
        }

        // Fallback to global environment variables (check both naming conventions)
        return {
            accessToken: (process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_ACCESS_TOKEN || '').trim(),
            phoneNumberId: (process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '').trim(),
            wabaId: (process.env.WABA_ID || '').trim(),
            verifyToken: (process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.META_WHATSAPP_VERIFY_TOKEN || '').trim(),
            appSecret: (process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '').trim()
        };
    }

    /**
     * Resolves credentials by WABA ID (useful for multi-tenant webhook routing)
     */
    static async getCredentialsByWabaId(wabaId: string): Promise<WhatsAppAccountCredentials | null> {
        const { createAdminClient } = await import('@/lib/supabase/server');
        const supabase = await createAdminClient();
        const { data: account } = await supabase
            .from('whatsapp_accounts')
            .select('access_token, phone_number_id, verify_token, waba_id, app_secret, tenant_id')
            .eq('waba_id', wabaId)
            .maybeSingle();

        if (account) {
            return {
                accessToken: account.access_token,
                phoneNumberId: account.phone_number_id,
                wabaId: account.waba_id,
                verifyToken: account.verify_token,
                appSecret: account.app_secret
            };
        }
        return null;
    }

    private static getBaseUrl(creds: WhatsAppAccountCredentials): string {
        const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v19.0';
        if (!creds.phoneNumberId) {
            throw new Error(`WhatsApp Phone Number ID is missing (creds: ${JSON.stringify(creds)})`);
        }
        return `${base}/${creds.phoneNumberId}/messages`;
    }

    private static async verifyWebhook(query: Record<string, string | null>, tenantId?: string): Promise<boolean> {
        const creds = await this.getCredentials(tenantId);
        return query['hub.verify_token'] === creds.verifyToken;
    }

    private static getHeaders(creds: WhatsAppAccountCredentials) {
        return {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    private static async post(payload: object, tenantId?: string): Promise<WhatsAppResponse> {
        const creds = await this.getCredentials(tenantId);
        try {
            const res = await axios.post(this.getBaseUrl(creds), payload, {
                headers: this.getHeaders(creds),
                timeout: 10000
            });
            return res.data;
        } catch (err) {
            const axiosErr = err as AxiosError;
            console.error('[WhatsAppService] Send failed:', {
                status: axiosErr.response?.status,
                data: axiosErr.response?.data,
                message: axiosErr.message,
                tenantId
            });
            throw err;
        }
    }

    /**
     * Sends a plain text message.
     */
    static async sendText(to: string, text: string, tenantId?: string): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text, preview_url: false }
        }, tenantId);
    }

    /**
     * Sends interactive quick-reply buttons.
     */
    static async sendButtons(to: string, bodyText: string, buttons: string[], tenantId?: string): Promise<WhatsAppResponse> {
        const capped = buttons.slice(0, 3).map(label => label.slice(0, 20));
        return this.post({
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: { text: bodyText },
                action: {
                    buttons: capped.map((label, i) => ({
                        type: 'reply',
                        reply: { id: `btn_${i}_${Date.now()}`, title: label }
                    }))
                }
            }
        }, tenantId);
    }

    /**
     * FIX H: List message — supports up to 10 rows across sections.
     * Use this when you have 4–10 options (buttons are limited to 3).
     */
    static async sendList(
        to: string,
        bodyText: string,
        buttonLabel: string,
        sections: { title: string; rows: { id: string; title: string; description?: string }[] }[],
        tenantId?: string
    ): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'list',
                body: { text: bodyText },
                action: {
                    button: buttonLabel.slice(0, 20),
                    sections
                }
            }
        }, tenantId);
    }

    /**
     * FIX I: Sends an image message by URL (for receipts, report charts, etc.)
     */
    static async sendImage(to: string, imageUrl: string, caption?: string, tenantId?: string): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            to,
            type: 'image',
            image: {
                link: imageUrl,
                ...(caption ? { caption } : {})
            }
        }, tenantId);
    }

    /**
     * Sends a pre-approved message template.
     */
    static async sendTemplate(
        to: string,
        templateName: string,
        langCode: string = 'en',
        components: Record<string, unknown>[] = [],
        tenantId?: string
    ): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: langCode },
                components
            }
        }, tenantId);
    }

    /**
     * Broadcasts a template to multiple recipients sequentially.
     * FIX G: Errors per recipient are logged without aborting the loop.
     */
    static async sendBroadcast(
        recipients: string[],
        templateName: string,
        components: Record<string, unknown>[] = [],
        tenantId?: string
    ): Promise<{ sent: number; failed: number }> {
        let sent = 0, failed = 0;
        for (const to of recipients) {
            try {
                await this.sendTemplate(to, templateName, 'en', components, tenantId);
                sent++;
                // Rate-limiting: Meta enforces ~80 messages/second; 15ms gap is safe
                await new Promise(r => setTimeout(r, 15));
            } catch (err) {
                console.error(`Broadcast failure for ${to}:`, err);
                failed++;
            }
        }
        return { sent, failed };
    }

    /**
     * Builds the `components` payload for a template with body variables.
     */
    static buildBodyParams(params: string[]): Record<string, unknown>[] {
        if (!params.length) return [];
        return [{
            type: 'body',
            parameters: params.map(text => ({ type: 'text', text }))
        }];
    }

    /**
     * True when the recipient messaged us within the last 24 hours, i.e. the
     * customer service window is open and free-form messages will deliver.
     *
     * Fails closed: if we can't prove the window is open we report false, so
     * callers fall back to a template (which always delivers) rather than
     * sending a free-form message Meta will reject.
     */
    static async isWithinServiceWindow(to: string, tenantId?: string): Promise<boolean> {
        const phone = normalisePhone(to);
        if (!phone) return false;

        try {
            const { createAdminClient } = await import('@/lib/supabase/server');
            const supabase = await createAdminClient();
            const since = new Date(Date.now() - SERVICE_WINDOW_MS).toISOString();

            let query = supabase
                .from('whatsapp_message_log')
                .select('id')
                .eq('phone_number', phone)
                .eq('direction', 'inbound')
                .gte('created_at', since)
                .limit(1);

            if (tenantId) query = query.eq('tenant_id', tenantId);

            const { data, error } = await query;
            if (error) {
                console.error('[WhatsAppService] Service window check failed:', { error, phone, tenantId });
                return false;
            }
            return (data?.length ?? 0) > 0;
        } catch (err) {
            console.error('[WhatsAppService] Service window check threw:', err);
            return false;
        }
    }

    /**
     * Templates Meta has APPROVED, read live from the Graph API.
     *
     * Meta is the source of truth here, deliberately. The whatsapp_templates table
     * records which templates we intend to have and their submitted body text, but
     * nothing pushes Meta's review outcome back into it — so gating on the local
     * `status` column would leave the picker permanently empty once Meta approves.
     *
     * `hello_world` is filtered out: Meta rejects it from production numbers with
     * error 131058 (test numbers only), so offering it would guarantee a failed send.
     */
    static async listApprovedTemplates(tenantId?: string): Promise<ApprovedTemplate[]> {
        const creds = await this.getCredentials(tenantId);
        if (!creds.accessToken || !creds.wabaId) {
            console.warn('[WhatsAppService] Cannot list templates — missing access token or WABA ID.');
            return [];
        }

        const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v19.0';
        try {
            const res = await axios.get(`${base}/${creds.wabaId}/message_templates`, {
                headers: { Authorization: `Bearer ${creds.accessToken}` },
                params: { fields: 'name,status,language,components', limit: 100 },
                timeout: 10000
            });

            type MetaComponent = { type?: string; text?: string };
            type MetaTemplate = { name?: string; status?: string; language?: string; components?: MetaComponent[] };

            return ((res.data?.data || []) as MetaTemplate[])
                .filter(t => t.status === 'APPROVED' && t.name && t.name !== 'hello_world')
                .map(t => {
                    const body = t.components?.find(c => c.type?.toUpperCase() === 'BODY')?.text || null;
                    return {
                        template_name: t.name as string,
                        body_text: body,
                        // Highest placeholder index, not the match count — {{1}} {{1}} {{2}} needs 2 params.
                        param_count: body
                            ? [...body.matchAll(/\{\{(\d+)\}\}/g)]
                                  .reduce((max, m) => Math.max(max, Number(m[1])), 0)
                            : 0,
                        language: t.language || 'en'
                    };
                });
        } catch (err) {
            const axiosErr = err as AxiosError;
            console.error('[WhatsAppService] listApprovedTemplates failed:', {
                status: axiosErr.response?.status,
                data: axiosErr.response?.data,
                tenantId
            });
            return [];
        }
    }

    /**
     * Bulk form of isWithinServiceWindow — resolves a whole recipient list in one
     * query. Use this for campaigns; calling isWithinServiceWindow per recipient
     * would issue one round-trip each.
     *
     * Returns the set of NORMALISED phone numbers whose window is open. Fails
     * closed: on error it returns an empty set, so every recipient takes the
     * template path.
     */
    static async filterWithinServiceWindow(phones: string[], tenantId?: string): Promise<Set<string>> {
        const normalised = [...new Set(phones.map(normalisePhone).filter(Boolean))];
        if (!normalised.length) return new Set();

        try {
            const { createAdminClient } = await import('@/lib/supabase/server');
            const supabase = await createAdminClient();
            const since = new Date(Date.now() - SERVICE_WINDOW_MS).toISOString();

            let query = supabase
                .from('whatsapp_message_log')
                .select('phone_number')
                .in('phone_number', normalised)
                .eq('direction', 'inbound')
                .gte('created_at', since);

            if (tenantId) query = query.eq('tenant_id', tenantId);

            const { data, error } = await query;
            if (error) {
                console.error('[WhatsAppService] Bulk service window check failed:', { error, tenantId });
                return new Set();
            }
            return new Set((data || []).map((r: { phone_number: string }) => r.phone_number));
        } catch (err) {
            console.error('[WhatsAppService] Bulk service window check threw:', err);
            return new Set();
        }
    }

    /**
     * Single entry point for PROACTIVE (business-initiated) messages — automations,
     * campaigns, alerts. Anything the merchant did not just reply to.
     *
     * Inside the 24h service window it sends the free-form text/image. Outside it,
     * free-form sends are rejected by Meta, so it falls back to the supplied
     * pre-approved template. With no template configured it skips and says so,
     * rather than firing a send that silently fails.
     *
     * Use sendText/sendImage directly only when replying inside a live conversation.
     */
    static async sendOutbound(opts: {
        to: string;
        tenantId?: string;
        text: string;
        imageUrl?: string;
        template?: { name: string; language?: string; params?: string[] };
    }): Promise<OutboundResult> {
        const { to, tenantId, text, imageUrl, template } = opts;

        if (!normalisePhone(to)) {
            return { delivered: false, mode: 'skipped', reason: 'invalid_phone' };
        }

        const windowOpen = await this.isWithinServiceWindow(to, tenantId);

        if (windowOpen) {
            try {
                if (imageUrl) {
                    await this.sendImage(to, imageUrl, text, tenantId);
                } else {
                    await this.sendText(to, text, tenantId);
                }
                return { delivered: true, mode: 'freeform' };
            } catch (err) {
                return {
                    delivered: false,
                    mode: 'freeform',
                    reason: err instanceof Error ? err.message : 'freeform_send_failed'
                };
            }
        }

        if (!template) {
            return { delivered: false, mode: 'skipped', reason: 'outside_service_window_no_template' };
        }

        try {
            await this.sendTemplate(
                to,
                template.name,
                template.language || 'en',
                this.buildBodyParams(template.params || []),
                tenantId
            );
            return { delivered: true, mode: 'template' };
        } catch (err) {
            return {
                delivered: false,
                mode: 'template',
                reason: err instanceof Error ? err.message : 'template_send_failed'
            };
        }
    }
}
