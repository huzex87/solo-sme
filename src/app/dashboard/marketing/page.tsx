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
    Loader2,
    ChevronRight,
    ArrowUpRight,
    Search,
    Plus
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";
import { getBaseUrl } from "@/lib/baseUrl";
import { AnalyticsService, AnalyticsSummary } from "@/services/analyticsService";
import CampaignStudio from "../../../components/dashboard/marketing/CampaignStudio";


const AUTOMATIONS = [
    {
        id: 'cart',
        title: 'Abandoned Cart Recovery',
        desc: 'Send automated reminders to customers who leave items in their cart.',
        icon: ShoppingCart,
        active: true,
        stats: '2.4% conv.'
    },
    {
        id: 'welcome',
        title: 'Welcome Email Sequence',
        desc: 'Greet new customers and offer an initial discount to drive first sales.',
        icon: Users,
        active: true,
        stats: '15% open'
    },
    {
        id: 'winback',
        title: 'Customer Win-back',
        desc: 'Re-engage inactive customers with special offers and updates.',
        icon: Activity,
        active: false,
        stats: '—'
    },
];

export default function MarketingPage() {
    const { tenantId, tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [showStudio, setShowStudio] = useState(false);
    const [previewingAI, setPreviewingAI] = useState<string | null>(null);
    const [generatingPreview, setGeneratingPreview] = useState(false);

    useEffect(() => {
        async function fetchMarketingData() {
            if (!tenantId) return;
            try {
                const analytics = await AnalyticsService.getDashboardStats(tenantId);
                setStats(analytics);
            } catch (error) {
                console.error('Failed to fetch marketing stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMarketingData();
    }, [tenantId]);

    const handlePreviewAI = async (id: string) => {
        // ... (existing logic)
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Loading Marketing Tools...</p>
            </div>
        );
    }

    const marketingStats = [
        {
            label: 'AI Conversion',
            value: stats?.orderCount > 0 ? `${((stats.channelBreakdown?.find((c: any) => c.channel === 'whatsapp')?.orders || 0) / stats.orderCount * 100).toFixed(1)}%` : '0%',
            trend: stats?.comparison?.ordersDelta >= 0 ? `+${stats.comparison.ordersDelta.toFixed(1)}%` : `${stats.comparison?.ordersDelta.toFixed(1)}%`,
            icon: Target
        },
        {
            label: 'Retention Rate',
            value: `${(stats?.customerRetentionRate || 0).toFixed(1)}%`,
            trend: stats?.comparison?.visitorsDelta >= 0 ? `+${stats.comparison.visitorsDelta.toFixed(1)}%` : `${stats.comparison?.visitorsDelta.toFixed(1)}%`,
            icon: Activity
        },
        {
            label: 'Campaign ROI',
            // Approximating ROI as (WhatsApp Revenue / Total Revenue) * 10 
            value: stats?.totalRevenue > 0 ? `${((stats.channelBreakdown?.find((c: any) => c.channel === 'whatsapp')?.revenue || 0) / stats.totalRevenue * 10).toFixed(1)}x` : '0x',
            trend: stats?.comparison?.revenueDelta >= 0 ? `+${stats.comparison.revenueDelta.toFixed(1)}%` : `${stats.comparison?.revenueDelta.toFixed(1)}%`,
            icon: TrendingUp
        },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
                    <p className="text-slate-500 text-sm mt-1">Grow your business with AI-powered marketing and automation.</p>
                </div>
                <button
                    onClick={() => setShowStudio(true)}
                    className="btn btn-primary px-6 py-2.5 rounded-xl shadow-sm self-start flex items-center gap-2"
                >
                    <Plus size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Create Campaign</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketingStats.map((stat, i) => (
                    <div key={i} className="card p-6 bg-white border border-slate-100 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            <span className={cn(
                                "text-[10px] font-bold bg-opacity-10 px-1.5 py-0.5 rounded mt-2 inline-block",
                                stat.trend.startsWith('+') ? "text-emerald-500 bg-emerald-500" : "text-rose-500 bg-rose-500"
                            )}>
                                {stat.trend} this period
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <stat.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Automations */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Automations</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {AUTOMATIONS.map((aut) => (
                                <div key={aut.id} className="p-6 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                                <aut.icon size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-slate-900">{aut.title}</h4>
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{aut.stats}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{aut.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handlePreviewAI(aut.id)}
                                                className="px-4 py-2 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all uppercase tracking-wider"
                                            >
                                                Preview AI
                                            </button>
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                                                aut.active ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                                            )}>
                                                {aut.active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                {aut.active ? 'Active' : 'Paused'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Studio Call-out */}
                <div className="space-y-6">
                    <div className="card p-6 bg-ink border-none shadow-xl relative overflow-hidden group">
                        <div className="relative z-10 text-white">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                                <Zap size={20} className="text-amber-400 fill-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight mb-2">Campaign Studio</h3>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                                Launch high-impact marketing campaigns powered by AI. Personalized messages for your entire customer base.
                            </p>
                            <button
                                onClick={() => setShowStudio(true)}
                                className="w-full py-3.5 rounded-xl bg-white text-slate-900 font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Open AI Studio
                                <ArrowUpRight size={14} />
                            </button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                    </div>

                    <div className="card p-6 bg-white border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Marketing Channels</h4>
                        <div className="space-y-3">
                            {[
                                { lbl: 'WhatsApp Business', val: 'Connected', active: true },
                                { lbl: 'Email Storefront', val: 'Connected', active: true },
                                { lbl: 'SMS Blasts', val: 'Setup Required', active: false }
                            ].map((m, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <span className="text-[11px] font-bold text-slate-600">{m.lbl}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold",
                                        m.active ? "text-primary" : "text-slate-300"
                                    )}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Preview Modal */}
            {previewingAI && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-fade bg-slate-900/40 backdrop-blur-md">
                    <div className="absolute inset-0" onClick={() => setPreviewingAI(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 h-[650px]">
                        <div className="lg:col-span-3 p-10 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center text-white">
                                    <Zap size={22} className="fill-amber-400 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">AI Preview</h2>
                                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Draft Campaign Orchestration</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Behavioral Analysis</label>
                                    <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                                        The AI has generated this message based on customer behavior. It focuses on value and helpfulness to encourage a return to store.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                        Refine Prompt
                                    </button>
                                    <button
                                        className="flex-1 py-3.5 rounded-xl bg-ink text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
                                        onClick={() => setPreviewingAI(null)}
                                    >
                                        Send Test Email
                                    </button>
                                </div>
                            </div>
                            <button className="text-slate-400 text-[11px] font-bold hover:text-slate-900 transition-colors mt-6 uppercase tracking-widest" onClick={() => setPreviewingAI(null)}>Close Preview</button>
                        </div>

                        {/* Mobile Preview */}
                        <div className="lg:col-span-2 bg-slate-50 flex items-center justify-center p-8">
                            <div className="w-full max-w-[260px] aspect-[9/18.5] bg-black rounded-[40px] border-[6px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-xl z-10" />
                                <div className="flex-1 bg-white p-6 overflow-y-auto pt-8 custom-scrollbar">
                                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                                        <div className="w-6 h-6 rounded-full bg-ink" />
                                        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">SOLO SME</span>
                                    </div>
                                    <div className="text-[11px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                                        {previewingAI}
                                    </div>
                                    <div className="mt-8">
                                        <div className="w-full py-2.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest text-center shadow-sm">
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
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-white/80 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-slate-100 border-t-primary rounded-full animate-spin" />
                        <p className="text-slate-900 text-sm font-bold uppercase tracking-widest">Generating AI Preview...</p>
                    </div>
                </div>
            )}

            {showStudio && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md">
                    <div className="absolute inset-0" onClick={() => setShowStudio(false)} />
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl animate-entrance">
                        <CampaignStudio onClose={() => setShowStudio(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
