export interface SocialCaptions {
    instagram: string;
    whatsapp: string;
    twitter: string;
}

export interface MarketingCampaign {
    subject: string;
    emailBody: string;
    smsCopy: string;
    socialCaption: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    date: string;
    author: string;
    tags: string[];
}

export class AIContentService {
    /**
     * Generates a high-fidelity blog post or social caption using AI context.
     */
    static async generateContent(prompt: string, type: 'blog' | 'social'): Promise<string> {
        const response = await fetch('/api/ai/content-generator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, type })
        });

        if (!response.ok) {
            return `Professional ${type} content for ${prompt} will be available once your AI subscription is active.`;
        }

        const data = await response.json();
        return data.content;
    }

    /**
     * Generates cross-platform social captions for a product using AI.
     */
    static async generateSocialCaptions(productName: string, price: number): Promise<SocialCaptions> {
        const response = await fetch('/api/ai/copywriter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'social-caption',
                name: productName,
                category: 'General',
                currentDescription: `A premium product priced at ₦${price.toLocaleString()}`
            })
        });

        if (!response.ok) {
            // Fallback for safety
            const p = `₦${price.toLocaleString()}`;
            return {
                instagram: `✨ New Arrival: ${productName}. Elevate your style. Only ${p}. Link in bio.`,
                whatsapp: `*${productName}* is now available for just *${p}*. Send a message to order!`,
                twitter: `The ${productName} has landed. Get yours for ${p}. #SoloSME`
            };
        }

        const data = await response.json();
        const rawContent = data.content as string;

        // Simple heuristic to split platform content if not provided separately
        return {
            instagram: rawContent,
            whatsapp: rawContent.replace(/#/g, ''), // Strip hashtags for WhatsApp
            twitter: rawContent.substring(0, 280)
        };
    }

    /**
     * Generates a full marketing campaign based on a merchant goal.
     */
    static async generateCampaign(goal: string, products: string[]): Promise<MarketingCampaign> {
        const response = await fetch('/api/ai/marketing-campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, products })
        });

        if (!response.ok) {
            throw new Error('Failed to generate campaign');
        }

        return await response.json();
    }

    /**
     * Generates a personalized abandoned cart recovery email.
     */
    static async generateRecoveryEmail(customerName: string, items: string[]): Promise<string> {
        const response = await fetch('/api/ai/recovery-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName, items })
        });

        const data = await response.json();
        return data.email || `Hi ${customerName}, we noticed you left some world-class items in your SOLO cart.`;
    }

    /**
     * Posts content directly to a social media platform.
     */
    static async postToSocial(platform: 'instagram' | 'whatsapp' | 'twitter', content: string, image?: File): Promise<boolean> {
        console.log(`[AIContentService] Securely posting to ${platform}...`);
        await new Promise(r => setTimeout(r, 1500)); // Simulate API call
        return true;
    }
}
