import styles from '../admin.module.css';

const TICKETS = [
    { id: 'TKT-105', tenant: 'Zara Collections', subject: 'Bulk Product Import Error', status: 'open', priority: 'high', age: '1h ago' },
    { id: 'TKT-104', tenant: 'FreshMart', subject: 'Custom Domain Not Resolving', status: 'open', priority: 'high', age: '2h ago' },
    { id: 'TKT-103', tenant: 'Demo Boutique', subject: 'Payout Delay - 3 Days', status: 'in-progress', priority: 'high', age: '5h ago' },
    { id: 'TKT-102', tenant: 'Lagos Fashion', subject: 'Custom Domain SSL Issue', status: 'in-progress', priority: 'medium', age: '1d ago' },
    { id: 'TKT-101', tenant: 'Artisan Hub', subject: 'Inquiry on Bulk Upload', status: 'resolved', priority: 'low', age: '2d ago' },
    { id: 'TKT-099', tenant: 'Electronic Mart', subject: 'Payment Integration Help', status: 'resolved', priority: 'low', age: '3d ago' },
];

const STATUS_MAP: Record<string, string> = {
    'open': styles.badgeError,
    'in-progress': styles.badgeInfo,
    'resolved': styles.badgeSuccess,
};

const PRIORITY_COLORS: Record<string, string> = {
    'high': '#f87171',
    'medium': 'var(--accent)',
    'low': 'rgba(255,255,255,0.4)',
};

export default function SupportPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Support &amp; Resolution</h1>
            <p className={styles.adminSubtitle}>Platform-wide support requests and tenant inquiries.</p>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Open Tickets', value: '2', color: '#f87171' },
                    { label: 'In Progress', value: '2', color: '#60a5fa' },
                    { label: 'Resolved (30d)', value: '47', color: '#34d399' },
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
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Sorted by priority</span>
                </div>
                <table className={styles.darkTable}>
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Tenant</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TICKETS.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{t.id}</td>
                                <td style={{ fontWeight: 600, color: '#fff' }}>{t.tenant}</td>
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
                                <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
