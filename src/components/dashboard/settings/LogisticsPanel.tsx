'use client';

import React from 'react';
import { Truck, Map, Check, Loader2, Info, Navigation, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

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
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Logistics & Delivery</h3>
                    <p className="text-sm text-slate-500 font-medium">Configure your delivery rates and mapping services.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Truck size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                            <Navigation size={16} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Delivery Rates</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Base Delivery Fee (₦)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">NGN</div>
                                <input
                                    type="text"
                                    value={config.logisticsBaseFee}
                                    onChange={(e) => setConfig({ ...config, logisticsBaseFee: e.target.value })}
                                    placeholder="1500"
                                    className="w-full pl-12 pr-4 py-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 font-bold shadow-sm placeholder-slate-200"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium ml-0.5">Initial fee applied to every delivery.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Fee Per KM (₦)</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">NGN</div>
                                <input
                                    type="text"
                                    value={config.logisticsPerKmFee}
                                    onChange={(e) => setConfig({ ...config, logisticsPerKmFee: e.target.value })}
                                    placeholder="250"
                                    className="w-full pl-12 pr-4 py-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 font-bold shadow-sm placeholder-slate-200"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium ml-0.5">Distance-based additional cost calculated automatically.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                            <Map size={16} />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Calculation Engine</h4>
                    </div>

                    <div className="p-6 bg-slate-50/50 border border-slate-200 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Google Maps Status</span>
                            {config.googleMapsKey ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase border border-emerald-100">Configured</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-[9px] font-bold text-amber-600 uppercase border border-amber-100">Action Required</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                <div className={cn("w-2 h-2 rounded-full", config.googleMapsKey ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                <span className="text-xs font-bold text-slate-700">Distance Matrix API</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                                <div className={cn("w-2 h-2 rounded-full", config.googleMapsKey ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                <span className="text-xs font-bold text-slate-700">Places Autocomplete</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                            <Info size={14} className="text-slate-400 mt-0.5" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                Precise quoting requires an active Google Maps API Key. You can manage this in the <span className="text-primary font-bold">API Integrations</span> section.
                            </p>
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
                            <span>Calibrating...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Logistics Updated</span>
                        </div>
                    ) : (
                        "Save Logistics Config"
                    )}
                </button>
            </div>
        </div>
    );
};
