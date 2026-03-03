import { supabase } from '@/lib/supabase';

export interface MarketplaceChannel {
    id: string;
    name: string;
    type: 'instagram' | 'facebook' | 'jumia' | 'konga' | 'whatsapp';
    status: 'connected' | 'disconnected' | 'pending';
    last_sync?: string;
    metadata?: Record<string, any>;
}

export class MarketplaceService {
    /**
     * Fetches all marketplace and social channels for a tenant.
     */
    static async getChannels(tenantId: string): Promise<MarketplaceChannel[]> {
        // For the MVP, we start with these core channels
        const { data, error } = await supabase
            .from('marketplace_channels')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error || !data || data.length === 0) {
            return [
                { id: 'ig-1', name: 'Instagram Shopping', type: 'instagram', status: 'disconnected' },
                { id: 'fb-1', name: 'Facebook Shop', type: 'facebook', status: 'disconnected' },
                { id: 'j-1', name: 'Jumia Seller Center', type: 'jumia', status: 'disconnected' },
                { id: 'k-1', name: 'Konga Marketplace', type: 'konga', status: 'disconnected' },
            ];
        }

        return data as MarketplaceChannel[];
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
    static async syncChannel(channelId: string): Promise<boolean> {
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { error } = await supabase
            .from('marketplace_channels')
            .update({ last_sync: new Date().toISOString(), status: 'connected' })
            .eq('id', channelId);

        return !error;
    }
}
