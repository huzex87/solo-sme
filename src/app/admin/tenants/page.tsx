import { Search } from 'lucide-react';
import styles from '../admin.module.css';

const TENANTS = [
    { id: 't1', name: 'Demo Boutique', subdomain: 'demo-boutique', plan: 'Growth', revenue: '₦892,110', status: 'active', joined: 'Jan 2026' },
    { id: 't2', name: 'Lagos Fashion', subdomain: 'lfash', plan: 'Enterprise', revenue: '₦1,450,900', status: 'active', joined: 'Nov 2025' },
    { id: 't3', name: 'Artisan Hub', subdomain: 'artisan', plan: 'Starter', revenue: '₦45,200', status: 'active', joined: 'Feb 2026' },
    { id: 't4', name: 'Electronic Mart', subdomain: 'emart', plan: 'Growth', revenue: '₦220,110', status: 'warning', joined: 'Dec 2025' },
    { id: 't5', name: 'Zara Collections', subdomain: 'zara-ng', plan: 'Enterprise', revenue: '₦2,180,500', status: 'active', joined: 'Oct 2025' },
    { id: 't6', name: 'FreshMart', subdomain: 'freshmart', plan: 'Growth', revenue: '₦340,800', status: 'active', joined: 'Mar 2026' },
];

export default function TenantDirectory() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Tenant Directory</h1>
            <p className={styles.adminSubtitle}>Manage every SME and business on the SOLO ecosystem.</p>

            {/* Stats summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total Tenants', value: '156', color: 'var(--accent)' },
                    { label: 'Active', value: '148', color: '#34d399' },
                    { label: 'Under Review', value: '8', color: '#60a5fa' },
                ].map(s => (
                    <div key={s.label} className={styles.adminCard} style={{ textAlign: 'center', padding: 18 }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Business</th>
                            <th>Subdomain</th>
                            <th>Plan</th>
                            <th>LTM Revenue</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TENANTS.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 700, color: '#fff' }}>{t.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t.subdomain}.solo.app</td>
                                <td>
                                    <span className={`${styles.badgeDark} ${t.plan === 'Enterprise' ? styles.badgeWarning : styles.badgeNeutral}`}>
                                        {t.plan}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>{t.revenue}</td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <span className={`${styles.statusDot} ${t.status === 'active' ? styles.statusOnline : styles.statusWarning}`} />
                                        <span style={{ textTransform: 'capitalize' }}>{t.status}</span>
                                    </span>
                                </td>
                                <td style={{ fontSize: 12 }}>{t.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
