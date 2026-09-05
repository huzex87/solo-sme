'use client';

import React from 'react';
import { ShoppingBag, Search, Check, Loader2, Info, Share2, Image as ImageIcon, Store, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';
import { SECTOR_PRESETS } from '@/lib/storefront/sectors';

const BUSINESS_TYPES = [
    SECTOR_PRESETS.fashion.label,
    SECTOR_PRESETS.food.label,
    SECTOR_PRESETS.beauty.label,
    SECTOR_PRESETS.home.label,
    SECTOR_PRESETS.services.label,
];
const inputCls = "w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300 shadow-sm";

interface StorefrontPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

export const StorefrontPanel: React.FC<StorefrontPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved
}) => {
    const founderActive = !!(config.founderName || config.founderQuote || config.founderMessage);
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Storefront Content</h3>
                <p className="text-sm text-slate-500">Manage your store homepage messaging and SEO.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Section */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <ImageIcon size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Hero Content</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-slate-600">Headline</label>
                                    <span className="text-[10px] text-slate-400 tabular-nums">{config.heroTitle?.length || 0}/60</span>
                                </div>
                                <input
                                    type="text"
                                    value={config.heroTitle}
                                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                    placeholder="The future of fashion is here"
                                    maxLength={60}
                                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300 shadow-sm"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-slate-600">Subtitle</label>
                                    <span className="text-[10px] text-slate-400 tabular-nums">{config.heroSubtitle?.length || 0}/120</span>
                                </div>
                                <textarea
                                    value={config.heroSubtitle}
                                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                                    placeholder="Discover curated pieces crafted for the modern individual."
                                    maxLength={120}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[80px] resize-none placeholder-slate-300 leading-relaxed shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Type & Theme */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <Store size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Business Type &amp; Theme</h4>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1.5">Business type</label>
                                <select
                                    value={config.businessType}
                                    onChange={(e) => setConfig({ ...config, businessType: e.target.value })}
                                    className={inputCls}
                                >
                                    <option value="">Select your sector…</option>
                                    {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1.5">Tailors your storefront&apos;s layout, colours and copy to your sector.</p>
                            </div>
                            <label className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.autoThemeFromLogo}
                                    onChange={(e) => setConfig({ ...config, autoThemeFromLogo: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 accent-primary"
                                />
                                <span>
                                    <span className="block text-xs font-semibold text-slate-800">Auto-colour from my logo</span>
                                    <span className="block text-[11px] text-slate-400 leading-relaxed">Pull your storefront&apos;s main colour from your logo. Turn off to keep the exact brand colour you set below.</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Founder / CEO Section */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                    <UserCircle size={14} className="text-white" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Founder / CEO</h4>
                            </div>
                            {founderActive ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live on your store
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Not set up yet
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 -mt-2">
                            {founderActive
                                ? 'This section shows at the bottom of your storefront. Clear the name, quote and message to hide it.'
                                : 'Hidden until you add a name and a quote or message below — then it appears at the bottom of your storefront.'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1.5">Name</label>
                                <input type="text" value={config.founderName} onChange={(e) => setConfig({ ...config, founderName: e.target.value })} placeholder="e.g. Amara Okonkwo" className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1.5">Role</label>
                                <input type="text" value={config.founderRole} onChange={(e) => setConfig({ ...config, founderRole: e.target.value })} placeholder="Founder &amp; CEO" className={inputCls} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1.5">Photo URL</label>
                            <input type="url" value={config.founderPhoto} onChange={(e) => setConfig({ ...config, founderPhoto: e.target.value })} placeholder="https://…  (optional — initials shown if blank)" className={inputCls} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-slate-600">Short quote</label>
                                <span className="text-[10px] text-slate-400 tabular-nums">{config.founderQuote?.length || 0}/160</span>
                            </div>
                            <textarea value={config.founderQuote} onChange={(e) => setConfig({ ...config, founderQuote: e.target.value })} maxLength={160} placeholder="“The story or promise behind your business, in one line.”" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[70px] resize-none placeholder-slate-300 leading-relaxed shadow-sm" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-slate-600">Message</label>
                                <span className="text-[10px] text-slate-400 tabular-nums">{config.founderMessage?.length || 0}/300</span>
                            </div>
                            <textarea value={config.founderMessage} onChange={(e) => setConfig({ ...config, founderMessage: e.target.value })} maxLength={300} placeholder="A few sentences about you and why customers can trust your store." className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[80px] resize-none placeholder-slate-300 leading-relaxed shadow-sm" />
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                                <Search size={14} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">SEO Description</h4>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-medium text-slate-600">Meta description</label>
                                <span className="text-[10px] text-slate-400 tabular-nums">{config.storeDescription?.length || 0}/160</span>
                            </div>
                            <textarea
                                value={config.storeDescription}
                                onChange={(e) => setConfig({ ...config, storeDescription: e.target.value })}
                                placeholder="Your store's description for Google search results and social media shares..."
                                maxLength={160}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[80px] resize-none placeholder-slate-300 leading-relaxed shadow-sm"
                            />
                            <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 mt-3">
                                <Info size={13} className="text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-600/80 leading-relaxed">
                                    This appears in Google search results and when your store link is shared on social media.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-4">
                    {/* Google Preview */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                <Search size={12} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-500">Google Preview</span>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-bold text-[#1a0dab] leading-tight">
                                {config.heroTitle || "Store Name | Solo SME"}
                            </h5>
                            <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                                {config.storeDescription || "Discover the best products curated for you."}
                            </p>
                        </div>
                    </div>

                    {/* Social Card Preview */}
                    <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                            <Share2 size={13} className="text-slate-400" />
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Social Card Preview</span>
                        </div>
                        <div className="aspect-[1.91/1] bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-md">
                            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <ShoppingBag size={24} className="text-slate-400" />
                            </div>
                            <div className="p-3 space-y-0.5 bg-white">
                                <p className="text-[11px] font-bold text-slate-900 truncate">{config.heroTitle || "Store Name"}</p>
                                <p className="text-[10px] text-slate-500 line-clamp-1">{config.storeDescription || "Visit my store"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
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
                        "Save Content"
                    )}
                </button>
            </div>
        </div>
    );
};
