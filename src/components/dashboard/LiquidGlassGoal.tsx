import { formatCurrency } from '@/lib/formatCurrency';
import styles from './LiquidGlassGoal.module.css';

interface LiquidGlassGoalProps {
    current: number;
    goal: number;
    label: string;
    unit?: string;
}

export default function LiquidGlassGoal({ current, goal, label }: LiquidGlassGoalProps) {
    const percentage = Math.min(Math.round((current / goal) * 100), 100);
    const isSuccess = percentage >= 100;

    return (
        <div className={styles.container}>
            <div className={styles.glass}>
                <div
                    className={`${styles.liquid} ${isSuccess ? styles.success : ''}`}
                    style={{ height: `${percentage}%` }}
                >
                    <div className={styles.wave} />
                    <div className={styles.wave} />
                </div>
                <div className={`${styles.percentage} font-mono`}>
                    {percentage}%
                </div>
            </div>
            <div className={styles.info}>
                <span className={styles.label}>{label}</span>
                <span className={`${styles.value} font-mono`}>
                    {formatCurrency(current)} / {formatCurrency(goal)}
                </span>
            </div>
        </div>
    );
}
