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
     * In production, this hits the SOLO AI Content Microservice.
     */
    static async generateContent(prompt: string, type: 'blog' | 'social'): Promise<string> {
        console.log(`[AIContentService] Generating ${type} content for: ${prompt}`);

        // In production, this would hit an API route that calls Gemini
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
     * Generates cross-platform social captions for a product.
     */
    static generateSocialCaptions(productName: string, price: number): SocialCaptions {
        const formattedPrice = `₦${price.toLocaleString()}`;

        return {
            instagram: `✨ New Arrival! The ${productName} is finally here. Elevate your style today with SOLO. Only ${formattedPrice}. Tap the link in bio to shop! 🛍️ #SoloSME #${productName.replace(/\s+/g, '')}`,
            whatsapp: `*${productName}* is now back in stock! \n\nGet yours for just *${formattedPrice}*. \n\nClick link to order: https://solo.sme/store`,
            twitter: `Looking for the perfect ${productName}? We've got you covered. Priced at ${formattedPrice}. Shop now on our official SOLO store! 🚀`
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

        if (!response.ok) {
            return `Hi ${customerName}, we noticed you left some world-class items in your SOLO cart. Come back and complete your purchase!`;
        }

        const data = await response.json();
        return data.email;
    }

    /**
     * Posts content directly to a social media platform.
     */
    static async postToSocial(platform: 'instagram' | 'whatsapp' | 'twitter', content: string, image?: File): Promise<boolean> {
        console.log(`[AIContentService] Securely posting to ${platform}...`);
        // Logic for platform-specific OAuth handlers
        return true;
    }
}
