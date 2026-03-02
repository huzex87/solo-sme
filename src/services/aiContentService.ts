export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    date: string;
    image?: string;
    author: string;
    tags: string[];
}

export interface SocialCaptions {
    instagram: string;
    whatsapp: string;
    twitter: string;
}

export class AIContentService {
    /**
     * Generates a high-fidelity blog post or social caption using AI context.
     */
    static async generateContent(prompt: string, type: 'blog' | 'social'): Promise<string> {
        console.log(`[AIContentService] Generating ${type} content for: ${prompt}`);

        // Simulate AI Processing
        await new Promise(resolve => setTimeout(resolve, 2500));

        if (type === 'blog') {
            return `
# The Standard of Excellence: Why We Celebrate ${prompt}

At the heart of every successful business is a commitment to quality. When we focus on ${prompt}, we aren't just creating a product; we're crafting an experience.

## The Tradition of Quality
In a world of mass production, the human touch of ${prompt} remains unparalleled. It represents a bridge between ancient techniques and modern design.

## Why It Matters
For our customers, ${prompt} is more than just a purchase. It's a statement of support for sustainable craftsmanship and local excellence.

We invite you to explore our new collection and find the piece that speaks to you.
            `.trim();
        }

        return `✨ Discover the new ${prompt} collection. Handcrafted excellence, delivered to your door. Tap the link in bio to shop now! 🛍️ #SoloSME #Handmade #${prompt.replace(/\s+/g, '')}`;
    }

    /**
     * Generates cross-platform social captions for a product.
     */
    static generateSocialCaptions(productName: string, price: number): SocialCaptions {
        const formattedPrice = `₦${price.toLocaleString()}`;

        return {
            instagram: `✨ New Arrival! The ${productName} is finally here. Elevate your style today with SOLO. Only ${formattedPrice}. Tap the link in bio to shop! 🛍️ #SoloSME #${productName.replace(/\s+/g, '')}`,
            whatsapp: `*${productName}* is now back in stock! \n\nGet yours for just *${formattedPrice}*. \n\nClick link to order: https://solo.sme/artisan-soul`,
            twitter: `Looking for the perfect ${productName}? We've got you covered. Priced at ${formattedPrice}. Shop now on our official SOLO store! 🚀`
        };
    }

    /**
     * Simulates posting content directly to a social media platform.
     */
    static async postToSocial(platform: 'instagram' | 'whatsapp' | 'twitter', content: string, image?: File): Promise<boolean> {
        console.log(`[AIContentService] Posting to ${platform}...`);
        console.log(`Content: ${content}`);
        if (image) console.log(`Attachment: ${image.name}`);

        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    }
}
