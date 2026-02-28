import styles from '../admin.module.css';

const SUBS = [
    { period: 'Feb 2026', starter: 450, growth: 120, enterprise: 25, revenue: '₦2,450,000' },
    { period: 'Jan 2026', starter: 410, growth: 105, enterprise: 22, revenue: '₦2,100,200' },
    { period: 'Dec 2025', starter: 380, growth: 98, enterprise: 20, revenue: '₦1,920,400' },
];

export default function SubscriptionsPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Financial Hub</h1>
            <p className={styles.adminSubtitle}>Platform-wide recurring revenue and tier distribution.</p>

            <div className={styles.statGrid}>
                <div className={`card ${styles.adminCard}`}>
                    <h4>Active Subscriptions</h4>
                    <div className={styles.value}>595</div>
                    <div className={styles.trendUp}>↑ 18 New this month</div>
                </div>
                <div className={`card ${styles.adminCard}`}>
                    <h4>LTM Platform Revenue</h4>
                    <div className={styles.value}>₦18.4M</div>
                    <div className={styles.trendUp}>Healthy growth</div>
                </div>
            </div>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Starter (Free)</th>
                            <th>Growth (₦9.9k)</th>
                            <th>Enterprise (₦49.9k)</th>
                            <th>Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SUBS.map((s, idx) => (
                            <tr key={idx}>
                                <td>{s.period}</td>
                                <td>{s.starter}</td>
                                <td>{s.growth}</td>
                                <td>{s.enterprise}</td>
                                <td style={{ fontWeight: 900 }}>{s.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
