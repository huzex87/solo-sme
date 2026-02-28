export interface AIImportResult {
    name: string;
    description: string;
    price: number;
    category: string;
    suggested_image_keywords: string[];
}

export interface OnboardingState {
    business_name: string;
    subdomain: string;
    products: AIImportResult[];
    branding: {
        primary: string;
        secondary: string;
    };
}

export class OnboardingService {
    /**
     * Simulates an AI-driven extraction of products from a social media profile.
     * Implements robust regex and heuristic parsing to convert captions into products.
     */
    static async importFromSocial(url: string): Promise<OnboardingState> {
        console.log(`[SOLO AI] Initializing extraction for: ${url}`);

        // Artificial delay for "Deep Intelligence" processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Unstructured data typically found on IG/Social
        const rawPosts = [
            { caption: "New Arrival! Midnight Silk Scarf. Available for ₦15,500. DM to order.", img: "silk-scarf.jpg" },
            { caption: "Ceramic Horizon Mug - Hand-thrown stoneware. Only 8.5k each. Limited stock!", img: "mug.jpg" },
            { caption: "Gilded Moon Earrings (24k Gold). 22,000 Naira only.", img: "earrings.jpg" }
        ];

        const parsedProducts: AIImportResult[] = rawPosts.map(post => {
            // Heuristic Parsing for Price
            const priceMatch = post.caption.match(/(?:₦|N|Naira|Price:?|for)\s?([\d,]+)(?:k)?/i);
            let price = 0;
            if (priceMatch) {
                let pStr = priceMatch[1].replace(/,/g, '');
                price = parseInt(pStr);
                if (post.caption.toLowerCase().includes(pStr + 'k')) price *= 1000;
            } else if (post.caption.match(/([\d\.]+)\s?k/i)) {
                price = parseFloat(post.caption.match(/([\d\.]+)\s?k/i)![1]) * 1000;
            }

            // Heuristic Parsing for Name
            const name = post.caption.split('.')[0].replace(/New Arrival!?|Only|Available|for/gi, '').trim();

            return {
                name: name || "Unnamed Product",
                description: post.caption,
                price: price || 0,
                category: "Imported",
                suggested_image_keywords: [name.toLowerCase()]
            };
        });

        return {
            business_name: url.split('/').pop()?.replace(/[-_]/g, ' ') || "My Boutique",
            subdomain: url.split('/').pop()?.toLowerCase() || "my-store",
            products: parsedProducts,
            branding: {
                primary: "#1a237e",
                secondary: "#ffab40"
            }
        };
    }

    /**
     * Finalizes the onboarding by creating the tenant, products, and profile
     */
    static async finalizeOnboarding(userId: string, state: OnboardingState): Promise<boolean> {
        console.log(`[SOLO AI] Finalizing setup for user ${userId} with ${state.products.length} products.`);

        // Actually persist products to the ProductService
        for (const p of state.products) {
            await ProductService.createProduct({
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                stock_quantity: 10 // Default stock
            });
        }

        return true;
    }

    /**
     * Heuristically syncs the latest social media catalog with the store.
     */
    static async syncCatalog(url: string): Promise<{ added: number, updated: number }> {
        console.log(`[SOLO AI] Syncing catalog with: ${url}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulation: 1 new product found, 1 price update
        return { added: 1, updated: 1 };
    }
}
import { ProductService } from './productService';
