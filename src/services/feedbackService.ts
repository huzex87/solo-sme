import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { SupabaseClient } from '@supabase/supabase-js';

export interface MerchantFeedback {
    id?: string;
    tenant_id: string;
    subject: string;
    message: string;
    category: 'bug' | 'feature_request' | 'improvement' | 'other';
    rating?: number;
    created_at?: string;
}

export class FeedbackService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Submits a high-fidelity feedback record for a merchant.
     */
    static async submitFeedback(feedback: MerchantFeedback, client?: SupabaseClient): Promise<{ success: boolean; error?: unknown }> {
        if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('merchant_feedback')
            .insert(feedback);

        if (error) {
            console.error('Feedback submission error:', error);
            return { success: false, error };
        }

        return { success: true };
    }
}
