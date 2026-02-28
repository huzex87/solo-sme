'use client';

import { useState } from 'react';
import styles from './customers.module.css';

interface Customer {
    id: string;
    name: string;
    email: string;
    orders: number;
    spent: number;
    lastOrder: string;
}

const DEMO_CUSTOMERS: Customer[] = [
    { id: 'c5', name: 'Grace Adekunle', email: 'grace@example.com', orders: 12, spent: 4567.80, lastOrder: 'Feb 25' },
    { id: 'c3', name: 'Fatima Ibrahim', email: 'fatima@example.com', orders: 8, spent: 2134.99, lastOrder: 'Feb 28' },
    { id: 'c1', name: 'Adaeze Okonkwo', email: 'adaeze@example.com', orders: 5, spent: 1245.50, lastOrder: 'Feb 27' },
    { id: 'c2', name: 'Chidi Nnamdi', email: 'chidi@example.com', orders: 3, spent: 567.00, lastOrder: 'Feb 26' },
    { id: 'c4', name: 'Oluwaseun Bakare', email: 'seun@example.com', orders: 2, spent: 310.00, lastOrder: 'Feb 28' },
    { id: 'c6', name: 'Emeka Uche', email: 'emeka@example.com', orders: 1, spent: 89.00, lastOrder: 'Feb 20' },
];

export default function CustomersPage() {
    const [search, setSearch] = useState('');

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

            <div className={styles.searchWrap}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search customers by name or email..."
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
                            <th>Total Orders</th>
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
