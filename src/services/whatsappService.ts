import axios from 'axios';

/**
 * WhatsApp Business Cloud API Service
 * Centralized sender for plain text, interactive buttons, and templates.
 */
export class WhatsAppService {
    private static readonly BASE_URL = `${process.env.WHATSAPP_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    private static readonly HEADERS = {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    /**
     * Sends a plain text message to a merchant.
     */
    static async sendText(to: string, text: string): Promise<any> {
        return axios.post(this.BASE_URL, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to,
            type: 'text',
            text: { body: text, preview_url: false }
        }, { headers: this.HEADERS });
    }

    /**
     * Sends interactive quick-reply buttons.
     * Maximum 3 buttons as per Meta limits.
     */
    static async sendButtons(to: string, bodyText: string, buttons: string[]): Promise<any> {
        return axios.post(this.BASE_URL, {
            messaging_product: 'whatsapp',
            to,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: { text: bodyText },
                action: {
                    buttons: buttons.slice(0, 3).map((label, i) => ({
                        type: 'reply',
                        reply: { id: `qr_${i}`, title: label }
                    }))
                }
            }
        }, { headers: this.HEADERS });
    }

    /**
     * Sends a pre-approved message template.
     * Components are optional and used for variable substitution {{1}}, {{2}}, etc.
     */
    static async sendTemplate(to: string, templateName: string, langCode: string = 'en', components: any[] = []): Promise<any> {
        return axios.post(this.BASE_URL, {
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: langCode },
                components
            }
        }, { headers: this.HEADERS });
    }

    /**
     * Broadcasts a template to multiple recipients.
     * Note: This is a sequential implementation for Phase 3.
     */
    static async sendBroadcast(recipients: string[], templateName: string, components: any[] = []): Promise<void> {
        for (const to of recipients) {
            try {
                await this.sendTemplate(to, templateName, 'en', components);
            } catch (err) {
                console.error(`[WhatsAppService] Broadcast failed for ${to}:`, err);
            }
        }
    }
}
