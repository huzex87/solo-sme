'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import { useRouter } from 'next/navigation';
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
    updateTenantState: () => { },
};

const TenantContext = createContext<TenantContextType>(EMPTY_CTX);

export function useTenant() {
    return useContext(TenantContext);
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const [ctx, setCtx] = useState<TenantContextType>(EMPTY_CTX);
    const router = useRouter();

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
                    updateTenantState: (updates) => {
                        setCtx(prev => ({
                            ...prev,
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    // Not logged in — redirect to login
                    setCtx({ ...EMPTY_CTX, isLoading: false });
                    router.push('/login');
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
                        userName: session.user.user_metadata?.full_name || session.user.email || '',
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
                    console.warn('[TenantContext] No tenant found for profile', profile.tenant_id);
                    setCtx({
                        tenantId: profile.tenant_id,
                        tenantName: 'My Business',
                        subdomain: '',
                        userName: profile.full_name,
                        userRole: profile.role,
                        isLoading: false,
                        isAuthenticated: true,
                        requiresOnboarding: true,
                        tenant: null,
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
                    requiresOnboarding: !tenant.subdomain,
                    tenant: tenant as Tenant,
                    updateTenantState: (updates) => {
                        setCtx(prev => ({
                            ...prev,
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
            } catch (err) {
                console.error('[TenantContext] Error loading tenant:', err);
                setCtx(prev => ({ ...prev, isLoading: false }));
            }
        }

        loadTenantFromSession();

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    loadTenantFromSession();
                }
                if (event === 'SIGNED_OUT') {
                    setCtx({ ...EMPTY_CTX, isLoading: false });
                    router.push('/login');
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
