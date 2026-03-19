'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Receipt, Plus, Trash2, Loader2, Check, Info } from 'lucide-react';
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
    const [newRule, setNewRule] = useState<Partial<TaxRule>>({
        name: 'VAT', rate: 0.075, is_included: false, is_active: true, country_code: 'NG'
    });

    const loadRules = async () => {
        setLoading(true);
        try {
            const data = await TaxService.getTaxRules(tenantId);
            setRules(data);
        } catch {
            toast.error("Failed to load tax rules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (tenantId) loadRules(); }, [tenantId]);

    const handleSave = async (ruleToSave: Partial<TaxRule>) => {
        setSaving(true);
        try {
            const { error } = await TaxService.saveTaxRule(tenantId, ruleToSave);
            if (error) throw error;
            toast.success("Tax rule saved.");
            setShowAdd(false);
            loadRules();
        } catch (error: any) {
            toast.error(error.message || "Failed to save rule.");
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (rule: TaxRule) => {
        const { error } = await TaxService.saveTaxRule(tenantId, { ...rule, is_active: !rule.is_active });
        if (!error) loadRules();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Taxes</h3>
                <p className="text-sm text-slate-500">Configure tax rates for your store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tax Rules */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tax Rules</h4>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} /> Add Rule
                        </button>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-slate-300">
                                <Loader2 size={20} className="animate-spin" />
                            </div>
                        ) : rules.length === 0 ? (
                            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Receipt size={24} className="text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">No custom tax rules.</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Regional defaults apply (e.g. 7.5% VAT for Nigeria).</p>
                            </div>
                        ) : (
                            rules.map((rule) => (
                                <div key={rule.id} className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                    rule.is_active ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 opacity-50"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold",
                                            rule.is_active ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-400"
                                        )}>
                                            {(rule.rate * 100).toFixed(1)}%
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{rule.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{rule.country_code || 'ALL'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => toggleActive(rule)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                rule.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                            )}
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </button>
                                        <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Defaults & Add Form */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regional Defaults</h4>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            When no custom rule is defined, the tax engine uses regional fallback rates automatically.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                                <p className="text-[10px] text-slate-400 uppercase">Nigeria</p>
                                <p className="text-sm font-bold text-slate-900 font-mono">7.5% VAT</p>
                            </div>
                            <div className="p-2.5 bg-white border border-slate-100 rounded-lg">
                                <p className="text-[10px] text-slate-400 uppercase">Global</p>
                                <p className="text-sm font-bold text-slate-900 font-mono">0.0%</p>
                            </div>
                        </div>
                    </div>

                    {showAdd && (
                        <div className="p-4 bg-white border border-primary/20 rounded-xl animate-in fade-in duration-200">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">New Tax Rule</h5>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500">Name</label>
                                    <input
                                        type="text"
                                        value={newRule.name}
                                        onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium outline-none focus:border-primary transition-all"
                                        placeholder="e.g. VAT"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs text-slate-500">Rate (e.g. 0.075 for 7.5%)</label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={newRule.rate}
                                        onChange={(e) => setNewRule({ ...newRule, rate: parseFloat(e.target.value) })}
                                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm font-medium outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={() => handleSave(newRule)}
                                        disabled={saving}
                                        className="flex-1 h-10 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        Save Rule
                                    </button>
                                    <button
                                        onClick={() => setShowAdd(false)}
                                        className="h-10 px-4 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium"
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
