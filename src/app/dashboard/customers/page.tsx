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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {stats.map(s => (
                    <div key={s.segment} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${s.color}` }}>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{s.segment}</div>
                        <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{s.count}</div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.description}</p>
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
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 'var(--font-size-sm)', fontWeight: 700, color: '#fff', flexShrink: 0,
                                        }}>
                                            {c.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge`} style={{
                                        background: c.segment === 'VIP' ? 'rgba(76, 175, 80, 0.1)' : c.segment === 'Dormant' ? 'rgba(255, 152, 0, 0.1)' : c.segment === 'Churn Risk' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        color: c.segment === 'VIP' ? '#4caf50' : c.segment === 'Dormant' ? '#ff9800' : c.segment === 'Churn Risk' ? '#f44336' : 'inherit',
                                        borderColor: 'transparent'
                                    }}>
                                        {c.segment}
                                    </span>
                                </td>
                                <td>{c.orders}</td>
                                <td style={{ fontWeight: 600 }}>₦{c.spent.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{c.lastOrder}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
