import { BarChart3, Building2, ShieldCheck, Zap, Clock, Activity, ArrowUpRight, TrendingUp, Users, CreditCard } from 'lucide-react';
import styles from './admin.module.css';

const SYSTEM_STATS = [
    { label: 'Platform MRR', value: '₦4.25M', trend: '+14%', icon: TrendingUp, color: '#34d399' },
    { label: 'Active Tenants', value: '156', trend: '+12', icon: Building2, color: 'var(--accent)' },
    { label: 'System Uptime', value: '99.98%', trend: 'Optimum', icon: Zap, color: '#60a5fa' },
    { label: 'Security Status', value: 'Secure', trend: 'All clear', icon: ShieldCheck, color: '#34d399' },
];

const RECENT_ACTIVITY = [
    { time: '2m ago', action: 'New Tenant Signup', user: 'Chidi Boutique', status: 'verified' },
    { time: '15m ago', action: 'Subscription Upgrade', user: 'Lagos Tech Hub', status: 'success' },
    { time: '1h ago', action: 'Payout Processed', user: 'Batch #882', status: 'processed' },
    { time: '2h ago', action: 'System Update', user: 'v1.4.2 Deployed', status: 'stable' },
    { time: '3h ago', action: 'New Integration', user: 'WhatsApp API v3', status: 'active' },
];

export default function AdminPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Command Center</h1>
            <p className={styles.adminSubtitle}>Global platform governance and real-time health monitoring.</p>

            {/* ── Stats ── */}
            <div className={styles.statGrid}>
                {SYSTEM_STATS.map(stat => (
                    <div key={stat.label} className={styles.adminCard}>
                        <div className={styles.cardHeader}>
                            <h4>{stat.label}</h4>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={17} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className={styles.value}>{stat.value}</div>
                        <div className={stat.trend.includes('+') ? styles.trendUp : styles.trend}>{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* ── Activity + Alerts ── */}
            <div className={styles.adminGridRow}>
                <div className={styles.darkCard} style={{ flex: 2 }}>
                    <div className={styles.panelHeader}>
                        <Activity size={18} color="var(--accent)" />
                        <h3>Recent Activity</h3>
                    </div>
                    <div className={styles.activityList}>
                        {RECENT_ACTIVITY.map((log, i) => (
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

                <div className={styles.darkCard} style={{ flex: 1 }}>
                    <div className={styles.panelHeader}>
                        <ShieldCheck size={18} color="#f87171" />
                        <h3>Critical Alerts</h3>
                    </div>
                    <div className={styles.alertList}>
                        <div className={styles.alertItem}>
                            <Clock size={16} color="#f87171" />
                            <div>
                                <p>3 Payouts Pending</p>
                                <span>Action required for Batch #883</span>
                            </div>
                        </div>
                        <div className={styles.alertItem}>
                            <ArrowUpRight size={16} color="#f87171" />
                            <div>
                                <p>Support Spike</p>
                                <span>+25% increase in billing tickets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Bar ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Monthly Revenue</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>₦4,250,578</div>
                    </div>
                </div>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} style={{ color: '#34d399' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Users</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>2,847</div>
                    </div>
                </div>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={18} style={{ color: '#60a5fa' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Transactions</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>18,432</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
