'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Image as ImageIcon, Type, Palette, Layout, Eye, Save, CheckCircle, Loader2, Globe, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

export default function SettingsPage() {
    // General
    const [storeName, setStoreName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [customDomain, setCustomDomain] = useState('');
    const [storeDescription, setStoreDescription] = useState('');

    // Branding
    const [primaryColor, setPrimaryColor] = useState('#6366f1');
    const [accentColor, setAccentColor] = useState('#14b8a6');
    const [fontFamily, setFontFamily] = useState('Inter');

    // Logo
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hero Customization
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroCtaText, setHeroCtaText] = useState('Explore Collection');

    // Layout
    const [layoutStyle, setLayoutStyle] = useState<'grid' | 'list' | 'masonry'>('grid');

    // UI State
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    // Load existing settings
    useEffect(() => {
        async function loadSettings() {
            if (!isSupabaseConfigured) {
                setStoreName('Demo Boutique');
                setSubdomain('demo-boutique');
                setHeroTitle('Welcome to Demo Boutique');
                setHeroSubtitle('Quality products, great prices.');
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) return;
                setTenantId(profile.tenant_id);

                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('id', profile.tenant_id)
                    .single();

                if (tenant) {
                    setStoreName(tenant.name || '');
                    setSubdomain(tenant.subdomain || '');
                    setPrimaryColor(tenant.brand_color || '#6366f1');
                    setAccentColor(tenant.accent_color || '#14b8a6');
                    setFontFamily(tenant.font_family || 'Inter');
                    setHeroTitle(tenant.hero_title || '');
                    setHeroSubtitle(tenant.hero_subtitle || '');
                    setHeroCtaText(tenant.hero_cta_text || 'Explore Collection');
                    setLayoutStyle(tenant.layout_style || 'grid');
                    setStoreDescription(tenant.store_description || '');
                    if (tenant.logo_url || tenant.logo_file_path) {
                        setLogoPreview(tenant.logo_url || tenant.logo_file_path);
                    }
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        }
        loadSettings();
    }, []);

    // Logo upload handler
    const handleLogoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, SVG, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Logo must be under 5MB');
            return;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    }, []);

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Save all settings
    const handleSave = async () => {
        setSaving(true);

        try {
            let logoPath = logoPreview;

            // Upload logo to Supabase Storage if new file selected
            if (logoFile && isSupabaseConfigured && tenantId) {
                setIsUploadingLogo(true);
                const ext = logoFile.name.split('.').pop();
                const filePath = `${tenantId}/logo.${ext}`;

                const { error: uploadError } = await supabase.storage
                    .from('store-assets')
                    .upload(filePath, logoFile, { upsert: true });

                if (uploadError) {
                    console.error('Logo upload error:', uploadError);
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('store-assets')
                        .getPublicUrl(filePath);
                    logoPath = publicUrl;
                }
                setIsUploadingLogo(false);
            }

            // Update tenant in Supabase
            if (isSupabaseConfigured && tenantId) {
                const { error: updateError } = await supabase
                    .from('tenants')
                    .update({
                        name: storeName,
                        brand_color: primaryColor,
                        accent_color: accentColor,
                        font_family: fontFamily,
                        hero_title: heroTitle,
                        hero_subtitle: heroSubtitle,
                        hero_cta_text: heroCtaText,
                        layout_style: layoutStyle,
                        store_description: storeDescription,
                        logo_url: logoPath,
                        logo_file_path: logoPath,
                    })
                    .eq('id', tenantId);

                if (updateError) {
                    console.error('Settings save error:', updateError);
                    alert('Failed to save settings. Please try again.');
                    setSaving(false);
                    return;
                }
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Save error:', err);
            alert('An unexpected error occurred.');
        } finally {
            setSaving(false);
        }
    };

    const previewFont = FONT_OPTIONS.find(f => f.value === fontFamily)?.preview || 'Inter, sans-serif';

    return (
        <>
            <div className={styles.header}>
                <h1 className={styles.title}>Store Settings</h1>
                <p className={styles.subtitle}>Customize every aspect of your storefront</p>
            </div>

            <div className={styles.settingsGrid}>
                {/* ── General Info ── */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>
                        <Globe size={18} /> General Information
                    </h3>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="storeName">Store Name</label>
                        <input
                            id="storeName"
                            type="text"
                            className="input-field"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="subdomain">Store URL</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="subdomain"
                                type="text"
                                className="input-field"
                                value={subdomain}
                                readOnly
                                style={{ paddingRight: '7rem', opacity: 0.7 }}
                            />
                            <span style={{
                                position: 'absolute', right: '1rem', top: '50%',
                                transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-xs)', pointerEvents: 'none',
                            }}>
                                .solo.app
                            </span>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="customDomain">Custom Domain (Optional)</label>
                        <input
                            id="customDomain"
                            type="text"
                            className="input-field"
                            placeholder="shop.yourbrand.com"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                        />
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px' }}>
                            Point your CNAME record to cname.solo.app
                        </p>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="storeDesc">Store Description</label>
                        <textarea
                            id="storeDesc"
                            className="input-field"
                            rows={3}
                            placeholder="Tell customers what makes your store special..."
                            value={storeDescription}
                            onChange={(e) => setStoreDescription(e.target.value)}
                            style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>
                </div>

                {/* ── Logo Upload ── */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>
                        <ImageIcon size={18} /> Store Logo
                    </h3>

                    <div className={styles.logoUploadArea}>
                        {logoPreview ? (
                            <div className={styles.logoPreviewWrap}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoPreview} alt="Store logo" className={styles.logoImage} />
                                <button className={styles.removeLogoBtn} onClick={removeLogo} title="Remove logo">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={styles.logoDropzone}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={32} />
                                <p><strong>Click to upload</strong> your logo</p>
                                <span>PNG, JPG, SVG, or WebP — Max 5MB</span>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            onChange={handleLogoSelect}
                            style={{ display: 'none' }}
                        />
                        {logoPreview && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ marginTop: 'var(--space-md)', width: '100%' }}
                            >
                                Replace Logo
                            </button>
                        )}
                        {isUploadingLogo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--accent-primary)' }}>
                                <Loader2 size={14} className="animate-spin" /> Uploading...
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Colors & Typography ── */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>
                        <Palette size={18} /> Colors & Typography
                    </h3>

                    <div className={styles.colorRow}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="input-label">Primary Color</label>
                            <div className={styles.colorPicker}>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                            <label className="input-label">Accent Color</label>
                            <div className={styles.colorPicker}>
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    className={styles.colorInput}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={accentColor}
                                    onChange={(e) => setAccentColor(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                        <label className="input-label">
                            <Type size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Font Family
                        </label>
                        <select
                            className="input-field"
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                        >
                            {FONT_OPTIONS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Hero Section ── */}
                <div className={`card ${styles.section}`}>
                    <h3 className={styles.sectionTitle}>
                        <Eye size={18} /> Hero Section
                    </h3>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="heroTitle">Hero Headline</label>
                        <input
                            id="heroTitle"
                            type="text"
                            className="input-field"
                            placeholder="Welcome to Our Store"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="heroSub">Hero Subtitle</label>
                        <textarea
                            id="heroSub"
                            className="input-field"
                            rows={2}
                            placeholder="Quality products, great prices..."
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label" htmlFor="heroCta">CTA Button Text</label>
                        <input
                            id="heroCta"
                            type="text"
                            className="input-field"
                            value={heroCtaText}
                            onChange={(e) => setHeroCtaText(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <Layout size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Product Layout
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(['grid', 'list', 'masonry'] as const).map(layout => (
                                <button
                                    key={layout}
                                    className={`btn ${layoutStyle === layout ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setLayoutStyle(layout)}
                                    style={{ flex: 1, textTransform: 'capitalize' }}
                                >
                                    {layout}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Live Preview ── */}
            <div className={styles.preview} style={{ '--preview-primary': primaryColor, '--preview-accent': accentColor } as React.CSSProperties}>
                <h4 className={styles.previewTitle}>Live Preview</h4>
                <div className={styles.previewCard} style={{ fontFamily: previewFont }}>
                    <div className={styles.previewHeader}>
                        <div style={{ fontWeight: 700, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {logoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logoPreview} alt="Logo" style={{ height: '24px' }} />
                            ) : (storeName || 'Your Store')}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '10px' }}>
                            <span>Shop</span>
                            <span>Cart</span>
                        </div>
                    </div>
                    <div className={styles.previewHero}>
                        <span style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                        }}>
                            {heroTitle || `Welcome to ${storeName || 'Your Store'}`}
                        </span>
                        {heroSubtitle && (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '8px' }}>
                                {heroSubtitle}
                            </p>
                        )}
                        <button
                            style={{
                                marginTop: '12px',
                                padding: '6px 20px',
                                background: primaryColor,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'default',
                            }}
                        >
                            {heroCtaText}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                {saved && (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Settings saved
                    </span>
                )}
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                        <><Save size={16} /> Save Changes</>
                    )}
                </button>
            </div>
        </>
    );
}
