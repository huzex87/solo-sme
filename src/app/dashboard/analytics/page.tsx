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
    Loader2
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";

const METRICS = [
    { label: "Total Sales", value: "₦1.42M", delta: "+12.5%", trending: "up", icon: TrendingUp },
    { label: "Total Orders", value: "542", delta: "+3.2%", trending: "up", icon: ShoppingBag },
    { label: "Store Visits", value: "12,402", delta: "-0.8%", trending: "down", icon: Users },
    { label: "WA Sessions", value: "842", delta: "+24.1%", trending: "up", icon: MessageCircle },
];

export default function AnalyticsPage() {
    const { tenantId } = useTenant();
    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (type: 'csv' | 'json') => {
        if (!tenantId) return;
        setExporting(type);
        try {
            const { AnalyticsService } = await import("@/services/analyticsService");
            const blob = type === 'csv'
                ? await AnalyticsService.exportToCSV(tenantId)
                : await AnalyticsService.exportToJSON(tenantId);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOLO_Performance_Report_${new Date().toISOString().split('T')[0]}.${type}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export failed:', err);
            alert("Export failed. Please try again.");
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="flex flex-col min-h-full -mt-[clamp(12px,3vw,32px)] -mx-[clamp(12px,3vw,32px)] overflow-x-hidden">
            {/* ── High-Fidelity Header ── */}
            <div className="dh">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                            Insights & Reports
                        </p>
                        <h2 className="text-white text-lg font-extrabold tracking-tight font-display m-0">
                            Performance Hub
                        </h2>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <Calendar size={14} className="text-white/40" />
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Last 30 Days</span>
                    </div>
                </div>

                {/* ── Revenue Metric (Glass) ── */}
                <div className="crystalCard p-6 rounded-[28px] shadow-2xl relative overflow-hidden group">
                    <p className="text-t3 text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Gross Revenue
                    </p>
                    <div className="flex items-end gap-2 mb-4">
                        <h1 className="text-t1 text-3xl font-extrabold tracking-tight font-mono m-0">
                            ₦1,420,000.00
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg text-[10px] bg-green/10 text-green font-bold flex items-center gap-1">
                            <ArrowUpRight size={10} /> 12.5%
                        </div>
                        <span className="text-t4 text-[11px] font-medium tracking-tight">vs previous 30 days</span>
                    </div>
                </div>
            </div>

            {/* ── Main Analytics Body ── */}
            <div className="px-5 -mt-6 relative z-10 pb-32">
                {/* ── Metric Grid ── */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {METRICS.map((m) => {
                        const Icon = m.icon;
                        return (
                            <div key={m.label} className="bg-white p-4 rounded-[24px] border border-border shadow-sh-sm flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-t4">
                                        <Icon size={16} />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black tracking-tighter",
                                        m.trending === 'up' ? "text-green" : "text-red"
                                    )}>
                                        {m.delta}
                                    </span>
                                </div>
                                <p className="text-t1 text-lg font-extrabold font-mono tracking-tighter m-0">{m.value}</p>
                                <p className="text-t3 text-[9px] font-bold uppercase tracking-widest">{m.label}</p>
                            </div>
                        )
                    })}
                </div>

                {/* ── High-Fidelity Chart Simulation ── */}
                <div className="bg-white p-5 rounded-[28px] border border-border shadow-sh-sm mb-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-t1 text-sm font-bold tracking-tight uppercase">Revenue Flow</h3>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue"></span>
                                <span className="text-t4 text-[9px] font-bold uppercase tracking-widest">This Period</span>
                            </div>
                        </div>
                    </div>

                    {/* Simulated SVG Graph for premium look */}
                    <div className="h-32 w-full relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--blue)" stopOpacity="0.3" />
                                    <stop offset="95%" stopColor="var(--blue)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20 V100 H0 Z"
                                fill="url(#chartGradient)"
                            />
                            <path
                                d="M0,80 Q50,60 100,70 T200,40 T300,50 T400,20"
                                fill="none"
                                stroke="var(--blue)"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                            {/* Points */}
                            <circle cx="100" cy="70" r="3" fill="var(--blue)" />
                            <circle cx="200" cy="40" r="3" fill="var(--blue)" />
                            <circle cx="400" cy="20" r="3" fill="var(--blue)" />
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
