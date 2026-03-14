import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

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
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Records a financial transaction in the platform ledger.
     */
    static async recordTransaction(entry: LedgerEntry, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const supabase = this.getClient(client);
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
    static async getSummary(tenantId: string, client?: SupabaseClient): Promise<FinancialSummary> {
        if (!isSupabaseConfigured) {
            return { totalRevenue: 0, totalExpenses: 0, netBalance: 0, availableBalance: 0, pendingPayouts: 0 };
        }

        const supabase = this.getClient(client);
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
    static async getHistory(tenantId: string, client?: SupabaseClient): Promise<Transaction[]> {
        if (!isSupabaseConfigured) return [];

        const supabase = this.getClient(client);
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
    static async getFinancialSummary(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) {
            return { totalRevenue: 0, totalExpenses: 0, netBalance: 0 };
        }

        const supabase = this.getClient(client);
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

    /**
     * Institutional-grade reconciliation: Detects discrepancies between orders and ledger entries.
     */
    static async reconcileTenantAccounts(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return { discrepancies: [], healthy: true };

        const supabase = this.getClient(client);
        // 1. Fetch all orders and their related ledger entries
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('id, total_amount, status')
            .eq('tenant_id', tenantId);

        const { data: ledger, error: ledgerError } = await supabase
            .from('ledger_entries')
            .select('order_id, amount, type')
            .eq('tenant_id', tenantId)
            .eq('status', 'completed');

        if (orderError || ledgerError) {
            console.error('[LedgerService] Reconciliation fetch failed');
            return { healthy: false, error: 'Fetch failed' };
        }

        const discrepancies: { orderId: string; expected: number; actual: number; diff: number }[] = [];

        // 2. Group ledger entries by order_id
        const ledgerMap = new Map<string, number>();
        ledger?.forEach(entry => {
            if (!entry.order_id) return;
            const current = ledgerMap.get(entry.order_id) || 0;
            ledgerMap.set(entry.order_id, current + entry.amount);
        });

        // 3. Verify each order has matching ledger volume
        orders?.forEach(order => {
            if (order.status === 'abandoned' || order.status === 'pending') return;

            const actualLedgerVolume = ledgerMap.get(order.id) || 0;
            const expectedVolume = order.total_amount;

            if (Math.abs(expectedVolume - actualLedgerVolume) > 0.01) {
                discrepancies.push({
                    orderId: order.id,
                    expected: expectedVolume,
                    actual: actualLedgerVolume,
                    diff: expectedVolume - actualLedgerVolume
                });
            }
        });

        // 4. Log the reconciliation event
        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: 'ledger_reconciliation_performed',
            entity_type: 'ledger',
            metadata: {
                discrepancyCount: discrepancies.length,
                healthy: discrepancies.length === 0,
                timestamp: new Date().toISOString()
            }
        }, client);

        return {
            healthy: discrepancies.length === 0,
            discrepancyCount: discrepancies.length,
            discrepancies
        };
    }
}

