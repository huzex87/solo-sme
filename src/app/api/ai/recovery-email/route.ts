import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

export async function POST(req: NextRequest) {
    if (!model) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    try {
        const { customerName, items } = await req.json();

        const prompt = `
            You are a professional customer retention specialist for SOLO SME.
            
            Customer: ${customerName}
            Abandoned Items: ${items?.join(", ") || "various world-class products"}
            
            Generate a personalized, warm, and persuasive abandoned cart recovery email.
            The tone should be helpful, not pushy, emphasizing the premium quality of the platform and the products.
            
            Return ONLY the JSON:
            {
                "email": "Full email content here"
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
