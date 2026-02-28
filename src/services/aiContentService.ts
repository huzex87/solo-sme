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
     * Generates a high-fidelity blog post using AI context.
     */
    static async generateBlogPost(businessName: string, topic: string): Promise<BlogPost> {
        console.log(`[AIContentService] Generating blog post for ${businessName} on: ${topic}`);

        // Simulated AI Generation Logic
        await new Promise(resolve => setTimeout(resolve, 2500));

        const slug = topic.toLowerCase().replace(/\s+/g, '-');

        return {
            id: `post_${Date.now()}`,
            title: `Why ${topic} is the standard for modern quality`,
            slug,
            content: `
                <p>In today's fast-paced market, <strong>${businessName}</strong> stands out by prioritizing ${topic}.</p>
                <p>The journey of excellence begins with a commitment to high standards. When we talk about ${topic}, we aren't just discussing a feature, but a core philosophy that drives everything we do.</p>
                <h2>The Importance of Quality</h2>
                <p>Authentic quality is becoming increasingly rare. At ${businessName}, we've found that customers value the attention to detail that only professional craftsmen can provide.</p>
                <blockquote>"Excellence is not an act, but a habit."</blockquote>
                <p>We invite you to explore our latest collection and see how we're redefining ${topic} for the modern SME.</p>
            `,
            excerpt: `Discover how ${businessName} is leading the way in ${topic} and why it matters for your next purchase.`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            author: "AI Marketing Assistant",
            tags: [topic, "Quality", "Innovation"]
        };
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
}
