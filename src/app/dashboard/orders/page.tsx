'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './orders.module.css';
import { OrderService, Order } from '@/services/orderService';
import { exportToCSV } from '@/utils/csvExport';
import { useTenant } from '@/context/TenantContext';
import { ShoppingBag, FileDown, ArrowRight, Loader2, Download } from 'lucide-react';

export default function OrdersPage() {
    const { tenantId, isLoading: tenantLoading } = useTenant();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'pending', 'paid', 'shipped', 'delivered'];

    useEffect(() => {
        async function fetchOrders() {
            if (tenantId) {
                const data = await OrderService.getOrders(tenantId);
                setOrders(data as unknown as Order[]);
            }
            setLoading(false);
        }
        if (!tenantLoading) {
            fetchOrders();
        }
    }, [tenantId, tenantLoading]);

    const filtered = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

    const handleExport = () => {
        exportToCSV(filtered as unknown as Record<string, unknown>[], 'SOLO_Orders_Export');
    };

    if (loading) return <div className={styles.loading}>Loading orders...</div>;

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>{orders.length} total orders · ₦{totalRevenue.toLocaleString()}</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExport}>
                    <Download size={16} />
                    <span>Export Data</span>
                </button>
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
                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{order.customer_name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                                </td>
                                <td style={{ fontSize: '13px' }}>{Array.isArray(order.items) ? order.items.length : 0} Item(s)</td>
                                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₦{(order.total_amount || 0).toLocaleString()}</td>
                                <td>
                                    <div className={styles.statusWrapper}>
                                        <span className={`${styles.statusIndicator} ${styles[order.status] || styles.pending}`}></span>
                                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>
                                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '200px', height: '200px', margin: '0 auto 2rem' }}>
                        <Image
                            src="/assets/branding/empty_orders.png"
                            alt="No Orders"
                            width={200}
                            height={200}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }}
                        />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>No orders found</h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', maxWidth: '300px', margin: '0.5rem auto' }}>
                        Your order queue is currently empty. Share your store link to start receiving orders!
                    </p>
                </div>
            )}
        </>
    );
}
