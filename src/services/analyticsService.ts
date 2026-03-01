import { OrderService, Order } from './orderService';
import { ProductService } from './productService';

export interface StockAlert {
    productId: string;
    productName: string;
    currentStock: number;
    predictedExhaustionDays: number;
    severity: 'critical' | 'warning' | 'info';
}

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
    stockAlerts: StockAlert[];
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

        // Calculate predictive stock alerts
        const stockAlerts = this.calculateStockAlerts(products, orders);

        return {
            totalRevenue,
            orderCount,
            averageOrderValue,
            customerCount: uniqueCustomers,
            conversionRate,
            activeUsers7d,
            customerRetentionRate,
            salesTrends,
            topProducts,
            stockAlerts
        };
    }

    private static calculateStockAlerts(products: { id: string; name: string; stock_quantity: number }[], orders: Order[]): StockAlert[] {
        const alerts: StockAlert[] = [];

        // Mock calculation: determine a daily run rate based on last 7 days of orders
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        products.forEach(product => {
            let recentSales = 0;
            orders.forEach(order => {
                const orderDate = new Date(order.created_at).getTime();
                if (now - orderDate <= SEVEN_DAYS_MS) {
                    order.items?.forEach(item => {
                        if (item.name === product.name || item.id === product.id) {
                            recentSales += (item.quantity || 1);
                        }
                    });
                }
            });

            const dailyRunRate = recentSales / 7;

            // If the product is selling and we have stock
            if (dailyRunRate > 0 && product.stock_quantity > 0) {
                const daysUntilEmpty = Math.floor(product.stock_quantity / dailyRunRate);

                if (daysUntilEmpty <= 14) {
                    alerts.push({
                        productId: product.id,
                        productName: product.name,
                        currentStock: product.stock_quantity,
                        predictedExhaustionDays: daysUntilEmpty,
                        severity: daysUntilEmpty <= 3 ? 'critical' : daysUntilEmpty <= 7 ? 'warning' : 'info'
                    });
                }
            } else if (product.stock_quantity <= 5) {
                // Absolute low stock fallback
                alerts.push({
                    productId: product.id,
                    productName: product.name,
                    currentStock: product.stock_quantity,
                    predictedExhaustionDays: 0,
                    severity: 'critical'
                });
            }
        });

        return alerts.sort((a, b) => a.predictedExhaustionDays - b.predictedExhaustionDays);
    }

    private static calculateTrends(orders: Order[]) {
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

    private static calculateTopProducts(orders: Order[]) {
        const productMap = new Map<string, { sales: number; revenue: number }>();

        orders.forEach(order => {
            order.items?.forEach(item => {
                if (!item.name) return;
                const existing = productMap.get(item.name) || { sales: 0, revenue: 0 };
                productMap.set(item.name, {
                    sales: existing.sales + (item.quantity || 1),
                    revenue: existing.revenue + ((item.price || 0) * (item.quantity || 1))
                });
            });
        });

        return Array.from(productMap.entries())
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }
}
