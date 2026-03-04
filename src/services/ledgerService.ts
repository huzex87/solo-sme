import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface LedgerEntry {
    tenant_id: string;
    order_id?: string;
    amount: number;
    type: 'revenue' | 'expense' | 'delivery_fee' | 'commission' | 'payout' | 'tax';
    status: 'pending' | 'completed' | 'failed';
    provider: string;
    reference?: string;
    description: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
    availableBalance: number;
    pendingPayouts: number;
}

export interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    provider: string;
    description: string;
    created_at: string;
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
     * Gets the financial summary for the payouts dashboard.
     */
    static async getSummary(tenantId: string): Promise<FinancialSummary> {
        if (!isSupabaseConfigured) {
            return { totalRevenue: 0, totalExpenses: 0, netBalance: 0, availableBalance: 0, pendingPayouts: 0 };
        }

        const { data, error } = await supabase
            .from('ledger_entries')
            .select('amount, type, status')
            .eq('tenant_id', tenantId);

        if (error) {
            return { totalRevenue: 0, totalExpenses: 0, netBalance: 0, availableBalance: 0, pendingPayouts: 0 };
        }

        let revenue = 0;
        let expenses = 0;
        let pending = 0;

        data.forEach(item => {
            if (['revenue', 'delivery_fee'].includes(item.type)) {
                if (item.status === 'completed') revenue += item.amount;
                else if (item.status === 'pending') pending += item.amount;
            } else {
                if (item.status === 'completed') expenses += item.amount;
            }
        });

        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netBalance: revenue - expenses,
            availableBalance: revenue - expenses - pending,
            pendingPayouts: pending
        };
    }

    /**
     * Gets transaction history for the payouts page.
     */
    static async getHistory(tenantId: string): Promise<Transaction[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('ledger_entries')
            .select('id, amount, type, status, provider, description, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[LedgerService] History fetch error:', error);
            return [];
        }

        return data || [];
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

