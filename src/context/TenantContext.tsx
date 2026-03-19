'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { useRouter, usePathname } from 'next/navigation';
import { ensureProfileAndTenantAction } from '@/app/actions/authActions';
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
                            ...(updates.subdomain !== undefined && { subdomain: updates.subdomain }),
                            ...(updates.name !== undefined && { tenantName: updates.name }),
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
                return;
            }

            // Start loading
            setCtx(prev => ({ ...prev, isLoading: true }));

            const supabase = createClient();
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    console.log('[TenantContext] No session found');
                    setCtx({ ...EMPTY_CTX, isLoading: false });
                    return;
                }

                // Inner function to fetch profile and tenant
                const fetchDetails = async () => {
                    // Get profile → tenant_id
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('tenant_id, full_name, role')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profileError) throw profileError;

                    if (!profile || !profile.tenant_id) {
                        console.warn('[TenantContext] Missing profile or tenant_id. Bootstrapping...');
                        const bootstrap = await ensureProfileAndTenantAction();

                        if (bootstrap.error) {
                            throw new Error(bootstrap.error);
                        }

                        // If bootstrap succeeded, it created/found the profile. Re-fetch details.
                        return null; // Signals retry
                    }

                    // Get tenant details
                    const { data: tenant, error: tenantError } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profile.tenant_id)
                        .single();

                    if (tenantError) throw tenantError;
                    return { profile, tenant };
                };

                let result = await fetchDetails();

                // One retry allowed if bootstrapping happened
                if (result === null) {
                    result = await fetchDetails();
                }

                if (!result) {
                    throw new Error("Could not load store context despite bootstrapping.");
                }

                const { profile, tenant } = result;

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
                            ...(updates.subdomain !== undefined && { subdomain: updates.subdomain }),
                            ...(updates.name !== undefined && { tenantName: updates.name }),
                            tenant: prev.tenant ? { ...prev.tenant, ...updates } : null
                        }));
                    }
                });
            } catch (err: any) {
                console.error('[TenantContext] Critical error loading tenant:', err);

                let detail = '';
                if (err?.message) detail = err.message;
                else if (err?.error_description) detail = err.error_description;
                else if (typeof err === 'string') detail = err;
                else detail = JSON.stringify(err);

                const message = detail || "Failed to load tenant configuration";

                setCtx(prev => ({
                    ...prev,
                    isLoading: false,
                    isAuthenticated: true,
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
