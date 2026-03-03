'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
    Upload,
    ImageIcon,
    Type,
    Palette,
    Layout,
    Eye,
    Save,
    CheckCircle,
    Loader2,
    Globe,
    X,
    Briefcase,
    Search,
    Zap,
    Code,
    Smartphone,
    Monitor,
    MousePointer2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Tenant, TenantService } from '@/services/tenantService';
import styles from './settings.module.css';

const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter — Modern Sans', preview: 'Inter, sans-serif' },
    { value: 'Outfit', label: 'Outfit — Geometric', preview: 'Outfit, sans-serif' },
    { value: 'Playfair Display', label: 'Playfair — Luxury Serif', preview: '"Playfair Display", serif' },
    { value: 'DM Sans', label: 'DM Sans — Clean', preview: '"DM Sans", sans-serif' },
    { value: 'Space Grotesk', label: 'Space Grotesk — Techy', preview: '"Space Grotesk", sans-serif' },
    { value: 'Lora', label: 'Lora — Elegant Serif', preview: 'Lora, serif' },
    { value: 'Poppins', label: 'Poppins — Friendly', preview: 'Poppins, sans-serif' },
];

type TabType = 'branding' | 'business' | 'seo' | 'advanced';

export default function SettingsPage() {
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
            if (!isSupabaseConfigured) return;

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) return;

                const { data: tenantData } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                if (tenantData) {
                    // Normalize configurations if they are null
                    const normalized = {
                        ...tenantData,
                        branding_config: tenantData.branding_config || {
                            primaryColor: '#7c4dff',
                            accentColor: '#00e5ff',
                            fontFamily: 'Outfit',
                            glassLevel: 'high',
                            borderRadius: '12px',
                            theme: 'glass'
                        },
                        business_config: tenantData.business_config || {},
                        seo_config: tenantData.seo_config || {},
                        advanced_config: tenantData.advanced_config || {}
                    };
                    setTenant(normalized);
                    setLogoPreview(tenantData.logo_url);
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

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
            let finalLogoUrl = tenant.logo_url;

            if (logoFile && isSupabaseConfigured) {
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
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Initializing Configuration Engine...</div>;
    if (!tenant) return <div className="error">Tenant context not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Store Settings</h1>
                <p className={styles.subtitle}>Full control over your brand identity and business logic.</p>
            </div>

            <div className={styles.layout}>
                {/* ── Tabs Sidebar ── */}
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'branding' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Palette size={18} /> Branding & Theme
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'business' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        <Briefcase size={18} /> Business Info
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'seo' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={18} /> SEO & Discoverability
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'advanced' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <Code size={18} /> Advanced & Apps
                    </button>
                </aside>

                {/* ── Settings Content ── */}
                <main className={styles.settingsArea}>
                    {activeTab === 'branding' && (
                        <div className={`card ${styles.section}`}>
                            <h3 className={styles.sectionTitle}><Palette size={20} /> Visual Identity</h3>

                            <div className={styles.inputGrid}>
                                <div className="input-group">
                                    <label className="input-label">Store Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.name}
                                        onChange={(e) => updateConfig('name', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Custom Domain</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="shop.yourbrand.com"
                                        value={tenant.custom_domain || ''}
                                        onChange={(e) => updateConfig('custom_domain', e.target.value)}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Primary Color</label>
                                    <div className={styles.colorPicker}>
                                        <input
                                            type="color"
                                            className={styles.colorInput}
                                            value={tenant.branding_config.primaryColor}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={tenant.branding_config.primaryColor}
                                            onChange={(e) => updateSubConfig('branding_config', 'primaryColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Accent Color</label>
                                    <div className={styles.colorPicker}>
                                        <input
                                            type="color"
                                            className={styles.colorInput}
                                            value={tenant.branding_config.accentColor}
                                            onChange={(e) => updateSubConfig('branding_config', 'accentColor', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={tenant.branding_config.accentColor}
                                            onChange={(e) => updateSubConfig('branding_config', 'accentColor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Typography</label>
                                    <select
                                        className="input-field"
                                        value={tenant.branding_config.fontFamily}
                                        onChange={(e) => updateSubConfig('branding_config', 'fontFamily', e.target.value)}
                                    >
                                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Glassmorphism Intensity</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['none', 'low', 'high'].map(level => (
                                            <button
                                                key={level}
                                                className={`btn btn-sm ${tenant.branding_config.glassLevel === level ? 'btn-primary' : 'btn-secondary'}`}
                                                style={{ flex: 1 }}
                                                onClick={() => updateSubConfig('branding_config', 'glassLevel', level)}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={`fullWidth ${styles.logoArea}`}>
                                    <label className="input-label">Store Logo</label>
                                    <div className={styles.logoUploadArea}>
                                        {logoPreview ? (
                                            <div className={styles.logoPreviewWrap}>
                                                <Image src={logoPreview} alt="Logo" width={160} height={160} unoptimized className={styles.logoImage} />
                                                <button className={styles.removeLogoBtn} onClick={() => { setLogoPreview(null); setLogoFile(null); }}><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <div className={styles.logoDropzone} onClick={() => fileInputRef.current?.click()}>
                                                <Upload size={24} />
                                                <span>Click to upload logo (PNG/SVG/WebP)</span>
                                            </div>
                                        )}
                                        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleLogoSelect} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className={`card ${styles.section}`}>
                            <h3 className={styles.sectionTitle}><Briefcase size={20} /> Operational Details</h3>
                            <div className={styles.inputGrid}>
                                <div className="input-group fullWidth">
                                    <label className="input-label">Business Address</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.business_config.address || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'address', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Support Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={tenant.business_config.email || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'email', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Support Phone</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.business_config.phone || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'phone', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Tax ID / RC Number</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.business_config.taxId || ''}
                                        onChange={(e) => updateSubConfig('business_config', 'taxId', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className={`card ${styles.section}`}>
                            <h3 className={styles.sectionTitle}><Search size={20} /> Global SEO</h3>
                            <div className={styles.inputGrid}>
                                <div className="input-group fullWidth">
                                    <label className="input-label">Meta Title Override</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder={tenant.name || 'Store Name'}
                                        value={tenant.seo_config.metaTitle || ''}
                                        onChange={(e) => updateSubConfig('seo_config', 'metaTitle', e.target.value)}
                                    />
                                </div>
                                <div className="input-group fullWidth">
                                    <label className="input-label">Meta Description</label>
                                    <textarea
                                        className="input-field"
                                        rows={3}
                                        value={tenant.seo_config.metaDescription || ''}
                                        onChange={(e) => updateSubConfig('seo_config', 'metaDescription', e.target.value)}
                                    />
                                </div>
                                <div className="input-group fullWidth">
                                    <label className="input-label">Social Sharing (OG Image) URL</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.seo_config.ogImage || ''}
                                        onChange={(e) => updateSubConfig('seo_config', 'ogImage', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className={`card ${styles.section}`}>
                            <h3 className={styles.sectionTitle}><Zap size={20} /> Growth Integrations</h3>
                            <div className={styles.inputGrid}>
                                <div className="input-group">
                                    <label className="input-label">Google Analytics G4 ID</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="G-XXXXXXXXXX"
                                        value={tenant.advanced_config.googleAnalyticsId || ''}
                                        onChange={(e) => updateSubConfig('advanced_config', 'googleAnalyticsId', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Meta Pixel ID</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={tenant.advanced_config.metaPixelId || ''}
                                        onChange={(e) => updateSubConfig('advanced_config', 'metaPixelId', e.target.value)}
                                    />
                                </div>
                                <div className="input-group fullWidth">
                                    <label className="input-label">Custom Head Scripts (Advanced)</label>
                                    <textarea
                                        className="input-field"
                                        rows={5}
                                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                        placeholder="<!-- Enter custom HTML/JS here -->"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* ── Live Preview Engine ── */}
                <aside className={styles.previewArea}>
                    <span className={styles.previewLabel}>Real-time Preview</span>
                    <div className={styles.previewFrame}>
                        {/* Mock Storefront Interface based on current branding */}
                        <div style={{
                            padding: '24px',
                            background: tenant.branding_config.theme === 'dark' ? '#0a0a0a' : '#ffffff',
                            color: tenant.branding_config.theme === 'dark' ? '#fff' : '#000',
                            height: '100%',
                            fontFamily: tenant.branding_config.fontFamily,
                            transition: 'all 0.3s ease'
                        }}>
                            <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '18px' }}>
                                    {logoPreview ? (
                                        <Image src={logoPreview} alt="Logo" width={32} height={32} unoptimized style={{ height: '32px', width: 'auto' }} />
                                    ) : tenant.name}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                                    <span style={{ opacity: 0.6 }}>Store</span>
                                    <span style={{ opacity: 0.6 }}>Cart</span>
                                </div>
                            </nav>

                            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                                <h1 style={{
                                    fontSize: '32px',
                                    fontWeight: 900,
                                    marginBottom: '16px',
                                    color: tenant.branding_config.primaryColor
                                }}>
                                    Modern. Personal. Elegant.
                                </h1>
                                <p style={{ opacity: 0.7, fontSize: '14px', marginBottom: '24px' }}>
                                    Experience the future of boutique shopping.
                                </p>
                                <button style={{
                                    background: tenant.branding_config.primaryColor,
                                    color: '#fff',
                                    padding: '12px 32px',
                                    borderRadius: tenant.branding_config.borderRadius || '8px',
                                    border: 'none',
                                    fontWeight: 700,
                                    boxShadow: `0 8px 24px ${tenant.branding_config.primaryColor}44`
                                }}>
                                    Shop Collection
                                </button>
                            </div>

                            <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[1, 2].map(i => (
                                    <div key={i} style={{
                                        aspectRatio: '1',
                                        background: tenant.branding_config.glassLevel !== 'none' ? 'rgba(0,0,0,0.05)' : '#f5f5f5',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <ImageIcon size={24} opacity={0.2} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Persistent Actions ── */}
            <div className={styles.actions}>
                {saved && (
                    <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={14} /> Global changes applied
                    </div>
                )}
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>Discard</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}
