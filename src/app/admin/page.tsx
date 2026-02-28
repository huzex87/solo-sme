import styles from './admin.module.css';

const SYSTEM_STATS = [
    { label: 'Platform MRR', value: '₦4,250,578', trend: '+14% YoY', icon: '💰' },
    { label: 'Active Tenants', value: '156', trend: '+12 this month', icon: '🏬' },
    { label: 'Total Sales (All)', value: '₦12,892,110', trend: 'Healthy', icon: '📊' },
    { label: 'System Uptime', value: '99.98%', trend: 'Last 30d', icon: '🛡️' },
];

export default function AdminPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Command Center</h1>
            <p className={styles.adminSubtitle}>Global platform governance and health monitoring.</p>

            <div className={styles.statGrid}>
                {SYSTEM_STATS.map(stat => (
                    <div key={stat.label} className={`card ${styles.adminCard}`}>
                        <h4>{stat.label}</h4>
                        <div className={styles.value}>{stat.value}</div>
                        <div className={stat.trend.includes('+') ? styles.trendUp : styles.trend}>
                            {stat.icon} {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Recent Platform Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { time: '2m ago', action: 'New Tenant Signup', user: 'Chidi Boutique' },
                        { time: '15m ago', action: 'Subscription Upgrade', user: 'Lagos Tech Hub' },
                        { time: '1h ago', action: 'Payout Processed', user: 'Batch #882' },
                        { time: '2h ago', action: 'System Update', user: 'v1.4.2 Deployed' },
                    ].map((log, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ fontWeight: 600 }}>{log.action}: {log.user}</span>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
