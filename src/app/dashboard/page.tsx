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
    <div className="flex flex-col gap-6 pb-20 md:pb-8 animate-entrance">

      {/* Mobile-Native Sticky Header (Visible only on mobile) */}
      <div className="lg:hidden sticky-native-header flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-tight text-ink leading-tight">Overview</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-t4">Live Operational Node</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-t2 border border-slate-100">
            <MonitorSmartphone size={16} />
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Header */}
      <div className="hidden lg:flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-t4 mb-1.5 px-0.5">Ecosystem Status</p>
          <h2 className="text-[32px] font-bold text-t1 tracking-tighter leading-none">{greeting} 👋</h2>
          <p className="text-sm text-t3 mt-2 font-medium">Your business pulse is reaching strategic peak today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-200/50 text-emerald-600 text-[10px] font-black px-4 py-2.5 rounded-full uppercase tracking-widest shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            System Live
          </span>
        </div>
      </div>

      {/* Crystalline Revenue Pulse — The North Star Metric */}
      <div className="crystalCard p-7 md:p-10 relative overflow-hidden group border-slate-100/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/15 transition-all duration-1000" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <TrendingUp size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-t2">Institutional Yield</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[12px] font-black border border-emerald-100/30 shadow-sh-sm">
              {revenueDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-6">
            <span className="text-3xl font-light text-primary/30 font-mono">₦</span>
            <span className="text-[56px] md:text-[64px] font-extrabold text-t1 tracking-tighter font-mono leading-none drop-shadow-sm">
              {revenue.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-slate-50/50">
            <div className="flex -space-x-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-6 h-6 rounded-full bg-surface-2 border-2 border-white" />
              ))}
            </div>
            <p className="text-[12px] text-t3 font-bold uppercase tracking-wider">
              <span className="text-primary">+12 Transactions</span> today
            </p>
          </div>
        </div>
      </div>

      {/* High-Fidelity App Icon Grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-6">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}
            className="flex flex-col items-center gap-2.5 group"
          >
            <div className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-[28px] bg-white shadow-sh-md border border-slate-100/50 flex items-center justify-center group-hover:shadow-sh-xl group-hover:-translate-y-1.5 group-active:scale-90 transition-all duration-500 ease-out glass-halo relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-3 rounded-2xl bg-surface-2 group-hover:bg-primary/10 transition-colors">
                <Icon size={24} className="text-primary group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-t3 group-hover:text-primary transition-colors text-center">{label}</span>
          </Link>
        ))}
      </div>

      {/* Operation Control Panels */}
      <div className="grid lg:grid-cols-5 gap-8 mt-4">

        {/* AI Strategist (The Amina Farida Experience) */}
        <div className="lg:col-span-2">
          <div className="rounded-[40px] p-8 md:p-10 relative overflow-hidden flex flex-col shadow-sh-xl min-h-[340px] border border-white/5 bg-[#072435]">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent opacity-30" />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-[90px] animate-pulse" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-[11px] font-black text-emerald-400/80 uppercase tracking-[0.25em]">AI Orchestator</h3>
              </div>

              <div className="space-y-4">
                <h2 className="text-white text-[28px] md:text-[32px] font-bold tracking-tighter leading-tight">
                  Amina Farida
                </h2>
                <p className="text-white/50 text-[14px] leading-relaxed font-medium max-w-xs">
                  "Sovereign node identified. I've optimized your WhatsApp sales funnel. Shall we deploy the next RAG grounding layer?"
                </p>
              </div>

              <Link href="/dashboard/whatsapp"
                className="mt-auto group bg-white text-[#072435] px-6 py-4 rounded-[22px] font-black text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-400 hover:text-white transition-all shadow-xl active:scale-[0.98]">
                <MessageCircle size={18} />
                Engage Strategist
              </Link>
            </div>
          </div>
        </div>

        {/* Operational Ledger (Native list refinement) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text- ink flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              </span>
              Operational Ledger
            </h3>
            <Link href="/dashboard/orders"
              className="text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-all flex items-center gap-2">
              Full Spectrum <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100/60 overflow-hidden shadow-sh-md divide-y divide-slate-50/80">
            {loading ? (
              [0, 1, 2, 3].map(i => (
                <div key={i} className="h-20 flex items-center px-6 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-50 animate-pulse rounded" />
                    <div className="h-3 w-20 bg-slate-50 animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="py-24 flex flex-col items-center text-center px-10">
                <div className="w-20 h-20 rounded-[30px] bg-slate-50 flex items-center justify-center text-t4 mb-6 border border-slate-100 shadow-inner">
                  <ShoppingBag size={32} />
                </div>
                <p className="text- ink font-bold text-lg mb-2">Ecosystem Awaiting Input</p>
                <p className="text-t3 text-sm max-w-[240px] leading-relaxed font-medium opacity-70">Logistics signals will synthesize here as your commerce nodes activate.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-5 md:p-6 hover:bg-slate-50 transition-all duration-300 group">
                  <div className="flex items-center gap-5">
                    <div className="w-13 h-13 rounded-2xl bg-surface-2 flex items-center justify-center font-mono font-bold text-[11px] text-t3 border border-slate-100/50 shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                      #{order.id.slice(0, 4)}
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-ink tracking-tight group-hover:text-primary transition-colors">{order.customer_name || "Sovereign Actor"}</div>
                      <div className="text-[10px] text-t4 font-black uppercase tracking-widest mt-0.5 opacity-60">{new Date(order.created_at).toLocaleDateString()} • {order.channel || 'web'}</div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div className="text-[17px] font-black text-ink font-mono tracking-tighter">₦{order.total_amount.toLocaleString()}</div>
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm",
                      order.status === 'delivered' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-primary/5 text-primary border-primary/10"
                    )}>
                      {order.status}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
