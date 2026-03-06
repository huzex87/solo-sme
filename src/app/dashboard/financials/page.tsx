'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { FinanceService, FinancialSummary } from '@/services/financeService';
import { TrendingUp, TrendingDown, PieChart, ShieldCheck } from 'lucide-react';
import styles from './financials.module.css';

export default function FinancialsPage() {
    const { tenantId } = useTenant();
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [performance, setPerformance] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        async function loadData() {
            setLoading(true);
            try {
                const [sum, perf] = await Promise.all([
                    FinanceService.getFinancialSummary(tenantId),
                    FinanceService.getMonthlyPerformance(tenantId)
                ]);
                setSummary(sum);
                setPerformance(perf);
            } catch (err) {
                console.error('[Financials] Error:', err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [tenantId]);

    if (loading) return <div className="loading">Analyzing Financials...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Financial Intelligence</h1>
                <p className={styles.subtitle}>Automated P&L reporting and tax forecasting for your business.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <span className={styles.statValue}>₦{summary?.revenue.toLocaleString()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.8rem' }}>
                        <TrendingUp size={14} /> <span>Live data</span>
                    </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Operational Expenses</span>
                    <span className={styles.statValue}>₦{summary?.expenses.toLocaleString()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem' }}>
                        <TrendingDown size={14} /> <span>Estimated costs</span>
                    </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Net Profit</span>
                    <span className={`${styles.statValue} ${styles.profit}`}>₦{summary?.profit.toLocaleString()}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>After estimated expenses</span>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <span className={styles.statLabel}>Gross Margin</span>
                    <span className={styles.statValue}>{summary?.margin.toFixed(1)}%</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Profitability ratio</span>
                </div>
            </div>

            <div className={styles.mainGrid}>
                <div className={`card ${styles.chartCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontWeight: 700 }}>Revenue Performance</h3>
                        <PieChart size={20} color="var(--text-tertiary)" />
                    </div>

                    {performance.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                            Register more orders to see performance trends.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px' }}>
                            {performance.map(p => (
                                <div key={p.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${(p.value / Math.max(...performance.map(x => x.value))) * 100}%`,
                                        background: 'var(--accent-primary)',
                                        borderRadius: '0.5rem 0.5rem 0 0',
                                        minHeight: '4px'
                                    }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`card ${styles.taxCard}`}>
                    <ShieldCheck size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 800 }}>Tax Provision</h3>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Estimated corporate tax liability</p>
                    <div className={styles.taxAmount}>₦{summary?.estimatedTax.toLocaleString()}</div>
                    <p className={styles.taxNote}>
                        This is an automated estimate based on a 7.5% VAT and simulated corporate tax rates.
                        Please consult a certified accountant for official filings.
                    </p>
                </div>
            </div>
        </div>
    );
}
