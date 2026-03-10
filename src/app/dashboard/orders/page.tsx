"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Search,
    Filter,
    MessageCircle,
    Globe,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type TabValue = "all" | "pending" | "paid";

const TABS: { label: string; value: TabValue }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Paid", value: "paid" },
];

const MOCK_ORDERS = [
    { id: "ORD-7214", customer: "Adeola Johnson", total: 13440, status: "paid", channel: "whatsapp", time: "10:24 AM" },
    { id: "ORD-7213", customer: "Musa Ibrahim", total: 45000, status: "pending", channel: "web", time: "09:45 AM" },
    { id: "ORD-7212", customer: "Chioma Okoro", total: 8500, status: "paid", channel: "whatsapp", time: "Yesterday" },
    { id: "ORD-7211", customer: "Fatima Yusuf", total: 12000, status: "paid", channel: "web", time: "Yesterday" },
];

export default function OrdersPage() {
    const [tab, setTab] = useState<TabValue>("all");
    const [search, setSearch] = useState("");

    const filteredOrders = MOCK_ORDERS.filter(o =>
        (tab === "all" || o.status === tab) &&
        (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-6 animate-entrance pb-32">
            {/* ── High-Fidelity Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-t1 text-xl font-extrabold tracking-tight font-display m-0">Orders</h2>
                    <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1">{MOCK_ORDERS.length} Transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sh-sm border border-border flex items-center justify-center text-t2 active:scale-95 transition-all">
                        <Search size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sh-sm border border-border flex items-center justify-center text-t2 active:scale-95 transition-all">
                        <Filter size={18} />
                    </div>
                </div>
            </div>

            {/* ── Segmented Control (Obsidian Style) ── */}
            <div className="bg-surface-2 p-1 rounded-2xl flex items-center">
                {TABS.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                            tab === t.value
                                ? "bg-white text-blue shadow-sh-sm"
                                : "text-t4 hover:text-t2"
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Orders List ── */}
            <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                    <div className="py-20 bg-white rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 rounded-3xl bg-surface mb-6 flex items-center justify-center text-t4">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-t1 text-lg font-bold mb-2">No orders found</h3>
                        <p className="text-t3 text-sm font-medium mb-8 leading-relaxed max-w-xs">
                            Orders from your online store and WhatsApp will appear here as they are received.
                        </p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-4 rounded-[24px] border border-border shadow-sh-sm flex items-center justify-between active:scale-[0.98] transition-all group relative">
                            <div className="flex items-center gap-4">
                                {/* Channel Icon */}
                                <div className={cn(
                                    "w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner",
                                    order.channel === 'whatsapp' ? "bg-green-dim text-green" : "bg-blue-dim text-blue"
                                )}>
                                    {order.channel === 'whatsapp' ? <MessageCircle size={20} /> : <Globe size={20} />}
                                </div>

                                <div>
                                    <h3 className="text-t1 text-[15px] font-extrabold tracking-tight mb-0.5">
                                        {order.customer}
                                    </h3>
                                    <p className="text-t3 text-[10px] font-black uppercase tracking-tighter">
                                        {order.id} · {order.time}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-t1 text-sm font-black font-mono">
                                    {formatCurrency(order.total)}
                                </p>
                                <div className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-1.5 border",
                                    order.status === 'paid'
                                        ? "bg-green/5 text-green border-green/10"
                                        : "bg-amber/5 text-amber border-amber/10"
                                )}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Interaction Link */}
                            <Link href={`/dashboard/orders/${order.id}`} className="absolute inset-0 rounded-[24px]" />
                        </div>
                    ))
                )}
            </div>

            {/* ── WhatsApp AI Summary community ── */}
            <div className="bg-ink p-6 rounded-[28px] shadow-sh-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-green/5 group-hover:text-green/10 transition-colors">
                    <MessageCircle size={100} />
                </div>
                <div className="relative z-10">
                    <h4 className="text-white text-sm font-bold tracking-tight mb-2">WhatsApp Order Assistant</h4>
                    <p className="text-white/40 text-[10px] font-medium leading-relaxed mb-4 uppercase tracking-wider">
                        AI recently handled 3 orders while you were away.
                    </p>
                    <button className="text-green text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        View AI Activity <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
