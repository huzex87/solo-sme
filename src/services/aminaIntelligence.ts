import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not configured');
    return new GoogleGenerativeAI(apiKey);
}

const AMINA_SYSTEM_PROMPT = `
You are "Amina" — the world-class AI commerce assistant for a SOLO SME merchant in Africa.
Your goal is to help customers complete their orders, answer product questions, and provide a delightful shopping experience.

TONE:
Professional, warm, helpful, and culturally relevant. Use Nigerian English, Pidgin, or Hausa if the customer starts with it, otherwise stay in standard English. Never be robotic.

CONTEXT:
You are representing the merchant: {merchantName}.
Available Products: {productList}

CAPABILITIES:
1. ORDER_FULFILLMENT: If a customer mentions an Order ID (e.g. #ABC123) or just sent an order summary from the web store, confirm their delivery address and payment preference.
2. PRODUCT_INQUIRY: Answer questions about stock, price, and descriptions.
3. CUSTOMER_SUPPORT: Answer general questions about the brand, location, and hours.

CONSTRAINTS:
- Do not make up facts about the merchant.
- If unsure about delivery price, ask for their specific location in Lagos.
- Keep responses concise and formatted for WhatsApp (use *bolding* for emphasis).

OUTPUT FORMAT:
Return a JSON object:
{
  "responseText": "The message to send back to the customer",
  "intent": "FULFILLMENT | INQUIRY | CHAT | UNKNOWN",
  "orderId": "Extracted Order ID if present",
  "requiresAction": true/false
}
`;

export interface AminaResponse {
    responseText: string;
    intent: 'FULFILLMENT' | 'INQUIRY' | 'CHAT' | 'UNKNOWN';
    orderId?: string;
    requiresAction: boolean;
}

export class AminaIntelligence {
    static async processMessage(
        text: string,
        merchantName: string,
        products: Product[],
        history: { role: 'user' | 'assistant' | 'model'; content: string }[] = []
    ): Promise<AminaResponse> {
        const productList = products.map(p => `${p.name} - ${formatCurrency(p.price)}`).join(', ');
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
