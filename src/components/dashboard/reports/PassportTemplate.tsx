import styles from './PassportTemplate.module.css';
import { formatCurrency } from '@/lib/formatCurrency';

interface PassportTemplateProps {
    data: any;
    businessName: string;
}

export default function PassportTemplate({ data, businessName }: PassportTemplateProps) {
    if (!data) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.badge}>CREDIT READINESS PASSPORT</div>
                <h1 className={styles.title}>{businessName}</h1>
                <p className={styles.meta}>Generated on {data.generationDate}</p>
            </div>

            <div className={styles.scoreSection}>
                <div className={styles.scoreCircle}>
                    <span className={styles.scoreValue}>{data.score}</span>
                    <span className={styles.scoreLabel}>Score</span>
                </div>
                <div className={styles.scoreStatus}>
                    <h3>Business Health: {data.score > 70 ? 'Excellent' : 'Stable'}</h3>
                    <p>This business demonstrates consistent operational metrics and financial transparency through the SOLO SME platform.</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <span className={`${styles.statValue} font-mono`}>{formatCurrency(data.businessHealth.revenue)}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Net Profit</span>
                    <span className={`${styles.statValue} font-mono`}>{formatCurrency(data.businessHealth.profit)}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Profit Margin</span>
                    <span className={`${styles.statValue} font-mono`}>{data.businessHealth.margin.toFixed(1)}%</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Customer Retention</span>
                    <span className={`${styles.statValue} font-mono`}>{data.businessHealth.retention.toFixed(1)}%</span>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Monthly Revenue Growth</h3>
                <div className={styles.chartArea}>
                    {data.monthlyPerformance.map((m: any, i: number) => (
                        <div key={i} className={styles.chartBar} style={{ height: `${Math.min((m.value / 100000) * 100, 100)}%` }}>
                            <span className={styles.barLabel}>{m.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.footer}>
                <p>Verified by SOLO SME Intelligence Engine • Digital Serial: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            </div>
        </div>
    );
}
