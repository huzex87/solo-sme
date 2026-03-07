'use client';

import { useState, useEffect } from 'react';
import styles from './customers.module.css';
import { SegmentationService, SegmentStats } from '@/services/segmentationService';
import { CustomerService, Customer } from '@/services/customerService';
import { useTenant } from '@/context/TenantContext';
import { exportToCSV } from '@/utils/csvExport';
import { Loader2, Users } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';

export default function CustomersPage() {
    const { tenantId, isLoading: tenantLoading } = useTenant();
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<SegmentStats[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tenantLoading) return;

        if (!tenantId) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);

                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('TIMEOUT')), 5000)
                );

                const dataResult = await Promise.race([
                    Promise.all([
                        SegmentationService.getSegmentStats(tenantId),
                        CustomerService.getCustomers(tenantId)
                    ]),
                    timeoutPromise
                ]);

                if (dataResult === 'TIMEOUT') throw new Error('TIMEOUT');

                const [segmentStats, customerData] = dataResult as [SegmentStats[], Customer[]];
                setStats(segmentStats);
                setCustomers(customerData);
            } catch (error: any) {
                console.error('Failed to fetch customer data:', error);
                // On timeout, we can still show the page but maybe with empty/cached data
                // For now, just stop loading so it doesn't spin forever
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tenantId, tenantLoading]);

    const filtered = customers.filter(c =>
        c.full_name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        exportToCSV(filtered as unknown as Record<string, unknown>[], 'SOLO_Customers_Export');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Analyzing segments...</p>
            </div>
        );
    }

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Customers</h1>
                    <p className={styles.subtitle}>{customers.length} total customers</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExport}>
                    Download Report
                </button>
            </div>

            {customers.length > 0 ? (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        {stats.map(s => (
                            <div key={s.segment} className={styles.segmentCard} style={{ borderLeft: `4px solid ${s.color}` }}>
                                <div className={styles.segmentGlow} style={{ background: s.color }} />
                                <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{s.segment}</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 850, margin: '0.5rem 0', letterSpacing: '-0.02em' }}>{s.count}</div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>{s.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className={styles.searchWrap}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ maxWidth: 400 }}
                        />
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Segment</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '50%',
                                                    background: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#fff', flexShrink: 0
                                                }}>
                                                    {c.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.full_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge">
                                                Regular
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--body)' }}>{c.total_orders}</td>
                                        <td style={{ fontWeight: 800, color: 'var(--ink)' }}>{formatCurrency(c.total_spend)}</td>
                                        <td style={{ color: 'var(--body)', fontSize: '0.875rem' }}>
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <EmptyState
                    icon={Users}
                    title="No Customers Yet"
                    description="When customers make purchases on your storefront, they will automatically appear here for segmentation and insights."
                />
            )}
        </>
    );
}
