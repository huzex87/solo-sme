import { CustomerService } from './customerService';

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
     * Returns real summary stats for all segments by analyzing customers in Supabase.
     */
    static async getSegmentStats(tenantId: string): Promise<SegmentStats[]> {
        const customers = await CustomerService.getCustomers(tenantId);

        const counts = {
            'VIP': 0,
            'Regular': 0,
            'Dormant': 0,
            'Churn Risk': 0
        };

        const now = new Date();
        customers.forEach(c => {
            const lastDate = c.last_order_at ? new Date(c.last_order_at) : new Date(c.created_at);
            const daysSinceLastPurchase = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            const segment = this.getSegment(c.total_spend, daysSinceLastPurchase);
            counts[segment]++;
        });

        return [
            { segment: 'VIP', count: counts['VIP'], description: 'High-value repeat customers', color: 'var(--color-success)' },
            { segment: 'Regular', count: counts['Regular'], description: 'Active buyers', color: 'var(--accent-primary)' },
            { segment: 'Dormant', count: counts['Dormant'], description: 'No purchase in 30+ days', color: 'var(--color-warning)' },
            { segment: 'Churn Risk', count: counts['Churn Risk'], description: 'High risk of leaving', color: 'var(--color-error)' }
        ];
    }
}
