'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, ShoppingBag, Users, Target, Activity, AlertTriangle, Clock, Info } from 'lucide-react';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { useTenant } from '@/context/TenantContext';
import styles from './analytics.module.css';
import SalesChart from '@/components/dashboard/SalesChart';

export default function AnalyticsPage() {
    const { tenantId } = useTenant();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            if (!tenantId) return;
            try {
                setLoading(true);
                setError(null);
                const data = await AnalyticsService.getDashboardStats(tenantId);
                setStats(data);
            } catch (error: unknown) {
                const err = error as Error;
                console.error('[Analytics] Fetch failed:', err);
                setError(err.message || 'Failed to load business intelligence data');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [tenantId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: 500 }}>Calculating business intelligence...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <AlertTriangle className="error-icon" size={48} />
                <h2>Intelligence Sync Failed</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!stats || stats.totalRevenue === 0) {
        return (
            <div className="empty-state">
                <Activity className="empty-icon" size={64} />
                <h2 className="empty-title">Waiting for Data Pulse</h2>
                <p className="empty-text">
                    Your analytics will illuminate here once your first orders begin to flow.
                    Connect your store or launch a campaign to start tracking.
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard/products'}>
                        Add Products
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.location.href = '/dashboard/marketing'}>
                        Launch Campaign
                    </button>
                </div>
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
                    <div className={styles.metricHeader}>
                        <ShoppingBag size={18} className={styles.metricIcon} />
                        <span className={styles.metricLabel}>Total Revenue</span>
                    </div>
                    <h2 className={styles.metricValue}>₦{stats.totalRevenue.toLocaleString()}</h2>
                    <div className={stats.comparison.revenueDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.revenueDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.revenueDelta).toFixed(1)}% vs last period
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <div className={styles.metricHeader}>
                        <Activity size={18} className={styles.metricIcon} />
                        <span className={styles.metricLabel}>Avg order value</span>
                    </div>
                    <h2 className={styles.metricValue}>₦{stats.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
                    <div className={stats.comparison.aovDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.aovDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.aovDelta).toFixed(1)}% efficiency
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <div className={styles.metricHeader}>
                        <Users size={18} className={styles.metricIcon} />
                        <span className={styles.metricLabel}>7D Reach</span>
                    </div>
                    <h2 className={styles.metricValue}>{stats.activeUsers7d}</h2>
                    <div className={stats.comparison.visitorsDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.visitorsDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.visitorsDelta).toFixed(1)}% visitor lift
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <div className={styles.metricHeader}>
                        <Target size={18} className={styles.metricIcon} />
                        <span className={styles.metricLabel}>Conversion</span>
                    </div>
                    <h2 className={styles.metricValue}>{stats.conversionRate.toFixed(1)}%</h2>
                    <div className={stats.comparison.ordersDelta >= 0 ? styles.trendUp : styles.trendDown}>
                        {stats.comparison.ordersDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(stats.comparison.ordersDelta).toFixed(1)}% order growth
                    </div>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <div className={styles.metricHeader}>
                        <Users size={18} className={styles.metricIcon} />
                        <span className={styles.metricLabel}>Retention</span>
                    </div>
                    <h2 className={styles.metricValue}>{stats.customerRetentionRate.toFixed(1)}%</h2>
                    <span className={styles.trendUp}><TrendingUp size={12} /> High loyalty</span>
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

                <div className={`card ${styles.channelsCard}`}>
                    <div className={styles.cardHeader}>
                        <h3>Channel Attribution</h3>
                        <p>Revenue mix by source</p>
                    </div>
                    <div className={styles.channelList}>
                        {stats.channelBreakdown.map((chan, idx) => (
                            <div key={idx} className={styles.channelRow}>
                                <div className={styles.channelInfo}>
                                    <span className={styles.channelName}>{chan.channel}</span>
                                    <div className={styles.channelBarContainer}>
                                        <div
                                            className={styles.channelBar}
                                            style={{
                                                width: `${(chan.revenue / stats.totalRevenue) * 100}%`,
                                                backgroundColor: chan.channel === 'POS' ? 'var(--accent-secondary)' : 'var(--accent-primary)'
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className={styles.channelRevenue}>₦{chan.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`card ${styles.predictiveCard}`}>
                <div className={styles.cardHeader}>
                    <h3>Low Stock Warnings</h3>
                    <p>Items that may run out soon based on how fast they&apos;re selling</p>
                </div>

                {stats.stockAlerts.length === 0 ? (
                    <p className={styles.textMuted}>All your items are well stocked. Nothing to worry about.</p>
                ) : (
                    <div className={styles.alertList}>
                        {stats.stockAlerts.map((alert, idx) => (
                            <div key={idx} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                                <div className={styles.alertIcon}>
                                    {alert.severity === 'critical' ? <AlertTriangle color="var(--color-error)" /> : alert.severity === 'warning' ? <Clock color="var(--color-warning)" /> : <Info color="var(--accent-primary)" />}
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
