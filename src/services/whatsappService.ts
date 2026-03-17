import axios, { AxiosError } from 'axios';
import { createAdminClient } from '@/lib/supabase/server';

export interface WhatsAppAccountCredentials {
    accessToken: string;
    phoneNumberId: string;
    verifyToken?: string;
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
            const supabase = await createAdminClient();
            const { data: account } = await supabase
                .from('whatsapp_accounts')
                .select('access_token, phone_number_id, verify_token')
                .eq('tenant_id', tenantId)
                .eq('is_default', true)
                .maybeSingle();

            if (account) {
                return {
                    accessToken: account.access_token,
                    phoneNumberId: account.phone_number_id,
                    verifyToken: account.verify_token
                };
            }
        }

        // Fallback to global environment variables
        return {
            accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
            phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
            verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || ''
        };
    }

    private static getBaseUrl(creds: WhatsAppAccountCredentials): string {
        return `${process.env.WHATSAPP_API_BASE}/${creds.phoneNumberId}/messages`;
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
}
