import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { aiRatelimit } from "@/lib/rateLimit";

import { createClient } from "@/lib/supabase/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || user.id;
    const { success } = await aiRatelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    try {
        const { goal, products } = await req.json();

        const prompt = `
            You are a world-class marketing strategist for SOLO SME, a premium commerce platform.
            
            Goal: ${goal}
            Related Products: ${products?.join(", ") || "General Store"}
            
            Generate a comprehensive marketing campaign. Return exactly this JSON format:
            {
                "subject": "Catchy email subject line",
                "emailBody": "Professional and high-converting email content",
                "smsCopy": "Punchy SMS message (max 160 chars)",
                "whatsappBody": "Rich WhatsApp message with bolding and emojis",
                "socialCaption": "Engaging social media caption with emojis and hashtags"
            }
            
            The tone should be professional, premium, and persuasive. Focus on value and growth.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from markdown code block if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        try {
            return NextResponse.json(JSON.parse(cleanJson));
        } catch (parseError) {
            console.error("Campaign JSON parse error:", parseError, "Raw text:", text);
            return NextResponse.json({ error: "AI returned invalid response format" }, { status: 502 });
        }
    } catch (error) {
        console.error("Campaign generation error:", error);
        return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
    }
}
