'use client';

import { useEffect, useState } from 'react';
import { LedgerService, FinancialSummary, Transaction } from '@/services/ledgerService';
import { useTenant } from '@/context/TenantContext';
import styles from './payouts.module.css';

import { exportToCSV } from '@/utils/csvExport';
import { formatCurrency } from '@/lib/formatCurrency';
import EmptyState from '@/components/shared/EmptyState';
import { CreditCard } from 'lucide-react';

export default function PayoutsPage() {
    const { tenantId, isLoading: isTenantLoading } = useTenant();
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isTenantLoading) return;
        if (!tenantId) {
            setTimeout(() => setLoading(false), 0);
            return;
        }

        const fetchData = async () => {
            const [s, h] = await Promise.all([
                LedgerService.getSummary(tenantId),
                LedgerService.getHistory(tenantId)
            ]);
            setSummary(s);
            setHistory(h);
            setLoading(false);
        };
        fetchData();
    }, [tenantId, isTenantLoading]);

    const handleExport = () => {
        exportToCSV(history as unknown as Record<string, unknown>[], 'SOLO_Finance_Report');
    };

    if (loading) return <div className="loading">Loading Finance Hub...</div>;

    const summaryData = summary || { totalRevenue: 0, totalExpenses: 0, netBalance: 0, availableBalance: 0, pendingPayouts: 0 };
    const availableBalance = summaryData.availableBalance || 0;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Finance & Payouts</h1>
                    <p className={styles.subtitle}>Track your earnings, processing fees, and upcoming payouts.</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExport} disabled={history.length === 0}>
                    Export Statement
                </button>
            </div>

            <div className={styles.summaryGrid}>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <h2 className={`${styles.statValue} font-mono`}>{formatCurrency(summaryData.totalRevenue)}</h2>
                    {summaryData.totalRevenue > 0 ? (
                        <span className={styles.statTrend} style={{ color: 'var(--color-success)' }}>↑ 4% from last week</span>
                    ) : (
                        <span className={styles.statTrend} style={{ color: 'var(--text-tertiary)' }}>Awaiting first sale</span>
                    )}
                </div>
                <div className={`card ${styles.statCard} ${styles.highlight}`}>
                    <span className={styles.statLabel}>Available for Payout</span>
                    <h2 className={`${styles.statValue} font-mono`}>{formatCurrency(availableBalance)}</h2>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: '100%' }} disabled={availableBalance <= 0}>Withdraw Now</button>
                </div>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Pending Payouts</span>
                    <h2 className={`${styles.statValue} font-mono`}>{formatCurrency(summaryData.pendingPayouts)}</h2>
                    <span className={styles.statTrend} style={{ color: 'var(--text-tertiary)' }}>No pending payouts</span>
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
                            {(history || []).length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-tertiary)' }}>
                                        <EmptyState
                                            icon={CreditCard}
                                            title="No Transactions"
                                            description="Sales from your storefront will appear here once customers start paying."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                (history || []).map(txn => {
                                    if (!txn || !txn.id) return null;
                                    const date = new Date(txn.created_at);
                                    return (
                                        <tr key={txn.id}>
                                            <td>
                                                <span className={styles.date}>{date.toLocaleDateString()}</span>
                                                <span className={styles.time}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td className={styles.description}>{txn.description}</td>
                                            <td><span className={`badge badge-ghost`}>{txn.type.replace('_', ' ')}</span></td>
                                            <td>{txn.provider.toUpperCase()}</td>
                                            <td className={`${styles.amount} font-mono`}>{formatCurrency(txn.amount || 0)}</td>
                                            <td>
                                                <span className={`badge ${txn.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
