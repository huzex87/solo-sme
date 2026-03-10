'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Link from 'next/link';
import {
    Globe, Store, Bell, Shield, ChevronRight, Check, Copy,
    ExternalLink, MessageCircle, Zap, Upload, X, Camera,
    ArrowRight, Loader2,
} from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { StorageService } from '@/services/storageService';

/* ──────────────────────────────────────────────────────────────────────── */

type Section = 'store' | 'domain' | 'whatsapp' | 'notifications' | 'security';

const SECTIONS: { id: Section; label: string; icon: typeof Store; step: number }[] = [
    { id: 'store', label: 'Store Profile', icon: Store, step: 1 },
    { id: 'domain', label: 'Custom Domain', icon: Globe, step: 2 },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, step: 3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, step: 4 },
    { id: 'security', label: 'Security', icon: Shield, step: 5 },
];

/* ── Reusable Input ── */
function Field({
    label, placeholder, hint, value, onChange, disabled, type = 'text',
}: {
    label: string; placeholder?: string; hint?: string;
    value?: string; onChange?: (v: string) => void; disabled?: boolean; type?: string;
}) {
    return (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <input
                type={type}
                className="input-field"
                placeholder={placeholder}
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                style={{ fontSize: 13 }}
            />
            {hint && <p style={{ fontSize: 10, color: 'var(--ghost)', marginTop: 4 }}>{hint}</p>}
        </div>
    );
}

