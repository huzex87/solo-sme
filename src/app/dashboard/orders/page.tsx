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

// Replace with: supabase.from("orders").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false })
const MOCK_ORDERS: Order[] = [];

const TABS: { label: string; value: OrderStatus }[] = [
  { label: "All",        value: "all"        },
  { label: "Pending",    value: "pending"    },
  { label: "Processing", value: "processing" },
  { label: "Completed",  value: "completed"  },
  { label: "Cancelled",  value: "cancelled"  },
];

const STATUS_CONFIG = {
  pending:    { label: "Pending",    icon: Clock,         class: "bg-amber-50 text-amber-600"   },
  processing: { label: "Processing", icon: Loader2,       class: "bg-blue-50 text-[#409EF2]"    },
  completed:  { label: "Completed",  icon: CheckCircle2,  class: "bg-emerald-50 text-emerald-600"},
  cancelled:  { label: "Cancelled",  icon: XCircle,       class: "bg-red-50 text-red-500"       },
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
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-[#072435] text-xl font-bold tracking-tight">Orders</h2>
        <p className="text-gray-400 text-sm mt-0.5">Track and manage customer orders</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map((tab) => {
            const count = tab.value === "all" ? MOCK_ORDERS.length : MOCK_ORDERS.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={[
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all",
                  activeTab === tab.value
                    ? "bg-[#409EF2] text-white shadow-sm shadow-[#409EF2]/25"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {tab.label}
                {tab.value !== "all" && count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name or order number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:bg-white focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-400 text-[#072435]"
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
            <ShoppingBag size={24} className="text-gray-300" />
          </div>
          <p className="text-[#072435] font-bold text-base">No orders yet</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
            When customers place orders through your store or WhatsApp, they'll appear here.
          </p>
          <Link
            href="/dashboard/whatsapp"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#409EF2] bg-[#409EF2]/8 hover:bg-[#409EF2]/14 px-3 py-2 rounded-lg transition-colors"
          >
            <MessageCircle size={12} />
            Set up WhatsApp AI to receive orders
            <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* Orders list */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <div className="col-span-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order #</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Channel</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
            <div className="col-span-1" />
          </div>

          {filtered.map((order) => {
            const s = STATUS_CONFIG[order.status];
            const StatusIcon = s.icon;
            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors"
              >
                {/* Mobile layout */}
                <div className="flex items-center justify-between sm:hidden">
                  <div>
                    <p className="text-[#072435] text-sm font-bold">{order.customer}</p>
                    <p className="text-gray-400 text-xs font-mono mt-0.5">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#072435] text-sm font-bold">₦{order.total.toLocaleString()}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${s.class}`}>
                      <StatusIcon size={10} />{s.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:hidden">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${order.channel === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-gray-100 text-gray-500"}`}>
                    {order.channel === "whatsapp" ? <MessageCircle size={10} /> : <Globe size={10} />}
                    {order.channel === "whatsapp" ? "WhatsApp" : "Store"}
                  </span>
                  <span className="text-gray-400 text-xs">{order.items} item{order.items !== 1 ? "s" : ""}</span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-gray-400 text-xs">{order.createdAt}</span>
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:block col-span-3">
                  <p className="text-[#072435] text-sm font-semibold truncate">{order.customer}</p>
                  <p className="text-gray-400 text-xs">{order.phone}</p>
                </div>
                <div className="hidden sm:block col-span-2">
                  <p className="text-gray-500 text-sm font-mono">{order.orderNumber}</p>
                </div>
                <div className="hidden sm:block col-span-2">
                  <p className="text-[#072435] text-sm font-bold">₦{order.total.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">{order.items} item{order.items !== 1 ? "s" : ""}</p>
                </div>
                <div className="hidden sm:block col-span-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${order.channel === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-gray-100 text-gray-500"}`}>
                    {order.channel === "whatsapp" ? <MessageCircle size={10} /> : <Globe size={10} />}
                    {order.channel === "whatsapp" ? "WhatsApp" : "Store"}
                  </span>
                </div>
                <div className="hidden sm:block col-span-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${s.class}`}>
                    <StatusIcon size={10} />{s.label}
                  </span>
                </div>
                <div className="hidden sm:flex col-span-1 justify-end items-center">
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
