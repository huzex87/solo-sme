'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface TenantContextType {
    tenantId: string;
    tenantName: string;
    subdomain: string;
    userName: string;
    userRole: string;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
    tenantId: 't1',
    tenantName: 'Artisan Soul',
    subdomain: 'demo-boutique',
    userName: 'Demo Owner',
    userRole: 'owner',
    isLoading: true,
});

export function useTenant() {
    return useContext(TenantContext);
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const [ctx, setCtx] = useState<TenantContextType>({
        tenantId: 't1',
        tenantName: 'Artisan Soul',
        subdomain: 'demo-boutique',
        userName: 'Demo Owner',
        userRole: 'owner',
        isLoading: true,
    });

    useEffect(() => {
        async function loadTenantContext() {
            if (!isSupabaseConfigured) {
                setCtx(prev => ({ ...prev, isLoading: false }));
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setCtx(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                // Get profile → tenant_id
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id, full_name, role')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) {
                    setCtx(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                // Get tenant details
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('id, name, subdomain')
                    .eq('id', profile.tenant_id)
                    .single();

                if (tenant) {
                    setCtx({
                        tenantId: tenant.id,
                        tenantName: tenant.name,
                        subdomain: tenant.subdomain,
                        userName: profile.full_name,
                        userRole: profile.role,
                        isLoading: false,
                    });
                } else {
                    setCtx(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err) {
                console.error('Failed to load tenant context:', err);
                setCtx(prev => ({ ...prev, isLoading: false }));
            }
        }

        loadTenantContext();
    }, []);

    return (
        <TenantContext.Provider value={ctx}>
            {children}
        </TenantContext.Provider>
    );
}
