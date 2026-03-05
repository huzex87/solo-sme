'use client';

import { useState, useEffect } from 'react';
import styles from './customers.module.css';
import { SegmentationService, SegmentStats } from '@/services/segmentationService';
import { CustomerService, Customer } from '@/services/customerService';
import { useTenant } from '@/context/TenantContext';
import { exportToCSV } from '@/utils/csvExport';
import { Loader2, Users } from 'lucide-react';

export default function CustomersPage() {
    const { tenantId } = useTenant();
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<SegmentStats[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        async function fetchData() {
            try {
                setLoading(true);
                const [segmentStats, customerData] = await Promise.all([
                    SegmentationService.getSegmentStats(tenantId),
                    CustomerService.getCustomers(tenantId)
                ]);
                setStats(segmentStats);
                setCustomers(customerData);
            } catch (error) {
                console.error('Failed to fetch customer data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tenantId]);

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
                                                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#fff', flexShrink: 0,
                                                    boxShadow: '0 4px 12px rgba(124, 77, 255, 0.2)'
                                                }}>
                                                    {c.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.full_name}</div>
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                background: 'var(--glass-bg-medium)',
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--border-subtle)'
                                            }}>
                                                Regular
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{c.total_orders}</td>
                                        <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₦{c.total_spend.toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-lg)' }}>
                    <Users size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>No Customers Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
                        When customers make purchases on your storefront, they will automatically appear here for segmentation and insights.
                    </p>
                </div>
            )}
        </>
    );
}
