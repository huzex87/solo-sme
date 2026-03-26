import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CurrencyService } from '@/services/currencyService';
import { ratelimit } from '@/lib/rateLimit';

const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

/**
 * AI Sales Assistant API Route
 * Uses Google Gemini to provide intelligent, product-aware sales support.
 * Falls back to keyword matching when no API key is configured.
 */
export async function POST(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await ratelimit.limit(`chat:${ip}`);
    if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    try {
        const { message, businessName, products, conversationHistory } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // If Gemini is configured, use real LLM
        if (genAI) {
            const response = await generateGeminiResponse(
                message,
                businessName,
                products,
                conversationHistory
            );
            return NextResponse.json({ response });
        }

        // Fallback: keyword-based responses when no API key
        const response = generateFallbackResponse(message, businessName, products);
        await new Promise(r => setTimeout(r, 600));
        return NextResponse.json({ response });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json({
            response: "I'm experiencing a temporary issue. Please try again in a moment, or feel free to browse our catalog directly!"
        });
    }
}

async function generateGeminiResponse(
    message: string,
    businessName: string,
    products: Array<{ name: string; price: number; category: string; description?: string }>,
    conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
    if (!genAI) return generateFallbackResponse(message, businessName, products);

    const currencySymbol = CurrencyService.getSymbol('NGN'); // Defaults to NGN check
    const productCatalog = products?.length
        ? products.map(p =>
            `- ${p.name} (${currencySymbol}${p.price.toLocaleString()}) — ${p.category}${p.description ? ': ' + p.description : ''}`
        ).join('\n')
        : 'No products currently listed.';

    const systemPrompt = `You are the AI Sales Assistant for "${businessName}", a premium online store.
Your personality is warm, professional, and knowledgeable. You speak like a friendly Nigerian commerce expert.

PRODUCT CATALOG:
${productCatalog}

GUIDELINES:
- Be concise: max 2-3 sentences per response
- Use the current currency sign (${currencySymbol}) for prices
- Recommend specific products when relevant
- If asked about discounts, mention code SOLO10 for 10% off first orders
- For delivery, say: within Lagos 24-48hrs, outside Lagos 3-5 business days
- If you don't know something, offer to connect the customer with the store owner
- Never make up products that aren't in the catalog
- Be naturally conversational, using occasional expressions like "sure thing", "great choice"
- If a customer seems ready to buy, guide them to click "+ Add" on the product card`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const history = conversationHistory?.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
    })) || [];

    const chat = model.startChat({
        history,
        systemInstruction: systemPrompt,
        generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
        },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return responseText;
}

function generateFallbackResponse(
    message: string,
    businessName: string,
    products?: Array<{ name: string; price: number }>
): string {
    const query = message.toLowerCase();

    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        return `Hey there! 👋 Welcome to ${businessName}. I can help with product info, delivery details, or anything else. What can I do for you?`;
    }
    if (query.includes('delivery') || query.includes('shipping')) {
        return `We deliver within Lagos in 24-48 hours, and 3-5 business days outside Lagos. You can track your order in the Delivery section!`;
    }
    if (query.includes('price') || query.includes('how much') || query.includes('cost')) {
        if (products?.length) {
            const list = products.slice(0, 3).map(p => `${p.name} (${CurrencyService.getSymbol('NGN')}${p.price.toLocaleString()})`).join(', ');
            return `Great question! Some of our favorites: ${list}. Check the catalog for the full lineup! 🛒`;
        }
        return `All our prices are on the product pages. Is there a specific item you're curious about?`;
    }
    if (query.includes('discount') || query.includes('promo') || query.includes('coupon')) {
        return `You're in luck! Use code SOLO10 at checkout for 10% off your first order. 🎉`;
    }
    if (query.includes('thank')) {
        return `You're welcome! Happy to help. Enjoy your shopping! 🙌`;
    }

    return `That's a great question! While I work on getting smarter, I'd suggest browsing our catalog or reaching out to the team directly for detailed info. Anything else I can help with?`;
}
