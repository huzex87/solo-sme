import { BaseService } from './baseService';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

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

export class LoyaltyService extends BaseService {
    protected static serviceName = 'LoyaltyService';

    /**
     * Gets a customer's loyalty account from Supabase.
     */
    static async getAccount(customerId: string, client?: SupabaseClient): Promise<LoyaltyAccount> {
        if (!isSupabaseConfigured) {
            return { customerId, points: 0, tier: 'Bronze', history: [], id: '' };
        }

        const supabase = await this.getClient(client);
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
    static async addPoints(tenantId: string, customerId: string, points: number, description: string, client?: SupabaseClient): Promise<void> {
        if (!isSupabaseConfigured) return;

        const supabase = await this.getClient(client);
        const account = await this.getAccount(customerId, client);
        const newPoints = account.points + points;

        let tier = account.tier;
        if (newPoints > 5000) tier = 'Platinum';
        else if (newPoints > 2000) tier = 'Gold';
        else if (newPoints > 500) tier = 'Silver';

        const { error: rpcError } = await supabase.rpc('add_loyalty_points', {
            p_tenant_id: tenantId,
            p_customer_id: customerId,
            p_points: points,
            p_action_type: points > 0 ? 'earn' : 'redeem',
            p_description: description,
            p_tier: tier
        });

        if (rpcError) {
            this.error('Atomic update failed:', rpcError);
            throw rpcError;
        }

        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: points > 0 ? 'earn_points' : 'redeem_points',
            entity_type: 'loyalty_account',
            entity_id: customerId,
            metadata: { points, description, newTotal: newPoints }
        }, client);
    }

    /**
     * Converts points to a discount value (e.g., 10 points = 1 currency unit).
     */
    static getDiscountValue(points: number): number {
        return points * 10;
    }
}
