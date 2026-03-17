'use client';

import React from 'react';
import { Brain, Hash, Check, Loader2, Sparkles, Zap, Bell, ShoppingCart, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

interface AutomationPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

const AutomationToggle = ({
    label,
    description,
    enabled,
    onChange,
    icon: Icon
}: {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (val: boolean) => void;
    icon: React.ElementType
}) => (
    <div className={cn(
        "flex items-center justify-between p-6 rounded-3xl border transition-all duration-300",
        enabled ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
    )}>
        <div className="flex gap-4">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                enabled ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
            )}>
                <Icon size={24} />
            </div>
            <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{label}</h4>
                <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">{description}</p>
            </div>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "w-14 h-7 rounded-full transition-all relative outline-none ring-primary/20 focus:ring-4 shrink-0",
                enabled ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200"
            )}
        >
            <div className={cn(
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all shadow-md flex items-center justify-center",
                enabled ? "translate-x-7" : "translate-x-0"
            )}>
                {enabled && <Check size={10} className="text-primary" strokeWidth={4} />}
            </div>
        </button>
    </div>
);

export const AutomationPanel: React.FC<AutomationPanelProps> = ({
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
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Automation Lab</h3>
                    <p className="text-sm text-slate-500 font-medium">Let AI handle routine tasks and keep your customers engaged.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                    <Brain size={14} className="text-indigo-600" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Intelligence</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AutomationToggle
                    label="Smart Cart Recovery"
                    description="Our AI sends a gentle nudge to customers who leave items behind, helping you close more sales automatically."
                    enabled={config.automationAbandonedEnabled}
                    icon={ShoppingCart}
                    onChange={(val) => setConfig({ ...config, automationAbandonedEnabled: val })}
                />
                <AutomationToggle
                    label="Stock Health Alerts"
                    description="Never run out of bestsellers. We&apos;ll notify you the moment your inventory hits your safety limit."
                    enabled={config.automationLowStockEnabled}
                    icon={Bell}
                    onChange={(val) => setConfig({ ...config, automationLowStockEnabled: val })}
                />
                <AutomationToggle
                    label="Weekly Profit Digest"
                    description="A high-level summary of your store&apos;s performance, delivered with insights to help you grow."
                    enabled={config.automationDigestEnabled}
                    icon={BarChart3}
                    onChange={(val) => setConfig({ ...config, automationDigestEnabled: val })}
                />

                <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                            <Hash size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Inventory Threshold</label>
                            <div className="flex items-center gap-3 mt-1">
                                <input
                                    type="text"
                                    value={config.lowStockThreshold}
                                    onChange={(e) => setConfig({ ...config, lowStockThreshold: e.target.value })}
                                    placeholder="5"
                                    className="w-20 px-4 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold shadow-sm"
                                />
                                <span className="text-xs text-slate-500 font-medium">Critical Stock Level</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 pt-2">
                        <Info size={14} className="text-slate-400 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            AI will trigger restock alerts when product inventory hits this specific number.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-500 to-primary rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-primary/20">
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black uppercase tracking-tight">Institutional Intelligence</h4>
                            <p className="text-sm opacity-80 font-medium">Coming soon: Automated Pricing Optimization</p>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90 max-w-lg font-medium">
                        Solo SME is evolving. Secure, cross-platform AI agents are being trained to handle customer inquiries directly, bringing 24/7 concierge support to every Nigerian merchant.
                    </p>
                </div>
                {/* Abstract background shapes */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl transition-transform duration-1000 animate-pulse" />
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
                            <span>Optimizing...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Lab Synced</span>
                        </div>
                    ) : (
                        "Save Automation Specs"
                    )}
                </button>
            </div>
        </div>
    );
};