/* ── Toggle Switch ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <div
            onClick={onToggle}
            style={{
                width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                background: on ? 'var(--primary)' : 'var(--border)',
                position: 'relative', flexShrink: 0, transition: 'var(--transition-fast)',
            }}
        >
            <span style={{
                position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'var(--transition-fast)',
                ...(on ? { right: 2 } : { left: 2 }),
            }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function SettingsPage() {
    const { tenantId, tenantName, subdomain: existingSubdomain, userName, tenant } = useTenant();
    const [section, setSection] = useState<Section>('store');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const logoRef = useRef<HTMLInputElement>(null);

    // ── Form state loaded from Supabase ──
    const [storeName, setStoreName] = useState('');
    const [category, setCategory] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [storeSubdomain, setStoreSubdomain] = useState('');
    const [subdomainSuggestions, setSubdomainSuggestions] = useState<string[]>([]);
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');

    // ── Notifications toggles ──
    const [notifs, setNotifs] = useState({
        newOrder: true, whatsapp: true, lowStock: false, weeklyReport: false
    });

    // ── Security ──
    const [fullName, setFullName] = useState('');
    const [secEmail, setSecEmail] = useState('');

    // ── Load tenant data ──
    useEffect(() => {
        if (tenant) {
            setStoreName(tenant.name || '');
            setCategory(tenant.category || '');
            setPhone(tenant.phone || '');
            setEmail(tenant.email || '');
            setDescription(tenant.description || '');
            setStoreSubdomain(tenant.subdomain || '');
            setLogoUrl(tenant.logo_url || '');
        } else if (tenantName) {
            setStoreName(tenantName);
        }
        if (userName) setFullName(userName);
    }, [tenant, tenantName, userName]);

    // ── Generate simple subdomain suggestions ──
    const generateSuggestions = (name: string) => {
        if (!name) return [];
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!base) return [];

        const sugs = [
            base.slice(0, 12), // exact short
            base.slice(0, 8) + Math.floor(Math.random() * 100), // with number
            'get' + base.slice(0, 9), // prefix
            base.slice(0, 9) + 'now', // suffix
        ];
        return Array.from(new Set(sugs)).filter(s => s.length >= 3);
    };

    // ── Auto-generate subdomain from store name ──
    const handleStoreNameChange = (name: string) => {
        setStoreName(name);
        if (!existingSubdomain) {
            const suggestions = generateSuggestions(name);
            setSubdomainSuggestions(suggestions);
            if (suggestions.length > 0 && !storeSubdomain) {
                setStoreSubdomain(suggestions[0]);
            }
        }
    };

    // ── Logo pick ──
    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB'); return; }
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    // ── Save Store Profile + Domain ──
    const handleSaveStore = async () => {
        if (!tenantId || !isSupabaseConfigured) return;
        setSaving(true);

        try {
            // Upload logo if changed
            let finalLogoUrl = logoUrl;
            if (logoFile && tenantId) {
                const { url, error } = await StorageService.uploadProductImage(logoFile, tenantId);
                if (url) finalLogoUrl = url;
                if (error) console.error('[Settings] Logo upload error:', error);
            }

            const { error } = await supabase
                .from('tenants')
                .update({
                    name: storeName,
                    subdomain: storeSubdomain,
                    category,
                    phone,
                    email,
                    description,
                    logo_url: finalLogoUrl,
                })
                .eq('id', tenantId);

            if (error) {
                if (error.message?.includes('tenants_subdomain_key')) {
                    alert('This store URL is already taken. Please choose a different one.');
                } else {
                    alert('Save failed: ' + error.message);
                }
                setSaving(false);
                return;
            }

            setLogoUrl(finalLogoUrl);
            setLogoFile(null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('[Settings] Save error:', err);
            alert('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Save Security ──
    const handleSaveSecurity = async () => {
        if (!tenantId || !isSupabaseConfigured) return;
        setSaving(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (user) {
                await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('[Settings] Security save error:', err);
        } finally {
            setSaving(false);
        }
    };

    // ── Wizard navigation ──
    const currentStep = SECTIONS.find(s => s.id === section)?.step || 1;
    const nextSection = SECTIONS.find(s => s.step === currentStep + 1);
    const goNext = () => { if (nextSection) setSection(nextSection.id); };

    const handleCopy = () => {
        navigator.clipboard.writeText(`${storeSubdomain || 'mystore'}.solo-sme.com`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Completion indicator ──
    const sectionComplete = (id: Section): boolean => {
        switch (id) {
            case 'store': return !!(storeName && storeSubdomain);
            case 'domain': return !!storeSubdomain;
            case 'whatsapp': return false; // needs manual setup
            case 'notifications': return true; // defaults always valid
            case 'security': return !!fullName;
        }
    };

    const completedCount = SECTIONS.filter(s => sectionComplete(s.id)).length;
    const progressPct = (completedCount / SECTIONS.length) * 100;

    const displayLogo = logoPreview || logoUrl;

    return (
        <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Header ── */}
            <div className="desktop-only">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', margin: 0 }}>Settings</h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>Configure your store — complete each section to get started</p>
            </div>

            {/* ── Progress bar ── */}
            <div className="card" style={{ padding: '14px 18px', borderRadius: 'var(--rl)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>Setup Progress</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{completedCount}/{SECTIONS.length}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)' }}>
                        <div style={{
                            height: 4, borderRadius: 2, transition: 'width 0.3s ease',
                            background: progressPct === 100 ? 'var(--success)' : 'var(--accent)',
                            width: `${progressPct}%`,
                        }} />
                    </div>
                </div>
                {progressPct === 100 && (
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--success)',
                        padding: '4px 10px', borderRadius: 20, background: 'var(--success-lt)',
                    }}>✓ All set!</div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ── Section nav (steps) ── */}
                <nav className="card" style={{
                    padding: 4, borderRadius: 'var(--rl)', flexShrink: 0,
                    display: 'flex', gap: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
                }}>
                    {SECTIONS.map((s) => {
                        const Icon = s.icon;
                        const active = section === s.id;
                        const done = sectionComplete(s.id);
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSection(s.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '8px 14px', borderRadius: 'var(--r)', border: 'none',
                                    background: active ? 'var(--primary-lt)' : 'transparent',
                                    color: active ? 'var(--primary)' : 'var(--muted)',
                                    fontSize: 12, fontWeight: active ? 700 : 500,
                                    cursor: 'pointer', transition: 'var(--transition-fast)',
                                    textAlign: 'left', whiteSpace: 'nowrap', flexShrink: 0,
                                    position: 'relative',
                                }}
                            >
                                {done && !active && (
                                    <div style={{
                                        position: 'absolute', top: 4, right: 4,
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: 'var(--success)',
                                    }} />
                                )}
                                <Icon size={15} />
                                <span>{s.label}</span>
                                {active && <ChevronRight size={13} />}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Content ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* ═══ STORE PROFILE ═══ */}
                    {section === 'store' && (
                        <div className="card" style={{ padding: 24, borderRadius: 'var(--rl)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Store Profile</h3>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px' }}>Public-facing business information</p>

                            {/* Logo Upload */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoSelect} />
                                <div
                                    onClick={() => logoRef.current?.click()}
                                    style={{
                                        width: 72, height: 72, borderRadius: 16, cursor: 'pointer',
                                        background: displayLogo ? `url(${displayLogo}) center/cover no-repeat` : 'var(--surface-2)',
                                        border: '2px dashed var(--border)', position: 'relative',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'var(--transition-fast)', flexShrink: 0,
                                    }}
                                >
                                    {!displayLogo && <Camera size={22} style={{ color: 'var(--ghost)' }} />}
                                    <div style={{
                                        position: 'absolute', bottom: -4, right: -4,
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: 'var(--accent)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}>
                                        <Upload size={11} color="white" />
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                                        {displayLogo ? 'Change Logo' : 'Upload Company Logo'}
                                    </p>
                                    <p style={{ fontSize: 11, color: 'var(--ghost)', margin: '4px 0 0' }}>
                                        JPEG, PNG, WebP · Max 2MB · Recommended 256×256
                                    </p>
                                    {logoPreview && (
                                        <button
                                            onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                                            style={{
                                                marginTop: 6, fontSize: 10, fontWeight: 600,
                                                color: 'var(--danger)', background: 'none', border: 'none',
                                                cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4,
                                            }}
                                        >
                                            <X size={10} /> Remove new logo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 16 }}>
                                <Field label="Business Name" placeholder="e.g. Fatima's Fashion House" value={storeName} onChange={handleStoreNameChange} />
                                <Field label="Category" placeholder="e.g. Fashion & Apparel" value={category} onChange={setCategory} />
                                <Field label="Phone" placeholder="+234 800 000 0000" value={phone} onChange={setPhone} />
                                <Field label="Email" placeholder="hello@mybusiness.com" value={email} onChange={setEmail} />
                            </div>

                            {/* Auto-generated subdomain preview */}
                            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                    Store URL
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                    <input
                                        type="text"
                                        value={storeSubdomain}
                                        onChange={(e) => setStoreSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20))}
                                        className="font-mono"
                                        style={{
                                            flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink)',
                                            background: 'transparent', border: 'none', outline: 'none', padding: 0,
                                        }}
                                        placeholder="mystore"
                                    />
                                    <span className="font-mono" style={{ fontSize: 12, color: 'var(--ghost)', flexShrink: 0 }}>.solo-sme.com</span>
                                </div>
                                {subdomainSuggestions.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                                        {subdomainSuggestions.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setStoreSubdomain(s)}
                                                style={{
                                                    fontSize: 10, fontWeight: 600, padding: '4px 8px',
                                                    borderRadius: 4, border: '1px solid var(--border)',
                                                    background: storeSubdomain === s ? 'var(--primary-lt)' : 'var(--surface)',
                                                    color: storeSubdomain === s ? 'var(--primary)' : 'var(--muted)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <p style={{ fontSize: 10, color: 'var(--ghost)', marginTop: 8 }}>
                                    Your store identifier. Avoid symbols for a cleaner look. Short & simple is best.
                                </p>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <Field label="Description" placeholder="What makes your business unique…" value={description} onChange={setDescription} />
                            </div>

                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                <button onClick={handleSaveStore} className={`btn ${saved ? 'btn-accent' : 'btn-primary'}`} disabled={saving}>
                                    {saving ? <><Loader2 size={14} className="animate-spin" style={{ marginRight: 4 }} /> Saving...</>
                                        : saved ? <><Check size={14} /> Saved!</>
                                            : 'Save Changes'}
                                </button>
                                {nextSection && (
                                    <button onClick={goNext} className="btn btn-ghost" style={{ fontSize: 12 }}>
                                        Next: {nextSection.label} <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ CUSTOM DOMAIN ═══ */}
                    {section === 'domain' && (
                        <div className="card" style={{ padding: 24, borderRadius: 'var(--rl)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Custom Domain</h3>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px' }}>Connect your own domain or use your free subdomain</p>

                            {/* Free subdomain */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Your Free Subdomain</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 'var(--rl)',
                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                }}>
                                    <Globe size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                    <span className="font-mono" style={{ flex: 1, fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>
                                        {storeSubdomain || 'mystore'}.solo-sme.com
                                    </span>
                                    <button onClick={handleCopy} className="btn btn-xs btn-ghost" style={{ fontSize: 11 }}>
                                        {copied ? <Check size={11} /> : <Copy size={11} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <Link
                                        href={`/store/${storeSubdomain || existingSubdomain || tenantId || 'demo'}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-xs btn-primary"
                                        style={{ fontSize: 11, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        <ExternalLink size={10} /> Visit
                                    </Link>
                                </div>
                            </div>

                            {/* Custom domain */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Connect Custom Domain</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="input-field" placeholder="e.g. www.mybusiness.com" style={{ flex: 1, fontSize: 13 }} />
                                    <button className="btn btn-primary" style={{ fontSize: 12 }}>Connect</button>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--ghost)', marginTop: 8 }}>
                                    Point your domain&apos;s CNAME to <span className="font-mono" style={{ color: 'var(--muted)' }}>cname.solo-sme.com</span>
                                </p>
                            </div>

                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                {nextSection && (
                                    <button onClick={goNext} className="btn btn-ghost" style={{ fontSize: 12 }}>
                                        Next: {nextSection.label} <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ WHATSAPP ═══ */}
                    {section === 'whatsapp' && (
                        <div className="card" style={{ padding: 24, borderRadius: 'var(--rl)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>WhatsApp Connection</h3>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px' }}>Link your business WhatsApp to SOLO AI</p>

                            <div style={{
                                borderRadius: 'var(--rl)', padding: 22,
                                background: 'linear-gradient(145deg, var(--sidebar-bg), #0a3352)',
                                color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{ position: 'absolute', top: -20, right: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(0,121,140,0.12)' }} />
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                        <MessageCircle size={17} style={{ color: '#25D366' }} />
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Connect WhatsApp Business</p>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                                        Your SOLO AI assistant handles customer chats, takes orders, sends receipts, and answers enquiries — 24/7.
                                    </p>
                                    <Link href="/dashboard/whatsapp" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        fontSize: 12, fontWeight: 700, background: '#25D366', color: '#fff',
                                        padding: '9px 16px', borderRadius: 'var(--r)', textDecoration: 'none',
                                        boxShadow: '0 2px 12px rgba(37,211,102,0.3)',
                                    }}>
                                        <Zap size={12} fill="white" /> Connect WhatsApp
                                    </Link>
                                </div>
                            </div>

                            <Field label="WhatsApp Business Number" placeholder="+234 800 000 0000" hint="Enter the number registered on your WhatsApp Business account" />

                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                {nextSection && (
                                    <button onClick={goNext} className="btn btn-ghost" style={{ fontSize: 12 }}>
                                        Next: {nextSection.label} <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ NOTIFICATIONS ═══ */}
                    {section === 'notifications' && (
                        <div className="card" style={{ padding: 24, borderRadius: 'var(--rl)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Notifications</h3>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px' }}>Choose what alerts you receive</p>
                            {[
                                { key: 'newOrder' as const, label: 'New order received', sub: 'Get notified when a customer places an order' },
                                { key: 'whatsapp' as const, label: 'WhatsApp message', sub: 'Alert when your AI receives a new customer message' },
                                { key: 'lowStock' as const, label: 'Low stock warning', sub: 'Alert when product stock falls below 5 units' },
                                { key: 'weeklyReport' as const, label: 'Weekly performance', sub: 'Receive a weekly summary of your store metrics' },
                            ].map((n) => (
                                <div key={n.key} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 0', borderBottom: '1px solid var(--border)',
                                }}>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{n.label}</p>
                                        <p style={{ fontSize: 11, color: 'var(--ghost)', marginTop: 3 }}>{n.sub}</p>
                                    </div>
                                    <Toggle on={notifs[n.key]} onToggle={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                                </div>
                            ))}
                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                                {nextSection && (
                                    <button onClick={goNext} className="btn btn-ghost" style={{ fontSize: 12 }}>
                                        Next: {nextSection.label} <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ SECURITY ═══ */}
                    {section === 'security' && (
                        <div className="card" style={{ padding: 24, borderRadius: 'var(--rl)' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>Account & Security</h3>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 20px' }}>Manage your login details</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 16 }}>
                                <Field label="Full Name" placeholder="Your name" value={fullName} onChange={setFullName} />
                                <Field label="Email Address" placeholder="your@email.com" value={secEmail} onChange={setSecEmail} disabled />
                            </div>
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 12 }}>Change Password</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 16 }}>
                                    <Field label="Current Password" placeholder="••••••••" type="password" />
                                    <Field label="New Password" placeholder="••••••••" type="password" />
                                </div>
                            </div>
                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                <button onClick={handleSaveSecurity} className={`btn ${saved ? 'btn-accent' : 'btn-primary'}`} disabled={saving}>
                                    {saving ? <><Loader2 size={14} className="animate-spin" style={{ marginRight: 4 }} /> Saving...</>
                                        : saved ? <><Check size={14} /> Saved!</>
                                            : 'Save Changes'}
                                </button>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: 'var(--success)',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    <Check size={13} /> Setup Complete
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
