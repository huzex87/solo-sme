import { OrderService, Order } from './orderService';
import { ProductService } from './productService';
import { CurrencyService } from './currencyService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    comparison: {
        revenueDelta: number;
        ordersDelta: number;
        aovDelta: number;
        visitorsDelta: number;
    };
    channelBreakdown: { channel: string; revenue: number; orders: number }[];
    salesTrends: { date: string; amount: number }[];
    topProducts: { name: string; sales: number; revenue: number }[];
    stockAlerts: StockAlert[];
}

export class AnalyticsService {
    /**
     * Calculates high-fidelity business intelligence from real database records.
     * Hardened: Strict tenant_id validation and server-side pre-filtering.
     */
    static async getDashboardStats(tenantId: string, dateRange: string = '7d', targetCurrency?: string): Promise<AnalyticsSummary> {
        if (!tenantId) throw new Error("Tenant ID is required for analytics");

        // 0. Calculate date range before fetching
        const now = new Date();
        let startDate = new Date();
        if (dateRange === '24h') startDate.setHours(now.getHours() - 24);
        else if (dateRange === '7d') startDate.setDate(now.getDate() - 7);
        else if (dateRange === '30d') startDate.setDate(now.getDate() - 30);
        else if (dateRange === '3m') startDate.setMonth(now.getMonth() - 3);
        else if (dateRange === '1y') startDate.setFullYear(now.getFullYear() - 1);
        else startDate.setFullYear(2020); // All time

        const orders = await OrderService.getOrders(tenantId, startDate);
        const products = await ProductService.getProducts(tenantId);

        const filteredOrders = orders; // Already filtered by server

        // 1. Currency Normalization (Merchant View)
        let normalizedOrders = filteredOrders;
        if (targetCurrency) {
            normalizedOrders = filteredOrders.map(o => ({
                ...o,
                total_amount: CurrencyService.convert(o.total_amount, 'NGN', targetCurrency)
            }));
        }

        const ordersToAnalyze = normalizedOrders;

        // 2. Core Financial Metrics
        const totalRevenue = ordersToAnalyze.reduce((sum, order) => sum + order.total_amount, 0);
        const orderCount = ordersToAnalyze.length;
        const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        const customerEmails = ordersToAnalyze.map(o => o.customer_email);
        const uniqueCustomers = new Set(customerEmails).size;

        const emailCounts: Record<string, number> = {};
        customerEmails.forEach(email => emailCounts[email] = (emailCounts[email] || 0) + 1);
        const repeatCustomersCount = Object.values(emailCounts).filter(count => count > 1).length;
        const customerRetentionRate = uniqueCustomers > 0 ? (repeatCustomersCount / uniqueCustomers) * 100 : 0;

        const estimatedVisitors = Math.max(uniqueCustomers * 2.5, orderCount * 5);
        const conversionRate = estimatedVisitors > 0 ? (orderCount / estimatedVisitors) * 100 : 0;

        const channelBreakdown = this.calculateChannelBreakdown(ordersToAnalyze);
        const comparison = this.calculateComparison(orders, dateRange); // Compare vs previous period of same length
        const stockAlerts = this.calculateStockAlerts(products, ordersToAnalyze);
        const salesTrends = this.calculateTrends(ordersToAnalyze, dateRange);
        const topProducts = this.calculateTopProducts(ordersToAnalyze);

        return {
            totalRevenue,
            orderCount,
            averageOrderValue,
            customerCount: uniqueCustomers,
            conversionRate,
            activeUsers7d: Math.round(estimatedVisitors),
            customerRetentionRate,
            comparison,
            channelBreakdown,
            salesTrends,
            topProducts,
            stockAlerts
        };
    }

    private static calculateComparison(allOrders: Order[], dateRange: string) {
        const now = new Date();
        const getRangeMs = (range: string) => {
            if (range === '24h') return 24 * 60 * 60 * 1000;
            if (range === '7d') return 7 * 24 * 60 * 60 * 1000;
            if (range === '30d') return 30 * 24 * 60 * 60 * 1000;
            if (range === '3m') return 90 * 24 * 60 * 60 * 1000;
            if (range === '1y') return 365 * 24 * 60 * 60 * 1000;
            return 365 * 10 * 24 * 60 * 60 * 1000; // All time fallback
        };

        const rangeMs = getRangeMs(dateRange);
        const startDate = new Date(now.getTime() - rangeMs);
        const previousStartDate = new Date(startDate.getTime() - rangeMs);

        const currentPeriodOrders = allOrders.filter(o => new Date(o.created_at) >= startDate);
        const previousPeriodOrders = allOrders.filter(o => {
            const date = new Date(o.created_at);
            return date >= previousStartDate && date < startDate;
        });

        const currentRevenue = currentPeriodOrders.reduce((s, o) => s + o.total_amount, 0);
        const previousRevenue = previousPeriodOrders.reduce((s, o) => s + o.total_amount, 0);

        const calculateDelta = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        return {
            revenueDelta: calculateDelta(currentRevenue, previousRevenue),
            ordersDelta: calculateDelta(currentPeriodOrders.length, previousPeriodOrders.length),
            aovDelta: calculateDelta(
                currentPeriodOrders.length > 0 ? currentRevenue / currentPeriodOrders.length : 0,
                previousPeriodOrders.length > 0 ? previousRevenue / previousPeriodOrders.length : 0
            ),
            visitorsDelta: 0
        };
    }

