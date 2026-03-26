import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalyticsSummary } from "./analyticsService";
import { FinancialSummary } from "./financeService";

export interface AIInsight {
    title: string;
    description: string;
    actionLabel: string;
    actionUrl: string;
    impact: 'high' | 'medium' | 'low';
}

export interface AIForecast {
    period: string;
    predictedRevenue: number;
    confidence: number;
    factors: string[];
    trendValue: 'up' | 'down' | 'stable';
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
}

export class AIAnalyticsService {
    /**
     * Institutional Grade Business Insight Orchestrator
     */
    static async getBusinessInsights(
        analytics: AnalyticsSummary,
        finance: FinancialSummary,
        currency: string = 'NGN'
    ): Promise<AIInsight[]> {
        const genAI = getGenAI();
        if (!genAI) {
            return this.getMockInsights();
        }

        try {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            const prompt = `
                Act as a world-class SME business consultant. Analyze the following business metrics for a merchant and provide 3 actionable, high-impact growth recommendations.
                
                METRICS (Currency: ${currency}):
                - Total Revenue: ${analytics.totalRevenue}
                - Net Profit: ${finance.profit}
                - Gross Margin: ${finance.margin}%
                - Customer Retention: ${analytics.customerRetentionRate}%
                - Top Products: ${analytics.topProducts.map(p => `${p.name} (${p.sales} sales)`).join(', ')}
                - Low Stock Alerts: ${analytics.stockAlerts.length} items
                
                Respond ONLY with a JSON array based on this schema:
                {
                    "title": string,
                    "description": string,
                    "actionLabel": string,
                    "actionUrl": string,
                    "impact": "high" | "medium" | "low"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('[AIAnalytics] Gemini analysis failed:', error);
            return this.getMockInsights();
        }
    }

    /**
     * Predictive Sales Forecasting for Global Resilience
     */
    static async getSalesForecastAI(
        historicalData: { date: string; amount: number }[],
        currency: string = 'NGN'
    ): Promise<AIForecast[]> {
        const genAI = getGenAI();
        if (!genAI) {
            return this.getMockForecast();
        }

        try {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            const prompt = `
                Act as a specialized financial forecasting AI for global SMEs. Analyze the following sales history (${currency}) and forecast revenue for the next 7 days and next 30 days.
                
                HISTORICAL DATA:
                ${JSON.stringify(historicalData)}
                
                Consider algorithmic velocity, seasonal variance, and market energy.
                Respond ONLY with a JSON array of 2 objects (7d, 30d) based on:
                {
                    "period": string,
                    "predictedRevenue": number,
                    "confidence": number (0-1),
                    "factors": string[],
                    "trendValue": "up" | "down" | "stable"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('[AIAnalytics] Forecasting failed:', error);
            return this.getMockForecast();
        }
    }

    /**
     * Strategic Advisory for Institutional Scalability
     */
    static async getStrategicAdvisory(
        analytics: AnalyticsSummary,
        finance: FinancialSummary,
        inventory: { name: string; runwayDays: number; status: string }[],
        segments: { label: string; count: number }[],
        currency: string = 'NGN'
    ): Promise<AIInsight[]> {
        const genAI = getGenAI();
        if (!genAI) {
            return this.getMockInsights();
        }

        try {
            const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

            const inventoryStatus = inventory
                .filter(i => i.status !== 'STABLE')
                .map(i => `${i.name}: ${i.runwayDays} days runway`)
                .join(', ');

            const segmentSummary = segments
                .map(s => `${s.label}: ${s.count}`)
                .join(', ');

            const prompt = `
                Act as an institutional-grade SME strategic advisor. Synthesize this data context into 3 high-level growth directives.
                
                CONTEXT (Currency: ${currency}):
                - Revenue/Profit Ratio: ${analytics.totalRevenue}/${finance.profit}
                - Cash Flow Pulse: ${finance.profit > 0 ? 'Positive Velocity' : 'Check Resistance'}
                - Inventory Latency: ${inventoryStatus || 'Optimized'}
                - Segment Distribution: ${segmentSummary}
                
                Respond ONLY with a JSON array:
                {
                    "title": string,
                    "description": string,
                    "actionLabel": string,
                    "actionUrl": string,
                    "impact": "high" | "medium" | "low"
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error('[AIAnalytics] Strategic advisory failed:', error);
            return this.getMockInsights();
        }
    }

    private static getMockForecast(): AIForecast[] {
        return [
            {
                period: 'Next 7 Days',
                predictedRevenue: 125000,
                confidence: 0.85,
                factors: ['Recent velocity upgrade', 'Weekday consistency'],
                trendValue: 'up'
            },
            {
                period: 'Next 30 Days',
                predictedRevenue: 540000,
                confidence: 0.72,
                factors: ['Monthly growth trend', 'Market energy stability'],
                trendValue: 'up'
            }
        ];
    }

    private static getMockInsights(): AIInsight[] {
        return [
            {
                title: "Optimize High-Margin Inventory",
                description: "Your top product has elite margins but stock levels are degrading. Restock within 24 hours to capture projected 15% demand spike.",
                actionLabel: "Restock Velocity",
                actionUrl: "/dashboard/products",
                impact: "high"
            },
            {
                title: "Loyalty Acceleration",
                description: "Segmented data shows high retention from WhatsApp shoppers. Execute an exclusive broadcast campaign to VIP segments.",
                actionLabel: "Launch Campaign",
                actionUrl: "/dashboard/marketing",
                impact: "medium"
            },
            {
                title: "Operating Cost Efficiency",
                description: "COGS has increased by 4% relative to revenue. Review supplier terms or explore bulk procurement strategies.",
                actionLabel: "Analyze COGS",
                actionUrl: "/dashboard/financials",
                impact: "high"
            }
        ];
    }
}
