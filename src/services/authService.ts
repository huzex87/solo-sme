import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    tenant_id: string;
    full_name: string;
    role: 'owner' | 'manager' | 'staff';
    avatar_url?: string;
}

export class AuthService {
    /**
     * Gets the current user session and associated tenant profile.
     */
    static async getCurrentUser(): Promise<{ user: any; profile: UserProfile | null }> {
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
     * Sign out the current user.
     */
    static async signOut() {
        return await supabase.auth.signOut();
    }
}