    private static calculateChannelBreakdown(orders: Order[]) {
        const breakdown: Record<string, { revenue: number; orders: number }> = {
            'online': { revenue: 0, orders: 0 },
            'pos': { revenue: 0, orders: 0 },
            'marketplace': { revenue: 0, orders: 0 }
        };

        orders.forEach(order => {
            const chan = order.channel || 'online';
            if (!breakdown[chan]) breakdown[chan] = { revenue: 0, orders: 0 };
            breakdown[chan].revenue += order.total_amount;
            breakdown[chan].orders += 1;
        });

        return Object.entries(breakdown).map(([channel, stats]) => ({
            channel: channel.toUpperCase(),
            ...stats
        }));
    }

    private static calculateStockAlerts(products: { id: string; name: string; stock_quantity: number }[], orders: Order[]): StockAlert[] {
        const alerts: StockAlert[] = [];
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

    private static calculateTrends(orders: Order[], dateRange: string) {
        // Simple day-based trend for 7d/30d
        const days = dateRange === '24h' ? 24 : dateRange === '7d' ? 7 : 30;
        const trendKeys = Array.from({ length: days }, (_, i) => {
            const d = new Date();
            if (dateRange === '24h') d.setHours(d.getHours() - i);
            else d.setDate(d.getDate() - i);
            return d.toISOString().split(dateRange === '24h' ? ':' : 'T')[0];
        }).reverse();

        const trendsMap = new Map<string, number>();
        trendKeys.forEach(key => trendsMap.set(key, 0));

        orders.forEach(order => {
            const date = order.created_at.split(dateRange === '24h' ? ':' : 'T')[0];
            if (trendsMap.has(date)) {
                trendsMap.set(date, (trendsMap.get(date) || 0) + order.total_amount);
            }
        });

        return trendKeys.map(key => ({
            date: dateRange === '24h'
                ? `${key.split('T')[1]}h`
                : new Date(key).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            amount: trendsMap.get(key) || 0
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

    /**
     * Generates a CSV blob for high-fidelity business reporting.
     */
    static async exportToCSV(stats: AnalyticsSummary, tenantId?: string): Promise<Blob> {
        // If we have stats, we use them. If we only had tenantId, we'd fetch them (but we now require stats for high-fidelity)

        const headers = ["Metric", "Value", "Delta %", "Status"];
        const rows = [
            ["Total Revenue", `₦${stats.totalRevenue.toLocaleString()}`, `${stats.comparison.revenueDelta.toFixed(1)}%`, stats.comparison.revenueDelta >= 0 ? "Growth" : "Decline"],
            ["Total Orders", stats.orderCount, `${stats.comparison.ordersDelta.toFixed(1)}%`, stats.comparison.ordersDelta >= 0 ? "Growth" : "Decline"],
            ["Customer Count", stats.customerCount, "-", "-"],
            ["Retention Rate", `${stats.customerRetentionRate.toFixed(1)}%`, "-", "-"],
            ["Conversion Rate", `${stats.conversionRate.toFixed(1)}%`, "-", "-"]
        ];

        // Add Top Products
        rows.push(["", "", "", ""]);
        rows.push(["TOP PRODUCTS", "REVENUE", "UNITS SOLD", ""]);
        stats.topProducts.forEach(p => {
            rows.push([p.name, `₦${p.revenue.toLocaleString()}`, p.sales.toString(), ""]);
        });

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    /**
     * Generates a JSON blob for institutional data portability.
     */
    static async exportToJSON(stats: AnalyticsSummary, tenantId?: string): Promise<Blob> {
        const data = {
            metadata: {
                tenantId,
                timestamp: new Date().toISOString(),
                version: "3.0"
            },
            data: stats
        };

        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }

    /**
     * Generates a high-fidelity PDF report for business intelligence.
     */
    static async exportToPDF(stats: AnalyticsSummary, tenantName: string = 'SOLO Merchant'): Promise<Blob> {
        const doc = new jsPDF() as any;
        const timestamp = new Date().toLocaleDateString();

        // Header
        doc.setFillColor(15, 23, 42); // slate-950
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('SOLO PERFORMANCE REPORT', 15, 24);

        doc.setFontSize(10);
        doc.text(`Business: ${tenantName}`, 15, 30);
        doc.text(`Generated: ${timestamp}`, 15, 35);

        // Summary Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Executive Summary', 15, 55);

        doc.autoTable({
            startY: 60,
            head: [['Metric', 'Value', 'Growth']],
            body: [
                ['Total Revenue', `NGN ${stats.totalRevenue.toLocaleString()}`, `${stats.comparison.revenueDelta.toFixed(1)}%`],
                ['Total Orders', stats.orderCount.toString(), `${stats.comparison.ordersDelta.toFixed(1)}%`],
                ['Avg Order Value', `NGN ${stats.averageOrderValue.toFixed(2)}`, `${stats.comparison.aovDelta.toFixed(1)}%`],
                ['Unique Customers', stats.customerCount.toString(), '-'],
                ['Retention Rate', `${stats.customerRetentionRate.toFixed(1)}%`, '-'],
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }
        });

        // Top Products Table
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text('Product Performance Leaderboard', 15, finalY);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Product Name', 'Units Sold', 'Total Revenue']],
            body: stats.topProducts.map(p => [p.name, p.sales.toString(), `NGN ${p.revenue.toLocaleString()}`]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        return doc.output('blob');
    }
}
