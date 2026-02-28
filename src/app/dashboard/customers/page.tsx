'use client';

import { useState } from 'react';
import styles from './customers.module.css';
import { SegmentationService, CustomerSegment } from '@/services/segmentationService';

interface Customer {
    id: string;
    name: string;
    email: string;
    orders: number;
    spent: number;
    lastOrder: string;
    segment: CustomerSegment;
}

const DEMO_CUSTOMERS: Customer[] = [
    { id: 'c5', name: 'Grace Adekunle', email: 'grace@example.com', orders: 12, spent: 145670, lastOrder: 'Feb 25', segment: 'VIP' },
    { id: 'c3', name: 'Fatima Ibrahim', email: 'fatima@example.com', orders: 8, spent: 21340, lastOrder: 'Feb 28', segment: 'Regular' },
    { id: 'c1', name: 'Adaeze Okonkwo', email: 'adaeze@example.com', orders: 5, spent: 12450, lastOrder: 'Feb 15', segment: 'Dormant' },
    { id: 'c2', name: 'Chidi Nnamdi', email: 'chidi@example.com', orders: 3, spent: 5670, lastOrder: 'Feb 26', segment: 'Regular' },
    { id: 'c4', name: 'Oluwaseun Bakare', email: 'seun@example.com', orders: 0, spent: 0, lastOrder: 'Feb 10', segment: 'Churn Risk' },
];

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const stats = SegmentationService.getSegmentStats();

    const filtered = DEMO_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Customers</h1>
                    <p className={styles.subtitle}>{DEMO_CUSTOMERS.length} total customers</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map(s => (
                    <div key={s.segment} className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${s.color}`, background: 'var(--glass-bg)', transition: 'var(--transition-smooth)' }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.segment}</div>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, margin: '0.5rem 0' }}>{s.count}</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.description}</p>
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
                            <th>Last Order</th>
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
                                            {c.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                                        background: c.segment === 'VIP' ? 'rgba(0, 200, 83, 0.15)' : c.segment === 'Dormant' ? 'rgba(255, 193, 7, 0.15)' : c.segment === 'Churn Risk' ? 'rgba(255, 61, 87, 0.15)' : 'var(--glass-bg-medium)',
                                        color: c.segment === 'VIP' ? 'var(--color-success)' : c.segment === 'Dormant' ? 'var(--color-warning)' : c.segment === 'Churn Risk' ? 'var(--color-error)' : 'var(--text-secondary)',
                                        border: `1px solid ${c.segment === 'VIP' ? 'rgba(0, 200, 83, 0.3)' : c.segment === 'Dormant' ? 'rgba(255, 193, 7, 0.3)' : c.segment === 'Churn Risk' ? 'rgba(255, 61, 87, 0.3)' : 'var(--border-subtle)'}`
                                    }}>
                                        {c.segment}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{c.orders}</td>
                                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₦{c.spent.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{c.lastOrder}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
