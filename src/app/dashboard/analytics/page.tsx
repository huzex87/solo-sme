'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { useTenant } from '@/context/TenantContext';
import styles from './analytics.module.css';
import SalesChart from '@/components/dashboard/SalesChart';

export default function AnalyticsPage() {
    const { tenantId } = useTenant();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const data = await AnalyticsService.getDashboardStats(tenantId);
            setStats(data);
            setLoading(false);
        }
        fetchStats();
    }, [tenantId]);

    if (loading || !stats) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Analytics</h1>
                    <p className={styles.subtitle}>See how your business is doing.</p>
                </div>
                <div className={styles.timeRange}>
                    <span>Last 7 Days</span>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Total Revenue</span>
                    <h2 className={styles.metricValue}>₦{stats.totalRevenue.toLocaleString()}</h2>
                    <span className={styles.trendUp}>↑ 12.5% from last week</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Average Order Value</span>
                    <h2 className={styles.metricValue}>₦{stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
                    <span className={styles.trendUp}>↑ 5.2% from last week</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Active Users (7d)</span>
                    <h2 className={styles.metricValue}>{stats.activeUsers7d}</h2>
                    <span className={styles.trendUp}>↑ 18% more visitors</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Conversion Rate</span>
                    <h2 className={styles.metricValue}>{stats.conversionRate.toFixed(1)}%</h2>
                    <span className={styles.trendDown}>↓ 0.5% — room to improve</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Total Customers</span>
                    <h2 className={styles.metricValue}>{stats.customerCount}</h2>
                    <span className={styles.trendUp}>↑ 8 new this week</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Retention Rate</span>
                    <h2 className={styles.metricValue}>{stats.customerRetentionRate.toFixed(1)}%</h2>
                    <span className={styles.trendUp}>↑ High loyalty</span>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={`card ${styles.chartCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Daily Sales</h3>
                        <p>Your revenue over the last week</p>
                    </div>
                    <SalesChart data={stats.salesTrends} />
                </div>

                <div className={`card ${styles.topProductsCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Best Sellers</h3>
                        <p>Your most popular items</p>
                    </div>
                    <div className={styles.productList}>
                        {stats.topProducts.map((p, idx) => (
                            <div key={idx} className={styles.productRow}>
                                <div className={styles.productInfo}>
                                    <span className={styles.rank}>{idx + 1}</span>
                                    <span className={styles.pName}>{p.name}</span>
                                </div>
                                <div className={styles.productStats}>
                                    <span className={styles.pSales}>{p.sales} sales</span>
                                    <span className={styles.pRevenue}>₦{p.revenue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`card ${styles.predictiveCard}`}>
                <div className={styles.cardHeader}>
                    <h3>Low Stock Warnings</h3>
                    <p>Items that may run out soon based on how fast they're selling</p>
                </div>

                {stats.stockAlerts.length === 0 ? (
                    <p className={styles.textMuted}>All your items are well stocked. Nothing to worry about.</p>
                ) : (
                    <div className={styles.alertList}>
                        {stats.stockAlerts.map((alert, idx) => (
                            <div key={idx} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                                <div className={styles.alertIcon}>
                                    {alert.severity === 'critical' ? '⚠️' : alert.severity === 'warning' ? '⏳' : 'ℹ️'}
                                </div>
                                <div className={styles.alertContent}>
                                    <h4>{alert.productName}</h4>
                                    <p>
                                        Current Stock: <strong>{alert.currentStock} unit{alert.currentStock !== 1 && 's'}</strong>.
                                        {alert.predictedExhaustionDays === 0
                                            ? ' Depleted or running critically low.'
                                            : ` Will likely sell out in about ${alert.predictedExhaustionDays} days.`}
                                    </p>
                                </div>
                                <button className={`btn btn-sm ${alert.severity === 'critical' ? 'btn-primary' : 'btn-secondary'}`}>
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
