import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { aiRatelimit } from "@/lib/rateLimit";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = await aiRatelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
    }

    try {
        const { type, name, category, currentDescription } = await req.json();

        if (!model) {
            return NextResponse.json({ error: "AI Model not initialized" }, { status: 500 });
        }

        let prompt = "";

        if (type === 'product-description') {
            prompt = `
                Generate a world-class, premium product description for:
                Product Name: ${name}
                Category: ${category}
                Current Draft: ${currentDescription || 'None'}

                Guidelines:
                1. Use a professional, luxury, and persuasive tone.
                2. Highlight the value proposition.
                3. Keep it under 150 words.
                4. Use sensory words that evoke quality.
                5. Return ONLY the description text.
            `;
        } else if (type === 'social-caption') {
            prompt = `
                Generate an engaging, high-converting social media caption (Instagram/Facebook) for:
                Product: ${name}
                Category: ${category}
                Description: ${currentDescription}

                Guidelines:
                1. Use a mix of enthusiasm and sophistication.
                2. Include 3-5 relevant hashtags.
                3. Add subtle emojis.
                4. Include a clear Call to Action (e.g., "Click the link in our bio to shop").
                5. Return ONLY the caption text.
            `;
        }

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        return NextResponse.json({ content: text });
    } catch (error) {
        console.error("Copywriter API Error:", error);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
    }
}
