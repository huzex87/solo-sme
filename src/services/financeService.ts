import { supabase } from '@/lib/supabase-instance';

export interface FinancialSummary {
    revenue: number;
    expenses: number;
    cogs: number;
    profit: number;
    grossProfit: number;
    estimatedTax: number;
    margin: number;
}

export interface ExpenseRecord {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
}

export class FinanceService {
    /**
     * Calculates P&L summary for a given tenant.
     */
    static async getFinancialSummary(tenantId: string): Promise<FinancialSummary> {
        // 1. Get revenue from all successful order statuses (Phase 29 standard)
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('total_amount, items')
            .eq('tenant_id', tenantId)
            .in('status', ['paid', 'processing', 'dispatched', 'delivered']);

        if (orderError) throw orderError;

        const revenue = orders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;

        // 2. Cross-reference items with products to calculate COGS
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, cost_price')
            .eq('tenant_id', tenantId);

        if (prodError) throw prodError;

        const costMap = new Map(products?.map(p => [p.id, p.cost_price || 0]) || []);
        let cogs = 0;

        orders?.forEach(order => {
            const items = order.items as Array<{ id: string; quantity: number }>;
            items?.forEach(item => {
                const cost = costMap.get(item.id) || 0;
                cogs += (cost * (item.quantity || 1));
            });
        });

        // 3. Get operational expenses from the expense table
        const { data: expensesData, error: expenseError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('tenant_id', tenantId);

        if (expenseError) throw expenseError;

        const expenses = expensesData?.reduce((acc, e) => acc + (e.amount || 0), 0) || 0;

        const grossProfit = revenue - cogs;
        const profit = grossProfit - expenses;
        const estimatedTax = profit > 0 ? profit * 0.075 : 0; // 7.5% corporate tax estimate
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            revenue,
            expenses,
            cogs,
            grossProfit,
            profit,
            estimatedTax,
            margin
        };
    }

    /**
     * Adds a new expense record.
     */
    static async addExpense(tenantId: string, expense: Omit<ExpenseRecord, 'id'>): Promise<boolean> {
        const { error } = await supabase
            .from('expenses')
            .insert({
                tenant_id: tenantId,
                ...expense
            });

        return !error;
    }

    /**
     * Fetches recent expenses.
     */
    static async getRecentExpenses(tenantId: string, limit = 10): Promise<ExpenseRecord[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false })
            .limit(limit);

        if (error) return [];
        return data as ExpenseRecord[];
    }

    /**
     * Gets monthly sales data for charts.
     */
    static async getMonthlyPerformance(tenantId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('tenant_id', tenantId)
            .in('status', ['paid', 'processing', 'dispatched', 'delivered'])
            .order('created_at', { ascending: true });

        if (error) return [];

        // Group by month
        const months: Record<string, number> = {};
        data.forEach(order => {
            const date = new Date(order.created_at);
            const key = date.toLocaleString('default', { month: 'short' });
            months[key] = (months[key] || 0) + order.total_amount;
        });

        return Object.entries(months).map(([name, value]) => ({ name, value }));
    }
}
