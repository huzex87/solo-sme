'use client';

import React from 'react';
import { ShoppingBag, Search, Check, Loader2, Sparkles, MessageSquare, Info, Share2, Image as ImageIcon } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Storefront Content</h3>
                    <p className="text-sm text-slate-500">Manage the messaging and narrative on your public store homepage.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Storefront</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Messaging Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Core Messaging</h4>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Hero Headline</label>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{config.heroTitle?.length || 0} / 60</span>
                                </div>
                                <input
                                    type="text"
                                    value={config.heroTitle}
                                    onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                    placeholder="The future of fashion is here"
                                    className="w-full px-5 py-4 text-sm bg-white border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold shadow-sm placeholder-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Hero Subtitle</label>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{config.heroSubtitle?.length || 0} / 120</span>
                                </div>
                                <textarea
                                    value={config.heroSubtitle}
                                    onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                                    placeholder="Discover curated pieces crafted for the modern individual."
                                    className="w-full px-5 py-4 text-sm bg-white border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium shadow-sm min-h-[120px] resize-none placeholder-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Marketing & SEO Section */}
                    <div className="space-y-8 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Search size={18} className="text-slate-400" />
                            <h4 className="text-sm font-bold text-slate-900">Search Engine presence (SEO)</h4>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">SEO Description</label>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{config.storeDescription?.length || 0} / 160</span>
                                </div>
                                <textarea
                                    value={config.storeDescription}
                                    onChange={(e) => setConfig({ ...config, storeDescription: e.target.value })}
                                    placeholder="Supreme Fabrics is Nigeria's premier source for luxury textiles and bespoke attire..."
                                    className="w-full px-5 py-4 text-sm bg-white border border-slate-200 text-slate-900 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium shadow-sm min-h-[140px] resize-none placeholder-slate-300 leading-relaxed"
                                />
                                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                                    <Info size={14} className="text-slate-400 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        This text appears in Google search results and when you share your store link on social media. Keep it descriptive and keyword-rich.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Live Preview */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Share2 size={18} className="text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-900">Search Preview</h4>
                    </div>

                    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/20 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Search size={14} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 leading-none">google.com/search</p>
                                <p className="text-[9px] text-primary font-bold">https://yourstore.solosme.ng</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h5 className="text-base font-bold text-[#1a0dab] hover:underline cursor-pointer leading-tight">
                                {config.heroTitle || "Store Name | Solo SME"}
                            </h5>
                            <p className="text-sm text-[#4d5156] leading-relaxed line-clamp-3">
                                <span className="text-[#70757a]">Mar 14, 2026 — </span>
                                {config.storeDescription || "Discover the best products curated for you. Secure shopping and fast delivery nationwide."}
                            </p>
                        </div>

                        <div className="flex gap-4 pt-2 border-t border-slate-50">
                            <div className="h-2 w-16 bg-slate-100 rounded" />
                            <div className="h-2 w-16 bg-slate-100 rounded" />
                            <div className="h-2 w-16 bg-slate-100 rounded" />
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={16} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social Card Preview</span>
                        </div>
                        <div className="aspect-[1.91/1] bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <ShoppingBag size={32} className="text-slate-300" />
                            </div>
                            <div className="p-3 space-y-1">
                                <p className="text-[10px] font-bold text-slate-900 truncate">{config.heroTitle || "SOLO Store"}</p>
                                <p className="text-[9px] text-slate-500 line-clamp-2">{config.storeDescription || "Visit my store on SOLO SME."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
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
                            <span>Syncing...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Content Synced</span>
                        </div>
                    ) : (
                        "Save Storefront Content"
                    )}
                </button>
            </div>
        </div>
    );
};
