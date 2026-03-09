import { BarChart3, Building2, ShieldAlert, Zap, Clock, Activity, ArrowUpRight } from 'lucide-react';
import styles from './admin.module.css';

const SYSTEM_STATS = [
    { label: 'Platform MRR', value: '₦4,250,578', trend: '+14% YoY', icon: BarChart3, color: 'var(--color-success)' },
    { label: 'Active Tenants', value: '156', trend: '+12 this month', icon: Building2, color: 'var(--color-primary)' },
    { label: 'System Health', value: '99.98%', trend: 'Optimum', icon: Zap, color: 'var(--color-warning)' },
    { label: 'Security Status', value: 'Secure', trend: 'Last 30d', icon: ShieldAlert, color: 'var(--color-teal)' },
];

export default function AdminPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Command Center</h1>
            <p className={styles.adminSubtitle}>Global platform governance and health monitoring.</p>

            <div className={styles.statGrid}>
                {SYSTEM_STATS.map(stat => (
                    <div key={stat.label} className={`card ${styles.adminCard}`}>
                        <div className={styles.cardHeader}>
                            <h4>{stat.label}</h4>
                            <stat.icon size={20} style={{ color: stat.color, opacity: 0.8 }} />
                        </div>
                        <div className={styles.value}>{stat.value}</div>
                        <div className={stat.trend.includes('+') ? styles.trendUp : styles.trend}>
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.adminGridRow}>
                <div className="card" style={{ padding: '2rem', flex: 2 }}>
                    <div className={styles.panelHeader}>
                        <Activity size={20} color="var(--accent-primary)" />
                        <h3>Institutional Oversight</h3>
                    </div>
                    <div className={styles.activityList}>
                        {[
                            { time: '2m ago', action: 'New Tenant Signup', user: 'Chidi Boutique', status: 'verified' },
                            { time: '15m ago', action: 'Subscription Upgrade', user: 'Lagos Tech Hub', status: 'success' },
                            { time: '1h ago', action: 'Payout Processed', user: 'Batch #882', status: 'processed' },
                            { time: '2h ago', action: 'System Update', user: 'v1.4.2 Deployed', status: 'stable' },
                        ].map((log, i) => (
                            <div key={i} className={styles.activityItem}>
                                <div className={styles.activityMain}>
                                    <span className={styles.actionLabel}>{log.action}</span>
                                    <span className={styles.actionUser}>{log.user}</span>
                                </div>
                                <div className={styles.activityMeta}>
                                    <span className={styles.statusTag}>{log.status}</span>
                                    <span className={styles.timeLabel}>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '2rem', flex: 1 }}>
                    <div className={styles.panelHeader}>
                        <ShieldAlert size={20} color="var(--color-error)" />
                        <h3>Critical Alerts</h3>
                    </div>
                    <div className={styles.alertList}>
                        <div className={styles.alertItem}>
                            <Clock size={16} />
                            <div>
                                <p>3 Payouts Pending</p>
                                <span>Action required for Batch #883</span>
                            </div>
                        </div>
                        <div className={styles.alertItem}>
                            <ArrowUpRight size={16} />
                            <div>
                                <p>Support Spike</p>
                                <span>+25% increase in billing tickets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
