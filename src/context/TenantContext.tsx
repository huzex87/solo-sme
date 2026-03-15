'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useRouter, usePathname } from 'next/navigation';
import { Tenant } from '@/types';

interface TenantContextType {
    tenantId: string;
    tenantName: string;
    subdomain: string;
    userName: string;
    userRole: string;
    isLoading: boolean;
    isAuthenticated: boolean;
    requiresOnboarding: boolean;
    tenant: Tenant | null;
    error: string | null;
    updateTenantState: (updates: Partial<Tenant>) => void;
}

const EMPTY_CTX: TenantContextType = {
    tenantId: '',
    tenantName: '',
    subdomain: '',
    userName: '',
    userRole: '',
    isLoading: true,
    isAuthenticated: false,
    requiresOnboarding: false,
    tenant: null,
    error: null,
    updateTenantState: () => { },
};

const TenantContext = createContext<TenantContextType>(EMPTY_CTX);

export function useTenant() {
    return useContext(TenantContext);
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const [ctx, setCtx] = useState<TenantContextType>(EMPTY_CTX);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        async function loadTenantFromSession() {
            if (!isSupabaseConfigured) {
                // Demo mode — show placeholder until real Supabase is configured
                setCtx({
                    tenantId: 'demo',
                    tenantName: 'My Business',
                    subdomain: 'my-store',
                    userName: 'Business Owner',
                    userRole: 'owner',
                    isLoading: false,
                    isAuthenticated: false,
                    requiresOnboarding: false,
                    tenant: {
                        id: 'demo',
                        name: 'My Business',
                        subdomain: 'my-store',
                        branding_config: {
                            primaryColor: '#0A7B6C',
                            accentColor: '#F5A623',
                            fontFamily: 'Outfit',
                            borderRadius: '12px',
                        },
                        business_config: {},
                        seo_config: {},
                        advanced_config: {},
                        currency: 'NGN',
                        timezone: 'Africa/Lagos',
                        locale: 'en',
                        ai_onboarding_completed: true
                    } as Tenant,
                    error: null,
                    updateTenantState: (updates) => {
                        setCtx(prev => ({
                            ...prev,
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
                return;
            }

            const supabase = createClient();
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    // Not logged in — simply set state and stop
                    setCtx({ ...EMPTY_CTX, isLoading: false });
                    return;
                }

                // Get profile → tenant_id
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('tenant_id, full_name, role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError || !profile) {
                    console.warn('[TenantContext] No profile found for user', session.user.id);
                    setCtx({
                        ...EMPTY_CTX,
                        tenantName: session.user.user_metadata?.full_name || 'My Business',
                        userName: session.user.user_metadata?.full_name || session.user.email || 'User',
                        isLoading: false,
                        isAuthenticated: true,
                        requiresOnboarding: true,
                        updateTenantState: () => { }
                    });
                    return;
                }

                // Get tenant details
                const { data: tenant, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                if (tenantError || !tenant) {
                    console.warn('[TenantContext] No tenant record found for profile', profile.tenant_id);
                    setCtx({
                        tenantId: profile.tenant_id,
                        tenantName: 'Setting Up...',
                        subdomain: '',
                        userName: profile.full_name,
                        userRole: profile.role,
                        isLoading: false,
                        isAuthenticated: true,
                        requiresOnboarding: true,
                        tenant: null,
                        error: null,
                        updateTenantState: () => { }
                    });
                    return;
                }

                // Success — set real tenant data
                setCtx({
                    tenantId: tenant.id,
                    tenantName: tenant.name,
                    subdomain: tenant.subdomain,
                    userName: profile.full_name,
                    userRole: profile.role,
                    isLoading: false,
                    isAuthenticated: true,
                    requiresOnboarding: !tenant.subdomain || !tenant.ai_onboarding_completed,
                    tenant: tenant as Tenant,
                    error: null,
                    updateTenantState: (updates) => {
                        setCtx(prev => ({
                            ...prev,
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
            } catch (err: unknown) {
                console.error('[TenantContext] Critical error loading tenant:', err);
                const message = err instanceof Error ? err.message : "Failed to load tenant configuration";
                setCtx(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: false,
                    error: message
                }));
            }
        }

        loadTenantFromSession();

        const supabase = createClient();
        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    loadTenantFromSession();
                }
                if (event === 'SIGNED_OUT') {
                    setCtx({ ...EMPTY_CTX, isLoading: false });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router]);

    return (
        <TenantContext.Provider value={ctx}>
            {children}
        </TenantContext.Provider>
    );
}
