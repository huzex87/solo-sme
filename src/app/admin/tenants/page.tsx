import styles from '../admin.module.css';

const TENANTS = [
    { id: 't1', name: 'Demo Boutique', subdomain: 'demo-boutique', plan: 'Growth', revenue: '₦892,110', status: 'active' },
    { id: 't2', name: 'Lagos Fashion', subdomain: 'lfash', plan: 'Enterprise', revenue: '₦1,450,900', status: 'active' },
    { id: 't3', name: 'Artisan Hub', subdomain: 'artisan', plan: 'Starter', revenue: '₦45,200', status: 'active' },
    { id: 't4', name: 'Electronic Mart', subdomain: 'emart', plan: 'Growth', revenue: '₦220,110', status: 'warning' },
];

export default function TenantDirectory() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Tenant Directory</h1>
            <p className={styles.adminSubtitle}>Manage every SME and business link on the SOLO ecosystem.</p>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Business Name</th>
                            <th>Subdomain</th>
                            <th>Plan</th>
                            <th>LTM Revenue</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TENANTS.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 700 }}>{t.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)' }}>{t.subdomain}.solo.app</td>
                                <td><span className="badge badge-neutral">{t.plan}</span></td>
                                <td style={{ fontWeight: 800 }}>{t.revenue}</td>
                                <td>
                                    <span className={`badge ${t.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {t.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
