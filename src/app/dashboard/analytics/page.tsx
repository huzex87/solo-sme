"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    MessageCircle,
    BarChart2,
    ArrowRight,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Loader2,
    Download,
    Zap,
    Activity,
    Shield
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";

const METRICS = [
    { id: 'revenue', label: 'Institutional Revenue', value: '₦4,280,000.00', trend: '+12.5%', icon: TrendingUp, color: 'blue', glow: 'rgba(59, 130, 246, 0.5)' },
    { id: 'customers', label: 'Verified Sovereigns', value: '1,240', trend: '+8.2%', icon: Users, color: 'indigo', glow: 'rgba(99, 102, 241, 0.5)' },
    { id: 'orders', label: 'Executed Orders', value: '856', trend: '+15.1%', icon: ShoppingBag, color: 'emerald', glow: 'rgba(16, 185, 129, 0.5)' },
    { id: 'engagement', label: 'Platform Pulse', value: '4.8k', trend: '+2.4%', icon: Activity, color: 'rose', glow: 'rgba(244, 63, 94, 0.5)' },
];

export default function AnalyticsPage() {
    const { tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<null | 'csv' | 'json'>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStats({
                revenue: 4280000,
                orders: 856,
                customers: 1240,
                avgOrderValue: 5000,
                topProducts: [
                    { name: "Premium Agbada set", sales: 142, revenue: 852000 },
                    { name: "Hand-crafted leather slides", sales: 128, revenue: 384000 },
                    { name: "Raw Silk Kaftan", sales: 94, revenue: 564000 }
                ]
            });
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleExport = async (format: 'csv' | 'json') => {
        setExporting(format);
        try {
            const { AnalyticsService } = await import('@/services/analyticsService');
            let blob;
            if (format === 'csv') {
                blob = await AnalyticsService.exportToCSV(stats, tenant?.id || 'anonymous');
            } else {
                blob = await AnalyticsService.exportToJSON(stats, tenant?.id || 'anonymous');
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOLO_Performance_Report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export failed:', err);
            alert("Report mobilization failed. Please verify system integrity.");
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart2 size={24} className="text-primary animate-pulse" />
                    </div>
                </div>
                <p className="text-secondary font-mono text-sm tracking-widest uppercase animate-pulse">Synchronizing performance data...</p>
            </div>
        );
    }

    return (
        <div className="animate-entrance space-y-8 pb-12">
            {/* High-Fidelity Professional Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <span className="beta-chip px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                            <BarChart2 size={12} className="mr-1.5" /> Institutional Insights
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h1 className="text-[34px] font-black tracking-tighter text-ink leading-tight">Performance Vector</h1>
                    <p className="text-t3 text-[15px] font-medium mt-2 leading-relaxed opacity-80">Real-time business orchestration and precision metrics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sh-sm">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting !== null}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-t2 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            {exporting === 'csv' ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                            CSV
                        </button>
                        <div className="w-px h-4 bg-slate-100 mx-1.5" />
                        <button
                            onClick={() => handleExport('json')}
                            disabled={exporting !== null}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-t2 hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            {exporting === 'json' ? <Loader2 size={12} className="animate-spin" /> : <Shield size={14} />}
                            Ledger JSON
                        </button>
                    </div>
                    <button className="btn btn-primary px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98]">
                        <Zap size={16} /> Advanced Query
                    </button>
                </div>
            </div>

            {/* Metric Grid — Crystalline Pulse Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS.map((metric) => (
                    <div key={metric.id} className="crystalCard group relative p-6 overflow-hidden border-slate-100/50 hover:border-primary/20">
                        <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                            <metric.icon size={64} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                                <div
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white shadow-sh-sm"
                                    style={{ backgroundColor: `${metric.color === 'blue' ? 'rgba(59,130,246,0.1)' : metric.color === 'indigo' ? 'rgba(99,102,241,0.1)' : metric.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'}` }}
                                >
                                    <metric.icon size={20} className={cn(
                                        metric.color === 'blue' ? 'text-blue-500' :
                                            metric.color === 'indigo' ? 'text-indigo-500' :
                                                metric.color === 'emerald' ? 'text-emerald-500' :
                                                    'text-rose-500'
                                    )} />
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50 text-[10px] font-black font-mono">
                                    {metric.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-t3 uppercase tracking-[0.2em] mb-1.5 opacity-80">{metric.label}</p>
                            <h3 className="text-[26px] font-extrabold text-ink tracking-tighter font-mono">{metric.value}</h3>
                        </div>
                        <div
                            className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full blur-[45px] opacity-0 group-hover:opacity-30 transition-opacity duration-1000"
                            style={{ background: metric.glow }}
                        />
                    </div>
                ))}
            </div>

            {/* Visualization Core Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 crystalCard overflow-hidden p-0 border-slate-100/60 shadow-sh-sm">
                    <div className="p-7 flex justify-between items-center border-b border-slate-50">
                        <div>
                            <h3 className="font-bold text-ink text-lg tracking-tight flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary" /> Convergence Flow
                            </h3>
                            <p className="text-t3 text-[11px] font-black uppercase tracking-widest mt-1 opacity-60">Transactional Vector Velocity</p>
                        </div>
                        <div className="flex p-1 bg-surface-2 rounded-xl gap-1">
                            {['7D', '30D', '90D', 'ALL'].map(t => (
                                <button key={t} className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                    t === '30D' ? "bg-white text-ink shadow-sm" : "text-t3 hover:text-t1"
                                )}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[360px] w-full bg-[#072435] relative flex items-center justify-center overflow-hidden">
                        {/* High-Fidelity Interaction Layer */}
                        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                        <svg className="w-full h-full px-12 py-12" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="var(--sovereign-md)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--sovereign-md)" stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#409EF2" />
                                    <stop offset="50%" stopColor="#0F766E" />
                                    <stop offset="100%" stopColor="#14B8A6" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,150 C50,145 100,170 150,130 S250,50 300,90 S400,30 450,70 S550,135 600,110 S750,55 800,75"
                                fill="none"
                                stroke="url(#pathGrad)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="animate-pulse"
                            />
                            <path
                                d="M0,150 C50,145 100,170 150,130 S250,50 300,90 S400,30 450,70 S550,135 600,110 S750,55 800,75 V200 H0 Z"
                                fill="url(#chartGrad)"
                            />
                        </svg>

                        <div className="absolute bottom-6 left-12 right-12 flex justify-between items-center">
                            {['Ordnance 1', 'Ordnance 2', 'Ordnance 3', 'Ordnance 4'].map(p => (
                                <span key={p} className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{p}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Assets — Modular High-Fidelity */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sh-sm overflow-hidden flex flex-col">
                    <div className="p-7 border-b border-slate-50">
                        <h3 className="text-ink text-lg font-bold tracking-tighter">High-Yield Assets</h3>
                        <p className="text-t3 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Revenue Concentration</p>
                    </div>

                    <div className="divide-y divide-slate-50 flex-1">
                        {[
                            { name: "Kandur Gown", sales: 124, price: 12500, trend: '+15%' },
                            { name: "Silk Abaya", sales: 84, price: 45000, trend: '+8%' },
                            { name: "Pashmina", sales: 72, price: 8500, trend: '+22%' },
                            { name: "Leather Slides", sales: 56, price: 12000, trend: '+12%' },
                        ].map((item, i) => (
                            <div key={i} className="px-7 py-5 flex items-center justify-between group hover:bg-slate-50 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-surface-2 flex items-center justify-center text-t4 font-extrabold text-[11px] group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-slate-100">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-ink text-sm font-bold tracking-tight">{item.name}</p>
                                        <p className="text-t3 text-[10px] font-bold uppercase tracking-widest opacity-70">{item.sales} Executed Node Units</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-ink text-sm font-black font-mono tracking-tighter">₦{(item.sales * item.price).toLocaleString()}</p>
                                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">{item.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-slate-50/50 mt-auto border-t border-slate-100 flex items-center justify-between">
                        <p className="text-t3 text-[9px] font-black uppercase tracking-widest">Global Export Suite</p>
                        <div className="flex gap-4">
                            <button onClick={() => handleExport('csv')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline active:scale-95 transition-all">CSV</button>
                            <span className="w-px h-3 bg-slate-200" />
                            <button onClick={() => handleExport('json')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline active:scale-95 transition-all">JSON</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
