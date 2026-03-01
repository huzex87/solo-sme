import { notFound } from 'next/navigation';
import { OrderService } from '@/services/orderService';
import styles from '../orders.module.css';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await OrderService.getOrder(id);

    if (!order) notFound();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Order #{order.id.slice(0, 8)}</h1>
                    <p className={styles.subtitle}>Placed on {order.created_at}</p>
                </div>
                <div className={styles.statusBadge}>
                    <span className={`badge badge-${order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'neutral'}`}>
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
                        <h3>Fulfillment</h3>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Update the status of this order to notify the customer.
                        </p>
                        <select className="input-field" defaultValue={order.status}>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Update Status
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
