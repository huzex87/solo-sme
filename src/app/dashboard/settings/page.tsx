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
    Globe,
    MessageCircle,
    Copy,
    CheckCircle2,
    ExternalLink,
    Smartphone
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

type TabType = 'branding' | 'business' | 'seo' | 'advanced' | 'whatsapp';

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
            if (!tenantId) {
                // If no tenantId is available yet, don't stop loading unless we're sure
                return;
            }

            try {
                setLoading(true);
                // Try to get detailed tenant from DB
                const { data: tenantData, error } = await supabase
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
                <div className={styles.aiBadge} style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    <Sparkles size={14} />
                    Verified Merchant
                </div>
            </div>

            <div className={styles.layout}>
                <aside className={styles.sidebar}>
                    <button
                        className={`${styles.tabBtn} ${styles.tabBtnBranding} ${activeTab === 'branding' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Palette size={18} /> Brand Identity
                    </button>
                    <button
                        className={`${styles.tabBtn} ${styles.tabBtnBusiness} ${activeTab === 'business' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('business')}
                    >
                        <Briefcase size={18} /> Localization
                    </button>
                    <button
                        className={`${styles.tabBtn} ${styles.tabBtnSeo} ${activeTab === 'seo' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={18} /> Search (SEO)
                    </button>
                    <button
                        className={`${styles.tabBtn} ${styles.tabBtnAdvanced} ${activeTab === 'advanced' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        <Zap size={18} /> Advanced
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'whatsapp' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('whatsapp')}
                        style={activeTab === 'whatsapp' ? {} : {}}
                    >
                        <MessageCircle size={18} /> WhatsApp AI
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

                    {activeTab === 'whatsapp' && (
                        <WhatsAppSettingsPanel tenant={tenant} />
                    )}
                </main>

                <aside className={styles.previewArea}>
                    <div className={styles.previewSidebar} style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)' }}>
                        <div className={styles.previewHeader}>
                            <Globe size={12} /> Mobile Preview
                        </div>
                        <div className={styles.iphoneFrame} style={{ borderColor: 'var(--ink)', background: 'var(--glass-bg)' }}>
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

/* ─────────────────────────────────────────
   WhatsApp Settings Panel — inline component
   ───────────────────────────────────────── */
function WhatsAppSettingsPanel({ tenant }: { tenant: Tenant }) {
    const [copied, setCopied] = useState(false);
    const linkCode = (tenant as any).whatsapp_link_code || '—';
    const enabled  = (tenant as any).whatsapp_enabled || false;
    const SOLO_WA_NUMBER = '+234 XXX XXX XXXX'; // Replace with real number after onboarding

    const copy = () => {
        navigator.clipboard.writeText(linkCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const STEPS = [
        {
            num: '1',
            title: 'Save our number',
            body: `Save ${SOLO_WA_NUMBER} as "SOLO Business" in your contacts.`,
        },
        {
            num: '2',
            title: 'Send your code',
            body: `Send the message: "Link ${linkCode}" to that number on WhatsApp.`,
        },
        {
            num: '3',
            title: 'Enter the OTP',
            body: 'You will receive a 6-digit code on WhatsApp. Reply with that code to complete linking.',
        },
        {
            num: '4',
            title: "You're live!",
            body: 'Say "Menu" to see everything you can do via WhatsApp.',
        },
    ];

    const COMMANDS = [
        { cmd: 'Record sale',      desc: 'Log any transaction instantly' },
        { cmd: 'Check stock',      desc: 'View inventory levels' },
        { cmd: 'Daily summary',    desc: 'Get today\'s revenue & orders' },
        { cmd: 'Send promo',       desc: 'Broadcast an offer to customers' },
        { cmd: 'Business advice',  desc: 'Ask your AI business coach' },
        { cmd: 'Check debts',      desc: 'See who owes you money' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'var(--ink)', borderRadius: 'var(--rl)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,121,140,.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, position: 'relative' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageCircle size={20} color="#fff" fill="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-.02em' }}>WhatsApp AI Command Layer</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>Manage your entire business from WhatsApp</div>
                    </div>
                    <div style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, background: enabled ? 'rgba(37,211,102,.15)' : 'rgba(255,255,255,.06)', border: `1px solid ${enabled ? 'rgba(37,211,102,.3)' : 'rgba(255,255,255,.1)'}`, fontSize: 11, fontWeight: 800, color: enabled ? '#25D366' : 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                        {enabled ? '● Active' : '○ Not linked'}
                    </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, position: 'relative' }}>
                    Once linked, you can record sales, check stock, send promos, view reports, and get AI business advice — all by sending simple WhatsApp messages.
                </p>
            </div>

            {/* Link code card */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '20px 24px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Your Link Code</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, padding: '14px 20px', background: 'var(--surface-2)', border: '2px dashed var(--border-md)', borderRadius: 'var(--r)', fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '.12em', textAlign: 'center' }}>
                        {linkCode}
                    </div>
                    <button onClick={copy} style={{ padding: '14px 20px', background: copied ? 'var(--success-lt)' : 'var(--primary-lt)', border: `1px solid ${copied ? 'rgba(10,140,79,.2)' : 'var(--primary-md)'}`, borderRadius: 'var(--r)', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, transition: 'all .2s', whiteSpace: 'nowrap' }}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, fontWeight: 500 }}>
                    This code is unique to your account. Keep it private — anyone with this code can link their WhatsApp to your store.
                </p>
            </div>

            {/* Setup steps */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '20px 24px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>How to link your WhatsApp</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {STEPS.map((s, i) => (
                        <div key={s.num} style={{ display: 'flex', gap: 16, paddingBottom: i < STEPS.length - 1 ? 20 : 0, position: 'relative' }}>
                            {i < STEPS.length - 1 && <div style={{ position: 'absolute', left: 16, top: 32, width: 1, height: 'calc(100% - 12px)', background: 'var(--border)' }} />}
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, flexShrink: 0, position: 'relative', zIndex: 1 }}>{s.num}</div>
                            <div style={{ paddingTop: 4 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{s.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, fontWeight: 500 }}>{s.body}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* What you can do */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '20px 24px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>Commands you can use</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {COMMANDS.map(c => (
                        <div key={c.cmd} style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--primary-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Smartphone size={13} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{c.cmd}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{c.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Open WhatsApp */}
            <a
                href={`https://wa.me/${SOLO_WA_NUMBER.replace(/\D/g, '')}?text=Link+${linkCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', background: '#25D366', color: '#fff', borderRadius: 'var(--rl)', fontWeight: 800, fontSize: 14, textDecoration: 'none', transition: 'all .2s', boxShadow: '0 4px 16px rgba(37,211,102,.3)' }}
            >
                <MessageCircle size={18} fill="#fff" />
                Open WhatsApp to Link Now
                <ExternalLink size={14} style={{ opacity: .7 }} />
            </a>
        </div>
    );
}
