import { supabase } from '@/lib/supabase';

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
    /**
     * Submits a high-fidelity feedback record for a merchant.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async submitFeedback(feedback: MerchantFeedback): Promise<{ success: boolean; error?: any }> {
        const { error } = await supabase
            .from('merchant_feedback')
            .insert(feedback);

        if (error) {
            console.error('Feedback submission error:', error);
            return { success: false, error };
        }

        return { success: true };
    }
}
