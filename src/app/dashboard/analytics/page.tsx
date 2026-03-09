"use client";

import { useState } from "react";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    MessageCircle,
    ArrowUpRight,
    BarChart2,
    Calendar,
} from "lucide-react";

// ─── Period selector ──────────────────────────────────────────────────────────
const PERIODS = ["7 days", "30 days", "90 days"] as const;
type Period = typeof PERIODS[number];

// ─── Metric cards ─────────────────────────────────────────────────────────────
const METRICS = [
    { label: "Total Revenue", value: "₦0", sub: "No sales yet", icon: TrendingUp, color: "#409EF2" },
    { label: "Total Orders", value: "0", sub: "No orders yet", icon: ShoppingBag, color: "#10B981" },
    { label: "Unique Customers", value: "0", sub: "No customers yet", icon: Users, color: "#F59E0B" },
    { label: "WhatsApp Enquiries", value: "0", sub: "Connect WhatsApp", icon: MessageCircle, color: "#25D366" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [period, setPeriod] = useState<Period>("7 days");

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-[#072435] text-xl font-bold">Analytics</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Track your store performance</p>
                </div>
                {/* Period selector */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    <Calendar size={13} className="text-gray-400 ml-2" />
                    {PERIODS.map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p
                                    ? "bg-[#409EF2] text-white shadow-sm"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {METRICS.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div
                            key={m.label}
                            className="bg-white rounded-xl border border-gray-100 p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${m.color}15` }}
                                >
                                    <Icon size={18} style={{ color: m.color }} />
                                </div>
                                <ArrowUpRight size={14} className="text-gray-200 mt-0.5" />
                            </div>
                            <p className="text-[#072435] text-2xl font-bold">{m.value}</p>
                            <p className="text-gray-400 text-xs mt-1">{m.label}</p>
                            <p className="text-gray-300 text-[11px] mt-1">{m.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── Revenue Chart placeholder ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[#072435] font-semibold text-[13px]">Revenue Over Time</h3>
                    <span className="text-gray-300 text-xs">{period}</span>
                </div>
                <div className="h-48 flex flex-col items-center justify-center gap-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <BarChart2 size={22} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No data yet</p>
                    <p className="text-gray-300 text-xs text-center max-w-[200px]">
                        Revenue chart will appear here once your first sale is recorded.
                    </p>
                </div>
            </div>

            {/* ── Bottom grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-[#072435] font-semibold text-[13px] mb-4">Top Products</h3>
                    <div className="flex flex-col items-center justify-center py-10 gap-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <ShoppingBag size={20} className="text-gray-300" />
                        <p className="text-gray-400 text-xs">Products will rank here once you have sales</p>
                    </div>
                </div>

                {/* Sales Channels */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="text-[#072435] font-semibold text-[13px] mb-4">Sales by Channel</h3>
                    <div className="space-y-3">
                        {/* WhatsApp */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                                <MessageCircle size={14} className="text-[#25D366]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-[#072435]">WhatsApp</span>
                                    <span className="text-xs text-gray-400">0 orders</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full">
                                    <div className="h-1.5 bg-[#25D366] rounded-full w-0" />
                                </div>
                            </div>
                        </div>

                        {/* Online Store */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#409EF2]/10 flex items-center justify-center">
                                <TrendingUp size={14} className="text-[#409EF2]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-[#072435]">Online Store</span>
                                    <span className="text-xs text-gray-400">0 orders</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full">
                                    <div className="h-1.5 bg-[#409EF2] rounded-full w-0" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-300 text-[11px] mt-4 text-center">
                        Channel breakdown appears once orders are recorded
                    </p>
                </div>

            </div>
        </div>
    );
}
