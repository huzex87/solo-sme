import { Search } from 'lucide-react';
import styles from '../admin.module.css';
import { TenantService } from '@/services/tenantService';
import { createClient } from '@/lib/supabase/server';

export default async function TenantDirectory() {
    const supabase = await createClient();
    const tenants = await TenantService.getTenantsForDirectory(supabase);

    // Calculate stats
    const totalTenants = tenants.length;
    const activeTenants = tenants.length; // Simplified for now, could check recent activity
    const reviewTenants = 0;

    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Tenant Directory</h1>
            <p className={styles.adminSubtitle}>Manage every SME and business on the SOLO ecosystem.</p>

            {/* Stats summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total Tenants', value: totalTenants.toString(), color: 'var(--accent)' },
                    { label: 'Active', value: activeTenants.toString(), color: '#34d399' },
                    { label: 'Under Review', value: reviewTenants.toString(), color: '#60a5fa' },
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
                        {tenants.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 700, color: '#fff' }}>{t.name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t.subdomain}.solosme.ng</td>
                                <td>
                                    <span className={`${styles.badgeDark} styles.badgeNeutral`}>
                                        Growth
                                    </span>
                                </td>
                                <td style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>₦0.00</td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <span className={`${styles.statusDot} ${styles.statusOnline}`} />
                                        <span style={{ textTransform: 'capitalize' }}>active</span>
                                    </span>
                                </td>
                                <td style={{ fontSize: 12 }}>
                                    {new Date(t.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tenants.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        No business tenants found.
                    </div>
                )}
            </div>
        </div>
    );
}
