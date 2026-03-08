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
    Palette,
    Zap,
    Globe
} from 'lucide-react';
import styles from './page.module.css';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { OrderService, Order } from '@/services/orderService';
import { useTenant } from '@/context/TenantContext';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import PulseFeed from '@/components/dashboard/PulseFeed';
import LiquidGlassGoal from '@/components/dashboard/LiquidGlassGoal';
import CelebrationSystem from '@/components/shared/CelebrationSystem';
import { ProductService } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { formatCurrency } from '@/lib/formatCurrency';

export default function DashboardPage() {
    const { tenantId, tenantName } = useTenant();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [celebrate, setCelebrate] = useState(false);
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

                if (analyticsData.totalRevenue >= 500000) {
                    setCelebrate(true);
                }

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
                        isCompleted: premiumDesignCompleted,
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

        const premiumDesignCompleted = true; // Placeholder for logic

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
            value: stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0),
            trend: stats && stats.comparison.revenueDelta !== 0 ? `${stats.comparison.revenueDelta >= 0 ? '+' : ''}${stats.comparison.revenueDelta.toFixed(1)}%` : null,
            up: stats ? stats.comparison.revenueDelta >= 0 : true,
            icon: DollarSign,
            color: 'var(--accent-revenue)',
            colorClass: styles.statPillGreen
        },
        {
            label: 'Total Orders',
            value: stats ? stats.orderCount.toString() : '0',
            trend: stats && stats.comparison.ordersDelta !== 0 ? `${stats.comparison.ordersDelta >= 0 ? '+' : ''}${stats.comparison.ordersDelta.toFixed(1)}%` : null,
            up: stats ? stats.comparison.ordersDelta >= 0 : true,
            icon: ShoppingCart,
            color: 'var(--accent-orders)',
            colorClass: styles.statPillBlue
        },
        {
            label: 'Avg Order Value',
            value: stats ? formatCurrency(stats.averageOrderValue) : formatCurrency(0),
            trend: stats && stats.comparison.aovDelta !== 0 ? `${stats.comparison.aovDelta >= 0 ? '+' : ''}${stats.comparison.aovDelta.toFixed(1)}%` : null,
            up: stats ? stats.comparison.aovDelta >= 0 : true,
            icon: Activity,
            color: 'var(--accent-customers)',
            colorClass: styles.statPillAmber
        },
        {
            label: '7D Reach',
            value: stats ? stats.activeUsers7d.toLocaleString() : '0',
            trend: stats && stats.comparison.visitorsDelta !== 0 ? `${stats.comparison.visitorsDelta >= 0 ? '+' : ''}${stats.comparison.visitorsDelta.toFixed(1)}%` : null,
            up: stats ? stats.comparison.visitorsDelta >= 0 : true,
            icon: Users,
            color: 'var(--primary)',
            colorClass: styles.statPillTeal
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
                <p>Syncing your business core...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <AlertCircle size={48} />
                <h3>Engine Connection Error</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
            </div>
        );
    }

    return (
        <div className="animate-entrance">
            <CelebrationSystem trigger={celebrate} onComplete={() => setCelebrate(false)} />

            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Merchant Console</h1>
                    <p className={styles.pageSubtitle}>Precision intelligence for <strong>{tenantName || 'your business'}</strong></p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/dashboard/pos" className="btn btn-primary btn-sm">
                        <Zap size={14} />
                        Launch Intelligence POS
                    </Link>
                    <Link href="/dashboard/marketplace" className="btn btn-secondary btn-sm px-3">
                        <Globe size={14} />
                    </Link>
                </div>
            </div>

            <PulseFeed tenantId={tenantId} />

            {/* Stats Overview */}
            <div className={styles.statsOverview}>
                <div className={styles.goalWrapper}>
                    <LiquidGlassGoal
                        current={stats ? stats.totalRevenue : 0}
                        goal={500000}
                        label="Monthly Revenue Target"
                    />
                </div>
                <div className={styles.statPillContainer}>
                    {dashboardStats.slice(0, 3).map((stat) => (
                        <div key={stat.label} className={`${styles.statPill} ${stat.colorClass}`}>
                            <div>
                                <div className={styles.statPillLabel}>{stat.label}</div>
                                <div className={`${styles.statPillValue} font-mono`}>{stat.value}</div>
                            </div>
                            {stat.trend && (
                                <div className={`${styles.statTrend} ${stat.up ? styles.trendUp : styles.trendDown}`}>
                                    {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    <span className="font-mono">{stat.trend}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.actionsGrid}>
                <Link href="/dashboard/products/new" className={styles.actionCard}>
                    <div className={`${styles.actionIconWrapper} ${styles.actionIconGreen}`}><PlusCircle size={20} /></div>
                    <div className={styles.actionText}>
                        <h4>Add Product</h4>
                        <p>List a new item to sell</p>
                    </div>
                </Link>
                <Link href="/dashboard/hub" className={styles.actionCard}>
                    <div className={`${styles.actionIconWrapper} ${styles.actionIconPurple}`}><Sparkles size={20} /></div>
                    <div className={styles.actionText}>
                        <h4>Messages</h4>
                        <p>View conversations</p>
                    </div>
                </Link>
                <Link href="/dashboard/settings" className={styles.actionCard}>
                    <div className={`${styles.actionIconWrapper} ${styles.actionIconAmber}`}><Palette size={20} /></div>
                    <div className={styles.actionText}>
                        <h4>Sovereign Lab</h4>
                        <p>Update brand & colors</p>
                    </div>
                </Link>
            </div>

            <div className={styles.mainGrid}>
                {/* Recent Activity */}
                <div className={styles.mainSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Transactional Flow</h2>
                        <Link href="/dashboard/orders" className="text-[10px] font-bold text-primary uppercase tracking-wider">Audit All</Link>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Client</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className={`${styles.orderId} font-mono`}>{order.id.slice(0, 8)}</td>
                                        <td className={styles.customerName}>{order.customer_name}</td>
                                        <td className={`${styles.orderAmount} font-mono`}>{formatCurrency(order.total_amount)}</td>
                                        <td>
                                            <span className={`badge ${STATUS_MAP[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</td>
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

                {/* Side Panels */}
                <div className={styles.sideSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Logic Alerts</h2>
                    </div>

                    <div className={styles.alertsList}>
                        {stats?.stockAlerts.slice(0, 4).map((alert, i) => (
                            <div key={i} className={`${styles.alertItem} ${styles[alert.severity]}`}>
                                <div className={styles.alertIconWrapper}>
                                    {alert.severity === 'critical' ? <AlertCircle size={16} /> : <Box size={16} />}
                                </div>
                                <div className={styles.alertContent}>
                                    <h4>{alert.productName}</h4>
                                    <p>{alert.predictedExhaustionDays === 0 ? 'Stock Exhausted' : `~${alert.predictedExhaustionDays}d remaining`}</p>
                                </div>
                                <div className={styles.alertAction}>Restock</div>
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
