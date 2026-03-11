"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag,
  Package, BarChart3, MessageCircle, Sparkles, Clock, ChevronRight,
  ArrowUpRight, Plus, Users
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const { tenantId, tenantName, userName } = useTenant();
  const [greeting, setGreeting] = useState("Welcome back");
  const [revenue, setRevenue] = useState(0);
  const [revenueDelta, setRevenueDelta] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      setLoading(true);
      try {
        const [analytics, orders] = await Promise.all([
          AnalyticsService.getDashboardStats(tenantId),
          OrderService.getOrders(tenantId),
        ]);
        setRevenue(analytics.totalRevenue);
        setRevenueDelta(analytics.comparison.revenueDelta);
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        console.error("[Dashboard]", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight font-display">
            {greeting}, {userName?.split(" ")[0] || "Merchant"}
          </h1>
          <p className="text-slate-500 text-[15px] font-semibold tracking-tight opacity-80">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products/new" className="btn btn-primary shadow-premium px-6 h-12 rounded-2xl group active:scale-95">
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold">New product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row - Modern Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        <div className="group card h-full flex flex-col justify-between hover:shadow-premium hover:-translate-y-2 transition-all duration-500 border-border bg-white rounded-[24px] p-7">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-soft-sm border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <TrendingUp size={22} strokeWidth={2.5} />
            </div>
            <div className={cn(
              "text-[11px] font-extrabold px-2.5 py-1 rounded-xl shadow-soft-sm",
              revenueDelta >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
            )}>
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em] opacity-80">Total Sales</p>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1.5 tabular-nums tracking-tighter font-display">₦{revenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="group card h-full flex flex-col justify-between hover:shadow-premium hover:-translate-y-2 transition-all duration-500 border-border bg-white rounded-[24px] p-7">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-soft-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl shadow-soft-sm">+12%</div>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em] opacity-80">Total Orders</p>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1.5 tabular-nums tracking-tighter font-display">1,284</h2>
          </div>
        </div>

        <div className="group card h-full flex flex-col justify-between hover:shadow-premium hover:-translate-y-2 transition-all duration-500 border-border bg-white rounded-[24px] p-7">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-soft-sm border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
              <Users size={22} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-xl shadow-soft-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Live
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em] opacity-80">Active Store</p>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-1.5 tracking-tighter font-display">Online</h2>
          </div>
        </div>

        <div className="group card h-full flex flex-col justify-between hover:shadow-premium hover:-translate-y-2 transition-all duration-500 bg-slate-950 text-white border-transparent rounded-[24px] p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner border border-white/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Sparkles size={22} strokeWidth={2} className="text-primary group-hover:text-white" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">AI Status</p>
            <h2 className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-display">Forecasting...</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3 font-display">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock size={18} className="text-slate-500" />
              </div>
              Recent Transactions
            </h3>
            <Link href="/dashboard/orders" className="text-[13px] font-extrabold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 group">
              View active queue
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="table-container shadow-premium border-border rounded-[24px] overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/80 backdrop-blur-sm">
                  <th className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] py-5">TRANSACTION</th>
                  <th className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] py-5">CUSTOMER</th>
                  <th className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] py-5">STATUS</th>
                  <th className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] text-right py-5 pr-8">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="h-16 bg-white" />
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingBag size={32} className="text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">No active orders right now.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="font-mono text-[12px] font-bold text-slate-400">
                        <span className="text-slate-300 mr-0.5">#</span>
                        <span className="text-slate-900 group-hover:text-primary transition-colors">{order.id.slice(0, 6).toUpperCase()}</span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 text-[13px] tracking-tight">{order.customer_name || "Guest Checkout"}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className={cn(
                          "badge shadow-sm border",
                          order.status === 'delivered'
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-right font-bold text-slate-950 tabular-nums">₦{order.total_amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Insights - Premium Glass Terminal */}
          <div className="bg-slate-950 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-premium border border-white/5">
            <div className="absolute inset-0 bg-mesh opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform">
                  <Sparkles size={28} className="text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold tracking-tight font-display">Amina Intelligence</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em]">Quantum Engine Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-5 rounded-[24px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-md relative overflow-hidden group-hover:bg-white/[0.06] transition-colors">
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary/60 rounded-full" />
                  <p className="text-[14px] text-slate-200 leading-relaxed font-semibold pl-4 italic">
                    "Sales are up 14% this week. I've prepared a custom segmentation report to boost your weekend revenue."
                  </p>
                </div>
              </div>

              <Link href="/dashboard/marketing" className="btn bg-white text-slate-950 hover:bg-slate-100 transition-all font-extrabold text-[13px] h-12 rounded-2xl border-none active:scale-[0.98] shadow-lg shadow-white/5 group-hover:shadow-primary/20">
                Launch Revenue Strategy
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-5 px-1">
            <h3 className="text-[11px] font-extrabold text-slate-400 px-2 tracking-[0.2em] uppercase opacity-70">Quick Access</h3>
            <div className="grid grid-cols-1 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-5 rounded-[24px] bg-white border border-border hover:border-primary/40 hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300 group shadow-soft-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-border flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-inner group-hover:scale-110 duration-300">
                    <action.icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-extrabold text-slate-950 tracking-tight">{action.label}</p>
                    <p className="text-[11px] text-slate-400 font-bold opacity-80 uppercase tracking-wider mt-0.5">Manage {action.label.toLowerCase()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
