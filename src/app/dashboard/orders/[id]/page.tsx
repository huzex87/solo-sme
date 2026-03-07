'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService, Order } from '@/services/orderService';
import { useToast } from '@/components/ui/ToastProvider';
import { Truck, PackageCheck, Loader2, ArrowLeft } from 'lucide-react';
import styles from '../orders.module.css';

export default function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { showToast } = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Order['status']>('pending');

    useEffect(() => {
        const fetchOrder = async () => {
            const data = await OrderService.getOrder(id);
            if (data) {
                setOrder(data);
                setSelectedStatus(data.status);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async (newStatus: Order['status']) => {
        if (!order) return;
        setIsUpdating(true);
        const success = await OrderService.updateOrderStatus(order.id, newStatus);
        if (success) {
            setOrder({ ...order, status: newStatus });
            setSelectedStatus(newStatus);
            showToast(`Order status updated to ${newStatus}`, 'success');
        } else {
            showToast('Failed to update order status', 'error');
        }
        setIsUpdating(false);
    };

    if (loading) return <div className={styles.loading}>Loading order details...</div>;
    if (!order) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Order Not Found</h2>
                <button className="btn btn-ghost" onClick={() => router.push('/dashboard/orders')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '1rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard/orders')}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Orders
                </button>
            </div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Order #{order.id.slice(0, 8)}</h1>
                    <p className={styles.subtitle}>Placed on {order.created_at}</p>
                </div>
                <div className={styles.statusBadge}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className={styles.orderGrid}>
                <div className={styles.mainContent}>
                    <div className={`card ${styles.detailsCard}`}>
                        <h3>Order Items</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items as Array<{ id: string; name: string; price: number; quantity: number }>).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>₦{item.price.toLocaleString()}</td>
                                        <td>{item.quantity}</td>
                                        <td>₦{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className={styles.orderSummary}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>₦{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>₦0.00</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                                <span>Total</span>
                                <span>₦{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebar}>
                    <div className={`card ${styles.customerCard}`}>
                        <h3>Customer</h3>
                        <div className={styles.customerHeader}>
                            <div className={styles.avatar}>{order.customer_name[0]}</div>
                            <div>
                                <h4>{order.customer_name}</h4>
                                <p>{order.customer_email}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`card ${styles.fulfillmentCard}`}>
                        <h3>Fulfillment & Dispatch</h3>

                        {(order.status === 'paid' && order.delivery_method === 'delivery') ? (
                            <div style={{ background: 'var(--accent-teal-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', border: '1px solid var(--accent-primary)' }}>
                                <Truck size={32} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
                                <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Ready for Dispatch</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                    This order has been paid and requires delivery. Dispatching will instantly alert nearby drivers to claim this task.
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateStatus('processing')}
                                >
                                    {isUpdating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Truck size={16} className="mr-2" />}
                                    Dispatch to Driver
                                </button>
                            </div>
                        ) : order.status === 'processing' ? (
                            <div style={{ background: 'var(--bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', border: '1px solid var(--border-subtle)' }}>
                                <Loader2 size={32} color="var(--accent-secondary)" className="animate-spin" style={{ marginBottom: '0.75rem' }} />
                                <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Waiting for Driver</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    This order is currently broadcasted to your delivery fleet. Awaiting a driver to claim the task.
                                </p>
                            </div>
                        ) : order.status === 'dispatched' ? (
                            <div style={{ background: 'var(--color-info-dim)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', border: '1px solid var(--color-info)' }}>
                                <Truck size={32} color="var(--color-info)" style={{ marginBottom: '0.75rem' }} />
                                <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>En Route</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    A driver has successfully claimed this order and is on their way to the delivery location.
                                </p>
                            </div>
                        ) : order.status === 'delivered' ? (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', border: '1px solid var(--color-success)' }}>
                                <PackageCheck size={32} color="var(--color-success)" style={{ marginBottom: '0.75rem' }} />
                                <h4 style={{ fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.5rem' }}>Delivery Completed</h4>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    This order was successfully delivered to the customer.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '1rem', marginTop: '1rem' }}>
                                    Manually update the status of this order.
                                </p>
                                <select
                                    className="input-field"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as Order['status'])}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="processing">Processing (Awaiting Driver)</option>
                                    <option value="dispatched">Dispatched (En Route)</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    disabled={isUpdating || selectedStatus === order.status}
                                    onClick={() => handleUpdateStatus(selectedStatus)}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
