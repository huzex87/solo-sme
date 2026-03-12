import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';

export interface LoyaltyAccount {
    id: string;
    customerId: string;
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    history: LoyaltyAction[];
}

export interface LoyaltyAction {
    id: string;
    type: 'earn' | 'redeem';
    points: number;
    description: string;
    date: string;
}

export class LoyaltyService {
    /**
     * Gets a customer's loyalty account from Supabase.
     */
    static async getAccount(customerId: string): Promise<LoyaltyAccount> {
        if (!isSupabaseConfigured) {
            return { customerId, points: 0, tier: 'Bronze', history: [], id: '' };
        }

        const { data, error } = await supabase
            .from('loyalty_accounts')
            .select('*')
            .eq('customer_id', customerId)
            .single();

        if (error || !data) {
            return {
                id: '',
                customerId,
                points: 0,
                tier: 'Bronze',
                history: []
            };
        }

        return {
            id: data.id,
            customerId: data.customer_id,
            points: data.points,
            tier: data.tier,
            history: data.history || []
        };
    }

    /**
     * Calculates points for a purchase (1 point per 100 currency units).
     */
    static calculatePoints(amount: number): number {
        return Math.floor(amount / 100);
    }

    /**
     * Adds points to an account in Supabase.
     */
    static async addPoints(tenantId: string, customerId: string, points: number, description: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const account = await this.getAccount(customerId);
        const newPoints = account.points + points;
        const newHistory = [
            {
                id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'earn' as const,
                points,
                description,
                date: new Date().toISOString()
            },
            ...account.history
        ];

        // Tier upgrade logic
        let tier = account.tier;
        if (newPoints > 5000) tier = 'Platinum';
        else if (newPoints > 2000) tier = 'Gold';
        else if (newPoints > 500) tier = 'Silver';

        if (account.id) {
            await supabase
                .from('loyalty_accounts')
                .update({ points: newPoints, tier, history: newHistory, updated_at: new Date().toISOString() })
                .eq('id', account.id);
        } else {
            await supabase
                .from('loyalty_accounts')
                .insert({
                    tenant_id: tenantId,
                    customer_id: customerId,
                    points: newPoints,
                    tier,
                    history: newHistory,
                    updated_at: new Date().toISOString()
                });
        }

        // Record audit action
        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: points > 0 ? 'earn_points' : 'redeem_points',
            entity_type: 'loyalty_account',
            entity_id: customerId,
            metadata: { points, description, newTotal: newPoints }
        });
    }

    /**
     * Converts points to a discount value (e.g., 10 points = 1 currency unit).
     */
    static getDiscountValue(points: number): number {
        return points * 10;
    }
}
