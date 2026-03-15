'use client';

import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Database,
    Mail,
    MessageCircle,
    Activity,
    Clock,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Zap
} from 'lucide-react';
import styles from '../admin.module.css';

interface ServiceHealth {
    status: 'online' | 'degraded' | 'error' | 'unconfigured' | 'loading';
    latency?: number;
    message?: string;
}

interface HealthData {
    status: string;
    timestamp: string;
    total_latency: number;
    uptime: number;
    services: {
        database: ServiceHealth;
        resend: ServiceHealth;
        meta: ServiceHealth;
        vercel: ServiceHealth;
    };
}

export default function HealthPage() {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/health');
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (err) {
            setError('Failed to reach health endpoint');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const timer = setInterval(fetchHealth, 30000); // 30s auto-refresh
        return () => clearInterval(timer);
    }, []);

    const StatusBadge = ({ status }: { status: ServiceHealth['status'] }) => {
        switch (status) {
            case 'online': return <span className={styles.badgeSuccess}>Online</span>;
            case 'degraded': return <span className={styles.badgeWarning}>Degraded</span>;
            case 'error': return <span className={styles.badgeError}>Critical</span>;
            case 'unconfigured': return <span className={styles.badgeNeutral}>Unconfigured</span>;
            default: return <span className={styles.badgeNeutral}>Loading</span>;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <div className={styles.adminBadge}>⚡ Institutional Monitoring</div>
                <h1 className={styles.adminTitle}>System Health & Infrastructure</h1>
                <p className={styles.adminSubtitle}>Real-time telemetry from core service providers and API gateways.</p>
            </header>

            <div className={styles.statGrid}>
                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>System Status</h4>
                        <Activity className="text-accent" size={16} />
                    </div>
                    <div className={styles.value}>
                        {loading ? '---' : data?.status.toUpperCase()}
                    </div>
                    <div className={styles.trend}>
                        Overall platform availability
                    </div>
                </div>

                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>API Latency</h4>
                        <Zap className="text-accent" size={16} />
                    </div>
                    <div className={styles.value}>
                        {loading ? '---' : `${data?.total_latency}ms`}
                    </div>
                    <div className={styles.trend}>
                        End-to-end response time
                    </div>
                </div>

                <div className={styles.adminCard}>
                    <div className={styles.cardHeader}>
                        <h4>Uptime</h4>
                        <Clock className="text-accent" size={16} />
                    </div>
                    <div className={styles.value}>
                        {loading ? '---' : `${Math.floor((data?.uptime || 0) / 3600)}h`}
                    </div>
                    <div className={styles.trend}>
                        Continuous runtime duration
                    </div>
                </div>
            </div>

            <div className={styles.panelHeader} style={{ marginTop: 40 }}>
                <ShieldCheck size={18} className="text-accent" />
                <h3>Service Connectivity Matrix</h3>
            </div>

            <div className={styles.adminCard} style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Service Identifier</th>
                            <th>Status Indicator</th>
                            <th>Latency / Detail</th>
                            <th>Last Measured</th>
                        </tr>
                    </thead>
                    <tbody>
                        {['database', 'resend', 'meta', 'vercel'].map((svc: any) => {
                            const health = data?.services[svc as keyof typeof data.services];
                            const Icon = svc === 'database' ? Database : svc === 'resend' ? Mail : svc === 'meta' ? MessageCircle : Zap;

                            return (
                                <tr key={svc}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: 'rgba(255,255,255,0.03)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'rgba(255,255,255,0.4)'
                                            }}>
                                                <Icon size={14} />
                                            </div>
                                            <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{svc}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className={`${styles.statusDot} ${health?.status === 'online' ? styles.statusOnline :
                                                health?.status === 'degraded' ? styles.statusWarning : styles.statusOffline
                                                }`} />
                                            <StatusBadge status={health?.status || 'loading'} />
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>
                                            {health?.latency ? `${health.latency}ms` : health?.message || 'Standard Response'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.timeLabel}>{loading ? 'Refreshing...' : 'ActiveNow'}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={fetchHealth}
                    className={styles.authBtn}
                    style={{ width: 'auto', px: 24, display: 'flex', alignItems: 'center', gap: 10 }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Force Telemetry Refresh
                </button>
            </div>
        </div>
    );
}
