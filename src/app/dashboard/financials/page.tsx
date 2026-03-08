'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { FinanceService, FinancialSummary, ExpenseRecord } from '@/services/financeService';
import { PieChart, ShieldCheck, Plus, History, Receipt, Wallet, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import TableHeader from '@/components/shared/TableHeader';
import styles from './financials.module.css';

export default function FinancialsPage() {
    const { tenantId } = useTenant();
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [performance, setPerformance] = useState<{ name: string; value: number }[]>([]);
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Rent');
    const [adding, setAdding] = useState(false);

    const loadData = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const [sum, perf, recent] = await Promise.all([
                FinanceService.getFinancialSummary(tenantId),
                FinanceService.getMonthlyPerformance(tenantId),
                FinanceService.getRecentExpenses(tenantId, 5)
            ]);
            setSummary(sum);
            setPerformance(perf);
            setExpenses(recent);
        } catch (err) {
            console.error('[Financials] Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId || !desc || !amount) return;
        setAdding(true);
        try {
            await FinanceService.addExpense(tenantId, {
                description: desc,
                amount: parseFloat(amount),
                category,
                date: new Date().toISOString()
            });
            setDesc('');
            setAmount('');
            loadData();
        } catch (err) {
            console.error('[Financials] Add failed:', err);
        } finally {
            setAdding(false);
        }
    };

    if (loading && !summary) return <div className="loading">Analyzing Financials...</div>;

    return (
        <div className={styles.container}>
            <TableHeader
                title="Financial Intelligence"
                subtitle="Automated P&L reporting and cost management for your business."
                icon={Activity}
            />

            <div className={styles.statsGrid}>
                <div className={`card ${styles.statCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.statLabel}>Revenue</span>
                        <ArrowUpRight size={18} color="#10b981" />
                    </div>
                    <span className={`${styles.statValue} font-mono`}>{formatCurrency(summary?.revenue || 0)}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Gross Sales</div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.statLabel}>COGS</span>
                        <Receipt size={18} color="var(--text-tertiary)" />
                    </div>
                    <span className={`${styles.statValue} font-mono`}>{formatCurrency(summary?.cogs || 0)}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Cost of Goods Sold</div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.statLabel}>Gross Profit</span>
                        <Activity size={18} color="var(--accent-primary)" />
                    </div>
                    <span className={`${styles.statValue} font-mono`}>{formatCurrency(summary?.grossProfit || 0)}</span>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{summary?.revenue ? ((summary.grossProfit / summary.revenue) * 100).toFixed(1) : 0}% Margin</div>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.statLabel}>Op Expenses</span>
                        <ArrowDownRight size={18} color="#ef4444" />
                    </div>
                    <span className={`${styles.statValue} ${styles.expense} font-mono`}>{formatCurrency(summary?.expenses || 0)}</span>
                </div>

                <div className={`card ${styles.statCard}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={styles.statLabel}>Net Profit</span>
                        <Wallet size={18} color="var(--accent-secondary)" />
                    </div>
                    <span className={`${styles.statValue} ${styles.profit} font-mono`}>{formatCurrency(summary?.profit || 0)}</span>
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
                                        height: `${(p.value / Math.max(...performance.map(x => x.value), 1)) * 100}%`,
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
                    < ShieldCheck size={32} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: 800 }}>Tax Provision</h3>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Estimated corporate tax liability</p>
                    <div className={`${styles.taxAmount} font-mono`}>{formatCurrency(summary?.estimatedTax || 0)}</div>
                    <p className={styles.taxNote}>
                        This is an automated estimate based on a 7.5% corporate tax rate in your region.
                    </p>
                </div>
            </div>

            <div className={styles.expenseManager}>
                <div className={`card ${styles.expenseFormCard}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Plus size={20} color="var(--accent-primary)" />
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Log Expense</h3>
                    </div>
                    <form className={styles.expenseForm} onSubmit={handleAddExpense}>
                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <input
                                placeholder="Store Rent, Utilities, etc."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Amount (₦)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option>Rent</option>
                                <option>Salary</option>
                                <option>Utilities</option>
                                <option>Supplies</option>
                                <option>Marketing</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={adding}>
                            {adding ? 'Securing ledger...' : 'Record Expense'}
                        </button>
                    </form>
                </div>

                <div className={`card ${styles.expenseHistoryCard}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <History size={20} color="var(--text-tertiary)" />
                        <h3 style={{ fontWeight: 700, margin: 0 }}>Recent Records</h3>
                    </div>
                    <table className={styles.expenseTable}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>No expenses recorded yet.</td>
                                </tr>
                            ) : (
                                expenses.map(e => (
                                    <tr key={e.id}>
                                        <td>{new Date(e.date).toLocaleDateString()}</td>
                                        <td>{e.description}</td>
                                        <td><span className={styles.categoryBadge}>{e.category}</span></td>
                                        <td className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(e.amount)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
