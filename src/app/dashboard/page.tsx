'use client';

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
    MoreHorizontal
} from 'lucide-react';
import styles from './page.module.css';

const STATS = [
    { label: 'Total Revenue', value: '₦1,143,970', trend: '+12.5%', up: true, icon: DollarSign, color: 'var(--accent-primary)' },
    { label: 'Orders Today', value: '23', trend: '+8.3%', up: true, icon: ShoppingCart, color: 'var(--accent-secondary)' },
    { label: 'Products', value: '156', trend: '+3', up: true, icon: Package, color: 'var(--color-success)' },
    { label: 'Customers', value: '1,284', trend: '+18.2%', up: true, icon: Users, color: 'var(--accent-tertiary)' },
];

const RECENT_ORDERS = [
    { id: 'ord-003', customer: 'Fatima Ibrahim', amount: '₦199,990', status: 'paid', date: 'Today, 11:45 AM' },
    { id: 'ord-004', customer: 'Oluwaseun Bakare', amount: '₦75,000', status: 'pending', date: 'Today, 1:00 PM' },
    { id: 'ord-001', customer: 'Adaeze Okonkwo', amount: '₦389,990', status: 'delivered', date: 'Feb 27, 9:30 AM' },
    { id: 'ord-002', customer: 'Chidi Nnamdi', amount: '₦134,000', status: 'shipped', date: 'Feb 26, 3:20 PM' },
    { id: 'ord-005', customer: 'Grace Adekunle', amount: '₦344,990', status: 'delivered', date: 'Feb 25, 8:00 AM' },
];

const STATUS_MAP: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
};

export default function DashboardPage() {
    return (
        <div className="animate-entrance">
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Command Center</h1>
                <p className={styles.pageSubtitle}>Precision management for your evolving business empire.</p>
            </div>

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                {STATS.map((stat) => (
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
                        <div className={styles.statGlow} style={{ background: stat.color }} />
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
                                {RECENT_ORDERS.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>{order.id}</td>
                                        <td className={styles.customerName}>{order.customer}</td>
                                        <td className={styles.orderAmount}>{order.amount}</td>
                                        <td>
                                            <span className={`badge ${STATUS_MAP[order.status]}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.orderDate}>{order.date}</td>
                                        <td>
                                            <button className={styles.rowAction}>
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
                        <div className={`${styles.alertItem} ${styles.critical}`}>
                            <div className={styles.alertIconWrapper}>
                                <AlertCircle size={18} />
                            </div>
                            <div className={styles.alertContent}>
                                <h4>Wireless Headphones</h4>
                                <p>Stock exhausted globally</p>
                            </div>
                            <div className={styles.alertAction}>Restock</div>
                        </div>

                        <div className={`${styles.alertItem} ${styles.warning}`}>
                            <div className={styles.alertIconWrapper}>
                                <TrendingDown size={18} />
                            </div>
                            <div className={styles.alertContent}>
                                <h4>Leather Wallet</h4>
                                <p>4 units remaining</p>
                            </div>
                            <div className={styles.alertAction}>Fulfill</div>
                        </div>

                        <div className={`${styles.alertItem} ${styles.info}`}>
                            <div className={styles.alertIconWrapper}>
                                <Box size={18} />
                            </div>
                            <div className={styles.alertContent}>
                                <h4>Organic T-Shirt</h4>
                                <p>Trending +45% increase</p>
                            </div>
                            <div className={styles.alertAction}>Audit</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
