'use client';

import React from 'react';
import { Truck, Map, Check, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';
import { CurrencyService } from '@/services/currencyService';

interface LogisticsPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

export const LogisticsPanel: React.FC<LogisticsPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved
}) => {
    const currency = CurrencyService.getSymbol('NGN');

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delivery Settings</h3>
                <p className="text-sm text-slate-500">Configure delivery rates and distance calculation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rates */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Rates</h4>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-500">Base Fee ({currency})</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{currency}</span>
                                <input
                                    type="text"
                                    value={config.logisticsBaseFee}
                                    onChange={(e) => setConfig({ ...config, logisticsBaseFee: e.target.value })}
                                    placeholder="1500"
                                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">Flat fee applied to every order.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-500">Per KM Fee ({currency})</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{currency}</span>
                                <input
                                    type="text"
                                    value={config.logisticsPerKmFee}
                                    onChange={(e) => setConfig({ ...config, logisticsPerKmFee: e.target.value })}
                                    placeholder="250"
                                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400">Additional cost per kilometer.</p>
                        </div>
                    </div>
                </div>

                {/* Maps Status */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance Calculation</h4>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">Google Maps API</span>
                            {config.googleMapsKey ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-600 border border-emerald-100">Connected</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[10px] font-semibold text-amber-600 border border-amber-100">Not Set</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-lg">
                                <div className={cn("w-1.5 h-1.5 rounded-full", config.googleMapsKey ? "bg-emerald-500" : "bg-slate-300")} />
                                <span className="text-xs text-slate-600">Distance Matrix API</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-lg">
                                <div className={cn("w-1.5 h-1.5 rounded-full", config.googleMapsKey ? "bg-emerald-500" : "bg-slate-300")} />
                                <span className="text-xs text-slate-600">Places Autocomplete</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-1">
                            <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Set your Google Maps API Key in the <span className="text-primary font-medium">Integrations</span> tab.
                            </p>
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
                        "Save Delivery Settings"
                    )}
                </button>
            </div>
        </div>
    );
};
