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

/**
 * WhatsApp Authentication Service
 * Manages phone-to-tenant binding and OTP logic for the Command Layer.
 */
export class WhatsAppAuthService {
    /**
     * Looks up a tenant by their registered WhatsApp phone number.
     * Uses Redis as a fast-path cache.
     */
    static async getTenantByPhone(phoneNumber: string): Promise<WhatsAppBinding | null> {
        try {
            // Check Redis cache first (TTL: 1 hour)
            const cached = await redis.get(`whatsapp:phone:${phoneNumber}`);
            if (cached) return cached as WhatsAppBinding;

            // Query Supabase for the binding
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

            // Cache the result for 1 hour
            await redis.set(`whatsapp:phone:${phoneNumber}`, binding, { ex: 3600 });
            return binding;
        } catch (err) {
            console.error('[WhatsAppAuth] Error fetching tenant by phone:', err);
            return null;
        }
    }

    /**
     * Initiates the binding flow by generating a 6-digit OTP.
     * OTP is stored in Redis with a 10-minute TTL.
     */
    static async initiateBinding(phoneNumber: string, tenantId: string): Promise<string> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with tenant context in Redis (TTL: 10 mins)
        await redis.set(`whatsapp:otp:${phoneNumber}`, { otp, tenantId }, { ex: 600 });

        return otp;
    }

    /**
     * Verifies the OTP and establishes a permanent binding in Supabase.
     */
    static async verifyAndBind(phoneNumber: string, submittedOtp: string): Promise<{ success: boolean; reason?: string }> {
        try {
            const stored = await redis.get(`whatsapp:otp:${phoneNumber}`) as { otp: string; tenantId: string } | null;

            if (!stored) return { success: false, reason: 'OTP_EXPIRED' };
            if (stored.otp !== submittedOtp) return { success: false, reason: 'INVALID_OTP' };

            // Upsert the binding in Supabase
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

            // Clear the OTP from Redis
            await redis.del(`whatsapp:otp:${phoneNumber}`);

            // Invalidate the phone lookup cache
            await redis.del(`whatsapp:phone:${phoneNumber}`);

            return { success: true };
        } catch (err) {
            console.error('[WhatsAppAuth] Error verifying OTP:', err);
            return { success: false, reason: 'SYSTEM_ERROR' };
        }
    }
}
