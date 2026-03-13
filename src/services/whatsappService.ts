import axios, { AxiosError } from 'axios';

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

    private static getBaseUrl(): string {
        return `${process.env.WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    }

    private static async verifyWebhook(query: Record<string, string | null>): Promise<boolean> {
        return query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN;
    }

    private static getHeaders() {
        return {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    private static async post(payload: object): Promise<WhatsAppResponse> {
        try {
            const res = await axios.post(this.getBaseUrl(), payload, {
                headers: this.getHeaders(),
                timeout: 10000 // FIX G: 10s timeout — prevents hanging on Meta API slowness
            });
            return res.data;
        } catch (err) {
            const axiosErr = err as AxiosError;
            console.error('[WhatsAppService] Send failed:', {
                status: axiosErr.response?.status,
                data: axiosErr.response?.data,
                message: axiosErr.message
            });
            throw err; // Re-throw so callers can handle
        }
    }

    /**
     * Sends a plain text message.
     */
    static async sendText(to: string, text: string): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text, preview_url: false }
        });
    }

    /**
     * Sends interactive quick-reply buttons.
     * Maximum 3 buttons per Meta policy. Button titles max 20 chars.
     * FIX H: Use sendList() for 4+ options.
     */
    static async sendButtons(to: string, bodyText: string, buttons: string[]): Promise<WhatsAppResponse> {
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
        });
    }

    /**
     * FIX H: List message — supports up to 10 rows across sections.
     * Use this when you have 4–10 options (buttons are limited to 3).
     */
    static async sendList(
        to: string,
        bodyText: string,
        buttonLabel: string,
        sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
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
        });
    }

    /**
     * FIX I: Sends an image message by URL (for receipts, report charts, etc.)
     */
    static async sendImage(to: string, imageUrl: string, caption?: string): Promise<WhatsAppResponse> {
        return this.post({
            messaging_product: 'whatsapp',
            to,
            type: 'image',
            image: {
                link: imageUrl,
                ...(caption ? { caption } : {})
            }
        });
    }

    /**
     * Sends a pre-approved message template.
     */
    static async sendTemplate(
        to: string,
        templateName: string,
        langCode: string = 'en',
        components: Record<string, unknown>[] = []
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
        });
    }

    /**
     * Broadcasts a template to multiple recipients sequentially.
     * FIX G: Errors per recipient are logged without aborting the loop.
     */
    static async sendBroadcast(
        recipients: string[],
        templateName: string,
        components: Record<string, unknown>[] = []
    ): Promise<{ sent: number; failed: number }> {
        let sent = 0, failed = 0;
        for (const to of recipients) {
            try {
                await this.sendTemplate(to, templateName, 'en', components);
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
