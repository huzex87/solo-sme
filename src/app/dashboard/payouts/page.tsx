'use client';

import { useEffect, useState } from 'react';
import { LedgerService, FinancialSummary, Transaction } from '@/services/ledgerService';
import styles from './payouts.module.css';

export default function PayoutsPage() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [s, h] = await Promise.all([
                LedgerService.getSummary(),
                LedgerService.getHistory()
            ]);
            setSummary(s);
            setHistory(h);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading Finance Hub...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Finance & Payouts</h1>
                <p className={styles.subtitle}>Track your earnings, processing fees, and upcoming payouts.</p>
            </div>

            <div className={styles.summaryGrid}>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <h2 className={styles.statValue}>₦{summary?.totalRevenue.toLocaleString()}</h2>
                    <span className={styles.statTrend} style={{ color: 'var(--color-success)' }}>↑ 12% from last month</span>
                </div>
                <div className={`card ${styles.statCard} ${styles.highlight}`}>
                    <span className={styles.statLabel}>Available for Payout</span>
                    <h2 className={styles.statValue}>₦{summary?.availableBalance.toLocaleString()}</h2>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: '100%' }}>Withdraw Now</button>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Pending Payouts</span>
                    <h2 className={styles.statValue}>₦{summary?.pendingPayouts.toLocaleString()}</h2>
                    <span className={styles.statTrend} style={{ color: 'var(--text-tertiary)' }}>Estimated arrival: 2-3 days</span>
                </div>
            </div>

            <div className={`card ${styles.historyCard}`}>
                <h3 className={styles.cardTitle}>Transaction History</h3>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(txn => (
                                <tr key={txn.id}>
                                    <td>
                                        <span className={styles.date}>{txn.timestamp.toLocaleDateString()}</span>
                                        <span className={styles.time}>{txn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className={styles.description}>{txn.description}</td>
                                    <td><span className={`badge badge-ghost`}>{txn.type.replace('_', ' ')}</span></td>
                                    <td>{txn.provider.toUpperCase()}</td>
                                    <td className={styles.amount}>₦{txn.amount.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${txn.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
