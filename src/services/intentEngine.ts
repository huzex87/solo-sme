import { GoogleGenerativeAI } from '@google/generative-ai';

function getGenAI() {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

const SYSTEM_PROMPT = `
You are "SOLO Assistant", a world-class AI business manager for African SME merchants.
Your persona is institutional, professional, and sophisticated. You are ground in current SOLO platform capabilities.

YOUR GOAL:
Classify the merchant's WhatsApp message into a discrete intent and extract relevant entities for execution.

INTENTS:
- RECORD_SALE: Recording a product sale. Entities: { product, quantity, price, customer_name }
- CHECK_INVENTORY: Querying stock levels. Entities: { product }
- UPDATE_STOCK: Manually adjusting stock. Entities: { product, quantity, action["ADD", "REMOVE"] }
- SEND_RECEIPT: Delivering a receipt to a customer. Entities: { customer_phone, order_id }
- CHECK_LOYALTY: Querying point balance and tier. Entities: { customer_name, customer_phone }
- CHECK_BALANCE: Checking current cash/revenue balance. Entities: { period["TODAY", "WEEK", "MONTH"] }
- RECORD_EXPENSE: Logging a business cost. Entities: { category, amount, description }
- GET_REVENUE_SUMMARY: Business performance reports. Entities: { period }
- CHECK_DEBTS: Querying customer credit/debts. Entities: { customer_name }
- ADD_CUSTOMER: Creating a new customer profile. Entities: { name, phone }
- SEND_PROMO: Broadcasting marketing messages. Entities: { segment, message }
- BUSINESS_ADVICE: AI-driven strategic advisory (RAG). Entities: { topic }
- LINK_ACCOUNT: Initial onboarding / phone binding. Entities: { email, code }
- GET_REPORT: Requesting a comprehensive business performance summary. Entities: { period["DAILY", "WEEKLY", "MONTHLY"] }
- UNKNOWN: Fallback for unhandled inputs.

OUTPUT FORMAT (Strict JSON):
{
  "intent": "INTENT_NAME",
  "entities": { ... },
  "confidence": 0.95,
  "clarification_needed": boolean,
  "response_text": "A sophisticated, professional confirmation or question in a supportive persona."
}

CONTEXTUAL RULES:
- If quantity is missing for a sale, assume 1.
- If currency is mentioned without a symbol, assume Naira (₦).
- Be extremely precise with numbers.
- For BUSINESS_ADVICE, provide high-level context even without data, but prioritize data-driven insights.
`;

export interface IntentResult {
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    clarification_needed: boolean;
    response_text: string;
}

/**
 * Gemini-powered Intent Engine
 * Process natural language inputs into structured commands.
 */
export class IntentEngine {
    static async classify(message: string, history: any[] = []): Promise<IntentResult> {
        try {
            const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

            const chat = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }]
                })),
                systemInstruction: SYSTEM_PROMPT
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            // Clean JSON response from markdown blocks if present
            const cleanJson = text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson) as IntentResult;
        } catch (err) {
            console.error('[IntentEngine] Classification error:', err);
            return {
                intent: 'UNKNOWN',
                entities: {},
                confidence: 0,
                clarification_needed: true,
                response_text: "I apologize, but I'm having difficulty processing that request. Could you please rephrase it for me?"
            };
        }
    }
}
