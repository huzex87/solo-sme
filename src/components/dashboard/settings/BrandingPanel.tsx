'use client';

import React, { useRef, useState } from 'react';
import { Palette, Type, Image as ImageIcon, Check, Loader2, Layout, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';
import { StorageService } from '@/services/storageService';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

interface BrandingPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: (oldData?: Record<string, unknown>) => Promise<void>;
    saving: boolean;
    saved: boolean;
}

const PRESET_COLORS = [
    { name: 'Teal', primary: '#00798C', accent: '#00A8CC' },
    { name: 'Navy', primary: '#1A365D', accent: '#2B6CB0' },
    { name: 'Forest', primary: '#064E3B', accent: '#059669' },
    { name: 'Maroon', primary: '#7F1D1D', accent: '#DC2626' },
    { name: 'Dark', primary: '#0F172A', accent: '#334155' },
];

const FONTS = [
    { name: 'Plus Jakarta Sans', family: 'var(--font-plus-jakarta)', desc: 'Modern & Clean' },
    { name: 'Outfit', family: 'var(--font-outfit)', desc: 'Bold & Characterful' },
    { name: 'Inter', family: 'Inter, sans-serif', desc: 'Precise & Standard' },
];

const THEME_STYLES = [
    { id: 'minimalist', name: 'Minimalist', desc: 'Clean outlines & border cards', radius: '12px' },
    { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted backdrops & soft pill buttons', radius: '24px' },
    { id: 'neobrutalism', name: 'Neobrutalism', desc: 'Bold outlines & hard black offsets', radius: '0px' },
    { id: 'luxury', name: 'Classic Luxury', desc: 'Elegant serif fonts & gold borders', radius: '8px' }
];

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const { tenantId } = useTenant();

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tenantId) return;

        setUploading(true);
        try {
            const { url, error } = await StorageService.uploadProductImage(file, tenantId, 'logo');
            if (error) {
                toast.error(error);
            } else if (url) {
                setConfig(prev => ({ ...prev, logoUrl: url }));
                toast.success('Logo uploaded successfully');
            }
        } catch {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const themeStyle = config.themeStyle || 'minimalist';
    const previewStyles = {
        cardRadius: themeStyle === 'glassmorphism' ? '12px' : themeStyle === 'neobrutalism' ? '0px' : themeStyle === 'luxury' ? '4px' : '6px',
        cardBorder: themeStyle === 'neobrutalism' ? '1.5px solid #072435' : themeStyle === 'luxury' ? '1px solid rgba(7, 36, 53, 0.12)' : '1px solid #f1f5f9',
        cardShadow: themeStyle === 'neobrutalism' ? '3.5px 3.5px 0px #072435' : themeStyle === 'luxury' ? '0 4px 10px rgba(0,0,0,0.02)' : 'none',
        btnRadius: themeStyle === 'glassmorphism' ? '9999px' : themeStyle === 'neobrutalism' ? '0px' : themeStyle === 'luxury' ? '2px' : '4px',
        btnBorder: themeStyle === 'neobrutalism' ? '1.5px solid #072435' : '1px solid transparent',
        btnShadow: themeStyle === 'neobrutalism' ? '3px 3px 0px #072435' : 'none',
        fontFamily: themeStyle === 'luxury' ? 'Georgia, serif' : config.fontFamily || 'sans-serif',
        heroBg: themeStyle === 'glassmorphism' ? 'rgba(255, 255, 255, 0.5)' : `${config.primaryColor}08`,
        heroBorder: themeStyle === 'glassmorphism' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
        wrapperBg: themeStyle === 'glassmorphism' ? 'radial-gradient(circle at 50% 50%, rgba(0, 121, 140, 0.05) 0%, #fff 100%)' : '#fff'
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Branding</h3>
                <p className="text-sm text-slate-500">Customize your store&apos;s visual identity.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Editor */}
                <div className="space-y-5">
                    {/* Colors */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <Palette size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Color Theme</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => setConfig({ ...config, primaryColor: preset.primary, accentColor: preset.accent })}
                                    className={cn(
                                        "relative w-9 h-9 rounded-lg border-2 transition-all active:scale-90 p-0.5",
                                        config.primaryColor === preset.primary ? "border-primary scale-105 shadow-sm" : "border-transparent hover:border-slate-200"
                                    )}
                                    title={preset.name}
                                >
                                    <div className="w-full h-full rounded-md overflow-hidden flex">
                                        <div style={{ backgroundColor: preset.primary }} className="w-1/2 h-full" />
                                        <div style={{ backgroundColor: preset.accent }} className="w-1/2 h-full" />
                                    </div>
                                    {config.primaryColor === preset.primary && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                                            <Check size={7} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500">Primary</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus-within:border-primary/40 transition-all">
                                    <input type="color" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer border-none p-0" />
                                    <input type="text" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} className="flex-1 text-xs font-mono text-slate-700 bg-transparent outline-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500">Accent</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 focus-within:border-primary/40 transition-all">
                                    <input type="color" value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer border-none p-0" />
                                    <input type="text" value={config.accentColor} onChange={(e) => setConfig({ ...config, accentColor: e.target.value })} className="flex-1 text-xs font-mono text-slate-700 bg-transparent outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Style Theme */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <Layout size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Website Theme Style</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            {THEME_STYLES.map((theme) => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => setConfig({ ...config, themeStyle: theme.id as any })}
                                    className={cn(
                                        "flex flex-col items-start p-3 rounded-xl border transition-all text-left gap-1.5",
                                        (config.themeStyle || 'minimalist') === theme.id
                                            ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <p className="text-xs font-bold text-slate-950">{theme.name}</p>
                                        {(config.themeStyle || 'minimalist') === theme.id && (
                                            <Check size={12} className="text-primary" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-normal">{theme.desc}</p>
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                        <div 
                                            className="h-full bg-primary" 
                                            style={{ 
                                                width: theme.id === 'glassmorphism' ? '85%' : theme.id === 'neobrutalism' ? '30%' : theme.id === 'luxury' ? '50%' : '65%',
                                                borderRadius: theme.radius 
                                            }} 
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hero */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <Type size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Hero Content</h4>
                        </div>
                        <div className="space-y-2.5">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Headline</label>
                                <input
                                    type="text"
                                    value={config.heroTitle || ''}
                                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                                    placeholder="Your bold headline"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Subtitle</label>
                                <input
                                    type="text"
                                    value={config.heroSubtitle || ''}
                                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none"
                                    placeholder="e.g. Elevate your everyday"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Font */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white text-xs font-bold">Aa</div>
                            <h4 className="text-sm font-bold text-slate-900">Font</h4>
                        </div>
                        <div className="space-y-1.5">
                            {FONTS.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => setConfig({ ...config, fontFamily: font.name })}
                                    className={cn(
                                        "flex items-center justify-between w-full p-2.5 rounded-lg border transition-all text-left",
                                        config.fontFamily === font.name
                                            ? "bg-primary/5 border-primary/30"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={cn(
                                            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold",
                                            config.fontFamily === font.name ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            Aa
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{font.name}</p>
                                            <p className="text-[10px] text-slate-400">{font.desc}</p>
                                        </div>
                                    </div>
                                    {config.fontFamily === font.name && <Check size={14} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <ImageIcon size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Logo</h4>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => !uploading && fileInputRef.current?.click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer shrink-0 relative overflow-hidden"
                            >
                                {uploading ? (
                                    <Loader2 size={18} className="animate-spin text-primary" />
                                ) : config.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
                                ) : (
                                    <Upload size={18} />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1.5">512x512px recommended. PNG, JPG, or WebP.</p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Choose File'}
                                    </button>
                                    {config.logoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setConfig(prev => ({ ...prev, logoUrl: '' }))}
                                            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</h4>
                    <div className="mx-auto max-w-[260px] bg-slate-900 rounded-[2rem] border-4 border-slate-800 shadow-md overflow-hidden">
                        <div className="min-h-[380px] flex flex-col mt-5 transition-all" style={{ background: previewStyles.wrapperBg, fontFamily: previewStyles.fontFamily }}>
                            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50">
                                {config.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={config.logoUrl} alt="Logo" className="h-3.5 object-contain" />
                                ) : (
                                    <div className="w-8 h-2.5 rounded opacity-40" style={{ backgroundColor: config.primaryColor }} />
                                )}
                                <Layout size={12} className="text-slate-300" />
                            </div>
                            <div className="p-5 space-y-2 text-center transition-all" style={{ backgroundColor: previewStyles.heroBg, borderBottom: previewStyles.heroBorder }}>
                                <h1 className="text-base font-bold transition-all" style={{ color: config.primaryColor }}>
                                    {config.heroTitle || 'Store Name'}
                                </h1>
                                <p className="text-[9px] text-slate-500">{config.heroSubtitle || 'Your tagline here'}</p>
                                <div className="mx-auto h-0.5 w-6 rounded-full" style={{ backgroundColor: config.accentColor }} />
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <div className="grid grid-cols-2 gap-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div 
                                            key={i} 
                                            className="p-1 transition-all"
                                            style={{ 
                                                borderRadius: previewStyles.cardRadius,
                                                border: previewStyles.cardBorder,
                                                boxShadow: previewStyles.cardShadow,
                                                background: '#fff'
                                            }}
                                        >
                                            <div className="aspect-square bg-slate-50" style={{ borderRadius: themeStyle === 'neobrutalism' ? '0px' : '4px' }} />
                                            <div className="h-1 w-full bg-slate-100 rounded mt-1" />
                                            <div className="h-1 w-2/3 bg-slate-50 rounded mt-0.5" />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="w-full py-2 text-[8px] font-bold uppercase text-white mt-3 transition-all"
                                    style={{ 
                                        backgroundColor: config.primaryColor,
                                        borderRadius: previewStyles.btnRadius,
                                        border: previewStyles.btnBorder,
                                        boxShadow: previewStyles.btnShadow
                                    }}
                                >
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                    onClick={() => onSave()}
                    disabled={saving}
                    className={cn(
                        "h-10 px-6 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50",
                        saved
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-950 text-white hover:bg-primary"
                    )}
                >
                    {saving ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                    ) : saved ? (
                        <span className="flex items-center gap-2"><Check size={16} /> Saved</span>
                    ) : (
                        "Save Branding"
                    )}
                </button>
            </div>
        </div>
    );
};
