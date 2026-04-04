'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, CreditCard } from 'lucide-react';
import styles from '../admin.module.css';
import { formatCurrency } from '@/lib/utils';

export default function SubscriptionsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubs() {
            try {
                const res = await fetch('/api/admin/subscriptions');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchSubs();
    }, []);

    const s = data?.stats || { total: 0, starter: 0, growth: 0, enterprise: 0, mrr: 0, arpu: 0 };
    const breakdown = data?.breakdown || [];

    return (
        <div className="animate-entrance pb-20">
            <h1 className={styles.adminTitle}>Financial Hub</h1>
            <p className={styles.adminSubtitle}>Platform-wide recurring revenue and tier distribution.</p>

            <div className={styles.statGrid}>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>Active Subscriptions</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={17} style={{ color: 'var(--accent)' }} />
                        </div>
                    </div>
                    <div className={styles.value}>{loading ? '--' : s.total}</div>
                    <div className={styles.trendUp}>↑ {loading ? '--' : data?.newThisMonth || 0} New this month</div>
                </div>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>LTM Revenue Run Rate</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={17} style={{ color: '#34d399' }} />
                        </div>
                    </div>
                    <div className={styles.value}>{loading ? '--' : formatCurrency(s.mrr * 12)}</div>
                    <div className={styles.trendUp}>Healthy growth trajectory</div>
                </div>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>ARPU</h4>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={17} style={{ color: '#60a5fa' }} />
                        </div>
                    </div>
                    <div className={styles.value}>{loading ? '--' : formatCurrency(s.arpu)}</div>
                    <div className={styles.trend}>Average revenue per user</div>
                </div>
            </div>

            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Monthly Breakdown</h3>
                </div>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Starter (Free)</th>
                            <th>Growth ({formatCurrency(9900)})</th>
                            <th>Enterprise ({formatCurrency(49900)})</th>
                            <th>Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} style={{textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)'}}>Calculating Revenue Vectors...</td>
                            </tr>
                        )}
                        {!loading && breakdown.map((b: any, idx: number) => (
                            <tr key={idx}>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{b.period}</td>
                                <td>{b.starter}</td>
                                <td><span className={`${styles.badgeDark} ${styles.badgeInfo}`}>{b.growth}</span></td>
                                <td><span className={`${styles.badgeDark} ${styles.badgeWarning}`}>{b.enterprise}</span></td>
                                <td style={{ fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(b.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
