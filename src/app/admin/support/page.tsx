import styles from '../admin.module.css';

const TICKETS = [
    { id: 'TKT-102', tenant: 'Demo Boutique', subject: 'Payout Delay', status: 'open', priority: 'high' },
    { id: 'TKT-101', tenant: 'Lagos Fashion', subject: 'Custom Domain SSL', status: 'in-progress', priority: 'medium' },
    { id: 'TKT-099', tenant: 'Artisan Hub', subject: 'Inquiry on Bulk Upload', status: 'resolved', priority: 'low' },
];

export default function SupportPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>Support & Resolution</h1>
            <p className={styles.adminSubtitle}>Manage platform-wide support requests and tenant inquiries.</p>

            <div className="table-container card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Tenant</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TICKETS.map(t => (
                            <tr key={t.id}>
                                <td style={{ fontFamily: 'var(--font-mono)' }}>{t.id}</td>
                                <td style={{ fontWeight: 600 }}>{t.tenant}</td>
                                <td>{t.subject}</td>
                                <td>
                                    <span className={`badge ${t.status === 'open' ? 'badge-error' : t.status === 'resolved' ? 'badge-success' : 'badge-info'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 800, color: t.priority === 'high' ? 'var(--color-error)' : 'inherit' }}>
                                        {t.priority.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-ghost btn-sm">Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
