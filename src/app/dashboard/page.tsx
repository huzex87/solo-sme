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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight leading-none">
            {greeting}, {userName?.split(" ")[0] || "Merchant"}
          </h1>
          <p className="text-slate-500 text-[14px] font-medium tracking-tight">Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products/new" className="btn btn-primary shadow-premium group">
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>New product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row - Modern Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card h-full flex flex-col justify-between hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100/50">
              <TrendingUp size={20} strokeWidth={2.5} />
            </div>
            <div className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-md",
              revenueDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gross Revenue</p>
            <h2 className="text-2xl font-bold text-slate-950 mt-1 tabular-nums tracking-tighter">₦{revenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card h-full flex flex-col justify-between hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+12%</div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
            <h2 className="text-2xl font-bold text-slate-950 mt-1 tabular-nums tracking-tighter">1,284</h2>
          </div>
        </div>

        <div className="card h-full flex flex-col justify-between hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100/50">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Live
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Store</p>
            <h2 className="text-2xl font-bold text-slate-950 mt-1 tracking-tighter">Online</h2>
          </div>
        </div>

        <div className="card h-full flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-br from-slate-900 to-slate-950 text-white border-slate-800 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner border border-white/10">
              <Sparkles size={20} strokeWidth={2} className="text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">AI Status</p>
            <h2 className="text-xl font-bold text-white mt-1 tracking-tight">Forecasting...</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-slate-400" />
              Recent Transactions
            </h3>
            <Link href="/dashboard/orders" className="text-[13px] font-bold text-primary hover:underline underline-offset-4">
              View active queue
            </Link>
          </div>

          <div className="table-container shadow-premium border-slate-200/40">
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-[10px] font-bold text-slate-400 tracking-widest">TRANSACTION</th>
                  <th className="text-[10px] font-bold text-slate-400 tracking-widest">CUSTOMER</th>
                  <th className="text-[10px] font-bold text-slate-400 tracking-widest">STATUS</th>
                  <th className="text-[10px] font-bold text-slate-400 tracking-widest text-right">AMOUNT</th>
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
          {/* AI Insights - Rich Terminal Style */}
          <div className="bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                  <Sparkles size={24} className="text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Amina Intelligence</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">System Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary/60 rounded-full" />
                  <p className="text-[13px] text-slate-200 leading-relaxed font-medium pl-2 italic">
                    "Sales are up 14% this week. I've prepared a customer segmentation report for your marketing hub."
                  </p>
                </div>
              </div>

              <Link href="/dashboard/marketing" className="btn bg-white text-slate-950 hover:bg-slate-100 transition-all font-bold text-[13px] h-11 border-none active:scale-[0.98] shadow-lg shadow-white/5">
                Launch Revenue Strategy
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 px-2 tracking-tight uppercase tracking-widest opacity-60">Shortcuts</h3>
            <div className="grid grid-cols-1 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/50 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-inner">
                    <action.icon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-slate-900 tracking-tight">{action.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Manage your {action.label.toLowerCase()}</p>
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
