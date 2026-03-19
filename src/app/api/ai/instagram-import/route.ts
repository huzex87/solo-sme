import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiRatelimit } from '@/lib/rateLimit';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

import { createClient } from '@/lib/supabase/server';

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
        const { socialUrl } = await req.json();

        if (!socialUrl) {
            return NextResponse.json({ error: 'Social URL is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn('[AI Setup] Missing GEMINI_API_KEY. Returning fallback.');
            return NextResponse.json({ fallback: true }, { status: 503 });
        }

        // Extract a handle or brand name from the URL to guide the AI
        let handle = socialUrl.split('instagram.com/')[1] || socialUrl.split('/').pop() || 'Brand';
        handle = handle.split('?')[0]; // Remove query params

        const prompt = `
            You are an expert commerce AI. A user wants to create an online store based on their social media handle: "@${handle}".
            Generate a highly realistic, premium eCommerce store setup for this brand. 
            
            Return the output STRICTLY as a valid JSON object with the following structure. Do not include markdown codeblocks or any additional text.
            {
                "business_name": "A creative, premium business name based on the handle",
                "subdomain": "a-url-friendly-slug",
                "branding": {
                    "primary": "A hex color code representing the brand's primary color (e.g. #000000 for luxury, #4CAF50 for organic)",
                    "secondary": "A complementary hex color code"
                },
                "products": [
                    {
                        "name": "A beautifully named product",
                        "description": "A compelling, premium 1-2 sentence product description.",
                        "price": 15000, 
                        // Price in NGN (numbers only, e.g., 5000 to 150000)
                        "category": "The product category",
                        "stock": 20,
                        "image": "Use a relevant descriptive unsplash image URL like: https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800 (pick fitting images based on the niche)"
                    }
                ]
            }
            Generate exactly 4 diverse products. Let the brand niche be inferred creatively from the handle (e.g., if handle has 'style', it's fashion. If it has 'eat', it's food. Otherwise pick a premium lifestyle niche like fashion, cosmetics, or artisanal home goods).
        `;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Strip backticks if the model returned markdown
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(jsonStr);

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error('[AI Instagram Import Error]:', error);
        return NextResponse.json({ error: 'Failed to generate store from URL' }, { status: 500 });
    }
}
