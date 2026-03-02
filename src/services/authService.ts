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
            console.log('[AuthService] Demo mode: Sign-in simulated for', email);
            return { data: { user: { id: 'demo_user', email } }, error: null };
        }

        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    /**
     * Register a new business (tenant) and a user profile
     * In a real app, this would be a single atomic operation (e.g., via a Supabase Edge Function)
     */
    static async signUp(email: string, password: string, businessName: string, subdomain: string, fullName: string) {
        if (!isSupabaseConfigured) {
            console.log('[AuthService] Demo mode: Account and business created for', businessName);
            return { data: { user: { id: 'demo_user', email } }, error: null };
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
            })
            .select()
            .single();

        if (tenantError) return { data: null, error: tenantError };

        // 3. Create the profile linked to the tenant
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    tenant_id: tenantData.id,
                    full_name: fullName,
                    role: 'owner',
                });

            if (profileError) return { data: null, error: profileError };
        }

        return { data: authData, error: null };
    }

    /**
     * Get the current active session
     */
    static async getSession() {
        if (!isSupabaseConfigured) {
            return { data: { session: { user: { id: 'demo_user', email: 'demo@solo.com' } } }, error: null };
        }

        return await supabase.auth.getSession();
    }

    /**
     * Sign out the current user
     */
    static async signOut() {
        if (!isSupabaseConfigured) return { error: null };
        return await supabase.auth.signOut();
    }
}
