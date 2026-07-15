'use client';

import { useState, useEffect } from 'react';
import { DriverService, DriverEarnings } from '@/services/driverService';
import { createClient } from '@/lib/supabase/client';
import styles from '../driver.module.css';
import { formatCurrency } from '@/lib/utils';

export default function WalletPage() {
    const [earnings, setEarnings] = useState<DriverEarnings | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                DriverService.getEarnings(user.id).then(setEarnings);
            }
        });
    }, []);

    if (!earnings) return <div className="loading">Loading Wallet...</div>;

    return (
        <div className="animate-entrance">
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>Earnings</h1>

            <div className={styles.balanceCard}>
                <span className={styles.balanceLabel}>Withdrawable Balance</span>
                <div className={styles.balanceValue}>{formatCurrency(earnings.balance)}</div>
                <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.2)', width: '100%' }}>
                    Request Payout
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.cardTask} style={{ marginBottom: '1rem' }}>
                    <span className={styles.label}>Daily Earnings</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(earnings.daily)}</div>
                </div>
                <div className={styles.cardTask} style={{ marginBottom: '1rem' }}>
                    <span className={styles.label}>Weekly Earnings</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(earnings.weekly)}</div>
                </div>
            </div>

            <div className={styles.cardTask}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Transaction History</h3>
                {[
                    { date: 'Today, 2:30 PM', desc: 'Delivery Fee - ORD-100', amount: `+ ${formatCurrency(1200)}` },
                    { date: 'Today, 11:15 AM', desc: 'Delivery Fee - ORD-098', amount: `+ ${formatCurrency(1500)}` },
                    { date: 'Yesterday', desc: 'Payout - Bank Transfer', amount: `- ${formatCurrency(12000)}`, neg: true },
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
