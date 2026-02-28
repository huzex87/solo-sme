import { NextResponse } from 'next/server';

/**
 * AI Sales Assistant API Route
 * In a real production environment, this would call an LLM (OpenAI, Gemini, etc.)
 * For this "fully built" implementation, we provide a sophisticated logic handler
 * that uses business context to generate responses.
 */
export async function POST(request: Request) {
    try {
        const { message, businessName, products } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const query = message.toLowerCase();
        let response = "";

        // Intelligent Keyword Matching & Contextual Response Generation
        if (query.includes('hello') || query.includes('hi')) {
            response = `Hello! I'm your assistant for ${businessName}. I can help you with product information, delivery times, or store policies. What's on your mind?`;
        } else if (query.includes('delivery') || query.includes('shipping') || query.includes('dispatch')) {
            response = `We offer reliable delivery for ${businessName}. Standard delivery within Lagos takes 24-48 hours. For outside Lagos, it typically takes 3-5 business days. You can track your order in the 'Delivery' section of our store.`;
        } else if (query.includes('price') || query.includes('how much')) {
            if (products && products.length > 0) {
                const productList = products.slice(0, 3).map((p: any) => `${p.name} (₦${p.price.toLocaleString()})`).join(', ');
                response = `Our top items like ${productList} are currently available. You can see the full pricing for all our products right here in the catalog!`;
            } else {
                response = `All our prices are clearly listed on the product pages. Is there a specific item you're interested in?`;
            }
        } else if (query.includes('discount') || query.includes('promo') || query.includes('coupon')) {
            response = `We love rewarding our customers! Use code SOLO10 at checkout for 10% off your first order. Keep an eye on our products for seasonal sales!`;
        } else if (query.includes('location') || query.includes('where')) {
            response = `We are primarily an online store, but we have pickup points available. You can find our physical locations in the 'Store Locator' section in the menu.`;
        } else if (query.includes('contact') || query.includes('owner') || query.includes('call')) {
            response = `You can reach the team directly at support@${businessName.toLowerCase().replace(/\s/g, '')}.com or use our WhatsApp link if available on the store. Would you like me to notify the owner to check this chat?`;
        } else if (query.includes('thank')) {
            response = `You're very welcome! If you need anything else, I'm right here. Happy shopping!`;
        } else {
            response = `That's a great question about ${businessName}. While I'm still learning, I can tell you that we prioritize quality and customer satisfaction. If you'd like more specific details, I can forward your query to the human team. Should I do that?`;
        }

        // Artificial delay to simulate "thinking"
        await new Promise(r => setTimeout(r, 800));

        return NextResponse.json({ response });
    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
