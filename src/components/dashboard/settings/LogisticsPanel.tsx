'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Check, Loader2, Info, Plus, Trash2, ShieldCheck, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';
import { CurrencyService } from '@/services/currencyService';
import { LogisticsService } from '@/services/logisticsService';
import { toast } from 'sonner';

interface LogisticsPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
    tenantId: string | null;
    city?: string;
}

export const LogisticsPanel: React.FC<LogisticsPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved,
    tenantId,
    city = 'Katsina'
}) => {
    const currency = CurrencyService.getSymbol('NGN');
    const [agents, setAgents] = useState<any[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: '', phone: '', vehicle: '', city: city });
    const [creatingAgent, setCreatingAgent] = useState(false);

    const loadAgents = async () => {
        if (!tenantId) return;
        setLoadingAgents(true);
        const data = await LogisticsService.getDeliveryAgents(tenantId, city);
        setAgents(data);
        setLoadingAgents(false);
    };

    useEffect(() => {
        loadAgents();
    }, [tenantId, city]);

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId) return;
        if (!newAgent.name || !newAgent.phone) {
            toast.error("Please fill in Name and Phone number");
            return;
        }

        setCreatingAgent(true);
        const success = await LogisticsService.createTrustedAgent(
            tenantId,
            newAgent.name,
            newAgent.phone,
            newAgent.vehicle,
            newAgent.city
        );

        if (success) {
            toast.success("Trusted delivery agent added successfully!");
            setNewAgent({ name: '', phone: '', vehicle: '', city: city });
            setModalOpen(false);
            loadAgents();
        } else {
            toast.error("Failed to add delivery agent.");
        }
        setCreatingAgent(false);
    };

    const handleDeleteAgent = async (agentId: string) => {
        if (!tenantId) return;
        if (!confirm("Are you sure you want to remove this delivery agent?")) return;

        const success = await LogisticsService.deleteAgent(agentId, tenantId);
        if (success) {
            toast.success("Delivery agent removed successfully.");
            loadAgents();
        } else {
            toast.error("Failed to remove delivery agent.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delivery & Logistics Settings</h3>
                <p className="text-sm text-slate-500 font-medium">Configure delivery rates and manage your delivery agent network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Rates */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Delivery Rates</h4>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Base Fee ({currency})</label>
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
                            <p className="text-[11px] text-slate-400 font-medium">Flat fee applied to every order.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Per KM Fee ({currency})</label>
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
                            <p className="text-[11px] text-slate-400 font-medium">Additional cost per kilometer.</p>
                        </div>
                    </div>
                </div>

                {/* Maps Status */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Distance Calculation</h4>

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
                                <span className="text-xs text-slate-600 font-medium">Distance Matrix API</span>
                            </div>
                            <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-lg">
                                <div className={cn("w-1.5 h-1.5 rounded-full", config.googleMapsKey ? "bg-emerald-500" : "bg-slate-300")} />
                                <span className="text-xs text-slate-600 font-medium">Places Autocomplete</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-1">
                            <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Set your Google Maps API Key in the <span className="text-primary font-medium">Integrations</span> tab.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rider Management Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-black text-slate-900 font-display">Delivery Agents & Riders</h4>
                        <p className="text-xs text-slate-500 font-medium">Manage private trusted riders and view verified platform partners.</p>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-soft-sm"
                    >
                        <Plus size={14} /> Add Trusted Rider
                    </button>
                </div>

                {loadingAgents ? (
                    <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs font-semibold">Loading agent registry...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Custom / Trusted Riders list */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">My Private Riders</h5>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {agents.filter(a => a.tenant_id !== null).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-4">No private riders added yet.</p>
                                ) : (
                                    agents.filter(a => a.tenant_id !== null).map(agent => (
                                        <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">{agent.vehicle_details || 'Motorcycle'} · {agent.city}</p>
                                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1"><Phone size={10} /> {agent.phone}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAgent(agent.id)}
                                                className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all active:scale-95"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Verified SOLO Partners List */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">SOLO Verified Network ({city})</h5>
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {agents.filter(a => a.tenant_id === null).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-4">No verified partners in {city} yet.</p>
                                ) : (
                                    agents.filter(a => a.tenant_id === null).map(agent => (
                                        <div key={agent.id} className="flex items-center justify-between p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                                                    <span className="flex items-center gap-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                                                        <ShieldCheck size={8} /> Verified
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-semibold">{agent.vehicle_details || 'Motorcycle'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-1"><Phone size={10} /> {agent.phone}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for adding Trusted Agent */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreateAgent} className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-premium border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-slate-950 font-display">Add Trusted Rider</h4>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rider Name</label>
                                <input
                                    type="text"
                                    value={newAgent.name}
                                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                    placeholder="e.g. Musa Abubakar"
                                    required
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                                <input
                                    type="tel"
                                    value={newAgent.phone}
                                    onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                                    placeholder="e.g. +234 813..."
                                    required
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vehicle Details</label>
                                <input
                                    type="text"
                                    value={newAgent.vehicle}
                                    onChange={(e) => setNewAgent({ ...newAgent, vehicle: e.target.value })}
                                    placeholder="e.g. Keke / Motorcycle"
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">City</label>
                                <input
                                    type="text"
                                    value={newAgent.city}
                                    onChange={(e) => setNewAgent({ ...newAgent, city: e.target.value })}
                                    placeholder="e.g. Katsina"
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={creatingAgent}
                                className="w-full h-11 bg-slate-950 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {creatingAgent ? "Adding..." : "Add Rider"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="w-full h-11 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
