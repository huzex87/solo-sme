import { supabase } from '@/lib/supabase';

export interface MarketplaceChannel {
    id: string;
    name: string;
    type: 'instagram' | 'facebook' | 'jumia' | 'konga' | 'whatsapp';
    status: 'connected' | 'disconnected' | 'pending';
    last_sync?: string;
    metadata?: Record<string, unknown>;
}

export class MarketplaceService {
    /**
     * Fetches all marketplace and social channels for a tenant.
     */
    static async getChannels(tenantId: string): Promise<MarketplaceChannel[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('marketplace_channels')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) {
            console.error('[MarketplaceService] Fetch error:', error);
            return [];
        }

        return (data || []) as MarketplaceChannel[];
    }

    /**
     * Connects a new channel (simulated for now).
     */
    static async connectChannel(tenantId: string, type: string): Promise<boolean> {
        const { error } = await supabase
            .from('marketplace_channels')
            .upsert({
                tenant_id: tenantId,
                type,
                name: type.charAt(0).toUpperCase() + type.slice(1),
                status: 'connected',
                last_sync: new Date().toISOString()
            });

        return !error;
    }

    /**
     * Triggers a manual sync for a specific channel.
     */
    /**
     * Joins the waitlist for a specific channel type.
     */
    static async joinWaitlist(tenantId: string, type: string): Promise<boolean> {
        const { error } = await supabase
            .from('marketplace_waitlist')
            .upsert({
                tenant_id: tenantId,
                channel_type: type,
                joined_at: new Date().toISOString()
            });

        return !error;
    }
}
