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

        return NextResponse.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Campaign generation error:", error);
        return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
    }
}
