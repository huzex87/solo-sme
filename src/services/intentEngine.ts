import { GoogleGenerativeAI } from '@google/generative-ai';
import { IntentValidator } from './intentValidator';
import { Product } from '@/types';

export interface ResolveProduct {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface ResolveVoidItem {
  product_id: string;
  product: { id: string; name: string };
  quantity: number;
}

function getGenAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
}

export interface ChatTurn {
  role: 'user' | 'assistant' | 'model';
  content: string;
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
You understand English, Nigerian Pidgin English (Broken), and Hausa.

YOUR GOAL:
Classify the merchant's WhatsApp message into a discrete intent and extract relevant entities.

INTENTS:
- RECORD_SALE: Recording a product sale. Entities: { products: [{name, quantity, price}], customer_name, total_price }
  English: "Sold 5 bags rice 25000", "sold ankara 4 yards mama chioma 8000"
  Pidgin: "I don sell 3 carton malt to Alhaja, 4500", "sell 2 bread and 1 coke 1500"
  Hausa: "Na sayar da jakunkuna 5 shinkafa wa Mallam Yusuf, 25000", "sayar da yadi 4 ga Mama Chioma 8000"
  Multi-Item: "sold 2 bags of rice 10000 and 3 bottles of oil 6000", "sell bread 500, egg 200, and milk 300"
- CHECK_INVENTORY: Querying stock. Entities: { product }
  English: "How many bags of rice?", "check stock garri"
  Hausa: "Nawa ne shinkafa a saura?", "Duba min yawan gari"
  Pidgin: "How many rice remain?", "Check garri stock"
- UPDATE_STOCK: Adjusting stock. Entities: { product, quantity, action["ADD","REMOVE"] }
  English: "Add 20 bags rice to stock", "Remove 5 cartons from malt"
  Hausa: "Ƙara buhunan shinkafa 20", "Rage katon 5 na malt"
  Pidgin: "Add 20 bag rice", "Commot 5 carton malt"
- SEND_RECEIPT: Send receipt to customer. Entities: { customer_phone?, order_id? }
- CHECK_LOYALTY: Customer loyalty balance. Entities: { customer_name?, customer_phone? }
- CHECK_BALANCE: Check cash/revenue. Entities: { period["TODAY","WEEK","MONTH"] }
  English: "What's my balance?", "How much I don make today"
  Hausa: "Nawa ne kuɗina yau?", "Duba min balance na mako"
- RECORD_EXPENSE: Log a cost. Entities: { category, amount, description }
  English: "Spent 4000 on generator", "paid 2000 for recharge card"
  Hausa: "Na kashe 4000 a kan mai", "na biya 2000 na kati"
  Pidgin: "I spend 4000 for fuel", "pay 2000 for credit"
- GET_REVENUE_SUMMARY: Business report. Entities: { period["TODAY","DAILY","WEEKLY","WEEK","MONTHLY","MONTH"] }
  English: "Show me this week revenue", "How I do this month?"
  Hausa: "Nuna min rahoton mako", "Yaya aka yi a wannan watan?"
- CHECK_DEBTS: Unpaid customer orders. Entities: { customer_name? }
  English: "Who owes me money?", "debts for Mama Chioma"
  Hausa: "Wa yake bina bashi?", "Bashin Mama Chioma nawa ne?"
  Pidgin: "Who dey owe me?", "Check Mama Chioma debt"
- RECORD_DEBT: Log a new customer credit/debt. Entities: { customer_name, amount, description? }
  English: "Mama Bello took goods worth 5000 on credit", "gave Yusuf rice 3000 credit"
  Hausa: "Mama Bello ta karɓi kaya na 5000 bashi", "na ba Yusuf shinkafa ta 3000 bashi"
  Pidgin: "Mama Bello carry 5000 goods for credit"
- ADD_CUSTOMER: Create customer. Entities: { name, phone?, email? }
- SEND_PROMO: Broadcast marketing. Entities: { segment?, message? }
- BUSINESS_ADVICE: AI strategic advisory. Entities: { topic? }
  English: "Why my sales drop?", "How can I sell more?"
  Hausa: "Me ya sa sayarwa ta ragu?", "Yaya zan ƙara sayarwa?"
  Pidgin: "Why my market slow?", "How I fit sell well?"
- LINK_ACCOUNT: Initial onboarding. Entities: { email?, code? }
- VERIFY_OTP: 6-digit numeric OTP. Entities: { otp }
- GET_REPORT: Comprehensive report. Entities: { period }
- VOID_SALE: Cancel/reverse last sale. Entities: { order_id? }
  English: "Cancel that last sale", "Reverse the last order"
  Hausa: "Soke sayarwar karshe"
  Pidgin: "Cancel that last market"
- MENU: Show command menu. Entities: {}
- UNKNOWN: Fallback.

ENTITY EXTRACTION RULES:
- For RECORD_SALE, always extract as products array (supports multi-product)
- If quantity missing, default to 1
- If currency mentioned without symbol, assume Naira (₦)
- Normalize period: "today"→"TODAY", "this week"→"WEEK", "this month"→"MONTH"

OUTPUT FORMAT (strict JSON, no markdown):
{
  "intent": "INTENT_NAME",
  "entities": { ... },
  "confidence": 0.95,
  "clarification_needed": false,
  "response_text": "Warm, professional confirmation in the SAME LANGUAGE/DIALECT as the user. (e.g. if they used Hausa, reply in Hausa). Keep under 80 words."
}
`;
;

export interface WhatsAppEntities {
  product?: string;
  products?: Array<{ name: string; quantity: number; price?: number }>;
  quantity?: number;
  action?: 'ADD' | 'REMOVE';
  amount?: number;
  category?: string;
  description?: string;
  customer_name?: string;
  customer_phone?: string;
  order_id?: string;
  order_ref?: string;
  period?: string;
  topic?: string;
  segment?: string;
  message?: string;
  code?: string;
  email?: string;
  otp?: string;
  // Staged fields
  resolved?: (ResolveProduct | ResolveVoidItem | Record<string, unknown>)[];
  totalAmount?: number;
  // Generic fields for lookups
  id?: string;
  name?: string;
  price?: number;
  whatsapp_phone?: string;
  phone?: string;
  title?: string;
  reorder_point?: number;
  low_stock_threshold?: number;
  productName?: string;
  currentStock?: number;
}

export interface IntentResult {
  intent: string;
  entities: WhatsAppEntities;
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

  static async classify(message: string, history: ChatTurn[] = []): Promise<IntentResult> {
    const cappedHistory = history.slice(-6); // FIX N

    for (let attempt = 0; attempt < 3; attempt++) { // FIX L: up to 3 attempts
      try {
        const model = getGenAI().getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT
        });

        const chat = model.startChat({
          history: cappedHistory.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          })),
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        // FIX M: Strip markdown code fences if Gemini wraps the JSON
        const cleanJson = text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(cleanJson) as IntentResult;

        if (parsed.entities?.period) {
          parsed.entities.period = parsed.entities.period.toUpperCase();
        }

        // Safety plaque: verify plausibility
        if (!IntentValidator.isPlausible(parsed.intent, message)) {
          parsed.intent = 'UNKNOWN';
          parsed.response_text = "I'm not sure if I understood your request correctly. Could you please rephrase it or type MENU? 📋";
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
