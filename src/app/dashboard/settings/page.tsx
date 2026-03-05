'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    Upload,
    ImageIcon,
    Palette,
    Save,
    CheckCircle,
    Loader2,
    X,
    Briefcase,
    Search,
    Zap,
    Code,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant, TenantService } from '@/services/tenantService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './settings.module.css';

const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter — Modern Sans', preview: 'Inter, sans-serif' },
    { value: 'Outfit', label: 'Outfit — Geometric', preview: 'Outfit, sans-serif' },
    { value: 'Playfair Display', label: 'Playfair — Luxury Serif', preview: '"Playfair Display", serif' },
    { value: 'DM Sans', label: 'DM Sans — Clean', preview: '"DM Sans", sans-serif' },
];

type TabType = 'branding' | 'business' | 'seo' | 'advanced';

export default function SettingsPage() {
    const { tenantId, tenant: contextTenant } = useTenant();
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
            setLoading(true);

            // Try context first
            if (contextTenant) {
                setTenant(contextTenant);
                setLogoPreview(contextTenant.logo_url || null);
                setLoading(false);
                return;
            }

            // Fallback for demo mode
            if (!isSupabaseConfigured || !tenantId) {
                const demoData = await TenantService.getTenantBySubdomain('my-store');
                if (demoData) {
                    setTenant(demoData);
                    setLogoPreview(demoData.logo_url || null);
                }
                setLoading(false);
                return;
            }

            try {
                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', tenantId)
                    .single();

                if (tenantData) {
                    const normalized = {
                        ...tenantData,
                        branding_config: tenantData.branding_config || {
                            primaryColor: '#0A7B6C',
                            accentColor: '#F5A623',
                            fontFamily: 'Outfit',
                            glassLevel: 'high',
                            borderRadius: '12px',
                        },
                        business_config: tenantData.business_config || {},
                        seo_config: tenantData.seo_config || {},
                        advanced_config: tenantData.advanced_config || {}
                    };
                    setTenant(normalized);
                    setLogoPreview(tenantData.logo_url || null);
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, [tenantId, contextTenant]);

    const updateConfig = (key: keyof Tenant, value: any) => {
        if (!tenant) return;
        setTenant({ ...tenant, [key]: value });
    };

    const updateSubConfig = (block: 'branding_config' | 'business_config' | 'seo_config' | 'advanced_config', field: string, value: any) => {
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
            } else {
                // Demo save simulation
                await new Promise(r => setTimeout(r, 1000));
            }

            showToast('Brand configuration published globally! 🚀', 'success');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            showToast('Configuration failed to synchronize.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin text-primary mb-4">
                <ShieldCheck size={40} />
            </div>
            <p className="text-muted font-bold tracking-widest uppercase text-xs">Accessing Platform Core...</p>
        </div>
    );

    if (!tenant) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <p className="text-error font-bold">System Context Unavailable</p>
                <button className="btn btn-ghost mt-4" onClick={() => window.location.reload()}>Retry Initialization</button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Brand Customization</h1>
                    <p className={styles.subtitle}>Define your institutional identity and visual language across the global network.</p>
                </div>
                <div className={styles.aiBadge}>
                    <Sparkles size={14} />
                    Identity Engine Active
                </div>
            </div>

            <div className={styles.layout}>
                {/* ── Tabs Sidebar ── */}
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'branding' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Palette size={18} /> Visual Identity
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'business' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        <Briefcase size={18} /> Business Logic
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'seo' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={18} /> Global SEO
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'advanced' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <Zap size={18} /> Integrations
                    </button>
                </aside>

                {/* ── Settings Content ── */}
                <main className={styles.settingsArea}>
                    {activeTab === 'branding' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Theme & Appearance</h3>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label>Business Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={tenant.name || ''}
                                        onChange={(e) => updateConfig('name', e.target.value)}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Primary Brand Color</label>
                                    <div className={styles.colorControl}>
                                        <input
                                            type="color"
                                            className={styles.colorCircle}
                                            value={tenant.branding_config?.primaryColor || '#0A7B6C'}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className={styles.hexInput}
                                            value={tenant.branding_config?.primaryColor || '#0A7B6C'}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label>Visual Typography</label>
                                    <select
                                        className={styles.select}
                                        value={tenant.branding_config?.fontFamily || 'Outfit'}
                                        onChange={(e) => updateSubConfig('branding_config', 'fontFamily', e.target.value)}
                                    >
                                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Border Aesthetics</label>
                                    <select
                                        className={styles.select}
                                        value={tenant.branding_config?.borderRadius || '12px'}
                                        onChange={(e) => updateSubConfig('branding_config', 'borderRadius', e.target.value)}
                                    >
                                        <option value="0px">Sharp (Institutional)</option>
                                        <option value="8px">Medium (Modern)</option>
                                        <option value="12px">Rounded (Premium)</option>
                                        <option value="24px">Organic (Soft)</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.logoDropzone} onClick={() => fileInputRef.current?.click()}>
                                {logoPreview ? (
                                    <div className={styles.previewContainer}>
                                        <Image src={logoPreview} alt="Logo" width={120} height={120} unoptimized style={{ objectFit: 'contain' }} />
                                        <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); setLogoPreview(null); setLogoFile(null); }}><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="text-muted" />
                                        <div className="mt-2 font-bold text-sm">Upload High-Fidelity Logo</div>
                                        <p className="text-xs text-muted">WebP, PNG or SVG recommended</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleLogoSelect} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Business Intelligence Context</h3>
                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup} style={{ flex: '1.5' }}>
                                    <label>Subdomain Address</label>
                                    <div className={styles.readonlyInput}>{tenant.subdomain || 'my-store'}.solo.sme</div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Support Phone</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={tenant.business_config?.phone || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Corporate Headquarters Address</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={3}
                                    value={tenant.business_config?.address || ''}
                                    onChange={(e) => updateSubConfig('business_config', 'address', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionHeading}>Search & Social Orchestration</h3>
                            <div className={styles.fieldGroup}>
                                <label>Meta Title Override</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder={tenant.name || 'Store Name'}
                                    value={tenant.seo_config?.metaTitle || ''}
                                    onChange={(e) => updateSubConfig('seo_config', 'metaTitle', e.target.value)}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Meta Description</label>
                                <textarea
                                    className={styles.textarea}
                                    rows={4}
                                    value={tenant.seo_config?.metaDescription || ''}
                                    onChange={(e) => updateSubConfig('seo_config', 'metaDescription', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className={styles.section} style={{ background: 'var(--color-ink)', color: '#fff' }}>
                            <h3 className={styles.sectionHeading} style={{ color: 'var(--color-accent)' }}>Growth Infrastructure</h3>
                            <p className="text-xs opacity-60 mb-6">Connect your favorite tools to scale your business operations.</p>
                            <div className={styles.fieldRow}>
                                <div className={styles.fieldGroup}>
                                    <label style={{ color: '#fff' }}>G4 Analytics</label>
                                    <input
                                        type="text"
                                        className={styles.darkInput}
                                        placeholder="G-XXXXXXXXXX"
                                        value={tenant.advanced_config?.googleAnalyticsId || ''}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label style={{ color: '#fff' }}>Meta Pixel</label>
                                    <input
                                        type="text"
                                        className={styles.darkInput}
                                        placeholder="Pixel ID"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* ── Live Preview Engine ── */}
                <aside className={styles.previewArea}>
                    <div className={styles.previewContainer}>
                        <div className={styles.previewHeader}>
                            <Globe size={12} /> Live Brand Preview
                        </div>
                        <div className={styles.iphoneFrame}>
                            <div className={styles.storePreview} style={{
                                fontFamily: tenant.branding_config?.fontFamily || 'Outfit',
                                '--preview-primary': tenant.branding_config?.primaryColor || '#0A7B6C'
                            } as any}>
                                <div className={styles.previewNavbar}>
                                    <div style={{ fontWeight: 800 }}>
                                        {logoPreview ? 'BRAND' : tenant.name}
                                    </div>
                                    <div className={styles.previewCart} />
                                </div>
                                <div className={styles.previewHero}>
                                    <div className={styles.heroBadge}>NEW ARRIVAL</div>
                                    <h4 className={styles.heroTitle}>World-Class Standard</h4>
                                    <button className={styles.heroCta}>Explore Now</button>
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

            {/* ── Persistent Actions ── */}
            <div className={styles.footer}>
                <div className={styles.footerContent}>
                    {saved && (
                        <div className={styles.saveStatus}>
                            <CheckCircle size={14} /> Synchronized
                        </div>
                    )}
                    <div style={{ flex: 1 }} />
                    <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>Discard</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Synchronizing...' : 'Apply Globally'}
                    </button>
                </div>
            </div>
        </div>
    );
}
