'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './orders.module.css';
import { OrderService, Order } from '@/services/orderService';
import { exportToCSV } from '@/utils/csvExport';
import { useTenant } from '@/context/TenantContext';
import { ShoppingBag, FileDown, ArrowRight, Loader2, Download, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { formatNaira } from '@/lib/formatNaira';

export default function OrdersPage() {
    const { tenantId, subdomain, isLoading: tenantLoading } = useTenant();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const statuses = ['all', 'pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled'];

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
                    <p className={styles.subtitle}>{orders.length} total orders · {formatNaira(totalRevenue)}</p>
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
                                    <Link href={`/dashboard/orders/${order.id}`} className={styles.orderId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}>
                                        {order.id.slice(0, 8)}
                                        <ChevronRight size={14} />
                                    </Link>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{order.customer_name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customer_email}</div>
                                </td>
                                <td style={{ fontSize: '13px' }}>{Array.isArray(order.items) ? order.items.length : 0} Item(s)</td>
                                <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatNaira(order.total_amount || 0)}</td>
                                <td>
                                    <div className={styles.statusWrapper}>
                                        <span className={`${styles.statusIndicator} ${styles[order.status] || styles.pending}`}></span>
                                        <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                const link = OrderService.generatePaymentLink(order.id);
                                                navigator.clipboard.writeText(link);
                                                showToast('Magic Link copied to clipboard!', 'success');
                                            }}
                                            className="text-primary hover:text-primary-dark mr-4"
                                            title="Copy Magic Link"
                                        >
                                            <Zap size={16} />
                                        </button>
                                        <Link href={`/dashboard/orders/${order.id}`} className="text-secondary hover:text-primary">
                                            Details
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <EmptyState
                    icon={ShoppingBag}
                    title="No Orders Found"
                    description="Your order queue is currently empty. Share your store link to start receiving orders from customers!"
                    action={{
                        label: "View Storefront",
                        onClick: () => window.open(`/store/${subdomain || 'demo'}`, '_blank')
                    }}
                />
            )}
        </>
    );
}
