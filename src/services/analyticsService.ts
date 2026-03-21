import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { InventoryService } from './inventoryService';
import { FinanceService } from './financeService';
import { OrderService, Order } from './orderService';
import { jsPDF } from 'jspdf';
import { LedgerService } from './ledgerService';
import { SupabaseClient } from '@supabase/supabase-js';

export interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
}

export interface SalesTrend {
    date: string;
    revenue: number;
    orders: number;
    [key: string]: string | number;
}

export interface StockAlert {
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
}

export interface ChannelPerformance {
    channel: string;
    revenue: number;
    orders: number;
}

export interface PredictiveStockItem {
    id: string;
    name: string;
    stock: number;
    runwayDays: number;
    dailyVelocity: number;
    status: 'CRITICAL' | 'LOW' | 'STABLE';
}

export interface AnalyticsSummary {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    customerCount: number;
    customerRetentionRate: number;
    comparison: {
        revenueDelta: number;
        ordersDelta: number;
        aovDelta: number;
        visitorsDelta: number; // For Customers metric
    };
    channelBreakdown: ChannelPerformance[];
    topProducts: TopProduct[];
    salesTrends: SalesTrend[];
    stockAlerts: StockAlert[];
    predictiveInventory: PredictiveStockItem[];
}

export class AnalyticsService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Calculates high-fidelity business intelligence from real database records.
     * Uses optimized Supabase aggregation filters to stay within memory limits.
     */
    static async getDashboardStats(tenantId: string, dateRange: string = '7d', targetCurrency?: string, client?: SupabaseClient): Promise<AnalyticsSummary> {
        if (!tenantId) throw new Error("Tenant ID is required for analytics");

        if (!isSupabaseConfigured) {
            return this.getEmptyStats();
        }

        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;

        switch (dateRange) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default: // 7d
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const supabase = this.getClient(client);

        const [currentOrders, previousOrders, inventoryAlerts] = await Promise.all([
            OrderService.getOrders(tenantId, startDate, client),
            supabase.from('orders').select('total_amount, channel').eq('tenant_id', tenantId).gte('created_at', previousStartDate.toISOString()).lt('created_at', startDate.toISOString()),
            InventoryService.getLowStockAlerts(tenantId, client)
        ]);

        const totalRevenue = (currentOrders as Order[]).reduce((acc: number, curr: Order) => acc + curr.total_amount, 0);
        const prevRevenue = (previousOrders.data || []).reduce((acc: number, curr: { total_amount: number }) => acc + curr.total_amount, 0);

        const orderCount = currentOrders.length;
        const prevOrderCount = (previousOrders.data || []).length;

        const aov = orderCount > 0 ? totalRevenue / orderCount : 0;
        const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

        // Calculate comparison deltas
        const revenueDelta = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 100;
        const ordersDelta = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 100;
        const aovDelta = prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 100;

        // Channel Breakdown
        const channelsMap = new Map<string, { revenue: number; orders: number }>();
        currentOrders.forEach((order: Order) => {
            const chan = order.channel || 'WEB';
            const existing = channelsMap.get(chan) || { revenue: 0, orders: 0 };
            channelsMap.set(chan, {
                revenue: existing.revenue + (order.total_amount || 0),
                orders: existing.orders + 1
            });
        });

        const channelBreakdown = Array.from(channelsMap.entries()).map(([channel, stats]) => ({
            channel,
            ...stats
        }));

        // Extract top products
        const productMap = new Map<string, { name: string; sales: number; revenue: number }>();
        currentOrders.forEach((order: Order) => {
            (order.items || []).forEach((item) => {
                const itemId = String(item.id || 'unknown');
                const itemName = String(item.name || 'Unknown');
                const existing = productMap.get(itemId) || { name: itemName, sales: 0, revenue: 0 };
                productMap.set(itemId, {
                    name: itemName,
                    sales: existing.sales + (Number(item.quantity) || 1),
                    revenue: existing.revenue + ((Number(item.price) || 0) * (Number(item.quantity) || 1))
                });
            });
        });

        const topProducts = Array.from(productMap.entries())
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Calculate sales trends (daily buckets)
        const salesTrends = this.calculateTrends(currentOrders, startDate);

        // Calculate real customer metrics
        const { data: customerStats } = await supabase
            .from('customers')
            .select('id, created_at')
            .eq('tenant_id', tenantId);

        const allCustomers = customerStats || [];
        const currentCustomers = allCustomers.filter(c => new Date(c.created_at) >= startDate);
        const prevPeriodCustomers = allCustomers.filter(c => new Date(c.created_at) >= previousStartDate && new Date(c.created_at) < startDate);

        // Retention Rate calculation: customers with multiple orders / total customers
        const customerOrderCounts = new Map<string, number>();
        currentOrders.forEach((o: Order) => {
            if (o.customer_id) {
                customerOrderCounts.set(o.customer_id, (customerOrderCounts.get(o.customer_id) || 0) + 1);
            }
        });
        const repeatCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
        const totalOrderingCustomers = customerOrderCounts.size;
        const retentionRate = totalOrderingCustomers > 0 ? (repeatCustomers / totalOrderingCustomers) * 100 : 0;

        // Visitors delta (approximated by customer growth for now)
        const visitorsDelta = prevPeriodCustomers.length > 0
            ? ((currentCustomers.length - prevPeriodCustomers.length) / prevPeriodCustomers.length) * 100
            : 100;

        return {
            totalRevenue,
            orderCount,
            averageOrderValue: aov,
            customerCount: allCustomers.length,
            customerRetentionRate: retentionRate,
            comparison: {
                revenueDelta,
                ordersDelta,
                aovDelta,
                visitorsDelta
            },
            channelBreakdown,
            topProducts,
            salesTrends,
            stockAlerts: inventoryAlerts.map(i => ({
                productId: i.id,
                productName: i.name,
                currentStock: i.stock_quantity,
                threshold: i.low_stock_threshold || 5
            })),
            predictiveInventory: await InventoryService.getPredictiveStockAnalysis(tenantId, client) as PredictiveStockItem[]
        };
    }

    /**
     * Aggregates marketing campaign performance for the dashboard.
     */
    static async getMarketingInsights(tenantId: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return null;
        const supabase = this.getClient(client);

        const { data: campaigns, error } = await supabase
            .from('marketing_campaigns')
            .select('channel, recipient_count, open_count, click_count, status')
            .eq('tenant_id', tenantId)
            .neq('status', 'draft');

        if (error) {
            console.error('Error fetching marketing insights:', error);
            return null;
        }

        // Aggregate by channel
        const channelStats = new Map<string, { recipients: number; opens: number; clicks: number; count: number }>();
        
        (campaigns || []).forEach(c => {
            const stats = channelStats.get(c.channel) || { recipients: 0, opens: 0, clicks: 0, count: 0 };
            channelStats.set(c.channel, {
                recipients: stats.recipients + (c.recipient_count || 0),
                opens: stats.opens + (c.open_count || 0),
                clicks: stats.clicks + (c.click_count || 0),
                count: stats.count + 1
            });
        });

        const insights = Array.from(channelStats.entries()).map(([channel, stats]) => ({
            channel,
            reach: stats.recipients,
            openRate: stats.recipients > 0 ? (stats.opens / stats.recipients) * 100 : 0,
            ctr: stats.recipients > 0 ? (stats.clicks / stats.recipients) * 100 : 0,
            campaignCount: stats.count
        }));

        return insights;
    }

    private static calculateTrends(orders: Order[], startDate: Date): SalesTrend[] {
        const trendsMap = new Map<string, { revenue: number; orders: number }>();

        // Initialize daily buckets
        const days = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            trendsMap.set(date.toISOString().split('T')[0], { revenue: 0, orders: 0 });
        }

        orders.forEach((order: Order) => {
            const date = (order.created_at || '').split('T')[0];
            const existing = trendsMap.get(date) || { revenue: 0, orders: 0 };
            trendsMap.set(date, {
                revenue: existing.revenue + (order.total_amount || 0),
                orders: existing.orders + 1
            });
        });

        return Array.from(trendsMap.entries()).map(([date, stats]) => ({
            date,
            ...stats
        }));
    }

    /**
     * Prepares report data for export in JSON format.
     */
    static async exportToJSON(stats: AnalyticsSummary, tenantId: string): Promise<Blob> {
        const data = {
            version: '1.99.0',
            exportedAt: new Date().toISOString(),
            tenantId,
            data: stats
        };

        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }

    /**
     * Prepares report data for export in CSV format.
     */
    static async exportToCSV(stats: AnalyticsSummary, tenantId: string): Promise<Blob> {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Report Version', '1.99.0'],
            ['Exported At', new Date().toISOString()],
            ['Tenant ID', tenantId],
            ['Total Revenue', stats.totalRevenue.toString()],
            ['Order Count', stats.orderCount.toString()],
            ['Avg Order Value', stats.averageOrderValue.toString()],
            ['Customer Count', stats.customerCount.toString()]
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return new Blob([csvContent], { type: 'text/csv' });
    }

    /**
     * Returns a zeroed-out AnalyticsSummary for new merchants or fallback states.
     */
    static getEmptyStats(): AnalyticsSummary {
        return {
            totalRevenue: 0,
            orderCount: 0,
            averageOrderValue: 0,
            customerCount: 0,
            customerRetentionRate: 0,
            comparison: {
                revenueDelta: 0,
                ordersDelta: 0,
                aovDelta: 0,
                visitorsDelta: 0
            },
            channelBreakdown: [],
            topProducts: [],
            salesTrends: [],
            stockAlerts: [],
            predictiveInventory: []
        };
    }

    /**
     * Generates a high-fidelity PDF report for business intelligence.
     */
    static async exportToPDF(stats: AnalyticsSummary, tenantName: string = 'SOLO Merchant'): Promise<Blob> {
        interface JsPDFWithAutoTable extends jsPDF {
            autoTable: (options: Record<string, unknown>) => void;
            lastAutoTable: { finalY: number };
        }
        const doc = new jsPDF() as JsPDFWithAutoTable;
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
        const finalY = doc.lastAutoTable.finalY + 15;
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
