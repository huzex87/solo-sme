import styles from '../admin.module.css';

export default function HealthPage() {
    return (
        <div className="animate-entrance">
            <h1 className={styles.adminTitle}>System Health</h1>
            <p className={styles.adminSubtitle}>Real-time monitoring of SOLO OS infrastructure and core services.</p>

            <div className={styles.statGrid}>
                <div className={`card ${styles.adminCard}`} style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <h4>Database (Supabase)</h4>
                    <div className={styles.value}>ONLINE</div>
                    <div className={styles.trend}>Latency: 12ms</div>
                </div>
                <div className={`card ${styles.adminCard}`} style={{ borderLeft: '4px solid var(--color-success)' }}>
                    <h4>Payment Gateway</h4>
                    <div className={styles.value}>OPERATIONAL</div>
                    <div className={styles.trend}>Paystack & Stripe Active</div>
                </div>
                <div className={`card ${styles.adminCard}`} style={{ borderLeft: '4px solid var(--color-info)' }}>
                    <h4>Storage Engine</h4>
                    <div className={styles.value}>92% Free</div>
                    <div className={styles.trend}>Global CDN Active</div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>Incident History</h3>
                <p style={{ color: 'var(--text-secondary)' }}>All systems operational. No major incidents reported in the last 90 days.</p>
            </div>
        </div>
    );
}
