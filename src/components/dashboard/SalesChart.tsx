'use client';

import styles from './SalesChart.module.css';

interface SalesTrend {
    date: string;
    amount: number;
}

export default function SalesChart({ data }: { data: SalesTrend[] }) {
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '12px',
                border: '1px dashed var(--border-glass)',
                borderRadius: 'var(--radius-md)'
            }}>
                No sales activity recorded in this period
            </div>
        );
    }
    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.yAxis}>
                <span>₦{(maxAmount / 1000).toFixed(0)}k</span>
                <span>₦{(maxAmount / 2000).toFixed(0)}k</span>
                <span>0</span>
            </div>

            <div className={styles.chartArea}>
                {data.map((item, index) => {
                    const height = (item.amount / maxAmount) * 100;
                    return (
                        <div key={index} className={styles.barGroup}>
                            <div className={styles.tooltip}>
                                ₦{item.amount.toLocaleString()}
                            </div>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.bar}
                                    style={{
                                        height: `${height}%`,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    <div className={styles.barGlow} />
                                </div>
                            </div>
                            <span className={styles.label}>{item.date}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
