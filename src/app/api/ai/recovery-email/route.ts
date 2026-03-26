import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { aiRatelimit } from "@/lib/rateLimit";

import { createClient } from "@/lib/supabase/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';

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
        const { customerName, items } = await req.json();

        const prompt = `
            You are a world-class customer retention strategist for SOLO SME, an institutional-grade commerce platform.
            
            Customer: ${customerName}
            Abandoned Items: ${items?.join(", ") || "premium boutique selections"}
            
            Generate a sophisticated, warm, and highly persuasive abandoned cart recovery email.
            The tone must be:
            - Professional and refined (Institutional)
            - Helpful and appreciative (Sovereign)
            - Minimalist yet premium
            
            Structure:
            1. Engaging Subject Line (Short, curiosity-driven)
            2. Warm greeting that acknowledges their taste
            3. Gentle reminder of their items
            4. Subtle value proposition about SOLO SME's quality/reliability
            5. Clear, non-aggressive Call to Action
            
            Return ONLY the JSON:
            {
                "email": "Subject: ... \n\nBody: ..."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : text;

        try {
            return NextResponse.json(JSON.parse(cleanJson));
        } catch (parseError) {
            console.error("Recovery email JSON parse error:", parseError, "Raw text:", text);
            return NextResponse.json({ error: "AI returned invalid response format" }, { status: 502 });
        }
    } catch (error) {
        console.error("Recovery email generation error:", error);
        return NextResponse.json({ error: "Failed to generate recovery email" }, { status: 500 });
    }
}
