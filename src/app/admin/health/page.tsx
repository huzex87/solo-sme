import { Database, CreditCard, Cloud, Server, Shield, Clock } from 'lucide-react';
import styles from '../admin.module.css';

const SERVICES = [
    { name: 'Database (Supabase)', status: 'online', latency: '12ms', uptime: '99.99%', icon: Database },
    { name: 'Payment Gateway', status: 'online', latency: '45ms', uptime: '99.98%', icon: CreditCard },
    { name: 'Storage Engine', status: 'online', latency: '8ms', uptime: '100%', icon: Cloud },
    { name: 'AI Services (Gemini)', status: 'online', latency: '230ms', uptime: '99.95%', icon: Server },
    { name: 'WhatsApp API', status: 'online', latency: '68ms', uptime: '99.97%', icon: Shield },
];

export default function HealthPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>System Health</h1>
            <p className={styles.adminSubtitle}>Real-time infrastructure and core service monitoring.</p>

            {/* Status banner */}
            <div className={styles.darkCard} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '18px 22px', marginBottom: 24,
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.1)',
            }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px rgba(52,211,153,0.5)', animation: 'pulse 2s cubic-bezier(.4,0,.6,1) infinite' }} />
                <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)' }}>All Systems Operational</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>No incidents in the last 90 days</div>
                </div>
            </div>

            {/* Services table */}
            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Service Status</h3>
                </div>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Latency</th>
                            <th>Uptime (30d)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SERVICES.map(s => (
                            <tr key={s.name}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <s.icon size={15} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{s.name}</span>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <span className={`${styles.statusDot} ${styles.statusOnline}`} />
                                        <span style={{ color: '#34d399', fontWeight: 600, fontSize: 12 }}>Online</span>
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s.latency}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#34d399' }}>{s.uptime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Infrastructure cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className={styles.darkCard}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Storage</h4>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 8 }}>92% Free</div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: 6, borderRadius: 3, background: '#34d399', width: '8%' }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>420 MB used of 5 GB</p>
                </div>
                <div className={styles.darkCard}>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Database</h4>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 8 }}>78% Free</div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--accent)', width: '22%' }} />
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>110 MB used of 500 MB</p>
                </div>
            </div>
        </div>
    );
}
