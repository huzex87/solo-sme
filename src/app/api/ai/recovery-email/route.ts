import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

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

    if (!model) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

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

        return NextResponse.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Recovery email generation error:", error);
        return NextResponse.json({ error: "Failed to generate recovery email" }, { status: 500 });
    }
}
