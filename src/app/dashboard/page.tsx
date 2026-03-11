"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ShoppingBag, ArrowRight, Package, BarChart3, MessageCircle, MonitorSmartphone, Sparkles } from 'lucide-react';
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn, formatCurrency } from "@/lib/utils";

const MINI_ACTIONS = [
  { label: "POS", href: "/dashboard/pos", icon: MonitorSmartphone },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Insights", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const { tenantId, tenantName, userName } = useTenant();
  const [greeting, setGreeting] = useState("Good morning");
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analytics, orders] = await Promise.all([
          AnalyticsService.getDashboardStats(tenantId),
          OrderService.getOrders(tenantId),
        ]);
        setRevenue(analytics.totalRevenue);
        setRevenueDelta(analytics.comparison.revenueDelta);
        setRecentOrders(orders.slice(0, 5));
      } catch (err) {
        console.error("[Dashboard] Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-6">

      {/* Welcome Header — no page title here, TopBar handles that */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-t4 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">Welcome back</p>
          <h2 className="text-t1 text-2xl font-bold tracking-tight leading-tight">
            {greeting} 👋
          </h2>
          <p className="text-t3 text-sm font-medium mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mt-1 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Closed Beta
        </span>
      </div>

      {/* Revenue Card */}
      <div className="crystalCard p-6 md:p-10 rounded-[28px] md:rounded-[32px] relative overflow-hidden group border-none shadow-xl bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-all pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-t3 text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              Gross Revenue
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] tracking-normal font-bold">V3.0 MASTERY</span>
            </p>
            <TrendingUp size={22} className="text-primary/20 group-hover:text-primary/40 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2 mb-5">
            <span className="text-primary/30 text-2xl font-medium">₦</span>
            <h1 className="text-t1 text-4xl md:text-5xl font-bold tracking-tighter font-mono m-0">
              {revenue.toLocaleString()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1.5 rounded-2xl text-[11px] font-bold flex items-center gap-1.5",
              revenueDelta >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              {revenueDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
            <span className="text-t3 text-[12px] font-medium opacity-60">Revenue growth this month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions — 4 columns always, avoids 2-row stacking on mobile */}
      <div className="grid grid-cols-4 gap-2 md:gap-6">
        {MINI_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-white shadow-md border border-white/40 flex items-center justify-center group-active:scale-95 transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                <Icon size={20} className="text-primary" />
              </div>
              <span className="text-t2 text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders + AI Panel */}
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-t1 text-sm font-bold tracking-[0.1em] uppercase">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-primary text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Full Overview <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/50 animate-pulse rounded-[24px] border border-white/40" />
              ))
            ) : recentOrders.length === 0 ? (
              <div className="py-16 bg-white rounded-[28px] shadow-sm border border-white/40 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 mb-4 flex items-center justify-center text-t4">
                  <ShoppingBag size={28} />
                </div>
                <p className="text-t1 text-base font-bold mb-1">No active orders</p>
                <p className="text-t3 text-sm max-w-[220px]">Once you start making sales, they will appear here in real-time.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-white/40 flex items-center justify-between hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-t1 font-mono font-bold text-xs">
                      #{order.id.slice(0, 4)}
                    </div>
                    <div>
                      <div className="text-t1 text-sm font-bold">{order.customer_name || 'Walk-in Customer'}</div>
                      <div className="text-t3 text-[11px] font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-t1 text-sm font-bold font-mono">₦{order.total_amount.toLocaleString()}</div>
                    <div className="text-primary text-[10px] font-bold uppercase tracking-wider">{order.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-ink to-ink80 p-6 md:p-8 rounded-[28px] shadow-2xl relative overflow-hidden min-h-[300px] md:min-h-[400px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 -mr-16 -mt-16 z-0 pointer-events-none">
              <Sparkles size={200} className="text-primary" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-auto">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  AI Intel Core
                </div>
                <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-3">
                  Meet Amina Farida
                </h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Your AI growth partner is analysing new shop signals and has identified opportunities to increase your conversion rate.
                </p>
              </div>
              <Link
                href="/dashboard/whatsapp"
                className="w-full bg-white text-ink py-3.5 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20"
              >
                <MessageCircle size={18} />
                Consult Intelligence
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
