'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import styles from '../admin.module.css';

interface Ticket {
    id: string;
    tenants?: { name: string };
    subject: string;
    status: string;
    priority: string;
    created_at: string;
}

const STATUS_MAP: Record<string, string> = {
    'open': styles.badgeError,
    'in-progress': styles.badgeInfo,
    'resolved': styles.badgeSuccess,
    'closed': styles.badgeNeutral,
};

const PRIORITY_COLORS: Record<string, string> = {
    'critical': '#ff4d4f',
    'high': '#f87171',
    'medium': 'var(--accent)',
    'low': 'rgba(255,255,255,0.4)',
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTickets = async () => {
        try {
            const res = await fetch('/api/admin/support');
            if (res.ok) {
                const data = await res.json();
                setTickets(data.tickets || []);
            }
        } catch (e) {
            console.error('Failed to load tickets', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const handleResolve = async (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
        try {
            await fetch('/api/admin/support', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'resolved' })
            });
        } catch (e) {
            console.error(e);
            loadTickets(); // Revert
        }
    };

    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

    return (
        <div className="animate-entrance pb-20">
            <h1 className={styles.adminTitle}>Support & Resolution</h1>
            <p className={styles.adminSubtitle}>Platform-wide support requests and tenant inquiries.</p>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Open Tickets', value: loading ? '--' : openTickets.toString(), color: '#f87171' },
                    { label: 'In Progress', value: loading ? '--' : inProgressTickets.toString(), color: '#60a5fa' },
                    { label: 'Resolved (All Time)', value: loading ? '--' : resolvedTickets.toString(), color: '#34d399' },
                ].map(s => (
                    <div key={s.label} className={styles.adminCard} style={{ textAlign: 'center', padding: 18 }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className={styles.darkCard} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Ticket Queue</h3>
                    <button onClick={loadTickets} style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, fontSize: 11, padding: '4px 8px', cursor: 'pointer'}}>Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className={styles.darkTable}>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Tenant</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Age</th>
                                <th style={{textAlign: 'right'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)'}}>Loading...</td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.3)'}}>No tickets found.</td>
                                </tr>
                            ) : tickets.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.id.split('-')[0]}</td>
                                    <td style={{ fontWeight: 600, color: '#fff' }}>{t.tenants?.name || 'Unknown'}</td>
                                    <td>{t.subject}</td>
                                    <td>
                                        <span className={`${styles.badgeDark} ${STATUS_MAP[t.status] || styles.badgeNeutral}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 800, color: PRIORITY_COLORS[t.priority] || '#fff', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                                    <td style={{textAlign: 'right'}}>
                                        {t.status !== 'resolved' && t.status !== 'closed' && (
                                            <button 
                                                onClick={() => handleResolve(t.id)}
                                                style={{background: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto'}}
                                            >
                                                <CheckCircle size={12}/> Resolve
                                            </button>
                                        )}
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
