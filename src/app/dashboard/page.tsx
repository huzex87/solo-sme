"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag,
  Package, BarChart3, MessageCircle, Sparkles, Clock, ChevronRight,
  ArrowUpRight, Plus
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
    <div className="max-w-5xl mx-auto space-y-10 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {userName?.split(" ")[0] || "Merchant"}
          </h1>
          <p className="text-slate-500 text-[13px] font-medium tracking-tight">Focus on your business metrics for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products/new" className="btn btn-primary h-8 px-4 text-xs">
            <Plus size={14} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid - High Fidelity Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Revenue Card */}
        <div className="card md:col-span-2 flex flex-col justify-between p-10 bg-gradient-to-br from-white to-slate-50/30">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Gross Revenue</span>
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm",
                revenueDelta >= 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
              )}>
                {revenueDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(revenueDelta).toFixed(1)}%
              </div>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-slate-950 tabular-nums tracking-tighter">₦{revenue.toLocaleString()}</span>
              <span className="text-slate-400 text-[13px] font-semibold tracking-tight">captured this month</span>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-slate-600">Sales Velocity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-200" />
                <span>Benchmark</span>
              </div>
            </div>
            <Link href="/dashboard/analytics" className="text-[12px] font-bold text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
              Analysis <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Insights Grid */}
        <div className="flex flex-col gap-6">
          <div className="card flex-1 flex flex-col justify-center p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="text-2xl font-bold text-slate-900">124</div>
            <div className="text-[11px] text-emerald-600 font-medium">+8 since yesterday</div>
          </div>

          <div className="card flex-1 flex flex-col justify-center p-6 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Visitors</span>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-slate-900">42</div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Active sessions right now</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Orders - Spacious & Clean */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Recent Transactions
            </h3>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="table-container border-slate-200/50">
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="font-bold text-[10px] tracking-[0.1em]">TRANSACTION</th>
                  <th className="font-bold text-[10px] tracking-[0.1em]">CUSTOMER</th>
                  <th className="font-bold text-[10px] tracking-[0.1em]">STATUS</th>
                  <th className="text-right font-bold text-[10px] tracking-[0.1em]">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="h-14 bg-slate-50/50" />
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400 text-sm">Everything is quiet. No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="group cursor-pointer">
                      <td className="font-mono text-[11px] font-semibold text-slate-400 space-x-1">
                        <span>#</span>
                        <span className="text-slate-900">{order.id.slice(0, 6).toUpperCase()}</span>
                      </td>
                      <td>
                        <div className="font-medium text-slate-900">{order.customer_name || "Guest Customer"}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <span className={cn(
                          "badge",
                          order.status === 'delivered' ? "badge-success" : "badge-info"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-right font-bold text-slate-900 tabular-nums">₦{order.total_amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Actions Component */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 px-2">Shortcuts</h3>
            <div className="grid grid-cols-1 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary-light transition-all shadow-sm">
                    <action.icon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Manage your {action.label.toLowerCase()}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* AI Assistant - Refined Status Promo */}
          <div className="bg-slate-950 rounded-2xl p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full -mr-20 -mt-20 opacity-40" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Sparkles size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold tracking-tight">Amina AI</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Operational</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/50" />
                <p className="text-[13px] text-slate-300 leading-relaxed font-medium italic">
                  "Ready to forecast your weekend demand based on current sales velocity."
                </p>
              </div>

              <Link href="/dashboard/whatsapp" className="btn bg-white text-slate-950 hover:bg-slate-100 w-full h-10 text-[12px] font-bold transition-all border-none shadow-lg active:scale-[0.98]">
                Start AI Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
