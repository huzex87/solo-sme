'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Receipt, ShieldCheck, Plus, Trash2, Edit2, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaxService, TaxRule } from '@/services/taxService';
import { toast } from 'sonner';

interface TaxPanelProps {
    tenantId: string;
}

export const TaxPanel: React.FC<TaxPanelProps> = ({ tenantId }) => {
    const [rules, setRules] = useState<TaxRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    // Form state
    const [newRule, setNewRule] = useState<Partial<TaxRule>>({
        name: 'VAT',
        rate: 0.075,
        is_included: false,
        is_active: true,
        country_code: 'NG'
    });

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await TaxService.getTaxRules(tenantId);
            setRules(data);
        } catch (error) {
            toast.error("Failed to load tax configurations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadRules();
    }, [tenantId]);

    const handleSave = async (ruleToSave: Partial<TaxRule>) => {
        setSaving(true);
        try {
            const { error } = await TaxService.saveTaxRule(tenantId, ruleToSave);
            if (error) throw error;
            toast.success("Tax rule synchronized.");
            setShowAdd(false);
            loadRules();
        } catch (error: any) {
            toast.error(error.message || "Failed to save rule.");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (rule: TaxRule) => {
        const { error } = await TaxService.saveTaxRule(tenantId, {
            ...rule,
            is_active: !rule.is_active
        });
        if (!error) loadRules();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Taxes & Compliance</h3>
                    <p className="text-sm text-slate-500">Coordinate regional tax rates and fiscal transparency.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                    <Scale size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={18} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">Active Configurations</h4>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} /> Add Rule
                        </button>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-slate-300">
                                <Loader2 size={24} className="animate-spin" />
                            </div>
                        ) : rules.length === 0 ? (
                            <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-3">
                                <Receipt className="mx-auto text-slate-200" size={32} />
                                <p className="text-xs font-bold text-slate-400">No custom tax rules defined.</p>
                                <p className="text-[10px] text-slate-300">Using regional fallbacks (e.g. 7.5% VAT for Nigeria).</p>
                            </div>
                        ) : (
                            rules.map((rule) => (
                                <div key={rule.id} className={cn(
                                    "p-5 rounded-2xl border transition-all flex items-center justify-between group",
                                    rule.is_active ? "bg-white border-slate-200 hover:border-primary/30" : "bg-slate-50 border-slate-100 opacity-60"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                                            rule.is_active ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                                        )}>
                                            {(rule.rate * 100).toFixed(1)}%
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{rule.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{rule.country_code || 'ALL'} REGION</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActive(rule)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                rule.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"
                                            )}
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Receipt size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">Institutional Compliance</h4>
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors">
                            <AlertCircle size={80} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <span className="px-3 py-1 bg-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20">Tax Intelligence</span>
                            <p className="text-white text-sm font-bold leading-relaxed">
                                Our Tax Engine automatically detects the appropriate rate based on regional fallbacks if no custom rule is defined.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-white/40 text-[9px] font-black tracking-widest uppercase">Nigeria</p>
                                    <p className="text-white text-xs font-bold font-mono">7.5% VAT</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white/40 text-[9px] font-black tracking-widest uppercase">Global Default</p>
                                    <p className="text-white text-xs font-bold font-mono">0.0% Custom</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showAdd && (
                        <div className="p-6 bg-white border border-primary/20 rounded-3xl shadow-xl shadow-primary/5 animate-in zoom-in-95 duration-300">
                            <h5 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">New Tax Rule</h5>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rule Name</label>
                                    <input
                                        type="text"
                                        value={newRule.name}
                                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                                        placeholder="e.g. VAT"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate (e.g. 0.075 for 7.5%)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={newRule.rate}
                                        onChange={(e) => setNewRule({ ...newRule, rate: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={() => handleSave(newRule)}
                                        disabled={saving}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving && <Loader2 size={12} className="animate-spin" />}
                                        Save Rule
                                    </button>
                                    <button
                                        onClick={() => setShowAdd(false)}
                                        className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
