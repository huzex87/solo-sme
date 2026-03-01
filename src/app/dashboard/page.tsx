'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    PlusCircle,
    Inbox,
    Sparkles,
    AlertCircle,
    TrendingDown,
    Box,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import styles from './page.module.css';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { OrderService, Order } from '@/services/orderService';

export default function DashboardPage() {
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tenantId = 't1'; // In production, this would come from the auth context

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const [analyticsData, ordersData] = await Promise.all([
                    AnalyticsService.getDashboardStats(tenantId),
                    OrderService.getOrders(tenantId)
                ]);

                setStats(analyticsData);
                setRecentOrders(ordersData.slice(0, 5));
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Failed to synchronize with Command Center. Please retry.');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [tenantId]);

    const dashboardStats = [
        {
            label: 'Total Revenue',
            value: stats ? `₦${stats.totalRevenue.toLocaleString()}` : '₦0',
            trend: '+12.5%',
            up: true,
            icon: DollarSign,
            color: 'var(--accent-primary)'
        },
        {
            label: 'Total Orders',
            value: stats ? stats.orderCount.toString() : '0',
            trend: '+8.3%',
            up: true,
            icon: ShoppingCart,
            color: 'var(--accent-secondary)'
        },
        {
            label: 'Customers',
            value: stats ? stats.customerCount.toLocaleString() : '0',
            trend: '+18.2%',
            up: true,
            icon: Users,
            color: 'var(--accent-tertiary)'
        },
        {
            label: 'Conversion',
            value: stats ? `${stats.conversionRate.toFixed(1)}%` : '0%',
            trend: '+2.1%',
            up: true,
            icon: Sparkles,
            color: 'var(--color-success)'
        },
    ];

    const STATUS_MAP: Record<string, string> = {
        pending: 'badge-warning',
        paid: 'badge-info',
        shipped: 'badge-info',
        delivered: 'badge-success',
        cancelled: 'badge-error',
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className="animate-spin" size={48} />
                <p>Initializing Command Center...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <AlertCircle size={48} />
                <h3>Signal Lost</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Re-establish Connection</button>
            </div>
        );
    }

    return (
        <div className="animate-entrance">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Command Center</h1>
                <p className={styles.pageSubtitle}>Precision management for your evolving business empire.</p>
            </div>

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                {dashboardStats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIconWrapper} style={{ color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div className={`${styles.statTrend} ${stat.up ? styles.trendUp : styles.trendDown}`}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                        <div className={styles.statBody}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className={styles.actionsGrid}>
                <Link href="/dashboard/products/new" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <PlusCircle size={24} />
                    </div>
                    <div className={styles.actionText}>
                        <h4>Add Product</h4>
                        <p>Expand your catalog</p>
                    </div>
                </Link>
                <Link href="/dashboard/orders" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <Inbox size={24} />
                    </div>
                    <div className={styles.actionText}>
                        <h4>Fulfill Orders</h4>
                        <p>Manage active intake</p>
                    </div>
                </Link>
                <Link href="/dashboard/settings" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <Sparkles size={24} />
                    </div>
                    <div className={styles.actionText}>
                        <h4>Branding Lab</h4>
                        <p>Evolve store aesthetic</p>
                    </div>
                </Link>
            </div>

            <div className={styles.mainGrid}>
                {/* Recent Activity */}
                <div className={styles.mainSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Global Orders</h2>
                        <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">View All</Link>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>{order.id}</td>
                                        <td className={styles.customerName}>{order.customer_name}</td>
                                        <td className={styles.orderAmount}>₦{order.total_amount.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${STATUS_MAP[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.orderDate}>{order.created_at}</td>
                                        <td>
                                            <button className={styles.rowAction}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            No active orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Inventory Intelligence */}
                <div className={styles.sideSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Inventory Intelligence</h2>
                    </div>

                    <div className={styles.alertsList}>
                        {stats?.stockAlerts.slice(0, 3).map((alert) => (
                            <div key={alert.productId} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                                <div className={styles.alertIconWrapper}>
                                    {alert.severity === 'critical' ? <AlertCircle size={18} /> :
                                        alert.severity === 'warning' ? <TrendingDown size={18} /> : <Box size={18} />}
                                </div>
                                <div className={styles.alertContent}>
                                    <h4>{alert.productName}</h4>
                                    <p>
                                        {alert.predictedExhaustionDays === 0
                                            ? 'Stock exhausted globally'
                                            : `~${alert.predictedExhaustionDays} days remaining`}
                                    </p>
                                </div>
                                <div className={styles.alertAction}>
                                    {alert.severity === 'critical' ? 'Restock' : 'Audit'}
                                </div>
                            </div>
                        ))}
                        {(!stats?.stockAlerts || stats.stockAlerts.length === 0) && (
                            <div className={styles.emptyAlerts}>
                                <Box size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                <p>All operational systems nominal.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
