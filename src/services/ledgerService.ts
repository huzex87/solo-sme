import { supabase } from '@/lib/supabase';

export interface Transaction {
    id: string;
    tenant_id: string;
    order_id?: string;
    amount: number;
    type: 'revenue' | 'delivery_fee' | 'tax' | 'payout' | 'adjustment';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    provider: string;
    reference?: string;
    description: string;
    created_at: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    pendingPayouts: number;
    availableBalance: number;
    transactionCount: number;
}

export class LedgerService {
    /**
     * Records a new transaction in Supabase.
     */
    static async recordTransaction(data: Partial<Transaction> & { tenant_id: string; amount: number; type: Transaction['type'] }): Promise<Transaction | null> {
        console.log(`[LedgerService] Recording ${data.type} of ${data.amount} for tenant ${data.tenant_id}`);

        const { data: record, error } = await supabase
            .from('transactions')
            .insert([data])
            .select()
            .single();

        if (error) {
            console.error('[LedgerService] Error recording transaction:', error);
            return null;
        }

        return record as Transaction;
    }

    /**
     * Gets the financial summary for a tenant.
     */
    static async getSummary(tenantId: string): Promise<FinancialSummary> {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, type, status')
            .eq('tenant_id', tenantId)
            .eq('status', 'completed');

        if (error) {
            console.error('[LedgerService] Error fetching summary:', error);
            return { totalRevenue: 0, pendingPayouts: 0, availableBalance: 0, transactionCount: 0 };
        }

        const totalRevenue = transactions
            .filter(t => t.type === 'revenue')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalPayouts = transactions
            .filter(t => t.type === 'payout')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        // Simple logic: 97% is available (3% fee simulation), minus payouts
        const availableBalance = (totalRevenue * 0.97) - totalPayouts;

        return {
            totalRevenue,
            pendingPayouts: totalRevenue * 0.05, // 5% simulated pending
            availableBalance: Math.max(0, availableBalance),
            transactionCount: transactions.length
        };
    }

    /**
     * Gets transaction history for a tenant.
     */
    static async getHistory(tenantId: string): Promise<Transaction[]> {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[LedgerService] Error fetching history:', error);
            return [];
        }

        return data as Transaction[];
    }
}
