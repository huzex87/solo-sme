import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { LedgerService } from '@/services/ledgerService';
import { AnalyticsService } from '@/services/analyticsService';
import { WhatsAppService } from '@/services/whatsappService';
import { formatCurrency } from '@/lib/utils';

export class RevenueHandler extends IntentHandler {
    intent = 'CHECK_BALANCE';

    async handle(context: HandlerContext, _result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding } = context;
        const summary = await LedgerService.getSummary(binding.tenant_id);
        const response = `📊 *Financial Status*\n\nAvailable Balance: ${formatCurrency(summary.availableBalance)}\nTotal Revenue: ${formatCurrency(summary.totalRevenue)}\nPending Payouts: ${formatCurrency(summary.pendingPayouts)}`;
        await WhatsAppService.sendText(from, response);
    }
}

export class RevenueSummaryHandler extends IntentHandler {
    intent = 'GET_REVENUE_SUMMARY';

    async handle(context: HandlerContext): Promise<void> {
        const { from, binding } = context;
        const summary = await LedgerService.getFinancialSummary(binding.tenant_id);
        const response = `📈 *Revenue Summary*\n\nNet Revenue: ${formatCurrency(summary.totalRevenue)}\nTotal Expenses: ${formatCurrency(summary.totalExpenses)}\nNet Balance: ${formatCurrency(summary.netBalance)}`;
        await WhatsAppService.sendText(from, response);
    }
}

export class ReportHandler extends IntentHandler {
    intent = 'GET_REPORT';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const period = result.entities.period || 'TODAY';
        await WhatsAppService.sendText(from, `📊 Generating your *${period} Report*...`);

        const [summary, stats] = await Promise.all([
            LedgerService.getFinancialSummary(binding.tenant_id, supabase),
            AnalyticsService.getDashboardStats(binding.tenant_id, '7d', undefined, supabase)
        ]);

        const totalProducts = (stats.topProducts?.length || 0) + stats.stockAlerts.length;
        const inStockRate = totalProducts > 0
            ? Math.round(((totalProducts - stats.stockAlerts.length) / totalProducts) * 100)
            : 100;

        const response =
            `📈 *SOLO Report: ${period}*\n\n` +
            `💰 *Financials*\nRevenue: ${formatCurrency(summary.totalRevenue)}\nExpenses: ${formatCurrency(summary.totalExpenses)}\nNet: ${formatCurrency(summary.netBalance)}\n\n` +
            `📦 *Operations*\nSales: ${stats.orderCount}\nStock Health: ${inStockRate}% in stock\n\n` +
            `🏆 *Top Product*: ${stats.topProducts?.[0]?.name || 'N/A'}\n\n` +
            `_Reply "ADVICE" for growth recommendations._`;

        await WhatsAppService.sendText(from, response);
    }
}
