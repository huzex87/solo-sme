import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { logger } from '@/lib/logger';
import { EmailService } from './emailService';
import { SupabaseClient } from '@supabase/supabase-js';
import { getBaseUrl } from '@/lib/baseUrl';


export interface UserProfile {
    id: string;
    tenant_id: string;
    full_name: string;
    role: 'owner' | 'admin' | 'staff';
}

export class AuthService {
    /**
     * Get a supabase client. Prioritizes injected client, falls back to new browser client,
     * then finally legacy singleton (for migration compatibility).
     */
    private static getClient(injectedClient?: SupabaseClient): SupabaseClient {
        if (injectedClient) return injectedClient;
        return createClient();
    }

    /**
     * Sign in with Google OAuth
     */
    static async signInWithGoogle(client?: SupabaseClient) {
        if (!isSupabaseConfigured) {
            logger.debug('Demo mode: Google sign-in simulated');
            return { data: null, error: null };
        }

        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${getBaseUrl()}/auth/callback`,

                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    }

    /**
     * Send OTP to a phone number
     */
    static async signInWithPhone(phone: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) {
            logger.debug('Demo mode: Phone OTP simulated', { phone });
            return { data: null, error: null };
        }

        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.signInWithOtp({
            phone,
        });
    }

    /**
     * Verify phone OTP code
     */
    static async verifyPhoneOTP(phone: string, token: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) {
            logger.debug('Demo mode: OTP verified', { phone });
            return { data: { user: { id: 'demo_user', phone } }, error: null };
        }

        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });
    }

    /**
     * Get the current active session
     */
    static async getSession(client?: SupabaseClient) {
        if (!isSupabaseConfigured) return { data: { session: null }, error: null };
        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.getSession();
    }

    /**
     * Get the current user's profile
     */
    static async getProfile(client?: SupabaseClient): Promise<UserProfile | null> {
        if (!isSupabaseConfigured) return null;

        const supabaseClient = this.getClient(client);
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;

        const { data } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return data;
    }

    /**
     * Sign out the current user
     */
    static async signOut(client?: SupabaseClient) {
        if (!isSupabaseConfigured) return { error: null };
        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.signOut();
    }
}
