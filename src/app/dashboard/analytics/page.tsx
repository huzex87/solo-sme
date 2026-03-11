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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor your business performance and growth vectors.</p>
                </div>
                <div className="flex items-center gap-3 self-start">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <button
                            onClick={() => handleExport('csv')}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider flex items-center gap-1.5"
                        >
                            <Download size={14} />
                            CSV
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-1" />
                        <button
                            onClick={() => handleExport('json')}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider flex items-center gap-1.5"
                        >
                            <Shield size={14} />
                            JSON
                        </button>
                    </div>
                    <button className="btn btn-primary px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
                        <Zap size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Advanced View</span>
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {METRICS.map((metric) => (
                    <div key={metric.id} className="card p-6 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-2 inline-block">
                                {metric.trend} this month
                            </span>
                        </div>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.bg, metric.color)}>
                            <metric.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Revenue Growth</h3>
                            <div className="flex gap-2">
                                {['7D', '30D', '90D'].map(t => (
                                    <button key={t} className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        t === '30D' ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"
                                    )}>{t}</button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[320px] bg-slate-50/50 p-8 relative flex items-center justify-center">
                            {/* Abstract Chart UI */}
                            <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                                <path
                                    d="M0,150 C50,145 100,170 150,130 S250,50 300,90 S400,30 450,70 S550,135 600,110 S750,55 800,75"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-primary opacity-20"
                                />
                                <path
                                    d="M0,150 C50,145 100,170 150,130 S250,50 300,90 S400,30 450,70 S550,135 600,110 S750,55 800,75 V200 H0 Z"
                                    className="fill-primary/5"
                                />
                                <path
                                    d="M0,150 C50,145 100,170 150,130 S250,50 300,90 S400,30 450,70 S550,135 600,110 S750,55 800,75"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray="800"
                                    strokeDashoffset="0"
                                    className="text-primary animate-draw"
                                />
                            </svg>
                            <div className="absolute inset-x-8 bottom-4 flex justify-between text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Performance</h3>
                    </div>
                    <div className="divide-y divide-slate-50 flex-1">
                        {stats.topProducts.map((item: any, i: number) => (
                            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{item.sales} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-900">₦{item.revenue.toLocaleString()}</p>
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">+12%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button className="w-full py-2.5 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-white transition-all">
                            Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
