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

    const ip = req.headers.get("x-forwarded-for") || user.id;
    const { success } = await aiRatelimit.limit(ip);
    if (!success) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 });
    }

    try {
        const { prompt, type } = await req.json();

        if (!model) {
            return NextResponse.json({
                content: `Professional ${type} content for ${prompt} will be generated once your AI subscription is active.`
            });
        }

        const systemPrompt = `
You are a high-end content creator for SOLO, an SME platform.
Generate a professional ${type} post about: "${prompt}".
Use a sophisticated, engaging, and world-class tone.
If it is a blog post, use Markdown.
If it is social content, include relevant emojis and hashtags.
        `;

        const result = await model.generateContent(systemPrompt);
        return NextResponse.json({ content: result.response.text() });
    } catch (error: unknown) {
        console.error("[ContentGenerator API Error]:", error);
        return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }
}
