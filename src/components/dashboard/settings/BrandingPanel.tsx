'use client';

import React from 'react';
import { Palette, Type, Image as ImageIcon, Check, Loader2, Sparkles, Smartphone, Layout, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditService } from '@/services/auditService';
import { toast } from 'sonner';
import { SettingsConfig } from '@/types';

interface BrandingPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: (oldData?: any) => Promise<void>;
    saving: boolean;
    saved: boolean;
}

const PRESET_COLORS = [
    { name: 'Sovereign Teal', primary: '#00798C', accent: '#00A8CC' },
    { name: 'Regal Navy', primary: '#1A365D', accent: '#2B6CB0' },
    { name: 'Forest Growth', primary: '#064E3B', accent: '#059669' },
    { name: 'Elite Maroon', primary: '#7F1D1D', accent: '#DC2626' },
    { name: 'Pitch Black', primary: '#0F172A', accent: '#334155' },
];

const FONTS = [
    { name: 'Plus Jakarta Sans', family: 'var(--font-plus-jakarta)', desc: 'Modern & Clean' },
    { name: 'Outfit', family: 'var(--font-outfit)', desc: 'Bold & Characterful' },
    { name: 'Inter', family: 'Inter, sans-serif', desc: 'Precise & Standard' },
];

type BuilderSection = 'colors' | 'typography' | 'logo' | 'hero' | null;

