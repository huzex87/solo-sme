import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    tenant_id: string;
    full_name: string;
    role: 'owner' | 'admin' | 'staff';
}

export class AuthService {
    /**
     * Authenticate a user with email and password
     */
    static async signIn(email: string, password: string) {
        if (!isSupabaseConfigured) {
            return {
                data: { session: null, user: null },
                error: { message: 'Supabase is not configured. Please check your environment variables.' }
            };
        }

        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    /**
     * Check if a subdomain is already taken
     */
    static async isSubdomainAvailable(subdomain: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { data } = await supabase
            .from('tenants')
            .select('id')
            .eq('subdomain', subdomain)
            .maybeSingle();

        return !data;
    }

    /**
     * Register a new business (tenant) and a user profile.
     */
    static async signUp(email: string, password: string, businessName: string, subdomain: string, fullName: string) {
        if (!isSupabaseConfigured) {
            throw new Error('Supabase is not configured.');
        }

        // 0. Pre-check subdomain
        const available = await this.isSubdomainAvailable(subdomain);
        if (!available) {
            return {
                data: null,
                error: { message: `The store URL "${subdomain}" is already taken. Please choose a different one.` }
            };
        }

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
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
        const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: businessName,
                subdomain,
                owner_id: authData.user?.id,
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
        if (authData.user) {
            await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    tenant_id: tenantData.id,
                    full_name: fullName,
                    role: 'owner',
                });
        }

        return { data: authData, error: null };
    }

    /**
     * Get the current active session
     */
    static async getSession() {
        if (!isSupabaseConfigured) return { data: { session: null }, error: null };
        return await supabase.auth.getSession();
    }

    /**
     * Get the current user's profile
     */
    static async getProfile(): Promise<UserProfile | null> {
        if (!isSupabaseConfigured) return null;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return data;
    }

    /**
     * Sign out the current user
     */
    static async signOut() {
        if (!isSupabaseConfigured) return { error: null };
        return await supabase.auth.signOut();
    }
}
