import { createClient } from '@supabase/supabase-js';
import redis from '@/lib/redis';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export interface WhatsAppBinding {
    tenant_id: string;
    tenant_name: string;
    is_active: boolean;
}

export interface PendingAction {
    type: string;
    tenant_id: string;
    [key: string]: any;
}

/**
 * WhatsApp Authentication Service
 * Manages phone-to-tenant binding, OTP logic, and pending confirmation state.
 *
 * FIX A: Added getPendingConfirmation, setPendingConfirmation, clearPendingConfirmation
 *        — these were called by WhatsAppCommandService but never implemented here,
 *          causing a runtime crash on every message that triggered a confirmation flow.
 */
export class WhatsAppAuthService {

    /**
     * Looks up a tenant by their registered WhatsApp phone number.
     * Uses Redis as a fast-path cache (TTL: 1 hour).
     */
    static async getTenantByPhone(phoneNumber: string): Promise<WhatsAppBinding | null> {
        try {
            const cached = await redis.get(`whatsapp:phone:${phoneNumber}`);
            if (cached) return cached as WhatsAppBinding;

            const { data, error } = await getSupabaseClient()
                .from('whatsapp_phone_bindings')
                .select('tenant_id, tenants(name), is_active')
                .eq('phone_number', phoneNumber)
                .eq('is_active', true)
                .single();

            if (error || !data) return null;

            const binding: WhatsAppBinding = {
                tenant_id: data.tenant_id,
                tenant_name: (data.tenants as any).name,
                is_active: data.is_active
            };

            await redis.set(`whatsapp:phone:${phoneNumber}`, binding, { ex: 3600 });
            return binding;
        } catch (err) {
            console.error('[WhatsAppAuth] Error fetching tenant by phone:', err);
            return null;
        }
    }

    /**
     * Generates and stores a 6-digit OTP for phone-to-tenant binding.
     * TTL: 10 minutes.
     */
    static async initiateBinding(phoneNumber: string, tenantId: string): Promise<string> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(`whatsapp:otp:${phoneNumber}`, { otp, tenantId }, { ex: 600 });
        return otp;
    }

    /**
     * Verifies OTP and writes a permanent phone binding to Supabase.
     */
    static async verifyAndBind(
        phoneNumber: string,
        submittedOtp: string
    ): Promise<{ success: boolean; reason?: string }> {
        try {
            const stored = await redis.get(`whatsapp:otp:${phoneNumber}`) as { otp: string; tenantId: string } | null;
            if (!stored) return { success: false, reason: 'OTP_EXPIRED' };
            if (stored.otp !== submittedOtp) return { success: false, reason: 'INVALID_OTP' };

            const { error } = await getSupabaseClient()
                .from('whatsapp_phone_bindings')
                .upsert({
                    phone_number: phoneNumber,
                    tenant_id: stored.tenantId,
                    is_active: true,
                    bound_at: new Date().toISOString(),
                    last_active_at: new Date().toISOString()
                }, { onConflict: 'phone_number' });

            if (error) throw error;

            await redis.del(`whatsapp:otp:${phoneNumber}`);
            await redis.del(`whatsapp:phone:${phoneNumber}`);
            return { success: true };
        } catch (err) {
            console.error('[WhatsAppAuth] Error verifying OTP:', err);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }

    // ── FIX A: Pending Confirmation State Management ──────────────────────────
    // These three methods are called by WhatsAppCommandService for confirmation-
    // before-write flows (RECORD_SALE, RECORD_EXPENSE, SEND_PROMO).
    // They were completely absent, causing a runtime crash on every write action.

    /**
     * Stages a pending action in Redis awaiting merchant YES/NO confirmation.
     * TTL: 5 minutes — if merchant doesn't confirm, action expires automatically.
     */
    static async setPendingConfirmation(phoneNumber: string, action: PendingAction): Promise<void> {
        await redis.set(`whatsapp:pending:${phoneNumber}`, action, { ex: 300 });
    }

    /**
     * Retrieves a staged pending action for this phone number.
     * Returns null if no action is staged or TTL has expired.
     */
    static async getPendingConfirmation(phoneNumber: string): Promise<PendingAction | null> {
        try {
            const pending = await redis.get(`whatsapp:pending:${phoneNumber}`);
            return pending as PendingAction | null;
        } catch {
            return null;
        }
    }

    /**
     * Clears a pending action after it has been confirmed or cancelled.
     */
    static async clearPendingConfirmation(phoneNumber: string): Promise<void> {
        await redis.del(`whatsapp:pending:${phoneNumber}`);
    }

    /**
     * Updates the last_active_at timestamp for a binding.
     * Called after each successful command to maintain session hygiene.
     */
    static async touchBinding(phoneNumber: string): Promise<void> {
        try {
            await getSupabaseClient()
                .from('whatsapp_phone_bindings')
                .update({ last_active_at: new Date().toISOString() })
                .eq('phone_number', phoneNumber);
        } catch (err) {
            console.error('[WhatsAppAuth] Error touching binding:', err);
        }
    }
}
