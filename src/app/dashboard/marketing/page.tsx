"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Megaphone,
    Target,
    Zap,
    Activity,
    Eye,
    ShoppingCart,
    Users,
    MessageCircle,
    Loader2
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";
import CampaignStudio from "../../../components/dashboard/marketing/CampaignStudio";

const AUTOMATIONS = [
    {
        id: 'cart',
        title: 'Abandoned Cart Recovery',
        desc: 'Recover lost sales with AI-orchestrated retention loops.',
        icon: ShoppingCart,
        active: true
    },
    {
        id: 'welcome',
        title: 'Sovereign Welcome Sequence',
        desc: 'Automate first-impression incentives for new verified customers.',
        icon: Users,
        active: true
    },
    {
        id: 'winback',
        title: 'Re-engagement Matrix',
        desc: 'Heal dormant relationships with precision-timed incentives.',
        icon: Activity,
        active: false
    },
];

export default function MarketingPage() {
    const { tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [showStudio, setShowStudio] = useState(false);
    const [previewingAI, setPreviewingAI] = useState<string | null>(null);
    const [generatingPreview, setGeneratingPreview] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handlePreviewAI = async (id: string) => {
        setGeneratingPreview(true);
        try {
            const response = await fetch('/api/ai/recovery-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: 'Ayo Balogun',
                    items: ['Premium Agbada set', 'Hand-crafted leather slides'],
                    tone: 'institutional_premium'
                })
            });
            const data = await response.json();
            if (data.email) {
                setPreviewingAI(data.email);
            }
        } catch (err) {
            console.error('AI Preview failed:', err);
            alert("Strategic orchestration failed. System integrity intact.");
        } finally {
            setGeneratingPreview(false);
        }
    };

    const handleSendTest = () => {
        alert("Institutional Test Email Mobilized! ✨");
        setPreviewingAI(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-amber-500 animate-pulse fill-amber-500" />
                    </div>
                </div>
                <p className="text-amber-500/60 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Growth Engine...</p>
            </div>
        );
    }

    return (
        <div className="animate-entrance space-y-8 pb-12">
            {/* Growth Header */}
            <div className="dh rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="beta-chip px-2 py-0.5 bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[9px] font-black">
                                <Zap size={10} className="fill-amber-500" /> GROWTH ORCHESTRATION
                            </span>
                            <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">Marketing Hub</h1>
                        <p className="text-white/40 text-sm font-medium">AI-driven acquisition and institutional retention engines.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="crystalCard rounded-3xl border border-border/50 overflow-hidden shadow-sh-sm">
                        <div className="p-6 border-b border-border bg-surface/30">
                            <h3 className="font-bold text-ink flex items-center gap-2">
                                <Activity size={16} className="text-amber-500" /> Active Automation Matrix
                            </h3>
                        </div>
                        <div className="divide-y divide-border">
                            {AUTOMATIONS.map((aut) => (
                                <div key={aut.id} className="p-6 hover:bg-surface/50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center border border-border group-hover:border-amber-500/30 transition-colors shadow-sm">
                                                <aut.icon size={24} className="text-secondary group-hover:text-amber-500 transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-ink mb-1">{aut.title}</h4>
                                                <p className="text-xs text-secondary font-medium leading-relaxed max-w-md">{aut.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 ml-16 md:ml-0">
                                            <button
                                                onClick={() => handlePreviewAI(aut.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black text-secondary hover:text-ink hover:bg-surface border border-transparent hover:border-border transition-all"
                                            >
                                                <Eye size={12} /> Preview AI
                                            </button>
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-xl border",
                                                aut.active ? "bg-emerald-500/5 border-emerald-500/10" : "bg-ghost/5 border-border/50 opacity-40"
                                            )}>
                                                {aut.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    aut.active ? "text-emerald-600" : "text-ghost"
                                                )}>{aut.active ? 'Active' : 'Paused'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="crystalCard p-8 rounded-3xl border border-amber-500/20 bg-amber-500/[0.02] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
                            <Zap size={120} />
                        </div>
                        <h3 className="text-lg font-black text-ink tracking-tight mb-2">Campaign Studio</h3>
                        <p className="text-xs text-secondary font-medium leading-relaxed mb-6">Deploy institutional-grade campaign bursts powered by Gemini 2.0. Personalized for every sovereign customer.</p>
                        <button className="w-full py-4 rounded-2xl bg-ink text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all" onClick={() => setShowStudio(true)}>
                            Initialize AI Burst
                        </button>
                    </div>

                    <div className="crystalCard p-6 rounded-3xl border border-border/50">
                        <h4 className="text-[10px] font-black text-ghost uppercase tracking-widest mb-4">Master Metrics</h4>
                        <div className="space-y-4">
                            {[
                                { lbl: 'AI Conversion', val: '24.2%', color: 'emerald' },
                                { lbl: 'Retention Velocity', val: '86%', color: 'blue' },
                                { lbl: 'Campaign ROI', val: '12.4x', color: 'amber' }
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-secondary">{m.lbl}</span>
                                    <span className={cn("font-mono text-xs font-black text-ink")}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Sovereign Preview Modal */}
            {previewingAI && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-fade">
                    <div className="absolute inset-0 bg-[#0D1B24]/90 backdrop-blur-2xl" onClick={() => setPreviewingAI(null)} />

                    <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        <div className="lg:col-span-3">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 border border-amber-500/30">
                                    <Zap size={20} className="fill-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">AI Recovery Strategist</h2>
                                    <p className="text-white/40 text-xs font-medium">Personalized institutional-grade retention flow.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Behavioral Analysis</label>
                                    <p className="text-white/70 text-xs leading-relaxed font-medium">Customer <strong>Ayo Balogun</strong> abandoned 2 items with total value of <strong>₦1,236,000.00</strong>. Gemini has orchestrated a professional return-to-cart strategy emphasizing institutional reliability.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Refine Prompt
                                    </button>
                                    <button
                                        className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                                        onClick={handleSendTest}
                                    >
                                        Execute Test Sent
                                    </button>
                                </div>
                                <button className="w-full text-white/40 text-[10px] font-bold hover:text-white transition-colors" onClick={() => setPreviewingAI(null)}>Close Strategic Overview</button>
                            </div>
                        </div>

                        {/* High-Fidelity Mobile Frame */}
                        <div className="lg:col-span-2 flex justify-center">
                            <div className="w-[300px] h-[600px] bg-black rounded-[50px] border-[8px] border-[#1C1C1E] shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col scale-90 md:scale-100">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[25px] bg-black rounded-b-2xl z-30" />
                                <div className="h-full bg-white flex flex-col">
                                    <div className="p-4 bg-surface/50 border-b border-border flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-ink" />
                                            <span className="text-[10px] font-black text-ink uppercase tracking-tighter">SOLO SME</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-ink font-medium">
                                        {previewingAI}
                                    </div>
                                    <div className="p-4 bg-white border-t border-border mt-auto">
                                        <div className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest text-center">
                                            Return to Cart
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {generatingPreview && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#0D1B24]/95 backdrop-blur-3xl">
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap size={24} className="text-amber-500 animate-pulse fill-amber-500" />
                            </div>
                        </div>
                        <div className="space-y-2 text-center">
                            <p className="text-white text-sm font-black tracking-widest uppercase">Orchestrating Retention Draft</p>
                            <p className="text-white/40 text-[10px] font-medium animate-pulse">Gemini 2.0 Flash is analyzing sovereign cart behavioral nodes...</p>
                        </div>
                    </div>
                </div>
            )}

            {showStudio && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-ink/90 backdrop-blur-xl" onClick={() => setShowStudio(false)} />
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl animate-entrance">
                        <CampaignStudio onClose={() => setShowStudio(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
