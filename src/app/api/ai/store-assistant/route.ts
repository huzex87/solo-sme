import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

interface Product {
    name: string;
    description: string;
    price: number;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
    try {
        const { message, history, tenantName, products } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const productContext = products.map((p: Product) =>
            `- ${p.name}: ${p.description} (Price: ₦${p.price.toLocaleString()})`
        ).join('\n');

        const systemPrompt = `
You are the "SOLO AI Sales Assistant" for a business called "${tenantName}".
Your goal is to help customers browse the catalog, answer questions about products, and encourage them to shop.

BUSINESS CATALOG:
${productContext}

GUIDELINES:
1. Be extremely professional, polite, and helpful.
2. Use a sophisticated yet friendly tone.
3. If asked about prices, always use the ₦ (Naira) symbol.
4. Focus on the products listed in the catalog above.
5. If a product isn't in the catalog, politely inform the customer and suggest the closest alternative.
6. Keep responses concise and engaging.
7. Use Nigerian English nuances where appropriate (e.g., "Welcome to our store", "Have a great day").
8. Do not mention that you are an AI unless explicitly asked.

CONTEXT:
This is a high-end SME platform called SOLO.

Respond to the user's message: "${message}"
        `;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        return NextResponse.json({ content: responseText });
    } catch (error: unknown) {
        console.error("[StoreAssistant API Error]:", error);
        return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
    }
}
