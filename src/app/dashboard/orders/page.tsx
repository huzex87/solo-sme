"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    MessageCircle,
    Globe,
    ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = "all" | "pending" | "processing" | "completed" | "cancelled";

interface Order {
    id: string;
    orderNumber: string;
    customer: string;
    phone: string;
    items: number;
    total: number;
    status: "pending" | "processing" | "completed" | "cancelled";
    channel: "whatsapp" | "store";
    createdAt: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [];

// ─── Config ───────────────────────────────────────────────────────────────────
const TABS: { label: string; value: OrderStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG = {
    pending: { label: "Pending", icon: Clock, className: "bg-amber-50 text-amber-600" },
    processing: { label: "Processing", icon: Loader2, className: "bg-blue-50 text-[#409EF2]" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
    cancelled: { label: "Cancelled", icon: XCircle, className: "bg-red-50 text-red-500" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("all");
    const [search, setSearch] = useState("");

    const filtered = MOCK_ORDERS.filter((o) => {
        const matchesTab = activeTab === "all" || o.status === activeTab;
        const matchesSearch =
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.orderNumber.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-[#072435] text-xl font-bold">Orders</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Track and manage customer orders</p>
                </div>
            </div>

            {/* ── Tabs + Search ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab.value
                                    ? "bg-[#409EF2] text-white"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                            {tab.value !== "all" && (
                                <span className={`ml-1.5 text-[10px] px-1 rounded-full ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                                    }`}>
                                    {MOCK_ORDERS.filter((o) => o.status === tab.value).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by customer or order number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:bg-white focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-400 text-[#072435]"
                    />
                </div>
            </div>

            {/* ── Orders list / Empty ── */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
                        <ShoppingBag size={26} className="text-gray-300" />
                    </div>
                    <p className="text-[#072435] font-semibold text-base">No orders yet</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs">
                        When customers place orders through your store or WhatsApp, they&apos;ll show up here.
                    </p>
                    <Link
                        href="/dashboard/whatsapp"
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#409EF2] bg-[#409EF2]/8 hover:bg-[#409EF2]/15 px-3 py-2 rounded-lg transition-colors"
                    >
                        <MessageCircle size={13} />
                        Set up WhatsApp AI to receive orders
                        <ArrowRight size={12} />
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                        <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order #</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Channel</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                        <div className="col-span-1" />
                    </div>

                    {filtered.map((order) => {
                        const status = STATUS_CONFIG[order.status];
                        const StatusIcon = status.icon;
                        return (
                            <Link
                                key={order.id}
                                href={`/dashboard/orders/${order.id}`}
                                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="col-span-3">
                                    <p className="text-[#072435] text-sm font-medium truncate">{order.customer}</p>
                                    <p className="text-gray-400 text-xs">{order.phone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 text-sm font-mono">{order.orderNumber}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[#072435] text-sm font-semibold">₦{order.total.toLocaleString()}</p>
                                    <p className="text-gray-400 text-xs">{order.items} item{order.items !== 1 ? "s" : ""}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${order.channel === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {order.channel === "whatsapp" ? <MessageCircle size={11} /> : <Globe size={11} />}
                                        {order.channel === "whatsapp" ? "WhatsApp" : "Store"}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${status.className}`}>
                                        <StatusIcon size={11} />
                                        {status.label}
                                    </span>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <ArrowRight size={13} className="text-gray-300" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
