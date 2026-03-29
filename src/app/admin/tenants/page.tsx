'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Building2, User, Activity } from 'lucide-react';
import styles from '../admin.module.css';
import { TenantService } from '@/services/tenantService';
import { createClient } from '@/lib/supabase/client';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    owner_name: string;
    created_at: string;
    business_config?: { paystack_secret_key?: string };
}

export default function TenantDirectory() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTenants() {
            const supabase = createClient();
            const data = await TenantService.getTenantsForDirectory(supabase);
            setTenants(data);
            setLoading(false);
        }
        fetchTenants();
    }, []);

    const filteredTenants = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return tenants.filter(t =>
            t.name?.toLowerCase().includes(query) ||
            t.subdomain?.toLowerCase().includes(query) ||
            t.owner_name?.toLowerCase().includes(query)
        );
    }, [searchQuery, tenants]);

    // Calculate real stats from actual data
    const totalTenants = tenants.length;
    // For now, consider any tenant created in the last 30 days as "Active/New"
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeTenants = tenants.filter(t => new Date(t.created_at) > thirtyDaysAgo).length;
    const reviewTenants = tenants.filter(t => !t.business_config?.paystack_secret_key).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-accent rounded-full animate-spin" />
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Loading SOLO Ecosystem...</p>
            </div>
        );
    }

    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Tenant Directory</h1>
            <p className={styles.adminSubtitle}>Manage every SME and business on the SOLO ecosystem.</p>

            {/* Stats summary */}
            <div className={styles.statGrid}>
                {[
                    { label: 'Total Tenants', value: totalTenants.toString(), icon: Building2, color: 'var(--accent)' },
                    { label: 'New (30d)', value: activeTenants.toString(), icon: Activity, color: '#34d399' },
                    { label: 'Pending Setup', value: reviewTenants.toString(), icon: User, color: '#60a5fa' },
                ].map(s => (
                    <div key={s.label} className={styles.adminCard}>
                        <div className={styles.cardHeader}>
                            <h4>{s.label}</h4>
                            <s.icon size={14} color={s.color} style={{ opacity: 0.5 }} />
                        </div>
                        <div className={styles.value}>{s.value}</div>
                        <div className={styles.trend}>Real-time system data</div>
                    </div>
                ))}
            </div>

            {/* Search Bar */}
            <div className={styles.darkCard} style={{ marginBottom: 24, padding: '12px 20px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: 0, color: 'rgba(255,255,255,0.2)' }} />
                    <input
                        type="text"
                        placeholder="Search by business name, subdomain, or owner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            paddingLeft: 28,
                            width: '100%',
                            outline: 'none',
                            fontSize: 14,
                            fontWeight: 500
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Business</th>
                            <th>Owner</th>
                            <th>Subdomain</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTenants.map((t: any) => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 700, color: '#fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{t.name?.[0]}</div>
                                        {t.name}
                                    </div>
                                </td>
                                <td>{t.owner_name}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.6 }}>{t.subdomain}.solosme.ng</td>
                                <td>
                                    <span className={`${styles.badgeDark} ${t.business_config?.paystack_secret_key ? styles.badgeSuccess : styles.badgeWarning}`}>
                                        {t.business_config?.paystack_secret_key ? 'Active' : 'Setup Pending'}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, opacity: 0.5 }}>
                                    {new Date(t.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTenants.length === 0 && (
                    <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 500 }}>
                        <Search size={32} style={{ marginBottom: 16, opacity: 0.1, display: 'block', margin: '0 auto' }} />
                        No business tenants match your search.
                    </div>
                )}
            </div>
        </div>
    );
}