export const BrandingPanel: React.FC<BrandingPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved
}) => {
    const [activeSection, setActiveSection] = React.useState<BuilderSection>(null);

    // Refs for scroll-to-nav
    const colorRef = React.useRef<HTMLDivElement>(null);
    const typographyRef = React.useRef<HTMLDivElement>(null);
    const logoRef = React.useRef<HTMLDivElement>(null);
    const heroContentRef = React.useRef<HTMLDivElement>(null);

    const scrollToSection = (section: BuilderSection) => {
        setActiveSection(section);
        const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
            colors: colorRef,
            typography: typographyRef,
            logo: logoRef,
            hero: heroContentRef
        };

        const target = refMap[section as string];
        if (target?.current) {
            target.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Subtle pulse animation
            target.current.classList.add('ring-2', 'ring-primary', 'ring-offset-8', 'rounded-2xl');
            setTimeout(() => {
                target.current?.classList.remove('ring-2', 'ring-primary', 'ring-offset-8', 'rounded-2xl');
            }, 2000);
        }
    };

    const handleSaveWithAudit = async () => {
        // Logic for audit logging could be here or in parent
        // We'll pass the intention to save to the parent
        await onSave();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Store Branding</h3>
                    <p className="text-sm text-slate-500">Define your unique visual identity and typography.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                    <Sparkles size={14} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">V3.0 Institutional</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="space-y-10 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {/* Color Identity */}
                    <div ref={colorRef} className={cn("space-y-6 transition-all duration-500", activeSection === 'colors' && "scale-[1.02]")}>
                        <div className="flex items-center gap-2 mb-2">
                            <Palette size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Color Identity</h4>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Brand Presets</label>
                            <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => setConfig({ ...config, primaryColor: preset.primary, accentColor: preset.accent })}
                                        className={cn(
                                            "group relative w-12 h-12 rounded-2xl border-2 transition-all active:scale-90 flex items-center justify-center p-0.5",
                                            config.primaryColor === preset.primary ? "border-primary shadow-lg shadow-primary/20 scale-105" : "border-transparent hover:border-slate-200"
                                        )}
                                        title={preset.name}
                                    >
                                        <div className="w-full h-full rounded-xl overflow-hidden rotate-45 flex shadow-inner">
                                            <div style={{ backgroundColor: preset.primary }} className="w-1/2 h-full" />
                                            <div style={{ backgroundColor: preset.accent }} className="w-1/2 h-full" />
                                        </div>
                                        {config.primaryColor === preset.primary && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                                                <Check size={8} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Hero Content */}
                        <div ref={heroContentRef} className={cn("space-y-6 transition-all duration-500", activeSection === 'hero' && "scale-[1.02]")}>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="text-slate-400" />
                                <h4 className="text-sm font-bold text-slate-900">Hero Messaging</h4>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Main Title</label>
                                    <input
                                        type="text"
                                        value={config.heroTitle || ''}
                                        onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="Enter your bold headline"
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Call to Action Subtitle</label>
                                    <input
                                        type="text"
                                        value={config.heroSubtitle || ''}
                                        onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                                        className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="e.g. Elevate your everyday"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Color</label>
                                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                    <input
                                        type="color"
                                        value={config.primaryColor}
                                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={config.primaryColor}
                                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                                        className="flex-1 text-xs font-mono font-bold text-slate-700 outline-none"
                                        placeholder="#00798C"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Accent Color</label>
                                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                                    <input
                                        type="color"
                                        value={config.accentColor}
                                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                        className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={config.accentColor}
                                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                                        className="flex-1 text-xs font-mono font-bold text-slate-700 outline-none"
                                        placeholder="#00A8CC"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div ref={typographyRef} className={cn("space-y-6 transition-all duration-500", activeSection === 'typography' && "scale-[1.02]")}>
                        <div className="flex items-center gap-2 mb-2">
                            <Type size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Typography Suite</h4>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {FONTS.map((font) => (
                                <button
                                    key={font.name}
                                    onClick={() => setConfig({ ...config, fontFamily: font.name })}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                        config.fontFamily === font.name
                                            ? "bg-primary/5 border-primary shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-colors",
                                            config.fontFamily === font.name ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                        )}>
                                            Aa
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{font.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{font.desc}</p>
                                        </div>
                                    </div>
                                    {config.fontFamily === font.name && <Check size={20} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div ref={logoRef} className={cn("space-y-6 transition-all duration-500", activeSection === 'logo' && "scale-[1.02]")}>
                        <div className="flex items-center gap-2 mb-2">
                            <ImageIcon size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Brand Logo</h4>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <>
                                        <ImageIcon size={24} className="group-hover:text-primary transition-colors" />
                                        <span className="text-[9px] font-bold uppercase mt-2">Upload</span>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-xs font-bold text-slate-900">Identity Guidelines</p>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Recommended size: 512x512px. Supports PNG, JPG, or SVG. Dark backgrounds work best for high-contrast logos.
                                </p>
                                <div className="flex gap-2">
                                    <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Choose File</button>
                                    <span className="text-slate-300">|</span>
                                    <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Column */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Smartphone size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Live Mock Preview</h4>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <div className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/40" />
                        </div>
                    </div>

                    <div className="relative mx-auto max-w-[320px] aspect-[9/18] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden ring-4 ring-slate-800/20">
                        {/* Phone Notch/Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-20" />

                        <div className="absolute inset-0 bg-white overflow-hidden flex flex-col pt-8">
                            {/* Mock Header */}
                            <div
                                className="px-6 py-4 flex items-center justify-between border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors group/header"
                                onClick={() => scrollToSection('logo')}
                            >
                                <div className="relative min-w-[40px] h-4 flex items-center">
                                    {config.logoUrl ? (
                                        <img src={config.logoUrl} alt="Logo" className="h-full object-contain" />
                                    ) : (
                                        <div
                                            className="w-10 h-4 rounded opacity-50"
                                            style={{ backgroundColor: config.primaryColor }}
                                        />
                                    )}
                                    <div className="absolute inset-0 border-2 border-primary border-dashed opacity-0 group-hover/header:opacity-100 rounded transition-opacity" />
                                </div>
                                <Layout size={18} className="text-slate-300" />
                            </div>

                            {/* Mock Hero */}
                            <div
                                className="p-8 space-y-4 text-center transition-all duration-500 cursor-pointer hover:brightness-95 relative group/hero"
                                style={{ backgroundColor: `${config.primaryColor}10` }}
                                onClick={() => scrollToSection('hero')}
                            >
                                <div className="absolute inset-4 border-2 border-primary border-dashed opacity-0 group-hover/hero:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                                    <span className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Edit Hero</span>
                                </div>
                                <h1
                                    className="text-2xl font-black transition-all duration-500"
                                    style={{ color: config.primaryColor, fontFamily: config.fontFamily }}
                                >
                                    {config.heroTitle || 'Premium Store'}
                                </h1>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-80">
                                    {config.heroSubtitle || 'Curated for Excellence'}
                                </p>
                                <div
                                    className="mx-auto h-1 w-12 rounded-full"
                                    style={{ backgroundColor: config.accentColor }}
                                />
                            </div>

                            {/* Mock Content */}
                            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                                <div
                                    className="grid grid-cols-2 gap-3 cursor-pointer group/typography"
                                    onClick={() => scrollToSection('typography')}
                                >
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 relative">
                                            <div className="aspect-square bg-white rounded-lg border border-slate-50 shadow-sm" />
                                            <div className="h-2 w-full bg-slate-200 rounded" />
                                            <div className="h-2 w-2/3 bg-slate-100 rounded" />
                                            <div className="absolute inset-0 border-2 border-primary border-dashed opacity-0 group-hover/typography:opacity-100 rounded-xl transition-opacity" />
                                        </div>
                                    ))}
                                </div>

                                {/* Mock CTA - Links to Colors or Hero context */}
                                <button
                                    className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-500 transform scale-100 active:scale-95"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        scrollToSection('colors');
                                    }}
                                    style={{
                                        backgroundColor: config.primaryColor,
                                        boxShadow: `0 10px 25px -5px ${config.primaryColor}50`
                                    }}
                                >
                                    Shop Collection
                                </button>
                            </div>
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Institutional V3.0 Mobile Layout
                    </p>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={handleSaveWithAudit}
                    disabled={saving}
                    className={cn(
                        "px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 disabled:opacity-50",
                        saved
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-primary text-white shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                    )}
                >
                    {saving ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Vaulting...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Identity Saved</span>
                        </div>
                    ) : (
                        "Save Brand Identity"
                    )}
                </button>
            </div>
        </div>
    );
};
