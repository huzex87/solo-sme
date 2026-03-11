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
  { label: "Stock", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analysis", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageCircle },
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
    <div className="flex flex-col gap-6 pb-8 animate-entrance">

      {/* Welcome Header — More Minimalist */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-t4 mb-1.5 px-0.5">Ecosystem Status</p>
          <h2 className="text-[26px] font-bold text-t1 tracking-tighter leading-none">{greeting} 👋</h2>
          <p className="text-sm text-t3 mt-1.5 font-medium">Your business pulse is looking healthy today.</p>
        </div>
        <span className="flex-shrink-0 flex items-center gap-2 bg-amber-500/10 border border-amber-200/50 text-amber-600 text-[9px] font-black px-3 py-2 rounded-full uppercase tracking-widest mt-1 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Beta Orchestration
        </span>
      </div>

      {/* Premium Revenue Insight */}
      <div className="crystalCard p-7 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <TrendingUp size={20} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-t2">Institutional Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100/50">
              {revenueDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-medium text-primary/40 font-mono">₦</span>
            <span className="text-[52px] font-extrabold text-t1 tracking-tighter font-mono leading-none">
              {revenue.toLocaleString()}
            </span>
          </div>
          <p className="text-[13px] text-t3 font-medium">Platform-wide gross volume this month</p>
        </div>
      </div>

      {/* Quick Acts — Premium Centric */}
      <div className="grid grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-[22px] bg-white shadow-sh-sm border border-slate-100 flex items-center justify-center group-hover:shadow-sh-md group-hover:-translate-y-1 group-active:scale-95 transition-all duration-300 relative overflow-hidden glass-halo">
              <Icon size={22} className="text-primary relative z-10" />
            </div>
            <span className="block text-[10px] font-black uppercase tracking-[0.15em] text-t2 text-center group-hover:text-primary transition-colors">{label}</span>
          </Link>
        ))}
      </div>

      {/* Intelligence & Activity Split */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* AI Orchestrator — Amina Farida High-Fidelity */}
        <div className="lg:col-span-2">
          <div className="rounded-[28px] p-7 relative overflow-hidden flex flex-col shadow-xl min-h-[300px] border border-white/5"
            style={{
              background: 'linear-gradient(165deg, #072435 0%, #0A3352 100%)',
            }}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/20 rounded-full blur-[60px] animate-pulse" />

            <div className="relative flex flex-col h-full gap-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-teal-500/15 text-teal-300 border border-teal-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                  Orchestrator
                </div>
              </div>

              <div>
                <h2 className="text-white text-[24px] font-bold tracking-tighter leading-tight mb-2">
                  Amina Farida
                </h2>
                <div className="h-px w-12 bg-teal-500/30 mb-4" />
                <p className="text-white/60 text-[13px] leading-relaxed font-medium">
                  I'm analysing your shop signal patterns. We have identified 3 inventory optimization nodes to boost your conversion velocity.
                </p>
              </div>

              <Link href="/dashboard/whatsapp"
                className="mt-auto w-full glass text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-ink transition-all shadow-lg active:scale-[0.98]">
                <MessageCircle size={16} />
                Strategic Consult
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-t1 flex items-center gap-2">
              Recent Ledger
              <span className="w-1 h-1 rounded-full bg-t4" />
              <span className="text-t3 lowercase font-medium tracking-normal">5 most recent</span>
            </h3>
            <Link href="/dashboard/orders"
              className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Full Archive <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              [0, 1, 2].map(i => (
                <div key={i} className="h-16 bg-white/40 animate-pulse rounded-2xl border border-slate-50" />
              ))
            ) : recentOrders.length === 0 ? (
              <div className="crystalCard border-none py-12 flex flex-col items-center text-center px-8">
                <div className="w-16 h-16 rounded-[22px] bg-slate-50 flex items-center justify-center text-t4 mb-5 border border-slate-100">
                  <ShoppingBag size={24} />
                </div>
                <p className="text-t1 font-bold text-base mb-1.5 tracking-tight">Ecosystem is quiet</p>
                <p className="text-t3 text-xs max-w-[200px] leading-relaxed font-medium">Fulfillment signals will appear here as orders propagate from your nodes.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id}
                  className="bg-white px-5 py-4 rounded-3xl border border-slate-100/50 shadow-sm flex items-center justify-between hover:shadow-sh-md hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-surface-2 flex items-center justify-center font-mono font-bold text-[11px] text-t2 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      #{order.id.slice(0, 4)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-t1 tracking-tight">{order.customer_name || "Sovereign Guest"}</div>
                      <div className="text-[10px] text-t3 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold text-t1 font-mono tracking-tighter">₦{order.total_amount.toLocaleString()}</div>
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-[0.14em] px-2 py-0.5 rounded-full mt-1 inline-block",
                      order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary"
                    )}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
