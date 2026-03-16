import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { logger } from '@/lib/logger';
import { EmailService } from './emailService';
import { ratelimit } from '@/lib/rateLimit';
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
     * Authenticate a user with email and password
     */
    static async signIn(email: string, password: string, client?: SupabaseClient) {
        // Rate limit: 5 attempts per 15 mins
        const { success } = await ratelimit.limit(`signin:${email}`);
        if (!success) {
            return {
                data: null,
                error: { message: 'Too many sign-in attempts. Please try again later.' }
            };
        }

        if (!isSupabaseConfigured) {
            return {
                data: { session: null, user: null },
                error: { message: 'Supabase is not configured. Please check your environment variables.' }
            };
        }

        const supabaseClient = this.getClient(client);
        return await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
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
     * Check if a subdomain is already taken
     */
    static async isSubdomainAvailable(subdomain: string, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const supabaseClient = this.getClient(client);
        const { data } = await supabaseClient
            .from('tenants')
            .select('id')
            .eq('subdomain', subdomain)
            .maybeSingle();

        return !data;
    }

    /**
     * Register a new business (tenant) and a user profile.
     */
    static async signUp(email: string, password: string, businessName: string, subdomain: string, fullName: string, client?: SupabaseClient) {
        // Rate limit: 3 signups per hour
        const { success } = await ratelimit.limit(`signup:${email}`);
        if (!success) {
            return {
                data: null,
                error: { message: 'Too many accounts created from this device. Please try again later.' }
            };
        }

        if (!isSupabaseConfigured) {
            throw new Error('Supabase is not configured.');
        }

        const supabaseClient = this.getClient(client);
        // Use admin client for DB inserts to bypass RLS during bootstrapping
        const adminClient = await createAdminClient();

        // 0. Pre-check subdomain
        const available = await this.isSubdomainAvailable(subdomain, supabaseClient);
        if (!available) {
            return {
                data: null,
                error: { message: `The store URL "${subdomain}" is already taken. Please choose a different one.` }
            };
        }

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (authError) return { data: null, error: authError };

        // 2. Create the tenant
        if (!authData.user) return { data: null, error: { message: 'User creation failed' } };

        const { data: tenantData, error: tenantError } = await adminClient
            .from('tenants')
            .insert({
                name: businessName,
                subdomain,
                owner_id: authData.user.id,
            })
            .select()
            .single();

        if (tenantError) {
            if (tenantError.message?.includes('tenants_subdomain_key')) {
                return {
                    data: null,
                    error: { message: `The store URL "${subdomain}" was just taken. Please choose a different one.` }
                };
            }
            return { data: null, error: tenantError };
        }

        // 3. Create the profile
        const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
                id: authData.user.id,
                tenant_id: tenantData.id,
                full_name: fullName,
                role: 'owner',
            });

        if (profileError) {
            logger.error('Profile creation failed', profileError);
            return { data: null, error: profileError };
        }

        // 4. Send welcome email (async, don't block)
        EmailService.sendWelcome(email, businessName).catch((err: unknown) => {
            logger.error('Failed to send welcome email', err);
        });

        return { data: { ...authData, tenant_id: tenantData.id }, error: null };
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
