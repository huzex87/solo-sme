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
    Loader2,
    Activity,
    BarChart3,
    CreditCard,
    Share2,
    Palette
} from 'lucide-react';
import styles from './page.module.css';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { OrderService, Order } from '@/services/orderService';
import { useTenant } from '@/context/TenantContext';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import { ProductService } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { formatNaira } from '@/lib/formatNaira';

export default function DashboardPage() {
    const { tenantId } = useTenant();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const [analyticsData, ordersData, productsData] = await Promise.all([
                    AnalyticsService.getDashboardStats(tenantId),
                    OrderService.getOrders(tenantId),
                    ProductService.getProducts(tenantId)
                ]);

                setStats(analyticsData);
                setRecentOrders(ordersData.slice(0, 5));

                // Logic for onboarding steps (Simplified for demo)
                const steps = [
                    {
                        id: 'products',
                        title: 'Add Products',
                        description: 'List your first items to start selling.',
                        isCompleted: productsData.length > 0,
                        href: '/dashboard/products/new',
                        icon: Package
                    },
                    {
                        id: 'payments',
                        title: 'Setup Payments',
                        description: 'Connect Paystack to accept local payments.',
                        isCompleted: true, // Assuming completed for now
                        href: '/dashboard/settings',
                        icon: CreditCard
                    },
                    {
                        id: 'social',
                        title: 'Sync Socials',
                        description: 'Import products from Instagram/WhatsApp.',
                        isCompleted: false,
                        href: '/dashboard/onboarding/instagram',
                        icon: Share2
                    },
                    {
                        id: 'branding',
                        title: 'Business Branding',
                        description: 'Customize colors and hero images.',
                        isCompleted: true,
                        href: '/dashboard/settings',
                        icon: Palette
                    }
                ];
                setOnboardingSteps(steps);

            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [tenantId]);

    type OnboardingStep = {
        id: string;
        title: string;
        description: string;
        isCompleted: boolean;
        href: string;
        icon: React.ElementType;
    };

    const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);

    const dashboardStats = [
        {
            label: 'Total Revenue',
            value: stats ? formatNaira(stats.totalRevenue) : formatNaira(0),
            trend: stats ? `${stats.comparison.revenueDelta >= 0 ? '+' : ''}${stats.comparison.revenueDelta.toFixed(1)}%` : '0%',
            up: stats ? stats.comparison.revenueDelta >= 0 : true,
            icon: DollarSign,
            color: 'var(--color-primary)'
        },
        {
            label: 'Total Orders',
            value: stats ? stats.orderCount.toString() : '0',
            trend: stats ? `${stats.comparison.ordersDelta >= 0 ? '+' : ''}${stats.comparison.ordersDelta.toFixed(1)}%` : '0%',
            up: stats ? stats.comparison.ordersDelta >= 0 : true,
            icon: ShoppingCart,
            color: 'var(--color-accent)'
        },
        {
            label: 'Avg Order Value',
            value: stats ? formatNaira(stats.averageOrderValue) : formatNaira(0),
            trend: stats ? `${stats.comparison.aovDelta >= 0 ? '+' : ''}${stats.comparison.aovDelta.toFixed(1)}%` : '0%',
            up: stats ? stats.comparison.aovDelta >= 0 : true,
            icon: Activity,
            color: 'var(--color-primary)'
        },
        {
            label: '7D Reach',
            value: stats ? stats.activeUsers7d.toLocaleString() : '0',
            trend: stats ? `${stats.comparison.visitorsDelta >= 0 ? '+' : ''}${stats.comparison.visitorsDelta.toFixed(1)}%` : '0%',
            up: stats ? stats.comparison.visitorsDelta >= 0 : true,
            icon: Users,
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
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <AlertCircle size={48} />
                <h3>Connection Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="animate-entrance">
            <div className={styles.biBanner}>
                <div className={styles.biIcon}>
                    <Sparkles size={20} />
                </div>
                <div className={styles.biText}>
                    <strong>Merchant Insights Active:</strong> Real-time trends and sales channel performance are now live in your analytics suite.
                </div>
                <Link href="/dashboard/analytics" className="btn btn-sm btn-primary">
                    View Reports
                </Link>
            </div>

            <OnboardingChecklist steps={onboardingSteps} />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                    <p className={styles.pageSubtitle}>Your business at a glance.</p>
                </div>
                <Link href="/dashboard/analytics" className="btn btn-secondary btn-sm">
                    <BarChart3 size={16} className="mr-2" />
                    Detailed Insights
                </Link>
            </div>

            {/* Inspecta-Inspired Stat Pill Layout */}
            <div className={`${styles.statPillContainer} dot-pattern`}>
                {dashboardStats.map((stat) => (
                    <div key={stat.label} className={styles.statPill}>
                        <div className={styles.statPillValue}>{stat.value}</div>
                        <div className={styles.statPillLabel}>{stat.label}</div>
                        <div className={`${styles.statTrend} ${stat.up ? styles.trendUp : styles.trendDown}`} style={{ marginTop: '0.5rem' }}>
                            {stat.up ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                            <span>{stat.trend}</span>
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
                        <p>List a new item</p>
                    </div>
                </Link>
                <Link href="/dashboard/orders" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <Inbox size={24} />
                    </div>
                    <div className={styles.actionText}>
                        <h4>View Orders</h4>
                        <p>Track & manage orders</p>
                    </div>
                </Link>
                <Link href="/dashboard/settings" className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                        <Sparkles size={24} />
                    </div>
                    <div className={styles.actionText}>
                        <h4>Store Design</h4>
                        <p>Customize your store look</p>
                    </div>
                </Link>
            </div>

            <div className={styles.mainGrid}>
                {/* Recent Activity */}
                <div className={styles.mainSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Orders</h2>
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
                                        <td className={styles.orderAmount}>{formatNaira(order.total_amount)}</td>
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

                {/* Inventory Smart Alerts */}
                <div className={styles.sideSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Inventory Alerts</h2>
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
                                <p>All stock levels are looking good.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
