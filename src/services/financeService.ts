import { supabase } from '@/lib/supabase';

export interface FinancialSummary {
    revenue: number;
    expenses: number;
    profit: number;
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
        // 1. Get total revenue from paid orders
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'paid');

        if (orderError) throw orderError;

        const revenue = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

        // 2. Get expenses (mocked for now, but wired for future table)
        // In a real scenario, this would query an 'expenses' table
        const expenses = revenue * 0.35; // Simulating 35% operational cost

        const profit = revenue - expenses;
        const estimatedTax = profit > 0 ? profit * 0.075 : 0; // 7.5% corporate tax estimate
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            revenue,
            expenses,
            profit,
            estimatedTax,
            margin
        };
    }

    /**
     * Gets monthly sales data for charts.
     */
    static async getMonthlyPerformance(tenantId: string) {
        const { data, error } = await supabase
            .from('orders')
            .select('created_at, total_amount')
            .eq('tenant_id', tenantId)
            .eq('status', 'paid')
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
