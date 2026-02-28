import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    tenant_id: string;
    full_name: string;
    role: 'owner' | 'manager' | 'staff';
    avatar_url?: string;
}

// Demo data for when Supabase is not configured
const DEMO_USER = {
    id: 'demo-user-001',
    email: 'demo@solo.app',
};

const DEMO_PROFILE: UserProfile = {
    id: 'demo-user-001',
    tenant_id: 'demo-tenant-001',
    full_name: 'Demo Owner',
    role: 'owner' as const,
    avatar_url: undefined,
};

export class AuthService {
    /**
     * Sign in with email and password.
     */
    static async signIn(email: string, password: string) {
        if (!isSupabaseConfigured) {
            // Demo mode
            return { user: DEMO_USER, error: null };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { user: data?.user || null, error };
    }

    /**
     * Sign up a new user and create a tenant + profile atomically.
     */
    static async signUp(
        email: string,
        password: string,
        businessName: string,
        subdomain: string,
        fullName: string,
    ) {
        if (!isSupabaseConfigured) {
            return { user: DEMO_USER, error: null };
        }

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError || !authData.user) {
            return { user: null, error: authError };
        }

        // 2. Create tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: businessName,
                subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            })
            .select()
            .single();

        if (tenantError) {
            return { user: authData.user, error: tenantError };
        }

        // 3. Create profile linked to tenant
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                tenant_id: tenant.id,
                full_name: fullName,
                role: 'owner',
            });

        if (profileError) {
            return { user: authData.user, error: profileError };
        }

        return { user: authData.user, error: null };
    }

    /**
     * Gets the current user session and associated tenant profile.
     */
    static async getCurrentUser(): Promise<{ user: any; profile: UserProfile | null }> {
        if (!isSupabaseConfigured) {
            return { user: DEMO_USER, profile: DEMO_PROFILE };
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { user: null, profile: null };

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return { user, profile: null };
        }

        return { user, profile };
    }

    /**
     * Get current session.
     */
    static async getSession() {
        if (!isSupabaseConfigured) {
            return { session: { user: DEMO_USER }, error: null };
        }

        const { data, error } = await supabase.auth.getSession();
        return { session: data?.session, error };
    }

    /**
     * Sign out the current user.
     */
    static async signOut() {
        if (!isSupabaseConfigured) {
            return { error: null };
        }
        return await supabase.auth.signOut();
    }
}
