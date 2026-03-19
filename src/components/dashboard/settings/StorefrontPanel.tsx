'use client';

import React from 'react';
import { ShoppingBag, Search, Check, Loader2, Info, Share2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

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
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Storefront Content</h3>
                <p className="text-sm text-slate-500">Manage your store homepage messaging and SEO.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hero Content</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-slate-500">Headline</label>
                                    <span className="text-[10px] text-slate-400">{config.heroTitle?.length || 0}/60</span>
                                </div>
                                <input
                                    type="text"
                                    value={config.heroTitle}
                                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                    placeholder="The future of fashion is here"
                                    maxLength={60}
                                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-slate-500">Subtitle</label>
                                    <span className="text-[10px] text-slate-400">{config.heroSubtitle?.length || 0}/120</span>
                                </div>
                                <textarea
                                    value={config.heroSubtitle}
                                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                                    placeholder="Discover curated pieces crafted for the modern individual."
                                    maxLength={120}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[80px] resize-none placeholder-slate-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SEO Description</h4>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-slate-500">Meta description</label>
                                <span className="text-[10px] text-slate-400">{config.storeDescription?.length || 0}/160</span>
                            </div>
                            <textarea
                                value={config.storeDescription}
                                onChange={(e) => setConfig({ ...config, storeDescription: e.target.value })}
                                placeholder="Your store's description for Google search results and social media shares..."
                                maxLength={160}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none min-h-[80px] resize-none placeholder-slate-300 leading-relaxed"
                            />
                            <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 mt-2">
                                <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    This appears in Google search results and when your store link is shared on social media.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Preview</h4>

                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                <Search size={12} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] text-slate-400">google.com</span>
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

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                            <Share2 size={13} className="text-slate-400" />
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Social Card</span>
                        </div>
                        <div className="aspect-[1.91/1] bg-white border border-slate-100 rounded-lg overflow-hidden flex flex-col">
                            <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                <ShoppingBag size={24} className="text-slate-300" />
                            </div>
                            <div className="p-2.5 space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-900 truncate">{config.heroTitle || "Store Name"}</p>
                                <p className="text-[9px] text-slate-500 line-clamp-1">{config.storeDescription || "Visit my store"}</p>
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
