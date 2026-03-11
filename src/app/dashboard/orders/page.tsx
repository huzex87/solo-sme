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
import { cn } from "@/lib/utils";

type OrderStatus = "all" | "pending" | "processing" | "delivered" | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  channel: "whatsapp" | "store";
  createdAt: string;
}

// Replace with: supabase.from("orders").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false })
const MOCK_ORDERS: Order[] = [];

const TABS: { label: string; value: OrderStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, class: "bg-amber-50 text-amber-600" },
  processing: { label: "Processing", icon: Loader2, class: "bg-blue-50 text-[#409EF2]" },
  delivered: { label: "Delivered", icon: CheckCircle2, class: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "bg-red-50 text-red-500" },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 animate-entrance">

      {/* Header — Professional Ledger */}
      <div className="px-1">
        <h2 className="text-ink text-2xl font-bold tracking-tighter">Fulfillment Ledger</h2>
        <p className="text-t3 text-xs font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">Orchestration & Log-lines</p>
      </div>

      {/* Filter Suite — Clean & Minimal */}
      <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100 p-5 space-y-5 shadow-sh-sm">
        {/* Tabs — Modern Pill Style */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const count = tab.value === "all" ? MOCK_ORDERS.length : MOCK_ORDERS.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 shrink-0 transition-all border",
                  activeTab === tab.value
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white border-slate-100 text-t3 hover:text-t1 hover:border-slate-200"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-black",
                    activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-50 text-t3"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Search Input — Minimalist Search */}
        <div className="relative group max-w-3xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-t4 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search order ID or sovereign customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder-t4 text-t1 font-medium"
          />
        </div>
      </div>

      {/* Empty State — Premium Minimalist */}
      {filtered.length === 0 && (
        <div className="crystalCard border-none flex flex-col items-center justify-center py-24 px-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-700 ease-out glass-halo">
              <ShoppingBag size={28} className="text-primary" />
            </div>
            <h3 className="text-ink font-bold text-lg tracking-tight mb-2">Ledger is empty</h3>
            <p className="text-t3 text-sm font-medium mt-2 max-w-xs mx-auto leading-relaxed mb-8 opacity-80">
              Transaction log-lines will propagate here as customers engage through your digital nodes.
            </p>
            <Link
              href="/dashboard/whatsapp"
              className="btn btn-outline border-slate-200 text-t2 px-6 py-3 rounded-2xl hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sh-sm"
            >
              <MessageCircle size={14} />
              Provision WhatsApp AI
            </Link>
          </div>
        </div>
      )}

      {/* Orders Grid — Crystalline Log-lines */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((order) => {
            const s = STATUS_CONFIG[order.status];
            const StatusIcon = s.icon;
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="crystalCard p-5 group flex items-center justify-between hover:shadow-sh-xl hover:bg-white transition-all duration-300 border-slate-100/50"
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center font-mono font-bold text-[11px] text-t3 shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors border border-slate-100 shadow-inner">
                    #{order.id.slice(0, 4)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-ink text-sm font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{order.customer}</p>
                    <div className="flex items-center gap-2.5">
                      <span className="text-t4 text-[11px] font-medium">{order.createdAt}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        order.channel === "whatsapp" ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-blue-50 text-blue border-blue-100/50"
                      )}>
                        {order.channel === "whatsapp" ? <MessageCircle size={10} /> : <Globe size={10} />}
                        {order.channel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 lg:gap-12">
                  <div className="hidden md:block text-right">
                    <p className="text-ink text-[16px] font-extrabold font-mono tracking-tighter">₦{order.total.toLocaleString()}</p>
                    <p className="text-t4 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">{order.items} Node items</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border",
                      s.class,
                      "border-transparent"
                    )}>
                      <StatusIcon size={12} className="animate-pulse" />
                      {s.label}
                    </span>
                    <ArrowRight size={16} className="text-t4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
