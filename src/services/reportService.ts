import { FinanceService } from './financeService';
import { AnalyticsService } from './analyticsService';
import { OrderService } from './orderService';

export class ReportService {
    static async generateCreditReadinessPassport(tenantId: string) {
        const financeSummary = await FinanceService.getFinancialSummary(tenantId);
        const dashStats = await AnalyticsService.getDashboardStats(tenantId);
        const recentExpenses = await FinanceService.getRecentExpenses(tenantId, 20);
        const monthlyPerf = await FinanceService.getMonthlyPerformance(tenantId);

        return {
            generationDate: new Date().toLocaleDateString(),
            businessHealth: {
                revenue: financeSummary.revenue,
                profit: financeSummary.profit,
                margin: financeSummary.margin,
                retention: dashStats.customerRetentionRate
            },
            monthlyPerformance: monthlyPerf,
            recentActivity: recentExpenses,
            score: this.calculateCreditScore(financeSummary, dashStats)
        };
    }

    private static calculateCreditScore(finance: any, analytics: any) {
        // Simple logic for the passport score (0-100)
        let score = 50;
        if (finance.profit > 0) score += 10;
        if (finance.margin > 20) score += 10;
        if (analytics.customerRetentionRate > 30) score += 10;
        if (analytics.totalRevenue > 500000) score += 10;
        if (analytics.orderCount > 50) score += 10;
        return Math.min(score, 100);
    }

    static triggerPrint() {
        if (typeof window !== 'undefined') {
            window.print();
        }
    }
}
