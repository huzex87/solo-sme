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
  ChevronRight,
  Filter
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
  pending: { label: "Pending", icon: Clock, class: "badge-info" },
  processing: { label: "Processing", icon: Loader2, class: "badge-info" },
  delivered: { label: "Delivered", icon: CheckCircle2, class: "badge-success" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "badge-danger" },
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
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 font-display">Active Orders</h1>
          <p className="text-[13px] font-semibold text-slate-500 mt-0.5 tracking-tight">Managing {MOCK_ORDERS.length} current orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors shadow-soft-sm">
            <Search size={22} />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors shadow-soft-sm">
            <Filter size={22} />
          </button>
        </div>
      </div>

      {/* Modern Filter Suite */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {TABS.map((tab) => {
            const count = tab.value === "all" ? MOCK_ORDERS.length : MOCK_ORDERS.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border flex items-center gap-2",
                  activeTab === tab.value
                    ? "bg-slate-950 border-slate-900 text-white shadow-premium"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-soft-sm"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter",
                    activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order List - Premium High-Density View */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-20 text-center shadow-premium">
            <div className="w-20 h-20 rounded-[24px] bg-slate-50 flex items-center justify-center mb-6 mx-auto border border-slate-100">
              <ShoppingBag size={40} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-950 font-display">No orders found</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium">Any incoming orders from WhatsApp or your web store will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-premium overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filtered.map((order) => {
                const s = STATUS_CONFIG[order.status];
                const StatusIcon = s.icon;
                return (
                  <div key={order.id} className="group p-6 flex flex-col gap-4 hover:bg-slate-50/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                          {order.customer[0]}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-950 font-display">{order.customer}</div>
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{order.createdAt}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-lg text-slate-950 font-display">₦{order.total.toLocaleString()}</div>
                        <div className="flex items-center justify-end gap-1.5">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            order.channel === 'whatsapp' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {order.channel === 'whatsapp' ? <MessageCircle size={10} /> : <Globe size={10} />}
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tighter",
                            order.channel === 'whatsapp' ? "text-emerald-600" : "text-blue-600"
                          )}>
                            {order.channel === 'whatsapp' ? 'WhatsApp Order' : 'Web Store'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-[11px] font-extrabold text-slate-300">#{order.orderNumber}</div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[11px] font-extrabold text-slate-500">{order.items} Items</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider shadow-sm",
                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50" : "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50"
                      )}>
                        <StatusIcon size={12} strokeWidth={3} />
                        {order.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
