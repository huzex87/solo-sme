import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/baseUrl";


const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

interface Product {
    name: string;
    description: string;
    price: number;
}

export async function POST(req: NextRequest) {
    const supabase = await createAdminClient();


    try {
        const { message, tenantName, products, tenantId, conversationId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        if (!model) {
            return NextResponse.json({
                content: "I'm currently undergoing some maintenance and can't respond right now. Please feel free to browse our collection!"
            });
        }

        // 1. Persist User Message if conversation exists
        if (conversationId && tenantId) {
            await supabase.from('chat_messages').insert({
                conversation_id: conversationId,
                tenant_id: tenantId,
                message: message,
                sender: 'customer'
            });
        }

        // 2. Fetch RAG context (Internal server logic)
        let ragContext = "";
        try {
            const { getRagContext } = await import('../rag-context/route');
            const knowledge = await getRagContext();
            if (knowledge) {
                ragContext = `
STRATEGIC KNOWLEDGE:
- Vision: ${knowledge.vision}
- Core Principles: ${knowledge.corePrinciples}
- Platform Identity: SOLO is a world-class, premium SME ecosystem.
                `;
            }
        } catch (e) {
            console.error('Vector search optional step failed', e);
        }

        const productContext = (products || []).map((p: Product) =>
            `- ${p.name}: ${p.description} (Price: ₦${p.price.toLocaleString()})`
        ).join('\n');

        const systemPrompt = `
You are the "SOLO AI Sales Assistant" for a business called "${tenantName}".
Your goal is to help customers browse the catalog, answer questions about products, and encourage them to shop.

${ragContext}

BUSINESS CATALOG:
${productContext || "No products currently available in the catalog."}

GUIDELINES:
1. Be extremely professional and helpful.
2. If asked about prices, always use ₦ (Naira).
3. Focus on the products in the catalog.
4. Keep responses concise and world-class.
5. If you don't know something, ask the customer to leave their details so the shop owner can reach out.

Respond to: "${message}"
        `;

        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        // 3. Persist AI Response if conversation exists
        if (conversationId && tenantId) {
            await supabase.from('chat_messages').insert({
                conversation_id: conversationId,
                tenant_id: tenantId,
                message: responseText,
                sender: 'ai'
            });

            // Update conversation last message
            await supabase.from('conversations').update({
                last_message: responseText,
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId);
        }

        return NextResponse.json({ content: responseText });
    } catch (error: unknown) {
        console.error("[StoreAssistant API Error]:", error);
        return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
    }
}
