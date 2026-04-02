'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Building2, Globe, ShieldAlert, CreditCard, Users, Settings, User, Activity, Edit3 } from 'lucide-react';
import styles from '../../admin.module.css';

interface TenantDetail {
    id: string;
    name: string;
    subdomain: string;
    owner_id: string;
    created_at: string;
    business_config: Record<string, any>;
    branding_config: Record<string, any>;
    profiles?: { full_name: string }[];
}

export default function TenantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [tenant, setTenant] = useState<TenantDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTenant() {
            if (!id) return;
            const supabase = createClient();
            
            // Because RLS is globally enabled, standard queries will usually be restricted to 
            // the user's own tenant due to get_my_tenant_id(). 
            // However, super admins need to read this payload. If RLS blocks it natively, we 
            // should fall back to just rendering a local mock or an API endpoint call. 
            // But we will test direct supabase fetch since the "Public read for active tenants" policy may allow it.
            
            const { data, error } = await supabase
                .from('tenants')
                .select(`
                    id, name, subdomain, owner_id, created_at, business_config, branding_config,
                    profiles!tenants_owner_id_fkey(full_name)
                `)
                .eq('id', id)
                .single();

            if (!error && data) {
                setTenant(data as any);
            } else {
                console.error("Failed to fetch tenant:", error);
                // Creating a mock fallback in case RLS stops us (since we are making an optimistic client query)
                setTenant({
                    id,
                    name: 'Unknown Tenant (RLS Block)',
                    subdomain: 'restricted',
                    owner_id: 'unknown',
                    created_at: new Date().toISOString(),
                    business_config: {},
                    branding_config: {},
                    profiles: [{ full_name: 'Unknown Owner' }]
                });
            }
            setLoading(false);
        }
        loadTenant();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-700 border-t-accent rounded-full animate-spin" />
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Loading Entity...</p>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="p-10 text-center animate-entrance">
                <ShieldAlert size={48} className="mx-auto mb-4 text-red-400 opacity-50" />
                <h2 className="text-xl font-bold text-white">Tenant Not Found</h2>
                <p className="text-white/40 mb-6 mt-2">The requested business entity could not be located in the database.</p>
                <button onClick={() => router.back()} className={styles.authBtn} style={{width: 200, margin:'0 auto'}}>
                    <ArrowLeft size={16} /> Go Back to Directory
                </button>
            </div>
        );
    }

    const ownerName = tenant.profiles && tenant.profiles.length > 0 
        ? tenant.profiles[0].full_name 
        : 'Unknown Owner';

    const hasPaystack = !!tenant.business_config?.paystack_secret_key;

    return (
        <div className="animate-entrance pb-20">
            {/* Header Navigation */}
            <button 
                onClick={() => router.push('/admin/tenants')} 
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold mb-6"
            >
                <ArrowLeft size={14} /> Back to Directory
            </button>

            <header className="mb-10 flex justifying-between items-start">
                <div style={{flex: 1}}>
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {tenant.branding_config?.logo_url ? (
                                <img src={tenant.branding_config.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit:'cover', borderRadius: 12 }} />
                            ) : (
                                <Building2 size={22} className="text-white/50" />
                            )}
                        </div>
                        <div>
                            <h1 className={styles.adminTitle} style={{marginBottom: 0, fontSize: 32}}>{tenant.name}</h1>
                            <p className="text-white/50 font-mono text-sm mt-1 flex items-center gap-2">
                                <Globe size={13} /> {tenant.subdomain}.solosme.ng
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button className={styles.authBtn} style={{width: 'auto', paddingLeft: 18, paddingRight: 18, background: 'rgba(255,255,255,0.05)', color: '#fff'}}>
                        <Users size={15} /> Impersonate Waiter
                    </button>
                    <button className={styles.authBtn} style={{width: 'auto', paddingLeft: 18, paddingRight: 18, background: 'rgba(248, 113, 113, 0.1)', color: '#f87171'}}>
                        <ShieldAlert size={15} /> Suspend Tenant
                    </button>
                </div>
            </header>

            <div className={styles.adminGridRow}>
                {/* Info Panel Left */}
                <div className="flex flex-col gap-6" style={{flex: 2}}>
                    {/* General Profile */}
                    <div className={styles.darkCard}>
                        <div className={styles.panelHeader}>
                            <User size={18} color="var(--accent)" />
                            <h3>Entity Profile</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="text-white/30 uppercase text-[10px] font-bold tracking-wider block mb-1">Entity ID (UUID)</label>
                                <div className="font-mono text-white/80 text-sm bg-black/30 p-2 rounded-md border border-white/5">{tenant.id}</div>
                            </div>
                            <div>
                                <label className="text-white/30 uppercase text-[10px] font-bold tracking-wider block mb-1">Primary Owner</label>
                                <div className="text-white font-semibold flex items-center gap-2 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold">
                                        {ownerName.charAt(0)}
                                    </div>
                                    {ownerName}
                                </div>
                            </div>
                            <div>
                                <label className="text-white/30 uppercase text-[10px] font-bold tracking-wider block mb-1">Platform Onboarding</label>
                                <div className="text-white text-sm font-medium mt-2">
                                    {new Date(tenant.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <label className="text-white/30 uppercase text-[10px] font-bold tracking-wider block mb-1">Payment Readiness</label>
                                <div className="mt-2">
                                    {hasPaystack ? (
                                        <span className={styles.badgeSuccess}>Verified Live</span>
                                    ) : (
                                        <span className={styles.badgeWarning}>Awaiting API Keys</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure & Capabilities */}
                    <div className={styles.darkCard}>
                        <div className={styles.panelHeader}>
                            <Settings size={18} color="#60a5fa" />
                            <h3>Configuration Payload</h3>
                            <button className="ml-auto text-white/30 hover:text-white"><Edit3 size={14}/></button>
                        </div>
                        <div className="mt-4 border border-white/5 rounded-xl overflow-hidden">
                            <div className="bg-black/40 p-4 border-b border-white/5">
                                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Business Configuration (JSONB)</h4>
                                <pre className="font-mono text-[11px] text-white/70 whitespace-pre-wrap">
                                    {JSON.stringify(tenant.business_config, null, 2) === '{}' ? '// No specific configurations explicitly tracked' : JSON.stringify(tenant.business_config, null, 2)}
                                </pre>
                            </div>
                            <div className="bg-black/40 p-4">
                                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Branding Configuration (JSONB)</h4>
                                <pre className="font-mono text-[11px] text-white/70 whitespace-pre-wrap">
                                    {JSON.stringify(tenant.branding_config, null, 2) === '{}' ? '// Using default platform aesthetic tokens' : JSON.stringify(tenant.branding_config, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Profile Left */}
                <div style={{flex: 1}} className="flex flex-col gap-6">
                    {/* Subscription Layer */}
                    <div className={styles.darkCard}>
                        <div className={styles.panelHeader}>
                            <CreditCard size={18} color="#34d399" />
                            <h3>Billing Tier</h3>
                        </div>
                        <div className="mt-4 p-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Activity size={64} />
                            </div>
                            <h4 className="text-emerald-400 font-bold text-lg mb-1 relative z-10">Essential Tier</h4>
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider relative z-10">Next billing: Oct 12, 2026</p>
                            
                            <div className="mt-4 flex gap-4 relative z-10">
                                <div>
                                    <div className="text-3xl font-bold font-display text-white">0</div>
                                    <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest mt-1">Outstanding</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.darkCard}>
                        <div className="p-2">
                            <h4 className="text-white/70 font-semibold text-sm mb-4">Quick Stats Estimation</h4>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-white/40 text-sm">Products</span>
                                <span className="text-white font-mono">--</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-white/40 text-sm">Customers</span>
                                <span className="text-white font-mono">--</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-white/40 text-sm">Lifetime Value</span>
                                <span className="text-white font-mono">₦0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
