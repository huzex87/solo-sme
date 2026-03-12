
/**
 * Intent Validator Utility
 * Provides a secondary validation layer for AI-classified intents.
 * Prevents "vibe-coded" hallucinations from affecting real financial data.
 */
export class IntentValidator {
    /**
     * Validates RECORD_SALE entities
     */
    static validateSale(entities: any): { valid: boolean; error?: string } {
        const products = entities.products || (entities.product ? [{ name: entities.product, quantity: entities.quantity || 1, price: entities.price }] : []);

        if (products.length === 0) {
            return { valid: false, error: "No products identified in sale." };
        }

        for (const p of products) {
            if (!p.name || p.name.length < 2) return { valid: false, error: "Invalid product name." };
            if (p.quantity <= 0) return { valid: false, error: "Quantity must be greater than zero." };
            if (p.price && p.price < 0) return { valid: false, error: "Price cannot be negative." };
            if (p.quantity > 1000) return { valid: false, error: "Quantity exceeds safety limit (1000)." };
        }

        return { valid: true };
    }

    /**
     * Validates RECORD_EXPENSE entities
     */
    static validateExpense(entities: any): { valid: boolean; error?: string } {
        if (!entities.amount || entities.amount <= 0) {
            return { valid: false, error: "Missing or invalid expense amount." };
        }
        if (entities.amount > 5000000) { // 5M NGN safety limit
            return { valid: false, error: "Expense amount exceeds safety limit for WhatsApp commands." };
        }
        return { valid: true };
    }

    /**
     * Cross-references intent with raw text for plausibility
     */
    static isPlausible(intent: string, text: string): boolean {
        const chattyWords = ['hello', 'hi', 'how are you', 'help', 'who are you', 'test'];
        const textLower = text.toLowerCase();

        if (intent === 'RECORD_SALE' || intent === 'RECORD_EXPENSE') {
            // Should contain at least one number (money or quantity)
            if (!/\d/.test(text)) return false;
            // Should not be just a greeting
            if (chattyWords.some(w => textLower === w)) return false;
        }

        return true;
    }
}
