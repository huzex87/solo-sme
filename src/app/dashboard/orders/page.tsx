'use client';

import { useState } from 'react';
import styles from './orders.module.css';

import { exportToCSV } from '@/utils/csvExport';

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

    const handleExport = () => {
        exportToCSV(filtered, 'SOLO_Orders_Export');
    };

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>{DEMO_ORDERS.length} total orders · ₦{totalRevenue.toLocaleString()} processed</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExport}>Export Data</button>
            </div>

            <div className={styles.filters}>
                {statuses.map(s => (
                    <button
                        key={s}
                        className={`btn btn-sm ${statusFilter === s ? 'btn-secondary' : 'btn-ghost'}`}
                        onClick={() => setStatusFilter(s)}
                        style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                        {s === 'all' ? 'All' : s}
                    </button>
                ))}
            </div>

            <div className={styles.orderTableWrapper}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id}>
                                <td>
                                    <span className={styles.orderId}>{order.id}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{order.customer}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.email}</div>
                                </td>
                                <td style={{ fontSize: '13px' }}>{order.items} SKU{order.items > 1 ? 's' : ''}</td>
                                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₦{order.amount.toLocaleString()}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span className={`${styles.statusIndicator} ${styles[order.status]}`}></span>
                                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>{order.date}</td>
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
