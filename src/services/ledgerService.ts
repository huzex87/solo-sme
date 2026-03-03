import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface LedgerEntry {
    tenant_id: string;
    order_id?: string;
    amount: number;
    type: 'revenue' | 'expense' | 'delivery_fee' | 'commission' | 'payout';
    status: 'pending' | 'completed' | 'failed';
    provider: string;
    reference?: string;
    description: string;
}

export class LedgerService {
    /**
     * Records a financial transaction in the platform ledger.
     */
    static async recordTransaction(entry: LedgerEntry): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const { error } = await supabase
            .from('ledger_entries')
            .insert({
                tenant_id: entry.tenant_id,
                order_id: entry.order_id,
                amount: entry.amount,
                type: entry.type,
                status: entry.status,
                provider: entry.provider,
                reference: entry.reference,
                description: entry.description,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('[LedgerService] Entry failure:', error);
            return false;
        }

        return true;
    }

    /**
     * Gets financial summary for the analytics dashboard.
     */
    static async getFinancialSummary(tenantId: string) {
        if (!isSupabaseConfigured) {
            return { totalRevenue: 0, totalExpenses: 0, netBalance: 0 };
        }

        const { data, error } = await supabase
            .from('ledger_entries')
            .select('amount, type')
            .eq('tenant_id', tenantId)
            .eq('status', 'completed');

        if (error) return { totalRevenue: 0, totalExpenses: 0, netBalance: 0 };

        let revenue = 0;
        let expenses = 0;

        data.forEach(item => {
            if (['revenue', 'delivery_fee'].includes(item.type)) {
                revenue += item.amount;
            } else {
                expenses += item.amount;
            }
        });

        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netBalance: revenue - expenses
        };
    }
}
