export type CustomerSegment = 'VIP' | 'Regular' | 'Dormant' | 'Churn Risk';

export interface SegmentStats {
    segment: CustomerSegment;
    count: number;
    description: string;
    color: string;
}

export class SegmentationService {
    /**
     * Categorizes a customer based on purchase history and activity.
     */
    static getSegment(totalSpent: number, daysSinceLastPurchase: number): CustomerSegment {
        if (totalSpent > 100000) return 'VIP';
        if (daysSinceLastPurchase > 30) return 'Dormant';
        if (daysSinceLastPurchase > 14 && totalSpent === 0) return 'Churn Risk';
        return 'Regular';
    }

    /**
     * Returns summary stats for all segments.
     */
    static getSegmentStats(): SegmentStats[] {
        return [
            {
                segment: 'VIP',
                count: 12,
                description: 'High-value repeat customers',
                color: 'var(--color-success)'
            },
            {
                segment: 'Regular',
                count: 45,
                description: 'Active buyers',
                color: 'var(--accent-primary)'
            },
            {
                segment: 'Dormant',
                count: 28,
                description: 'No purchase in 30+ days',
                color: 'var(--color-warning)'
            },
            {
                segment: 'Churn Risk',
                count: 15,
                description: 'High risk of leaving',
                color: 'var(--color-error)'
            }
        ];
    }
}
