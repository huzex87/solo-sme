import { SupabaseClient } from '@supabase/supabase-js';
import { WhatsAppBinding } from '@/services/whatsappAuthService';
import { IntentResult } from '@/services/intentEngine';

export interface HandlerContext {
    from: string;
    binding: WhatsAppBinding;
    supabase: SupabaseClient;
}

export abstract class IntentHandler {
    abstract intent: string;
    abstract handle(context: HandlerContext, result: IntentResult): Promise<void>;
}
