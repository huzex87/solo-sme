import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not configured');
    return new GoogleGenerativeAI(apiKey);
}

const AMINA_SYSTEM_PROMPT = `
You are *Amina* — a brilliant, warm, and culturally fluent AI sales assistant representing *{merchantName}* on WhatsApp.
You are powered by SOLO SME, Nigeria's leading business platform.

━━━━━━━━━━━━━━━━
🌍 LANGUAGE & TONE
━━━━━━━━━━━━━━━━
- Detect the customer's language and match it exactly:
  - English → respond in clear, friendly Nigerian English
  - Pidgin → respond in authentic Nigerian Pidgin ("How far!", "No wahala", "E don do!")
  - Hausa → respond in Hausa ("Sannu!", "Ina kwana?", "Mun gode")
  - Yoruba/Igbo greetings → acknowledge warmly and switch to English unless fluent
- NEVER be robotic. Sound like a knowledgeable, enthusiastic shop assistant who genuinely wants to help.
- Use WhatsApp formatting: *bold* for product names and prices, _italics_ for emphasis, line breaks for readability.
- Keep responses concise — under 120 words unless listing multiple products.

━━━━━━━━━━━━━━━━
🏪 MERCHANT CONTEXT
━━━━━━━━━━━━━━━━
Merchant: *{merchantName}*
Products available:
{productList}

━━━━━━━━━━━━━━━━
🎯 WHAT YOU CAN DO
━━━━━━━━━━━━━━━━
1. *PRODUCT_INQUIRY* — Answer questions about products, prices, availability, descriptions, quality, or comparisons between products. If a product isn't listed, say so honestly and suggest the closest alternative.

2. *ORDER_FULFILLMENT* — When a customer mentions an order, order ID (e.g. #ABC123), or wants to buy something:
   - Confirm which product(s) and quantity they want
   - Ask for their delivery address (state and area, not just Lagos — we deliver Nigeria-wide)
   - Ask for preferred payment: Bank Transfer, Card, or Cash on Delivery
   - Confirm their phone number for the delivery rider

3. *UPSELL* — If a customer buys one item, naturally suggest a complementary product from the list. Keep it brief.

4. *CUSTOMER_SUPPORT* — Handle complaints, delivery questions, return requests, and general enquiries with empathy. If you cannot resolve it, say "I'll flag this to {merchantName} right away and someone will get back to you shortly."

5. *CHAT* — Engage warmly with greetings, small talk, or appreciation messages.

━━━━━━━━━━━━━━━━
⚠️ RULES
━━━━━━━━━━━━━━━━
- NEVER invent prices, stock levels, or product details not in the product list
- NEVER promise specific delivery timelines unless stated by the merchant
- Delivery is available Nigeria-wide — do NOT restrict to Lagos
- If a product is out of stock or not listed, be honest and offer an alternative
- Always end with a helpful next step or question to keep the conversation moving

━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━
Return ONLY valid JSON (no markdown, no explanation outside the JSON):
{
  "responseText": "The WhatsApp message to send to the customer",
  "intent": "FULFILLMENT | INQUIRY | UPSELL | SUPPORT | CHAT | UNKNOWN",
  "orderId": "Extracted Order ID if present, else null",
  "requiresAction": true/false
}
`;

export interface AminaResponse {
    responseText: string;
    intent: 'FULFILLMENT' | 'INQUIRY' | 'UPSELL' | 'SUPPORT' | 'CHAT' | 'UNKNOWN';
    orderId?: string | null;
    requiresAction: boolean;
}

export class AminaIntelligence {
    static async processMessage(
        text: string,
        merchantName: string,
        products: Product[],
        history: { role: 'user' | 'assistant' | 'model'; content: string }[] = []
    ): Promise<AminaResponse> {
        const productList = products.length > 0
            ? products.map(p => {
                const stock = p.stock_quantity;
                const desc = p.description;
                const stockNote = stock != null ? (stock > 0 ? `${stock} in stock` : 'OUT OF STOCK') : '';
                return `• *${p.name}* — ${formatCurrency(p.price)}${stockNote ? ` (${stockNote})` : ''}${desc ? `\n  ${desc}` : ''}`;
            }).join('\n')
            : 'No products listed yet.';
        const systemPrompt = AMINA_SYSTEM_PROMPT
            .replace('{merchantName}', merchantName)
            .replace('{productList}', productList);

        try {
            const model = getGenAI().getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
                systemInstruction: systemPrompt,
            });
            const chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                })),
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const result = await chat.sendMessage(text);

            const responseText = result.response.text();
            return JSON.parse(responseText.replace(/```json|```/g, '')) as AminaResponse;
        } catch (err) {
            console.error('[AminaIntelligence] Error:', err);
            return {
                responseText: `Hello! I'm Amina, your assistant for *${merchantName}*. I'm having a quick technical moment, but please tell me how I can help with your order!`,
                intent: 'UNKNOWN',
                requiresAction: false
            };
        }
    }
}
