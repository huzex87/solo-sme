import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AutomationTrigger = 'abandoned_cart' | 'recall_dormant' | 'vip_thank_you';

export interface AutomationSequence {
    id: string;
    trigger_type: AutomationTrigger;
    status: 'active' | 'paused';
    lastRan?: string;
    total_sent: number;
    conversions: number;
}

export class AutomationService {
    /**
     * Triggers an automation workflow.
     */
    static async triggerWorkflow(trigger: AutomationTrigger, customerEmail: string): Promise<boolean> {
        console.log(`[Automation] Sequence ${trigger} for ${customerEmail}`);
        // In production, this would hit an Edge Function or queue
        return true;
    }

    /**
     * Gets all configured automation sequences from Supabase.
     */
    static async getSequences(tenantId: string): Promise<AutomationSequence[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('automation_sequences')
            .select('*')
            .eq('tenant_id', tenantId);

        if (error) return [];
        return data || [];
    }

    /**
     * Toggles a sequence status.
     */
    static async toggleSequence(id: string, currentStatus: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        await supabase
            .from('automation_sequences')
            .update({ status: newStatus })
            .eq('id', id);
    }
}
