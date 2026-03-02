'use client';

import { useState, useEffect } from 'react';
import { DriverService, DriverEarnings } from '@/services/driverService';
import { useTenant } from '@/context/TenantContext';
import styles from '../driver.module.css';

export default function WalletPage() {
    const { tenantId } = useTenant();
    const [earnings, setEarnings] = useState<DriverEarnings | null>(null);

    useEffect(() => {
        if (!tenantId) return;
        DriverService.getEarnings(tenantId).then(setEarnings);
    }, [tenantId]);

    if (!earnings) return <div className="loading">Loading Wallet...</div>;

    return (
        <div className="animate-entrance">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>Earnings</h1>

            <div className={styles.balanceCard}>
                <span className={styles.balanceLabel}>Withdrawable Balance</span>
                <div className={styles.balanceValue}>₦{earnings.balance.toLocaleString()}</div>
                <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.2)', width: '100%' }}>
                    Request Payout
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.cardTask} style={{ marginBottom: '1rem' }}>
                    <span className={styles.label}>Daily Earnings</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₦{earnings.daily.toLocaleString()}</div>
                </div>
                <div className={styles.cardTask} style={{ marginBottom: '1rem' }}>
                    <span className={styles.label}>Weekly Earnings</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₦{earnings.weekly.toLocaleString()}</div>
                </div>
            </div>

            <div className={styles.cardTask}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Transaction History</h3>
                {[
                    { date: 'Today, 2:30 PM', desc: 'Delivery Fee - ORD-100', amount: '+ ₦1,200' },
                    { date: 'Today, 11:15 AM', desc: 'Delivery Fee - ORD-098', amount: '+ ₦1,500' },
                    { date: 'Yesterday', desc: 'Payout - Bank Transfer', amount: '- ₦12,000', neg: true },
                ].map((tx, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <div>
                            <p style={{ fontWeight: 600 }}>{tx.desc}</p>
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{tx.date}</p>
                        </div>
                        <span style={{ fontWeight: 800, color: tx.neg ? '#ff3d57' : '#00c853' }}>{tx.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
