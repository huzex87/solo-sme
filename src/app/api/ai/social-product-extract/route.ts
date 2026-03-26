import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { aiRatelimit } from '@/lib/rateLimit';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || user.id;
    const { success } = await aiRatelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a minute.' }, { status: 429 });
    }

    try {
        const { imageUrl, caption, sourceUrl } = await req.json();

        if (!imageUrl && !caption) {
            return NextResponse.json({ error: 'Image URL or caption required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `
You are an expert commerce product analyst for African e-commerce. Analyze the following Instagram post and determine if it's selling a product.

Caption: "${caption || 'No caption'}"
Image URL: ${imageUrl || 'No image'}
Source: ${sourceUrl || 'Instagram'}

If this post is advertising/selling a product, extract the product details. If it's a personal post, lifestyle content, or not product-related, return { "isProduct": false }.

Common Nigerian price formats: "N15,000", "₦15000", "15k", "NGN 15,000", "15,000 naira"
Common Nigerian e-commerce patterns: "DM to order", "Available in all sizes", "Swipe up to buy", "Send a message", "Price: ..."

Return STRICTLY as valid JSON (no markdown, no backticks):
{
    "isProduct": true/false,
    "name": "Clean product name (remove emojis, hashtags)",
    "description": "A professional 1-2 sentence product description suitable for an e-commerce store",
    "price": 15000,
    "category": "One of: Fashion, Beauty, Electronics, Food, Home, Accessories, Health, General",
    "stock": 20,
    "confidence": 0.0 to 1.0
}

Important:
- Price should be in NGN (Nigerian Naira) as a number
- If price says "15k" interpret as 15000
- If no clear price, estimate based on the product type and Nigerian market
- Only return isProduct: true if confidence >= 0.6
`;

        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        // Filter low-confidence results
        if (parsed.confidence && parsed.confidence < 0.6) {
            return NextResponse.json({ isProduct: false });
        }

        return NextResponse.json(parsed);
    } catch (error) {
        console.error('[AI Social Product Extract]:', error);
        return NextResponse.json({ isProduct: false, error: 'Analysis failed' }, { status: 200 });
    }
}
