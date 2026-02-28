'use client';

import { useState, useEffect } from 'react';
import { DriverService } from '@/services/driverService';
import styles from '../store.module.css';

export default function DeliveryTrackingPage() {
    const [progress, setProgress] = useState(25);
    const [status, setStatus] = useState('Order Confirmed');

    useEffect(() => {
        // In a real production app, this would be a WebSocket or Supabase Realtime subscription
        const checkStatus = async () => {
            const tasks = await DriverService.getAvailableTasks();
            const myTask = tasks.find(t => t.id === 'ORD-101');

            if (myTask) {
                const statusMap: Record<string, { p: number, s: string }> = {
                    'pending': { p: 10, s: 'Searching for Rider' },
                    'claimed': { p: 25, s: 'Rider Assigned' },
                    'picked_up': { p: 50, s: 'Picked Up (Out for Delivery)' },
                    'arriving': { p: 85, s: 'Arriving Soon' },
                    'delivered': { p: 100, s: 'Delivered ✅' }
                };
                setProgress(statusMap[myTask.status].p);
                setStatus(statusMap[myTask.status].s);
            }
        };

        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.trackingPage}>
            <div className={styles.trackingHeader}>
                <h1 className={styles.checkoutTitle}>Track Your Order</h1>
                <p className={styles.orderId}>Order #SOLO-8829</p>
            </div>

            <div className={`card ${styles.mapPlaceholder}`}>
                <div className={styles.mapOverlay}>
                    <div className={styles.riderPin} style={{ left: `${progress}%`, transition: 'left 1s linear' }}>
                        🛵
                    </div>
                    <div className={styles.storePin}>🏪</div>
                    <div className={styles.customerPin}>🏠</div>
                    <div className={styles.routeLine}>
                        <div className={styles.routeProgress} style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className={styles.mapLabel}>
                    Google Maps Preview (Production Key Required)
                </div>
            </div>

            <div className={styles.statusSection}>
                <div className={styles.statusMain}>
                    <span className={styles.statusBadge}>{status}</span>
                    <p className={styles.eta}>Estimated Arrival: 12 mins</p>
                </div>

                <div className={styles.trackingSteps}>
                    {[
                        { label: 'Confirmed', done: progress >= 0 },
                        { label: 'Preparing', done: progress >= 25 },
                        { label: 'Picked Up', done: progress >= 50 },
                        { label: 'Out for Delivery', done: progress >= 75 },
                        { label: 'Delivered', done: progress === 100 }
                    ].map((step, idx) => (
                        <div key={idx} className={`${styles.step} ${step.done ? styles.stepDone : ''}`}>
                            <div className={styles.stepDot} />
                            <span>{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-xl)', marginTop: '2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Rider Details</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--glass-bg-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        👤
                    </div>
                    <div>
                        <p style={{ fontWeight: 700 }}>Mustapha K.</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>SOLO Express Delivery</p>
                    </div>
                    <button className="btn btn-ghost" style={{ marginLeft: 'auto' }}>
                        📞 Contact
                    </button>
                </div>
            </div>
        </div>
    );
}
