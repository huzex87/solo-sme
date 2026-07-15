import { OrderService } from './orderService';
import { AnalyticsService } from './analyticsService';
import { InventoryService } from './inventoryService';
import { AIAnalyticsService, AIInsight } from './aiAnalyticsService';
import { FinanceService } from './financeService';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SalesForecast {
    period: string;
    predictedRevenue: number;
    confidence: number; // 0-1
    factors: string[];
}

export interface CustomerSegment {
    id: 'vip' | 'at_risk' | 'new' | 'loyal';
    label: string;
    count: number;
    description: string;
    color: string;
}

export interface BusinessHealthScore {
    score: number; // 0-100
    status: 'healthy' | 'caution' | 'critical';
    recommendations: string[];
}

export class InsightsService {
    /**
     * Predicts sales for the next 30 days based on historical trends.
     */
    static async getSalesForecast(tenantId: string): Promise<SalesForecast[]> {
        const stats = await AnalyticsService.getDashboardStats(tenantId);
        if (stats.orderCount < 5) return [];

        // Return AI-driven forecast using historical trends
        return await AIAnalyticsService.getSalesForecastAI(
            stats.salesTrends.map(t => ({ date: t.date, amount: t.revenue }))
        );
    }

    /**
     * Categorizes customers into strategic segments.
     */
    static async getCustomerSegments(tenantId: string): Promise<CustomerSegment[]> {
        const orders = await OrderService.getOrders(tenantId);
        const customerMap = new Map<string, { totalSpent: number; orderCount: number; lastOrder: string }>();

        orders.forEach(order => {
            // Fix I: Key by customer identifier with fallback to avoid guest checkouts collapsing
            const key = order.customer_email || order.customer_phone || `guest_${order.id}`;
            const existing = customerMap.get(key) || { totalSpent: 0, orderCount: 0, lastOrder: order.created_at };

            customerMap.set(key, {
                totalSpent: existing.totalSpent + order.total_amount,
                orderCount: existing.orderCount + 1,
                lastOrder: new Date(order.created_at) > new Date(existing.lastOrder) ? order.created_at : existing.lastOrder
            });
        });

        const now = new Date();
        const segments: CustomerSegment[] = [
            { id: 'vip', label: 'VIP Customers', count: 0, description: 'Top 10% by spending or repeat orders.', color: 'var(--color-accent)' },
            { id: 'loyal', label: 'Loyal', count: 0, description: 'Ordered more than 3 times.', color: 'var(--color-success)' },
            { id: 'new', label: 'New', count: 0, description: 'First order in the last 14 days.', color: 'var(--color-primary)' },
            { id: 'at_risk', label: 'At Risk', count: 0, description: 'Hasnt ordered in over 30 days.', color: 'var(--color-error)' }
        ];

        customerMap.forEach((stats) => {
            const lastOrderDate = new Date(stats.lastOrder);
            const daysSinceLastOrder = (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);

            const isVIP = stats.totalSpent > 100000 || stats.orderCount > 15;
            const isAtRisk = daysSinceLastOrder > 45;
            const isNew = daysSinceLastOrder <= 14 && stats.orderCount === 1;

            if (isVIP) segments[0].count++;
            else if (isAtRisk) segments[3].count++;
            else if (isNew) segments[2].count++;
            else if (stats.orderCount >= 3) segments[1].count++;
        });

        return segments;
    }

    /**
     * Calculates the Estimated Lifetime Value of a merchant's customer base.
     */
    static async getAverageLTV(tenantId: string): Promise<number> {
        const orders = await OrderService.getOrders(tenantId);
        if (orders.length === 0) return 0;

        const customerKeys = new Set(orders.map(o => o.customer_email || o.customer_phone || `guest_${o.id}`));
        const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

        // LTV = Average Order Value * Purchase Frequency
        const aov = totalRevenue / orders.length;
        const frequency = orders.length / customerKeys.size;

        return aov * frequency;
    }

    /**
     * Generates an overall Business Health Score and actionable recommendations.
     */
    static async getBusinessHealth(tenantId: string, _client?: SupabaseClient): Promise<BusinessHealthScore> {
        const orders = await OrderService.getOrders(tenantId);

        // Simple health scoring logic
        const recentOrders = orders.filter(o => {
            const date = new Date(o.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return date >= thirtyDaysAgo;
        });

        const score = Math.min(100, Math.round((recentOrders.length / 10) * 100)); // Arbitrary target

        const recommendations = [];
        if (recentOrders.length < 5) recommendations.push('Run a targeted Instagram promotion to boost traffic.');
        if (score < 40) recommendations.push('Review your pricing strategy; conversion rates are below average.');
        if (orders.length > 50) recommendations.push('Consider setting up dynamic discounts for your VIP segment.');

        return {
            score,
            status: score > 70 ? 'healthy' : score > 40 ? 'caution' : 'critical',
            recommendations
        };
    }

    /**
     * Synthesizes ledger, inventory, and customer data for deep AI advisory.
     */
    static async getStrategicIntelligence(tenantId: string): Promise<AIInsight[]> {
        const [stats, summary, inventory, segments] = await Promise.all([
            AnalyticsService.getDashboardStats(tenantId),
            FinanceService.getFinancialSummary(tenantId),
            InventoryService.getPredictiveStockAnalysis(tenantId),
            this.getCustomerSegments(tenantId)
        ]);

        return AIAnalyticsService.getStrategicAdvisory(
            stats,
            summary,
            inventory.map(i => ({ name: i.name, runwayDays: i.runwayDays, status: i.status })),
            segments.map(s => ({ label: s.label, count: s.count }))
        );
    }
}
