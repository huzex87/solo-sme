import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/baseUrl";
import { CurrencyService } from "@/services/currencyService";


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

        // Fetch tenant to get currency preference
        const { data: tenant } = await supabase
            .from('tenants')
            .select('business_config')
            .eq('id', tenantId)
            .single();

        const currencyCode = tenant?.business_config?.currency || 'NGN';
        const currencySymbol = CurrencyService.getSymbol(currencyCode);

        const productContext = (products || []).map((p: Product) =>
            `- ${p.name}: ${p.description} (Price: ${currencySymbol}${p.price.toLocaleString()})`
        ).join('\n');

        const systemPrompt = `
You are Amina, the high-fidelity AI Sales Agent for "${tenantName}". 
You represent the peak of institutional-grade commerce. Your tone is refined, helpful, and highly professional.

${ragContext}

MISSION:
Transform every visitor into a loyal customer by providing world-class product knowledge and seamless assistance.

BUSINESS CATALOG:
${productContext || "Our exclusive collection is currently being curated. Please check back shortly."}

GUIDELINES:
1. Tone: Premium, minimalist, and sovereign. Avoid generic AI fluff.
2. Pricing: Always use ${currencySymbol} (${currencyCode}) for currency.
3. Expertise: Speak confidently about the values listed in our catalog.
4. Conversion: If a customer is interested, encourage them to add to cart.
5. Assistance: If you cannot answer a specific query, politely request their contact details for a direct callback from the business owner.

Current Query: "${message}"
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
