import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { logger } from '@/lib/logger';
import { EmailService } from './emailService';
import { ratelimit } from '@/lib/rateLimit';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { getBaseUrl } from '@/lib/baseUrl';

export class AuthAdminService {
    /**
     * Get a supabase client. Prioritizes injected client, falls back to server client (should be passed by caller).
     */
    private static getClient(injectedClient?: SupabaseClient): SupabaseClient {
        if (injectedClient) return injectedClient;
        // This is a fallback but caller SHOULD pass the server client in Next.js App Router context
        return createBrowserClient();
    }

    /**
     * Authenticate a user with email and password.
     * This is intended for server-side use in Server Actions.
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
     * Check if a subdomain is already taken.
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
     * Uses createAdminClient to bypass RLS during bootstrapping.
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
     * Ensures a user has a profile and a tenant. 
     * Created for OAuth users who might sign in without completing the signup flow.
     */
    static async ensureProfileAndTenant(userId: string, email: string, fullName: string, client?: SupabaseClient) {
        if (!isSupabaseConfigured) return { data: null, error: null };

        const adminClient = await createAdminClient();

        // 1. Check if profile exists
        const { data: profile } = await adminClient
            .from('profiles')
            .select('id, tenant_id')
            .eq('id', userId)
            .maybeSingle();

        if (profile?.tenant_id) {
            return { data: profile, error: null };
        }

        // 2. If no profile/tenant, bootstrap them
        logger.info(`[AuthAdminService] Bootstrapping OAuth user: ${email}`);

        // Generate a decent default subdomain
        const baseSubdomain = email.split('@')[0].replace(/[^a-z0-9]/g, '').slice(0, 15);
        let subdomain = baseSubdomain;

        // Ensure uniqueness for the auto-generated subdomain
        const isTaken = await this.isSubdomainAvailable(subdomain, adminClient).then(avail => !avail);
        if (isTaken) {
            subdomain = `${baseSubdomain}-${Math.floor(Math.random() * 1000)}`;
        }

        // Create Tenant
        const { data: tenant, error: tErr } = await adminClient
            .from('tenants')
            .insert({
                name: `${fullName}'s Store`,
                subdomain,
                owner_id: userId,
            })
            .select()
            .single();

        if (tErr) {
            logger.error('[AuthAdminService] OAuth Tenant bootstrapping failed', tErr);
            return { data: null, error: tErr };
        }

        // Create Profile
        const { data: newProfile, error: pErr } = await adminClient
            .from('profiles')
            .insert({
                id: userId,
                tenant_id: tenant.id,
                full_name: fullName,
                role: 'owner',
            })
            .select()
            .single();

        if (pErr) {
            logger.error('[AuthAdminService] OAuth Profile bootstrapping failed', pErr);
            return { data: null, error: pErr };
        }

        return { data: newProfile, error: null };
    }
}
