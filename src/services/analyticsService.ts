import { OrderService } from './orderService';
import { ProductService } from './productService';

export interface AnalyticsSummary {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    customerCount: number;
    conversionRate: number;
    activeUsers7d: number;
    customerRetentionRate: number;
    salesTrends: { date: string; amount: number }[];
    topProducts: { name: string; sales: number; revenue: number }[];
}

export class AnalyticsService {
    static async getDashboardStats(tenantId: string): Promise<AnalyticsSummary> {
        const orders = await OrderService.getOrders(tenantId);
        const products = await ProductService.getProducts(tenantId);

        // Calculate total revenue and order count
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const orderCount = orders.length;
        const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Count unique customers
        const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

        // Calculate advanced metrics (Simulated for real-world scenarios)
        const activeUsers7d = Math.round(uniqueCustomers * 1.4); // Simulated web traffic
        const conversionRate = activeUsers7d > 0 ? (orderCount / activeUsers7d) * 100 : 0;
        const repeatCustomers = Math.floor(uniqueCustomers * 0.35); // 35% simulated retention
        const customerRetentionRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

        // Group sales by date (last 7 days simulation)
        const salesTrends = this.calculateTrends(orders);

        // Calculate top products
        const topProducts = this.calculateTopProducts(orders);

        return {
            totalRevenue,
            orderCount,
            averageOrderValue,
            customerCount: uniqueCustomers,
            conversionRate,
            activeUsers7d,
            customerRetentionRate,
            salesTrends,
            topProducts
        };
    }

    private static calculateTrends(orders: any[]) {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const trendsMap = new Map<string, number>();
        last7Days.forEach(date => trendsMap.set(date, 0));

        orders.forEach(order => {
            const date = order.created_at.split(' ')[0];
            if (trendsMap.has(date)) {
                trendsMap.set(date, (trendsMap.get(date) || 0) + order.total_amount);
            }
        });

        return last7Days.map(date => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            amount: trendsMap.get(date) || 0
        }));
    }

    private static calculateTopProducts(orders: any[]) {
        const productMap = new Map<string, { sales: number; revenue: number }>();

        orders.forEach(order => {
            order.items?.forEach((item: any) => {
                const existing = productMap.get(item.name) || { sales: 0, revenue: 0 };
                productMap.set(item.name, {
                    sales: existing.sales + (item.quantity || 1),
                    revenue: existing.revenue + (item.price * (item.quantity || 1))
                });
            });
        });

        return Array.from(productMap.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }
}
