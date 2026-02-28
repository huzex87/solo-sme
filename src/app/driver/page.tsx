'use client';

import { useState, useEffect } from 'react';
import { DriverService, DriverOrder } from '@/services/driverService';
import styles from './driver.module.css';

export default function DriverDashboard() {
    const [tasks, setTasks] = useState<DriverOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await DriverService.getAvailableTasks();
            setTasks(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleClaim = async (id: string) => {
        const ok = await DriverService.claimTask(id);
        if (ok) {
            setTasks(tasks.filter(t => t.id !== id));
            alert('Order Claimed! Head to pickup location.');
        }
    };

    return (
        <div className="animate-entrance">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>Available Tasks</h1>

            {loading ? (
                <p>Finding nearby orders...</p>
            ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.5 }}>
                    <span style={{ fontSize: '3rem' }}>📭</span>
                    <p>No available orders right now. Stay online to receive notifications.</p>
                </div>
            ) : (
                <div className={styles.taskList}>
                    {tasks.map(task => (
                        <div key={task.id} className={styles.cardTask}>
                            <div className={styles.taskHeader}>
                                <div>
                                    <span className={styles.label}>Merchant</span>
                                    <span className={styles.value}>{task.tenantName}</span>
                                </div>
                                <div className={styles.fee}>₦{task.fee.toLocaleString()}</div>
                            </div>

                            <div className={styles.addressLine}>
                                <div className={styles.dot} style={{ background: '#00e5ff' }} />
                                <div className={styles.info}>
                                    <span className={styles.label}>Pickup</span>
                                    <span className={styles.value}>{task.pickupAddress}</span>
                                </div>
                            </div>

                            <div className={styles.addressLine}>
                                <div className={styles.dot} style={{ background: '#ff3d57' }} />
                                <div className={styles.info}>
                                    <span className={styles.label}>Drop-off</span>
                                    <span className={styles.value}>{task.deliveryAddress}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, opacity: 0.6 }}>📏 {task.distance} Away</span>
                                <button className="btn btn-primary btn-sm" onClick={() => handleClaim(task.id)}>
                                    Claim Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
