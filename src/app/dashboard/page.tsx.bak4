"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag, ArrowRight,
  Package, BarChart3, MessageCircle, MonitorSmartphone, Sparkles
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "POS",      href: "/dashboard/pos",      icon: MonitorSmartphone },
  { label: "Products", href: "/dashboard/products",  icon: Package },
  { label: "Orders",   href: "/dashboard/orders",    icon: ShoppingBag },
  { label: "Insights", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const { tenantId, tenantName, userName } = useTenant();
  const [greeting, setGreeting]           = useState("Good morning");
  const [revenue, setRevenue]             = useState(0);
  const [revenueDelta, setRevenueDelta]   = useState(0);
  const [recentOrders, setRecentOrders]   = useState<Order[]>([]);
  const [loading, setLoading]             = useState(true);

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
    <div className="flex flex-col gap-6 pb-4">

      {/* ── Welcome header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t4 mb-1">Welcome back</p>
          <h2 className="text-[22px] font-bold text-t1 tracking-tight">{greeting} 👋</h2>
          <p className="text-sm text-t3 mt-0.5">Here's what's happening with your store today.</p>
        </div>
        <span className="flex-shrink-0 flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-600 text-[9px] font-bold px-2.5 py-1.5 rounded-full uppercase tracking-wider mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Closed Beta
        </span>
      </div>

      {/* ── Revenue card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-[var(--sh-md)] border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none group-hover:bg-primary/8 transition-all" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-t3 flex items-center gap-2">
              Gross Revenue
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[8px] font-bold normal-case tracking-normal">V3.0 MASTERY</span>
            </span>
            <TrendingUp size={18} className="text-primary/20 group-hover:text-primary/40 transition-colors" />
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-xl font-medium text-primary/30 mt-1">₦</span>
            <span className="text-[44px] md:text-5xl font-bold text-t1 tracking-tighter font-mono leading-none">
              {revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold",
              revenueDelta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            )}>
              {revenueDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </span>
            <span className="text-[12px] text-t3">Revenue growth this month</span>
          </div>
        </div>
      </div>

      {/* ── Quick actions — 4 cols always ──────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-[var(--sh-sm)] border border-slate-100 flex items-center justify-center group-hover:shadow-[var(--sh-md)] group-hover:-translate-y-0.5 group-active:scale-95 transition-all">
              <Icon size={20} className="text-primary" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-t2 text-center">{label}</span>
          </Link>
        ))}
      </div>

      {/* ── Recent orders + AI panel ───────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Orders list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-t1">Recent Orders</h3>
            <Link href="/dashboard/orders"
              className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all">
              Full Overview <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            [0,1,2].map(i => (
              <div key={i} className="h-[68px] bg-white/60 animate-pulse rounded-2xl border border-slate-100" />
            ))
          ) : recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[var(--sh-sm)] py-12 flex flex-col items-center text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-t4 mb-3">
                <ShoppingBag size={22} />
              </div>
              <p className="text-t1 font-bold text-sm mb-1">No active orders</p>
              <p className="text-t3 text-xs max-w-[180px] leading-relaxed">Sales will appear here in real-time once customers start ordering.</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id}
                className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-[var(--sh-sm)] flex items-center justify-between hover:shadow-[var(--sh-md)] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-mono font-bold text-[11px] text-t2">
                    #{order.id.slice(0,4)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-t1">{order.customer_name || "Walk-in Customer"}</div>
                    <div className="text-[11px] text-t3">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-t1 font-mono">₦{order.total_amount.toLocaleString()}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-primary">{order.status}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI advisor panel */}
        <div className="lg:col-span-1">
          <div className="h-full min-h-[260px] rounded-[20px] p-6 relative overflow-hidden flex flex-col shadow-2xl"
            style={{ background: "linear-gradient(145deg, var(--ink) 0%, var(--ink80) 100%)" }}>
            <div className="absolute -top-6 -right-6 opacity-[0.06] pointer-events-none">
              <Sparkles size={140} className="text-blue-400" />
            </div>
            <div className="relative flex-1 flex flex-col">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 bg-teal-500/15 text-teal-300 border border-teal-500/20 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  AI Intel Core
                </div>
                <h2 className="text-white text-[22px] font-bold tracking-tight leading-tight mb-2">
                  Meet Amina Farida
                </h2>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  Your AI growth partner is analysing shop signals and has identified opportunities to improve your conversion.
                </p>
              </div>
              <Link href="/dashboard/whatsapp"
                className="mt-5 w-full bg-white text-[var(--ink)] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-500 hover:text-white transition-all shadow-lg">
                <MessageCircle size={15} />
                Consult Intelligence
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
