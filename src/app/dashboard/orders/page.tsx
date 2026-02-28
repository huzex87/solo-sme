'use client';

import { useState } from 'react';
import styles from './orders.module.css';

interface Order {
    id: string;
    customer: string;
    email: string;
    amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    items: number;
    date: string;
}

const DEMO_ORDERS: Order[] = [
    { id: 'ORD-003', customer: 'Fatima Ibrahim', email: 'fatima@example.com', amount: 199.99, status: 'paid', items: 1, date: 'Feb 28, 11:45 AM' },
    { id: 'ORD-004', customer: 'Oluwaseun Bakare', email: 'seun@example.com', amount: 75.00, status: 'pending', items: 1, date: 'Feb 28, 1:00 PM' },
    { id: 'ORD-001', customer: 'Adaeze Okonkwo', email: 'adaeze@example.com', amount: 389.99, status: 'delivered', items: 2, date: 'Feb 27, 9:30 AM' },
    { id: 'ORD-002', customer: 'Chidi Nnamdi', email: 'chidi@example.com', amount: 134.00, status: 'shipped', items: 2, date: 'Feb 26, 3:20 PM' },
    { id: 'ORD-005', customer: 'Grace Adekunle', email: 'grace@example.com', amount: 344.99, status: 'delivered', items: 2, date: 'Feb 25, 8:00 AM' },
];

const STATUS_MAP: Record<string, string> = {
    pending: 'badge-warning',
    paid: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
};

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'pending', 'paid', 'shipped', 'delivered'];

    const filtered = statusFilter === 'all'
        ? DEMO_ORDERS
        : DEMO_ORDERS.filter(o => o.status === statusFilter);

    const totalRevenue = DEMO_ORDERS.reduce((s, o) => s + o.amount, 0);

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>{DEMO_ORDERS.length} orders · ₦{totalRevenue.toLocaleString()} total revenue</p>
                </div>
            </div>

            <div className={styles.filters}>
                {statuses.map(s => (
                    <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                                    {order.id}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{order.customer}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{order.email}</div>
                                </td>
                                <td>{order.items} item{order.items > 1 ? 's' : ''}</td>
                                <td style={{ fontWeight: 700 }}>₦{order.amount.toLocaleString()}</td>
                                <td>
                                    <span className={`badge ${STATUS_MAP[order.status]}`}>{order.status}</span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '3rem' }}>📋</span>
                    <h3 style={{ marginTop: 'var(--space-md)' }}>No orders found</h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>No orders match the selected filter</p>
                </div>
            )}
        </>
    );
}
