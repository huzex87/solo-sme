import { TrendingUp, Users, CreditCard } from 'lucide-react';
import styles from '../admin.module.css';
import { formatCurrency } from '@/lib/utils';

const SUBS = [
    { period: 'Feb 2026', starter: 450, growth: 120, enterprise: 25, revenue: formatCurrency(2450000) },
    { period: 'Jan 2026', starter: 410, growth: 105, enterprise: 22, revenue: formatCurrency(2100200) },
    { period: 'Dec 2025', starter: 380, growth: 98, enterprise: 20, revenue: formatCurrency(1920400) },
    { period: 'Nov 2025', starter: 350, growth: 88, enterprise: 18, revenue: formatCurrency(1680000) },
];

export default function SubscriptionsPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Financial Hub</h1>
            <p className={styles.adminSubtitle}>Platform-wide recurring revenue and tier distribution.</p>

            <div className={styles.statGrid}>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>Active Subscriptions</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={17} style={{ color: 'var(--accent)' }} />
                        </div>
                    </div>
                    <div className={styles.value}>595</div>
                    <div className={styles.trendUp}>↑ 18 New this month</div>
                </div>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>LTM Revenue</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={17} style={{ color: '#34d399' }} />
                        </div>
                    </div>
                    <div className={styles.value}>{formatCurrency(18400000)}</div>
                    <div className={styles.trendUp}>Healthy growth trajectory</div>
                </div>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>ARPU</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={17} style={{ color: '#60a5fa' }} />
                        </div>
                    </div>
                    <div className={styles.value}>{formatCurrency(30900)}</div>
                    <div className={styles.trend}>Average revenue per user</div>
                </div>
            </div>

            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Monthly Breakdown</h3>
                </div>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Starter (Free)</th>
                            <th>Growth ({formatCurrency(9900)})</th>
                            <th>Enterprise ({formatCurrency(49900)})</th>
                            <th>Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SUBS.map((s, idx) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{s.period}</td>
                                <td>{s.starter}</td>
                                <td><span className={`${styles.badgeDark} ${styles.badgeInfo}`}>{s.growth}</span></td>
                                <td><span className={`${styles.badgeDark} ${styles.badgeWarning}`}>{s.enterprise}</span></td>
                                <td style={{ fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{s.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
