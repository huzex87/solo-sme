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
            {/* High-Fidelity Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="beta-chip px-2 py-0.5"><BarChart2 size={10} /> INSTITUTIONAL INSIGHTS</span>
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-ink">Performance Hub</h1>
                    <p className="text-secondary text-sm font-medium mt-1">Real-time business orchestration and precision metrics.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-card/50 border border-border rounded-xl p-1 shadow-sm backdrop-blur-md">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting !== null}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-ink hover:bg-surface transition-all disabled:opacity-50"
                        >
                            {exporting === 'csv' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            Export CSV
                        </button>
                        <div className="w-[1px] h-4 bg-border/60 mx-1" />
                        <button
                            onClick={() => handleExport('json')}
                            disabled={exporting !== null}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-ink hover:bg-surface transition-all disabled:opacity-50"
                        >
                            {exporting === 'json' ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                            Institutional JSON
                        </button>
                    </div>
                    <button className="btn btn-primary shadow-lg shadow-primary/20">
                        <Zap size={14} /> Advanced Query
                    </button>
                </div>
            </div>

            {/* Performance Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {METRICS.map((metric) => (
                    <div key={metric.id} className="crystalCard group relative p-6 overflow-hidden rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <metric.icon size={48} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: `${metric.color === 'blue' ? 'rgba(59,130,246,0.1)' : metric.color === 'indigo' ? 'rgba(99,102,241,0.1)' : metric.color === 'emerald' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'}` }}
                                >
                                    <metric.icon size={18} className={cn(
                                        metric.color === 'blue' ? 'text-blue-500' :
                                            metric.color === 'indigo' ? 'text-indigo-500' :
                                                metric.color === 'emerald' ? 'text-emerald-500' :
                                                    'text-rose-500'
                                    )} />
                                </div>
                                <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    {metric.trend}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-1">{metric.label}</p>
                            <h3 className="text-2xl font-black text-ink tracking-tight">{metric.value}</h3>
                        </div>
                        <div
                            className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-700"
                            style={{ background: metric.glow }}
                        />
                    </div>
                ))}
            </div>

            {/* Main Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 crystalCard overflow-hidden rounded-2xl p-0 border border-border/50">
                    <div className="p-6 border-bottom border-border flex justify-between items-center">
                        <h3 className="font-bold text-ink flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary" /> Performance Vector
                        </h3>
                        <div className="flex gap-2">
                            {['7D', '30D', '90D', 'ALL'].map(t => (
                                <button key={t} className={cn(
                                    "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                                    t === '30D' ? "bg-primary text-white" : "bg-surface hover:bg-border text-secondary"
                                )}>{t}</button>
                            ))}
                        </div>
                    </div>
                    {/* High-Fidelity Visualization Placeholder */}
                    <div className="h-[340px] w-full bg-[#0D1B24] relative flex items-center justify-center group overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                        {/* Simulated High-Fidelity Chart */}
                        <svg className="w-full h-full px-12 py-16" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="50%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path
                                d="M0,150 C50,140 100,160 150,120 S250,40 300,80 S400,20 450,60 S550,120 600,100 S750,40 800,60"
                                fill="none"
                                stroke="url(#lineGrad)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                filter="url(#glow)"
                                className="animate-pulse"
                            />
                            <path
                                d="M0,150 C50,140 100,160 150,120 S250,40 300,80 S400,20 450,60 S550,120 600,100 S750,40 800,60 V200 H0 Z"
                                fill="url(#lineGrad)"
                                fillOpacity="0.05"
                            />
                        </svg>
                        <div className="flex justify-between mt-4 text-t4 text-[8px] font-bold uppercase tracking-widest px-1">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                            <span>Week 4</span>
                        </div>
                    </div>
                </div>

                {/* ── Top Products Simulation community ── */}
                <div className="bg-white rounded-[28px] border border-border shadow-sh-sm overflow-hidden">
                    <div className="p-5 border-b border-border">
                        <h3 className="text-t1 text-sm font-bold tracking-tight uppercase">Best Selling Items</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {[
                            { name: "Kandur Gown", sales: 124, price: 12500 },
                            { name: "Luxury Silk Abaya", sales: 84, price: 45000 },
                            { name: "Embroidered Pashmina", sales: 72, price: 8500 },
                        ].map((item, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-t4 font-extrabold text-xs">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-t1 text-sm font-bold tracking-tight">{item.name}</p>
                                        <p className="text-t3 text-[10px] font-medium">{item.sales} Units Sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-t1 text-sm font-black font-mono">{formatCurrency(item.sales * item.price)}</p>
                                    <p className="text-blue text-[9px] font-extrabold uppercase tracking-widest">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-surface/50 flex items-center justify-center gap-4">
                        <button
                            className="text-blue text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                            onClick={() => handleExport('csv')}
                            disabled={exporting !== null}
                        >
                            {exporting === 'csv' ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                            Export CSV
                        </button>
                        <div className="w-[1px] h-3 bg-border"></div>
                        <button
                            className="text-blue text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                            onClick={() => handleExport('json')}
                            disabled={exporting !== null}
                        >
                            {exporting === 'json' ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                            Export JSON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
