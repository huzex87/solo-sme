import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import redis from '@/lib/redis';
import { WhatsAppEntities, ResolveProduct, ResolveVoidItem } from './intentEngine';

export interface WhatsAppBinding {
    tenant_id: string;
    tenant_name: string;
    is_active: boolean;
}

export interface PendingAction extends WhatsAppEntities {
    type: string;
    tenant_id: string;
    resolved?: (ResolveProduct | ResolveVoidItem)[];
    totalAmount?: number;
    order_id?: string;
    order_ref?: string;
    amount?: number;
    category?: string;
    description?: string;
    segment?: string;
    count?: number;
    message?: string;
    customer_name?: string;
}

/**
 * WhatsApp Authentication Service
 * Manages phone-to-tenant binding, OTP logic, and pending confirmation state.
 */
export class WhatsAppAuthService {
    private static async getClient(injectedClient?: SupabaseClient) {
        if (injectedClient) return injectedClient;
        return await createAdminClient();
    }

    /**
     * Looks up a tenant by their registered WhatsApp phone number.
     * Uses Redis as a fast-path cache (TTL: 1 hour).
     */
    static async getTenantByPhone(phoneNumber: string, supabase?: SupabaseClient): Promise<any | null> {
        // 1. Try Cache (Redis)
        let cached: any = null;
        try {
            cached = await redis.get(`whatsapp:phone:${phoneNumber}`);
        } catch (err) {
            console.warn('[WhatsAppAuth] Redis cache lookup failed, falling back to Supabase:', err);
        }
        if (cached) return cached as WhatsAppBinding;

        try {
            // 2. Try DB (Supabase)
            const client = await this.getClient(supabase);
            const { data, error } = await client
                .from('whatsapp_phone_bindings')
                .select('*, tenants(name)')
                .eq('phone_number', phoneNumber)
                .eq('is_active', true)
                .single();

            if (error || !data) return null;

            const binding: any = {
                id: data.id,
                phone_number: data.phone_number,
                tenant_id: data.tenant_id,
                tenant_name: (data.tenants as any)?.name || 'Merchant',
                is_active: data.is_active,
                bound_at: data.bound_at,
                last_active_at: data.last_active_at
            };

            // 3. Cache it
            try {
                await redis.set(`whatsapp:phone:${phoneNumber}`, binding, { ex: 3600 });
            } catch (err) {
                console.warn('[WhatsAppAuth] Redis cache set failed:', err);
            }

            return binding;
        } catch (err) {
            console.error('[WhatsAppAuth] Error looking up tenant by phone:', err);
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
     * FIX S: Added brute-force protection — max 3 failed attempts before OTP is invalidated.
     */
    static async verifyAndBind(
        phoneNumber: string,
        submittedOtp: string,
        supabase?: SupabaseClient
    ): Promise<{ success: boolean; reason?: string }> {
        try {
            const stored = await redis.get(`whatsapp:otp:${phoneNumber}`) as { otp: string; tenantId: string; attempts?: number } | null;
            if (!stored) return { success: false, reason: 'OTP_EXPIRED' };

            // Brute-force guard: invalidate after 3 failed attempts
            const attempts = (stored.attempts || 0) + 1;
            if (stored.otp !== submittedOtp) {
                if (attempts >= 3) {
                    await redis.del(`whatsapp:otp:${phoneNumber}`);
                    return { success: false, reason: 'MAX_ATTEMPTS_EXCEEDED' };
                }
                // Increment attempt counter while preserving remaining TTL
                await redis.set(`whatsapp:otp:${phoneNumber}`, { ...stored, attempts }, { ex: 600 });
                return { success: false, reason: 'INVALID_OTP' };
            }

            const client = await this.getClient(supabase);
            const { error } = await client
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
        } catch (err) {
            console.error('[WhatsAppAuth] Error fetching pending confirmation:', err);
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
     * Directly binds a phone number to a tenant without OTP.
     * Used for in-band signup flows where the channel itself provides authentication.
     */
    static async verifyAndBindManual(
        phoneNumber: string,
        tenantId: string,
        supabase?: SupabaseClient
    ): Promise<void> {
        try {
            const client = await this.getClient(supabase);
            const { error } = await client
                .from('whatsapp_phone_bindings')
                .upsert({
                    phone_number: phoneNumber,
                    tenant_id: tenantId,
                    is_active: true,
                    bound_at: new Date().toISOString(),
                    last_active_at: new Date().toISOString()
                }, { onConflict: 'phone_number' });

            if (error) throw error;
            await redis.del(`whatsapp:phone:${phoneNumber}`);
        } catch (err) {
            console.error('[WhatsAppAuth] Error in manual bind:', err);
            throw err;
        }
    }

    /**
     * Updates the last_active_at timestamp for a binding.
     * Called after each successful command to maintain session hygiene.
     */
    static async touchBinding(phoneNumber: string, supabase?: SupabaseClient): Promise<void> {
        try {
            const client = await this.getClient(supabase);
            await client
                .from('whatsapp_phone_bindings')
                .update({ last_active_at: new Date().toISOString() })
                .eq('phone_number', phoneNumber);
        } catch (err) {
            console.error('[WhatsAppAuth] Error touching binding:', err);
        }
    }
}
