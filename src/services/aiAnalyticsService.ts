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
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export class AIAnalyticsService {
    static async getBusinessInsights(
        analytics: AnalyticsSummary,
        finance: FinancialSummary
    ): Promise<AIInsight[]> {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return this.getMockInsights();
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Act as a world-class SME business consultant. Analyze the following business metrics for a merchant and provide 3 actionable, high-impact growth recommendations.
                
                METRICS:
                - Total Revenue: ₦${analytics.totalRevenue}
                - Net Profit: ₦${finance.profit}
                - Gross Margin: ${finance.margin}%
                - Customer Retention: ${analytics.customerRetentionRate}%
                - Top Products: ${analytics.topProducts.map(p => `${p.name} (${p.sales} sales)`).join(', ')}
                - Low Stock Alerts: ${analytics.stockAlerts.length} items
                
                Respond ONLY with a JSON array of 3 objects with the following schema:
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

            // Extract JSON from potential markdown code blocks
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

    static async getSalesForecastAI(
        historicalData: { date: string; amount: number }[]
    ): Promise<AIForecast[]> {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return this.getMockForecast();
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                Act as a specialized financial forecasting AI for Nigerian SMEs. Analyze the following daily sales history and forecast revenue for the next 7 days and next 30 days.
                
                HISTORICAL DATA (Last 30 Days):
                ${JSON.stringify(historicalData)}
                
                Consider local market dynamics, potential seasonality, and trend velocity.
                Respond ONLY with a JSON array of 2 objects (Next 7 Days, Next 30 Days) with the following schema:
                {
                    "period": string,
                    "predictedRevenue": number,
                    "confidence": number (0-1),
                    "factors": string[] (max 3 factors)
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

    static async getStrategicAdvisory(
        analytics: AnalyticsSummary,
        finance: FinancialSummary,
        inventory: any[],
        segments: any[]
    ): Promise<AIInsight[]> {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            return this.getMockInsights();
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const inventoryStatus = inventory
                .filter(i => i.status !== 'STABLE')
                .map(i => `${i.name}: ${i.runwayDays} days runway`)
                .join(', ');

            const segmentSummary = segments
                .map(s => `${s.label}: ${s.count}`)
                .join(', ');

            const prompt = `
                Act as a world-class SME strategic advisor. Analyze this multi-dimensional business context and provide 3 high-level strategic directives.
                
                FINANCIAL HEALTH:
                - Revenue: ₦${analytics.totalRevenue}
                - Net Profit: ₦${finance.profit}
                - Cash Flow: ${finance.profit > 0 ? 'Positive' : 'Negative'} (₦${finance.profit})
                
                OPERATIONAL LATENCY:
                - Critical Stock: ${inventoryStatus || 'All levels stable'}
                
                MARKET DYNAMICS:
                - Customer Segments: ${segmentSummary}
                - Retention: ${analytics.customerRetentionRate}%
                
                Provide strategic, institutional-grade advice that synthesizes these factors. Avoid generic tips.
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
                factors: ['Recent velocity upgrade', 'Weekday consistency']
            },
            {
                period: 'Next 30 Days',
                predictedRevenue: 540000,
                confidence: 0.72,
                factors: ['Monthly growth trend', 'Market energy stability']
            }
        ];
    }

    private static getMockInsights(): AIInsight[] {
        return [
            {
                title: "Boost High-Margin Sales",
                description: "Your top product has a healthy margin. Consider a bundle deal with slower-moving items to increase order value.",
                actionLabel: "Create Bundle",
                actionUrl: "/dashboard/products",
                impact: "high"
            },
            {
                title: "Retention Opportunity",
                description: "Your retention rate is improving. Launch a 'Welcome Back' discount for customers who haven't visited in 14 days.",
                actionLabel: "Setup Automation",
                actionUrl: "/dashboard/marketing",
                impact: "medium"
            },
            {
                title: "Stock Optimization",
                description: "3 items are predicted to sell out within 48 hours. Restock now to avoid lost revenue.",
                actionLabel: "Restock Now",
                actionUrl: "/dashboard/inventory",
                impact: "high"
            }
        ];
    }
}
