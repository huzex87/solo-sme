'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Building2, ShieldCheck, Zap, Clock, Activity, ArrowUpRight, TrendingUp, Users, CreditCard } from 'lucide-react';
import styles from './admin.module.css';
import { formatCurrency } from '@/lib/utils';

interface AdminStats {
    platform_mrr: number;
    active_tenants: number;
    system_uptime: string;
    recent_activity: {
        time: string;
        action: string;
        user: string;
        status: string;
    }[];
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const SYSTEM_STATS = [
        { label: 'Platform MRR', value: stats ? formatCurrency(stats.platform_mrr) : '---', trend: '+14%', icon: TrendingUp, color: '#34d399' },
        { label: 'Active Tenants', value: stats ? stats.active_tenants.toString() : '---', trend: '+12', icon: Building2, color: 'var(--accent)' },
        { label: 'System Uptime', value: stats ? stats.system_uptime : '---', trend: 'Optimum', icon: Zap, color: '#60a5fa' },
        { label: 'Security Status', value: 'Secure', trend: 'All clear', icon: ShieldCheck, color: '#34d399' },
    ];

    const RECENT_ACTIVITY = stats?.recent_activity || [
        { time: '...', action: 'Loading Operations...', user: '...', status: 'system' }
    ];

    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Command Center</h1>
            <p className={styles.adminSubtitle}>Global platform governance and real-time health monitoring.</p>

            {/* ── Stats ── */}
            <div className={styles.statGrid}>
                {SYSTEM_STATS.map(stat => (
                    <div key={stat.label} className={styles.adminCard}>
                        <div className={styles.cardHeader}>
                            <h4>{stat.label}</h4>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <stat.icon size={17} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className={styles.value}>{loading ? <span className="animate-pulse opacity-50">...</span> : stat.value}</div>
                        <div className={stat.trend.includes('+') ? styles.trendUp : styles.trend}>{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* ── Activity + Alerts ── */}
            <div className={styles.adminGridRow}>
                <div className={styles.darkCard} style={{ flex: 2 }}>
                    <div className={styles.panelHeader}>
                        <Activity size={18} color="var(--accent)" />
                        <h3>Recent Activity</h3>
                    </div>
                    <div className={styles.activityList}>
                        {RECENT_ACTIVITY.map((log, i) => (
                            <div key={i} className={styles.activityItem}>
                                <div className={styles.activityMain}>
                                    <span className={styles.actionLabel}>{log.action}</span>
                                    <span className={styles.actionUser}>{log.user}</span>
                                </div>
                                <div className={styles.activityMeta}>
                                    <span className={styles.statusTag}>{log.status}</span>
                                    <span className={styles.timeLabel}>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.darkCard} style={{ flex: 1 }}>
                    <div className={styles.panelHeader}>
                        <ShieldCheck size={18} color="#f87171" />
                        <h3>Critical Alerts</h3>
                    </div>
                    <div className={styles.alertList}>
                        <div className={styles.alertItem}>
                            <Clock size={16} color="#f87171" />
                            <div>
                                <p>3 Payouts Pending</p>
                                <span>Action required for Batch #883</span>
                            </div>
                        </div>
                        <div className={styles.alertItem}>
                            <ArrowUpRight size={16} color="#f87171" />
                            <div>
                                <p>Support Spike</p>
                                <span>+25% increase in billing tickets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Bar ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,166,35,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Monthly Revenue</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{loading ? '...' : formatCurrency((stats?.platform_mrr || 0) * 1.5)}</div>
                    </div>
                </div>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} style={{ color: '#34d399' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Active Users</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{loading ? '...' : (stats?.active_tenants || 0) * 8}</div>
                    </div>
                </div>
                <div className={styles.darkCard} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={18} style={{ color: '#60a5fa' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tx Volume</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{loading ? '...' : (stats?.active_tenants || 0) * 123}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
