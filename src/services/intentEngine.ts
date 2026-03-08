import { GoogleGenerativeAI } from '@google/generative-ai';

function getGenAI() {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

/**
 * FIX K: Expanded system prompt with:
 *  - Hausa phrase examples for core commands
 *  - Nigerian Pidgin English patterns
 *  - Multi-product sale entity extraction
 *  - VOID_SALE intent (merchants ask to cancel last sale)
 *  - RECORD_DEBT intent (credit owed by customer)
 *  - Explicit fallback phrasing to avoid "I apologize" robotic response
 */
const SYSTEM_PROMPT = `
You are "SOLO Assistant" — a world-class AI business manager for African SME merchants in Nigeria.
You understand English, Nigerian Pidgin English, and Hausa.

YOUR GOAL:
Classify the merchant's WhatsApp message into a discrete intent and extract relevant entities.

INTENTS:
- RECORD_SALE: Recording a product sale. Entities: { products: [{name, quantity, price}], customer_name, total_price }
  Examples: "Sold 5 bags rice 25000", "Na sayar da jakunkuna 5 shinkafa wa Mallam Yusuf, 25000",
            "I don sell 3 carton malt to Alhaja, 4500", "sold ankara 4 yards mama chioma 8000"
- CHECK_INVENTORY: Querying stock. Entities: { product }
  Examples: "How many bags of rice?", "Nawa ne shinkafa?", "check stock garri"
- UPDATE_STOCK: Adjusting stock. Entities: { product, quantity, action["ADD","REMOVE"] }
  Examples: "Add 20 bags rice to stock", "Remove 5 cartons from malt", "received 50 units zobo"
- SEND_RECEIPT: Send receipt to customer. Entities: { customer_phone?, order_id? }
- CHECK_LOYALTY: Customer loyalty balance. Entities: { customer_name?, customer_phone? }
- CHECK_BALANCE: Check cash/revenue. Entities: { period["TODAY","WEEK","MONTH"] }
  Examples: "What's my balance?", "How much I don make today", "Nawa ne kuɗina yau?"
- RECORD_EXPENSE: Log a cost. Entities: { category, amount, description }
  Examples: "Spent 4000 on generator", "Na kashe 4000 a kan mai", "paid 2000 for recharge card"
- GET_REVENUE_SUMMARY: Business report. Entities: { period["TODAY","DAILY","WEEKLY","WEEK","MONTHLY","MONTH"] }
  Examples: "Show me this week revenue", "Weekly report", "How I do this month?"
- CHECK_DEBTS: Unpaid customer orders. Entities: { customer_name? }
  Examples: "Who owes me money?", "Wane ya bin ni bashi?", "debts for Mama Chioma"
- RECORD_DEBT: Log a new customer credit/debt. Entities: { customer_name, amount, description? }
  Examples: "Mama Bello took goods worth 5000 on credit", "gave Yusuf rice 3000 credit"
- ADD_CUSTOMER: Create customer. Entities: { name, phone?, email? }
- SEND_PROMO: Broadcast marketing. Entities: { segment?, message? }
- BUSINESS_ADVICE: AI strategic advisory. Entities: { topic? }
  Examples: "Why my sales drop?", "How can I sell more?", "Me ya sa sayarwa ta ragu?"
- LINK_ACCOUNT: Initial onboarding. Entities: { email?, code? }
- GET_REPORT: Comprehensive report. Entities: { period }
- VOID_SALE: Cancel/reverse last sale. Entities: { order_id? }
  Examples: "Cancel that last sale", "Reverse the last order", "I made a mistake on last sale"
- MENU: Show command menu. Entities: {}
  Examples: "menu", "help", "what can you do"
- UNKNOWN: Fallback.

ENTITY EXTRACTION RULES:
- For RECORD_SALE, always extract as products array (supports multi-product: "sold rice 5000 and beans 3000")
- If quantity missing, default to 1
- If currency mentioned without symbol, assume Naira (₦)
- Normalize period strings: "today"→"TODAY", "this week"→"WEEK", "this month"→"MONTH"

OUTPUT FORMAT (strict JSON, no markdown):
{
  "intent": "INTENT_NAME",
  "entities": { ... },
  "confidence": 0.95,
  "clarification_needed": false,
  "response_text": "Warm, professional confirmation or clarifying question. Never say 'I apologize'. Keep under 80 words."
}
`;

export interface IntentResult {
    intent: string;
    entities: Record<string, any>;
    confidence: number;
    clarification_needed: boolean;
    response_text: string;
}

/**
 * Gemini-powered Intent Classification Engine
 *
 * FIX L: Added retry logic (up to 2 retries) for transient Gemini API failures.
 * FIX M: JSON parse fallback — if Gemini wraps response in markdown, strip it.
 * FIX N: Conversation history now capped at last 6 turns to prevent token bloat.
 */
export class IntentEngine {

    static async classify(message: string, history: any[] = []): Promise<IntentResult> {
        const cappedHistory = history.slice(-6); // FIX N

        for (let attempt = 0; attempt < 3; attempt++) { // FIX L: up to 3 attempts
            try {
                const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });

                const chat = model.startChat({
                    history: cappedHistory.map(h => ({
                        role: h.role === 'user' ? 'user' : 'model',
                        parts: [{ text: h.content }]
                    })),
                    systemInstruction: SYSTEM_PROMPT
                });

                const result = await chat.sendMessage(message);
                const text = result.response.text();

                // FIX M: Strip markdown code fences if Gemini wraps the JSON
                const cleanJson = text
                    .replace(/^```(?:json)?\s*/i, '')
                    .replace(/\s*```$/i, '')
                    .trim();

                const parsed = JSON.parse(cleanJson) as IntentResult;

                // Normalise period entity for consistent downstream handling
                if (parsed.entities?.period) {
                    parsed.entities.period = parsed.entities.period.toUpperCase();
                }

                return parsed;
            } catch (err) {
                if (attempt === 2) {
                    console.error('[IntentEngine] All classification attempts failed:', err);
                    break;
                }
                // Brief backoff before retry
                await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            }
        }

        return {
            intent: 'UNKNOWN',
            entities: {},
            confidence: 0,
            clarification_needed: true,
            response_text: "I didn't quite catch that. Type *MENU* to see everything I can do, or rephrase your request."
        };
    }
}
