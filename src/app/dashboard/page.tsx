import Link from 'next/link';
import styles from './page.module.css';

const STATS = [
    { label: 'Total Revenue', value: '₦1,143,970', trend: '+12.5%', up: true, icon: '💰', bg: 'rgba(124, 77, 255, 0.1)' },
    { label: 'Orders Today', value: '23', trend: '+8.3%', up: true, icon: '🧾', bg: 'rgba(0, 229, 255, 0.1)' },
    { label: 'Products', value: '156', trend: '+3', up: true, icon: '📦', bg: 'rgba(0, 200, 83, 0.1)' },
    { label: 'Customers', value: '1,284', trend: '+18.2%', up: true, icon: '👥', bg: 'rgba(255, 193, 7, 0.1)' },
];

const RECENT_ORDERS = [
    { id: 'ord-003', customer: 'Fatima Ibrahim', amount: '₦199.99', status: 'paid', date: 'Today, 11:45 AM' },
    { id: 'ord-004', customer: 'Oluwaseun Bakare', amount: '₦75.00', status: 'pending', date: 'Today, 1:00 PM' },
    { id: 'ord-001', customer: 'Adaeze Okonkwo', amount: '₦389.99', status: 'delivered', date: 'Feb 27, 9:30 AM' },
    { id: 'ord-002', customer: 'Chidi Nnamdi', amount: '₦134.00', status: 'shipped', date: 'Feb 26, 3:20 PM' },
    { id: 'ord-005', customer: 'Grace Adekunle', amount: '₦344.99', status: 'delivered', date: 'Feb 25, 8:00 AM' },
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
                <p className={styles.pageSubtitle}>Welcome back. Here&apos;s what&apos;s happening with your business.</p>
            </div>

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                {STATS.map((stat) => (
                    <div key={stat.label} className={`card ${styles.statCard}`}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: stat.bg }}>
                                {stat.icon}
                            </div>
                            <span className={`${styles.statTrend} ${stat.up ? styles.trendUp : styles.trendDown}`}>
                                {stat.up ? '↑' : '↓'} {stat.trend}
                            </span>
                        </div>
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className={styles.actionsGrid}>
                <Link href="/dashboard/products/new" className={`card ${styles.actionCard}`}>
                    <span className={styles.actionIcon}>➕</span>
                    <div className={styles.actionText}>
                        <h4>Add Product</h4>
                        <p>List a new item in your store</p>
                    </div>
                </Link>
                <Link href="/dashboard/orders" className={`card ${styles.actionCard}`}>
                    <span className={styles.actionIcon}>📋</span>
                    <div className={styles.actionText}>
                        <h4>View All Orders</h4>
                        <p>Manage and track shipments</p>
                    </div>
                </Link>
                <Link href="/dashboard/settings" className={`card ${styles.actionCard}`}>
                    <span className={styles.actionIcon}>🎨</span>
                    <div className={styles.actionText}>
                        <h4>Customize Store</h4>
                        <p>Branding, domain, and more</p>
                    </div>
                </Link>
            </div>

            {/* Inventory Alerts */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Inventory Alerts</h2>
                <span className="badge badge-error" style={{ fontSize: '10px' }}>3 Action Required</span>
            </div>

            <div className={styles.alertsGrid}>
                <div className={`card ${styles.alertCard} ${styles.critical}`}>
                    <div className={styles.alertHeader}>
                        <span className={styles.alertIcon}>⚠️</span>
                        <span className={styles.alertTag}>OUT OF STOCK</span>
                    </div>
                    <h4 className={styles.alertTitle}>Premium Wireless Headphones</h4>
                    <p className={styles.alertMeta}>Last sold: 2 hours ago</p>
                    <Link href="/dashboard/products" className="btn btn-primary btn-sm btn-block" style={{ marginTop: '1rem' }}>Restock Now</Link>
                </div>

                <div className={`card ${styles.alertCard} ${styles.warning}`}>
                    <div className={styles.alertHeader}>
                        <span className={styles.alertIcon}>📉</span>
                        <span className={styles.alertTag}>LOW STOCK</span>
                    </div>
                    <h4 className={styles.alertTitle}>Artisan Leather Wallet</h4>
                    <p className={styles.alertMeta}>Remaining: 4 units</p>
                    <Link href="/dashboard/products" className="btn btn-ghost btn-sm btn-block" style={{ marginTop: '1rem' }}>Order More</Link>
                </div>

                <div className={`card ${styles.alertCard} ${styles.info}`}>
                    <div className={styles.alertHeader}>
                        <span className={styles.alertIcon}>📦</span>
                        <span className={styles.alertTag}>HIGH DEMAND</span>
                    </div>
                    <h4 className={styles.alertTitle}>Organic Cotton T-Shirt</h4>
                    <p className={styles.alertMeta}>Trending: +45% this week</p>
                    <Link href="/dashboard/products" className="btn btn-ghost btn-sm btn-block" style={{ marginTop: '1rem' }}>Manage Stock</Link>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RECENT_ORDERS.map((order) => (
                            <tr key={order.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                    {order.id}
                                </td>
                                <td style={{ fontWeight: 500 }}>{order.customer}</td>
                                <td style={{ fontWeight: 600 }}>{order.amount}</td>
                                <td>
                                    <span className={`badge ${STATUS_MAP[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    {order.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
