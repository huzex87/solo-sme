'use client';

import { useState } from 'react';
import { DriverService, DriverOrder } from '@/services/driverService';
import SlideToConfirm from '@/components/ui/SlideToConfirm';
import styles from '../driver.module.css';

export default function ActiveDeliveryPage() {
    const [step, setStep] = useState(1); // 1: Claimed, 2: Picked Up, 3: Arriving, 4: Delivered
    const [task] = useState<DriverOrder | null>({
        id: 'ORD-101',
        tenant_id: 't1',
        customer_name: 'John Doe',
        pickup_address: 'SOLO HQ, Ikeja',
        delivery_address: 'Victoria Island, Lagos',
        total_amount: 15600,
        delivery_fee: 1500,
        status: 'dispatched'
    });

    const nextStep = () => {
        if (step < 4) {
            const next = step + 1;
            setStep(next);
            // Mapped to real Supabase order statuses
            const statusMap: Record<number, DriverOrder['status']> = {
                2: 'dispatched',
                3: 'dispatched',
                4: 'delivered'
            };
            if (task) DriverService.updateTaskStatus(task.id, statusMap[next]);
        }
    };

    if (!task) return null;

    const getBtnLabel = () => {
        if (step === 1) return 'Slide to Confirm Pickup';
        if (step === 2) return 'Slide to Start Navigation';
        if (step === 3) return 'Slide to Confirm Delivery';
        return 'Delivery Completed';
    };

    return (
        <div className="animate-entrance">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Active Delivery</h1>

            <div className={styles.cardTask} style={{ borderColor: 'var(--accent-primary)', borderWidth: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span className="badge badge-primary">IN PROGRESS</span>
                    <span style={{ fontWeight: 800 }}>{task.id}</span>
                </div>

                <div className={styles.addressLine}>
                    <div className={styles.dot} style={{ background: step >= 2 ? '#00c853' : '#00e5ff' }} />
                    <div className={styles.info}>
                        <span className={styles.label}>Pickup</span>
                        <span className={styles.value}>{task.pickup_address}</span>
                    </div>
                </div>

                <div className={styles.addressLine}>
                    <div className={styles.dot} style={{ background: step === 4 ? '#00c853' : '#ff3d57' }} />
                    <div className={styles.info}>
                        <span className={styles.label}>Drop-off</span>
                        <span className={styles.value}>{task.delivery_address}</span>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '11px', fontWeight: 700 }}>
                        <span>Progress</span>
                        <span>{Math.round((step / 4) * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${(step / 4) * 100}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }} />
                    </div>
                </div>
            </div>

            <div style={{ position: 'fixed', bottom: '6rem', left: '1.5rem', right: '1.5rem' }}>
                {step < 4 ? (
                    <SlideToConfirm
                        onConfirm={nextStep}
                        label={getBtnLabel()}
                        successLabel="Action Processed"
                    />
                ) : (
                    <div className="card animate-entrance" style={{ background: 'rgba(0, 200, 83, 0.1)', borderColor: 'var(--color-success)', textAlign: 'center' }}>
                        <p style={{ fontWeight: 800, color: 'var(--color-success)' }}>DELIVERY COMPLETED ✅</p>
                    </div>
                )}

                {step === 4 && (
                    <button className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem' }} onClick={() => window.location.href = '/driver'}>
                        Back to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
}
