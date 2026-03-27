import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { LedgerService } from '@/services/ledgerService';
import { AnalyticsService } from '@/services/analyticsService';
import { FinanceService } from '@/services/financeService';
import { InsightsService } from '@/services/insightsService';
import { AIAnalyticsService } from '@/services/aiAnalyticsService';
import { WhatsAppService } from '@/services/whatsappService';
import { formatCurrency } from '@/lib/utils';
import { SupabaseClient } from '@supabase/supabase-js';

export class AdviceHandler extends IntentHandler {
    intent = 'AI_ADVICE';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        await WhatsAppService.sendText(from, "🔍 Analysing your business data... one moment.");

        const [stats, financeSummaryForAI, health] = await Promise.all([
            AnalyticsService.getDashboardStats(binding.tenant_id, '7d', undefined, supabase),
            FinanceService.getFinancialSummary(binding.tenant_id, supabase),
            InsightsService.getBusinessHealth(binding.tenant_id, supabase)
        ]);
        const insights = await AIAnalyticsService.getBusinessInsights(stats, financeSummaryForAI);

        let response = `💡 *Strategic Advisor Brief*\nTheme: ${result.entities.topic || 'General Growth'}\n\n`;
        insights.forEach((insight: { title: string; description: string }, i: number) => {
            response += `${i + 1}. *${insight.title}*\n${insight.description}\n\n`;
        });

        if (health.recommendations?.length > 0) {
            response += `⚡ *Quick Win*: ${health.recommendations[0]}`;
        }

        await WhatsAppService.sendText(from, response);
    }
}

export class DebtHandler extends IntentHandler {
    intent = 'RECORD_DEBT';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { customer_name, amount, description } = result.entities;

        if (!customer_name || !amount) {
            await WhatsAppService.sendText(from, "To record a debt, I need the customer name and amount.\n\nExample: _\"Malam Bello took goods worth 5000 on credit\"_");
            return;
        }

        const success = await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            amount,
            type: 'revenue',
            status: 'pending',
            provider: 'Credit',
            description: `DEBT — ${customer_name}: ${description || 'Goods on credit'}`
        }, supabase);

        if (!success) {
            await WhatsAppService.sendText(from, "❌ Failed to record debt. Please try again.");
            return;
        }

        await WhatsAppService.sendText(from, `📝 *Debt Recorded*\n\nCustomer: ${customer_name}\nAmount Owed: ${formatCurrency(Number(amount))}\nNote: ${description || 'Goods on credit'}\n\n_Shows in your financials as pending revenue._`);
    }
}

export class DebtCheckHandler extends IntentHandler {
    intent = 'CHECK_DEBTS';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding, supabase } = context;
        const { data: debts } = await supabase
            .from('ledger_transactions')
            .select('description, amount, created_at')
            .eq('tenant_id', binding.tenant_id)
            .eq('type', 'revenue')
            .eq('status', 'pending')
            .ilike('description', 'DEBT%')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!debts || debts.length === 0) {
            await WhatsAppService.sendText(from, "✅ No outstanding debts recorded. You're all clear!");
            return;
        }

        const customerFilter = result.entities.customer_name?.toLowerCase();
        const filtered = customerFilter
            ? debts.filter((d: { description: string }) => d.description.toLowerCase().includes(customerFilter))
            : debts;

        const totalOwed = filtered.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
        const list = filtered.map((d: { description: string; amount: number; created_at: string }) =>
            `• ${d.description.replace('DEBT — ', '')} — ${formatCurrency(Number(d.amount))}`
        ).join('\n');

        await WhatsAppService.sendText(from, `💰 *Outstanding Debts*\n\n${list}\n\n*Total Owed: ${formatCurrency(totalOwed)}*`);
    }
}
