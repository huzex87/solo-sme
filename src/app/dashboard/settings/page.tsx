'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    ImageIcon,
    Palette,
    Save,
    CheckCircle,
    Loader2,
    X,
    Briefcase,
    Search,
    Zap,
    Sparkles,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant, TenantService } from '@/services/tenantService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/shared/EmptyState';
import styles from './settings.module.css';

const FONT_OPTIONS = [
    { value: 'Outfit', label: 'Outfit — Premium Geometric', preview: 'var(--font-outfit), sans-serif' },
    { value: 'Inter', label: 'Inter — Clean Sans', preview: 'Inter, sans-serif' },
    { value: 'DM Mono', label: 'DM Mono — Technical', preview: 'var(--font-dm-mono), monospace' },
];

type TabType = 'branding' | 'business' | 'seo' | 'advanced';

export default function SettingsPage() {
    const { tenantId } = useTenant();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<TabType>('branding');
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Logo State
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function loadSettings() {
            if (!tenantId) {
                // If no tenantId is available yet, don't stop loading unless we're sure
                return;
            }

            try {
                setLoading(true);
                // Try to get detailed tenant from DB
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', tenantId)
                    .single();

                if (tenantData) {
                    const normalized = {
                        ...tenantData,
                        branding_config: tenantData.branding_config || {
                            primaryColor: '#00798C',
                            accentColor: '#EDAE49',
                            fontFamily: 'Outfit',
                            borderRadius: '12px',
                        },
                        business_config: tenantData.business_config || {},
                        seo_config: tenantData.seo_config || {},
                        advanced_config: tenantData.advanced_config || {}
                    };
                    setTenant(normalized);
                    setLogoPreview(tenantData.logo_url || null);
                } else if (!isSupabaseConfigured) {
                    // Fallback for demo/dev
                    const demoData = await TenantService.getTenantBySubdomain('my-store');
                    if (demoData) {
                        setTenant(demoData);
                        setLogoPreview(demoData.logo_url || null);
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, [tenantId]);

    const updateConfig = (key: keyof Tenant, value: unknown) => {
        if (!tenant) return;
        setTenant({ ...tenant, [key]: value });
    };

    const updateSubConfig = (block: 'branding_config' | 'business_config' | 'seo_config' | 'advanced_config', field: string, value: unknown) => {
        if (!tenant) return;
        setTenant({
            ...tenant,
            [block]: {
                ...tenant[block],
                [field]: value
            }
        });
    };

    const handleLogoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const handleSave = async () => {
        if (!tenant) return;
        setSaving(true);
        try {
            if (isSupabaseConfigured && tenant.id !== 'demo') {
                let finalLogoUrl = tenant.logo_url;

                if (logoFile) {
                    const ext = logoFile.name.split('.').pop();
                    const filePath = `${tenant.id}/logo_${Date.now()}.${ext}`;
                    const { error: uploadError } = await supabase.storage
                        .from('store-assets')
                        .upload(filePath, logoFile, { upsert: true });

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('store-assets')
                            .getPublicUrl(filePath);
                        finalLogoUrl = publicUrl;
                    }
                }

                const { error } = await supabase
                    .from('tenants')
                    .update({
                        name: tenant.name,
                        custom_domain: tenant.custom_domain,
                        branding_config: tenant.branding_config,
                        business_config: tenant.business_config,
                        seo_config: tenant.seo_config,
                        advanced_config: tenant.advanced_config,
                        logo_url: finalLogoUrl
                    })
                    .eq('id', tenant.id);

                if (error) throw error;
            }

            showToast('Settings successfully updated!', 'success');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            showToast('Failed to save settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-border rounded-md mb-2"></div>
                    <div className="h-4 w-96 bg-border/50 rounded-md"></div>
                </div>
            </div>
            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-full bg-border/30 rounded-lg mb-2 animate-pulse"></div>
                    ))}
                </aside>
                <main className={styles.settingsArea}>
                    <div className="section animate-pulse">
                        <div className="h-6 w-32 bg-border rounded-md mb-6"></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="h-20 bg-border/20 rounded-xl"></div>
                            <div className="h-20 bg-border/20 rounded-xl"></div>
                        </div>
                        <div className="h-40 bg-border/10 rounded-2xl w-full"></div>
                    </div>
                </main>
            </div>
        </div>
    );

    if (!tenant) return (
        <div className="py-24">
            <EmptyState
                icon={ShieldCheck}
                title="Business Configuration Not Found"
                description="We couldn't retrieve your business profile. This usually happens if the session expired or the store ID is invalid."
                action={{
                    label: "Re-authenticate",
                    onClick: () => window.location.href = '/login'
                }}
            />
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Store Settings</h1>
                    <p className={styles.subtitle}>Manage your brand identity, business localization, and search engine presence.</p>
                </div>
                <div className="bg-primary-light text-primary px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                    <Sparkles size={14} />
                    Verified Merchant
                </div>
            </div>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'branding' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Palette size={18} /> Brand Identity
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'business' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        <Briefcase size={18} /> Localization
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'seo' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={18} /> Search (SEO)
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'advanced' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <Zap size={18} /> Advanced
                    </button>
                </aside>

                <main className={styles.settingsArea}>
                    {activeTab === 'branding' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Visual Identity</h3>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label>Store Display Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={tenant.name || ''}
                                        onChange={(e) => updateConfig('name', e.target.value)}
                                        placeholder="Enter business name"
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Primary Theme Color</label>
                                    <div className={styles.colorControl}>
                                        <input
                                            type="color"
                                            className={styles.colorCircle}
                                            value={tenant.branding_config?.primaryColor || '#00798C'}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className={styles.hexInput}
                                            value={tenant.branding_config?.primaryColor || '#00798C'}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label>Brand Typography</label>
                                    <select
                                        className={styles.select}
                                        value={tenant.branding_config?.fontFamily || 'Outfit'}
                                        onChange={(e) => updateSubConfig('branding_config', 'fontFamily', e.target.value)}
                                    >
                                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Corner Radius</label>
                                    <select
                                        className={styles.select}
                                        value={tenant.branding_config?.borderRadius || '12px'}
                                        onChange={(e) => updateSubConfig('branding_config', 'borderRadius', e.target.value)}
                                    >
                                        <option value="0px">Sharp</option>
                                        <option value="8px">Soft</option>
                                        <option value="12px">Rounded (Standard)</option>
                                        <option value="20px">Pill</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.logoDropzone} onClick={() => fileInputRef.current?.click()}>
                                {logoPreview ? (
                                    <div className={styles.previewContainer}>
                                        <Image src={logoPreview} alt="Logo" width={140} height={140} unoptimized style={{ objectFit: 'contain' }} />
                                        <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="text-muted mb-2" />
                                        <div className="font-bold text-sm text-ink">Update Store Logo</div>
                                        <p className="text-xs text-muted">Transparent PNG, WebP or SVG</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleLogoSelect} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Business Localization</h3>
                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label>Customer Support Phone</label>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        placeholder="+234..."
                                        value={tenant.business_config?.phone || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'phone', e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Subdomain Address</label>
                                    <div className="bg-surface border border-border px-3 py-2 rounded-lg text-sm text-muted">
                                        {tenant.subdomain}.solo.sme
                                    </div>
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Business Address</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={3}
                                    placeholder="Enter physical shop address"
                                    value={tenant.business_config?.address || ''}
                                    onChange={(e) => updateSubConfig('business_config', 'address', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Search Engine Optimization</h3>
                            <div className={styles.fieldGroup}>
                                <label>Meta Title Override</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder={tenant.name || 'My Store'}
                                    value={tenant.seo_config?.metaTitle || ''}
                                    onChange={(e) => updateSubConfig('seo_config', 'metaTitle', e.target.value)}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Meta Description</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={4}
                                    placeholder="Briefly describe what you sell for search engines..."
                                    value={tenant.seo_config?.metaDescription || ''}
                                    onChange={(e) => updateSubConfig('seo_config', 'metaDescription', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>System Integrations</h3>
                            <div className="bg-ink text-white p-6 rounded-xl border border-primary/20">
                                <h4 className="text-accent font-bold mb-2">Google Analytics Integration</h4>
                                <p className="text-sm opacity-80 mb-6 font-light">Track visitors and customer behavior using your own GA4 property.</p>
                                <div className={styles.fieldGroup}>
                                    <label className="text-white opacity-90">Measurement ID (G-XXXXX)</label>
                                    <input
                                        type="text"
                                        className="bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white w-full"
                                        placeholder="G-XXXXXXXXXX"
                                        value={tenant.advanced_config?.googleAnalyticsId || ''}
                                        onChange={(e) => updateSubConfig('advanced_config', 'googleAnalyticsId', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <aside className={styles.previewArea}>
                    <div className={styles.previewSidebar}>
                        <div className={styles.previewHeader}>
                            <Globe size={12} /> Mobile Storefront Preview
                        </div>
                        <div className={styles.iphoneFrame}>
                            <div className={styles.storePreview} style={{
                                fontFamily: tenant.branding_config?.fontFamily || 'Outfit',
                                '--preview-primary': tenant.branding_config?.primaryColor || '#00798C'
                            } as React.CSSProperties}>
                                <div className={styles.previewNavbar}>
                                    <div style={{ fontWeight: 800 }}>{tenant.name}</div>
                                    <div className={styles.previewCart} />
                                </div>
                                <div className={styles.previewHero}>
                                    <div className={styles.heroBadge}>COLLECTION 2026</div>
                                    <h4 className={styles.heroTitle}>Premium Standards</h4>
                                    <button className={styles.heroCta}>Shop All</button>
                                </div>
                                <div className={styles.previewProducts}>
                                    <div className={styles.productMock} />
                                    <div className={styles.productMock} />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <div className={styles.footer}>
                <div className={styles.footerContent}>
                    {saved && (
                        <div className="flex items-center gap-2 text-success text-sm font-bold animate-pulse">
                            <CheckCircle size={14} /> Changes Synchronized
                        </div>
                    )}
                    <div className="flex-1" />
                    <button className="text-muted hover:text-ink font-semibold px-4" onClick={() => window.location.reload()}>Discard</button>
                    <button
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg hover:shadow-primary/20 active:scale-95"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Syncing...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
