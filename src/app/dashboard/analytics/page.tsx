"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    BarChart2,
    ArrowUpRight,
    Activity,
    Shield,
    Download,
    Zap,
    Loader2,
    Plus,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";

const METRICS = [
    { id: 'revenue', label: 'Total Revenue', value: '₦4,280,000.00', trend: '+12.5%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'customers', label: 'Active Customers', value: '1,240', trend: '+8.2%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'orders', label: 'Total Orders', value: '856', trend: '+15.1%', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'engagement', label: 'Customer Pulse', value: '4.8k', trend: '+2.4%', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
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
                    { name: "Raw Silk Kaftan", sales: 94, revenue: 564000 },
                    { name: "Leather Bag", sales: 56, revenue: 120000 },
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
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Synchronizing Performance Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between px-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-950 font-display">Insights</h1>
                    <p className="text-[13px] font-semibold text-slate-500 mt-0.5 tracking-tight">Business performance overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('csv')} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors shadow-soft-sm">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Modern Filter Suite */}
            <div className="px-4">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                    {['24 Hours', '7 Days', '30 Days', 'All Time'].map((t) => (
                        <button
                            key={t}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border",
                                t === '7 Days'
                                    ? "bg-slate-950 border-slate-900 text-white shadow-premium"
                                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-soft-sm"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Analytics - Chart Lift */}
            <div className="px-4">
                <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-premium group min-h-[400px] flex flex-col justify-between">
                    <div className="absolute inset-0 bg-mesh opacity-10 group-hover:opacity-20 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/10">Total Revenue</span>
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <TrendingUp size={14} />
                                +14.2%
                            </div>
                        </div>
                        <h2 className="text-5xl font-extrabold tracking-tighter font-display mb-2">
                            <span className="text-slate-500 font-medium mr-2 text-4xl">₦</span>
                            {stats.revenue.toLocaleString()}
                        </h2>
                        <p className="text-slate-400 text-sm font-semibold">vs ₦3,820,000 last week</p>
                    </div>

                    <div className="relative z-10 h-40 mt-8">
                        <svg className="w-full h-full opacity-50" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,80 Q50,75 100,85 T200,40 T300,60 T400,20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-primary"
                            />
                            <path
                                d="M0,80 Q50,75 100,85 T200,40 T300,60 T400,20 V100 H0 Z"
                                fill="url(#chartGradient)"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 px-4">
                {[
                    { label: "Orders", value: stats.orders, trend: "+12%", color: "text-blue-500" },
                    { label: "Customers", value: stats.customers, trend: "+5%", color: "text-indigo-500" },
                ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-extrabold text-slate-950 font-display">{item.value.toLocaleString()}</h4>
                            <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600")}>{item.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Channel Breakdown */}
            <div className="px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-extrabold text-slate-950 font-display">Channel Performance</h3>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs">
                            Live updates <Activity size={14} className="animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-600">WhatsApp AI Orders</span>
                                <span className="text-xs font-black text-slate-950">64%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '64%' }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-600">Web Storefront</span>
                                <span className="text-xs font-black text-slate-950">36%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: '36%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
                    <h3 className="text-lg font-extrabold text-slate-950 font-display mb-8">Top Products</h3>
                    <div className="space-y-6">
                        {stats.topProducts.map((product: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300">
                                    0{i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-extrabold text-slate-950 truncate">{product.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{product.sales} sales</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-950">₦{product.revenue.toLocaleString()}</div>
                                    <div className="text-[9px] font-extrabold text-emerald-500 uppercase">+12%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
