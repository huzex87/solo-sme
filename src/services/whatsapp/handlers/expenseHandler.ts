import { IntentHandler, HandlerContext } from './base';
import { WhatsAppEntities } from '@/services/intentEngine';
import { IntentValidator } from '@/services/intentValidator';
import { LedgerService } from '@/services/ledgerService';
import { WhatsAppService } from '@/services/whatsappService';
import { WhatsAppAuthService, PendingAction } from '@/services/whatsappAuthService';
import { formatCurrency } from '@/lib/utils';

export class ExpenseHandler extends IntentHandler {
    intent = 'RECORD_EXPENSE';

    async handle(context: HandlerContext, result: { entities: WhatsAppEntities }): Promise<void> {
        const { from, binding } = context;
        const { amount, category, description } = result.entities;

        if (!amount) {
            await WhatsAppService.sendText(from, "How much was the expense?");
            return;
        }

        const validation = IntentValidator.validateExpense(result.entities);
        if (!validation.valid) {
            await WhatsAppService.sendText(from, `⚠️ ${validation.error}`);
            return;
        }

        await WhatsAppAuthService.setPendingConfirmation(from, {
            type: 'RECORD_EXPENSE',
            tenant_id: binding.tenant_id,
            amount,
            category: category || 'General',
            description: description || `${category || 'General'} expense`
        });

        await WhatsAppService.sendButtons(
            from,
            `💸 *Confirm Expense?*\n\nAmount: ${formatCurrency(Number(amount))}\nCategory: ${category || 'General'}\n${description ? `Note: ${description}` : ''}`,
            ['YES — Record It', 'NO — Cancel']
        );
    }

    static async commit(context: HandlerContext, pending: PendingAction): Promise<void> {
        const { from, binding, supabase } = context;
        const { amount, category, description } = pending;

        if (amount === undefined) return;

        const success = await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            amount,
            type: 'expense',
            status: 'completed',
            provider: 'WhatsApp',
            description: description || `Expense: ${category}`
        }, supabase);

        if (success) {
            // Fix F: Also write the expense to the operational expenses table
            const { FinanceService } = await import('@/services/financeService');
            await FinanceService.addExpense(binding.tenant_id, {
                amount,
                category: category || 'General',
                description: description || `Expense: ${category}`,
                date: new Date().toISOString().split('T')[0]
            }, supabase).catch(err => console.error('[ExpenseHandler] Failed to sync to expenses table:', err));

            await WhatsAppService.sendText(from, `✅ *Expense Recorded*\n\nAmount: ${formatCurrency(Number(amount))}\nCategory: ${category}`);
        } else {
            await WhatsAppService.sendText(from, `❌ Failed to record expense. Please try again.`);
        }
    }
}
