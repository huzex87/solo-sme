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
  ChevronRight
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage customer orders across all channels.</p>
        </div>
      </div>

      {/* Control Suite */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const count = tab.value === "all" ? MOCK_ORDERS.length : MOCK_ORDERS.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2",
                  activeTab === tab.value
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-bold",
                    activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="card text-center py-20 bg-white border-dashed border-2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <ShoppingBag size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed mb-8">
            Orders from your storefront and WhatsApp AI will appear here.
          </p>
          <Link
            href="/dashboard/whatsapp"
            className="btn btn-primary px-8 py-3 rounded-xl shadow-sm flex items-center gap-2"
          >
            <MessageCircle size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Set up WhatsApp AI</span>
          </Link>
        </div>
      )}

      {/* Order List */}
      {filtered.length > 0 && (
        <div className="table-container bg-white shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Items</th>
                <th className="text-right">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const s = STATUS_CONFIG[order.status];
                const StatusIcon = s.icon;
                return (
                  <tr key={order.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-xs font-bold text-slate-500">#{order.orderNumber}</td>
                    <td>
                      <div className="font-semibold text-slate-900">{order.customer}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{order.createdAt}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        {order.channel === "whatsapp" ? <MessageCircle size={14} className="text-primary" /> : <Globe size={14} />}
                        <span className="capitalize">{order.channel}</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn("badge flex items-center w-fit gap-1", s.class)}>
                        <StatusIcon size={12} />
                        {s.label}
                      </span>
                    </td>
                    <td className="text-slate-600 text-sm">{order.items} items</td>
                    <td className="text-right font-bold text-slate-900">₦{order.total.toLocaleString()}</td>
                    <td className="text-right">
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
