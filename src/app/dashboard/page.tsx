"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag, ArrowRight,
  Package, BarChart3, MessageCircle, Sparkles, Clock, ChevronRight
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Products", href: "/dashboard/products", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "AI Assistant", href: "/dashboard/whatsapp", icon: MessageCircle, color: "text-primary", bg: "bg-primary-light" },
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
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {userName?.split(" ")[0] || "Merchant"}</h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Store Status: Active
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="card md:col-span-2 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                revenueDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {revenueDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(revenueDelta).toFixed(1)}%
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">₦{revenue.toLocaleString()}</span>
              <span className="text-slate-400 text-sm font-medium">this month</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">+12 new transactions today</span>
            </div>
            <Link href="/dashboard/analytics" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View Analytics <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
              >
                <div className={cn("p-2.5 rounded-lg mb-2 transition-transform group-hover:scale-110", action.bg, action.color)}>
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Recent Orders
            </h3>
            <Link href="/dashboard/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="table-container bg-white shadow-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="h-12 bg-slate-50/50" />
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="font-mono text-xs font-bold text-slate-500">#{order.id.slice(0, 6)}</td>
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
                      <td className="text-right font-bold text-slate-900">₦{order.total_amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Assistant Promo */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Assistant
          </h3>
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <MessageCircle size={80} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold">Meet Amina</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Your personal AI business strategist. Ask about inventory, revenue trends, or customer patterns.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/5 italic text-xs text-white/80">
                "Your sales velocity has increased by 15% this week. Would you like to see which products are driving this?"
              </div>
              <Link href="/dashboard/whatsapp" className="btn btn-primary w-full text-xs font-bold uppercase tracking-wider py-3 mt-2">
                Start Consultation
              </Link>
            </div>
          </div>

          {/* Tip of the day */}
          <div className="p-4 bg-primary-light border border-primary/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
              <Sparkles size={12} />
              Pro Tip
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Customers who receive automated abandoned cart reminders are 3x more likely to complete their purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
