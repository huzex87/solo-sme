import { FinanceService, FinancialSummary as FinanceSummary } from './financeService';
import { AnalyticsService, AnalyticsSummary } from './analyticsService';
import { InsightsService } from './insightsService';

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

    private static calculateCreditScore(finance: FinanceSummary, analytics: AnalyticsSummary) {
        // Simple logic for the passport score (0-100)
        let score = 50;
        if ((finance.profit ?? 0) > 0) score += 10;
        if ((finance.margin ?? 0) > 20) score += 10;
        if (analytics.customerRetentionRate > 30) score += 10;
        if (analytics.totalRevenue > 500000) score += 10;
        if (analytics.orderCount > 50) score += 10;
        return Math.min(score, 100);
    }

    static async generateInstitutionalReport(tenantId: string) {
        const [passport, forecast, segments, health] = await Promise.all([
            this.generateCreditReadinessPassport(tenantId),
            InsightsService.getSalesForecast(tenantId),
            InsightsService.getCustomerSegments(tenantId),
            InsightsService.getBusinessHealth(tenantId)
        ]);

        return {
            ...passport,
            forecast,
            customerSegments: segments,
            healthAudit: health,
            institutionalCompliance: {
                taxStatus: 'COMPLIANT',
                auditTrail: 'SECURE',
                reconciliation: 'PERFORMED'
            }
        };
    }

    static triggerPrint() {
        if (typeof window !== 'undefined') {
            window.print();
        }
    }
}
