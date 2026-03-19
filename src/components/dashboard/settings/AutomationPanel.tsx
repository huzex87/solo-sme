'use client';

import React from 'react';
import { Brain, Hash, Check, Loader2, Zap, Bell, ShoppingCart, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

interface AutomationPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

const Toggle = ({ label, description, enabled, onChange, icon: Icon }: {
    label: string; description: string; enabled: boolean; onChange: (val: boolean) => void; icon: React.ElementType;
}) => (
    <div className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all",
        enabled ? "bg-primary/5 border-primary/20" : "bg-white border-slate-100 hover:border-slate-200"
    )}>
        <div className="flex gap-3 items-start">
            <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                enabled ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
            )}>
                <Icon size={18} />
            </div>
            <div>
                <h4 className="text-sm font-medium text-slate-900">{label}</h4>
                <p className="text-xs text-slate-500 mt-0.5 max-w-[260px] leading-relaxed">{description}</p>
            </div>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                "w-11 h-6 rounded-full transition-all relative shrink-0 ml-3",
                enabled ? "bg-primary" : "bg-slate-200"
            )}
        >
            <div className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm",
                enabled && "translate-x-5"
            )} />
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
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Automation</h3>
                <p className="text-sm text-slate-500">Automate routine tasks and customer engagement.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Toggle
                    label="Cart Recovery"
                    description="Send reminders to customers who leave items in their cart."
                    enabled={config.automationAbandonedEnabled}
                    icon={ShoppingCart}
                    onChange={(val) => setConfig({ ...config, automationAbandonedEnabled: val })}
                />
                <Toggle
                    label="Low Stock Alerts"
                    description="Get notified when inventory drops below your threshold."
                    enabled={config.automationLowStockEnabled}
                    icon={Bell}
                    onChange={(val) => setConfig({ ...config, automationLowStockEnabled: val })}
                />
                <Toggle
                    label="Weekly Digest"
                    description="Receive a summary of your store's performance each week."
                    enabled={config.automationDigestEnabled}
                    icon={BarChart3}
                    onChange={(val) => setConfig({ ...config, automationDigestEnabled: val })}
                />

                {/* Threshold */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                        <Hash size={15} className="text-slate-400" />
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Threshold</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={config.lowStockThreshold}
                            onChange={(e) => setConfig({ ...config, lowStockThreshold: e.target.value })}
                            placeholder="5"
                            className="w-16 h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none text-center"
                        />
                        <span className="text-xs text-slate-500">units triggers alert</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Alerts fire when any product drops to this quantity.
                    </p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-slate-900">AI Pricing Optimization</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Coming soon — automated pricing based on demand and competition.</p>
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
                        "Save Automation"
                    )}
                </button>
            </div>
        </div>
    );
};
