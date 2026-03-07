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
