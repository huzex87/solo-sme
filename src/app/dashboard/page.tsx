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

      {/* Mobile-Native Sticky Header */}
      <div className="lg:hidden sticky-native-header flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-black tracking-tight text-ink leading-tight font-display uppercase italic">Overview</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-t3 font-sans">Live Node Pulse</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-t2 border border-slate-200/60 shadow-sm active:scale-90 transition-all">
            <MonitorSmartphone size={18} />
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Header */}
      <div className="hidden lg:flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-t4 mb-2 font-display">Intelligence Command</p>
          <h2 className="text-[36px] font-extrabold text-ink tracking-tighter leading-none font-display">{greeting} 👋</h2>
          <p className="text-[16px] text-t3 mt-3 font-medium opacity-80 max-w-sm">Strategic business signals reaching peak performance today.</p>
        </div>
        <div className="flex items-center gap-3 px-1">
          <span className="flex items-center gap-2.5 bg-white border border-slate-200/80 text-emerald-600 text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-[0.15em] shadow-sm font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            Node Operational
          </span>
        </div>
      </div>

      {/* Crystalline Revenue Pulse — Financial Heartbeat */}
      <div className="crystalCard p-8 md:p-12 relative overflow-hidden group border-white/40 shadow-[0_20px_60px_-15px_rgba(7,36,53,0.08)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-12 h-12 rounded-[22px] bg-primary text-white flex items-center justify-center shadow-sh-xl border border-white/20">
              <TrendingUp size={24} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black uppercase tracking-[0.4em] text-ink block font-display">Institutional Yield</span>
              <span className="text-[10px] font-bold text-t4 uppercase tracking-[0.2em] mt-1 block">Live Flow Monitor</span>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-2xl text-[14px] font-black border border-emerald-100/50 shadow-sm font-sans">
              {revenueDelta >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
          </div>

          <div className="flex items-baseline gap-6 mb-10">
            <span className="text-[36px] md:text-[44px] font-bold text-primary font-mono tracking-tighter leading-none opacity-30">₦</span>
            <span className="text-[72px] md:text-[100px] font-black text-ink tracking-tight font-mono leading-none">
              {revenue.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-6 pt-10 border-t border-slate-200/60">
            <div className="flex -space-x-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-2xl bg-white border-4 border-surface shadow-sh-sm flex items-center justify-center text-[11px] font-black text-t3 overflow-hidden">
                  {i === 3 ? <span className="p-1">+12</span> : <div className="w-full h-full bg-slate-100" />}
                </div>
              ))}
            </div>
            <p className="text-[14px] text-t3 font-bold uppercase tracking-[0.15em] font-sans">
              <span className="text-primary">+12 Transactions</span> finalized today
            </p>
          </div>
        </div>
      </div>

      {/* High-Fidelity App Icon Grid — Touch & Eye Candy */}
      <div className="grid grid-cols-4 gap-4 md:gap-8">
        {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href}
            className="flex flex-col items-center gap-3.5 group"
          >
            <div className="w-[72px] h-[72px] md:w-24 md:h-24 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 flex items-center justify-center group-hover:shadow-[0_20px_50px_rgba(15,118,110,0.1)] group-hover:-translate-y-2 group-active:scale-95 transition-all duration-500 ease-out glass-halo relative overflow-hidden active:bg-slate-50">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 rounded-[22px] bg-slate-50 group-hover:bg-primary/10 transition-colors duration-500">
                <Icon size={28} className="text-primary group-hover:scale-110 transition-transform duration-500" strokeWidth={2.2} />
              </div>
            </div>
            <span className="block text-[12px] font-black uppercase tracking-[0.25em] text-t2 group-hover:text-primary transition-colors text-center">{label}</span>
          </Link>
        ))}
      </div>

      {/* Operation Control Panels */}
      <div className="grid lg:grid-cols-5 gap-8 mt-4">

        {/* AI Strategist (The Amina Farida Experience) */}
        <div className="lg:col-span-2">
          <div className="rounded-[40px] p-8 md:p-10 relative overflow-hidden flex flex-col shadow-sh-xl min-h-[360px] border border-white/5 bg-ink">
            {/* Primary Obsidian Base */}
            <div className="absolute inset-0 bg-[#072435]" />

            {/* Immersive Pulse Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-40 animate-pulse transition-opacity duration-[3000ms]" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[110px] animate-pulse" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                  <Sparkles size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] font-display">AI Strategist</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-[0.1em]">Active Matrix</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-white text-[32px] md:text-[44px] font-black tracking-tighter leading-[0.9] mb-4 font-display uppercase italic opacity-95">
                  Amina <br /><span className="text-emerald-400">Farida</span>
                </h2>
                <p className="text-white/40 text-[14px] leading-relaxed font-medium max-w-[200px] opacity-70">
                  "Sovereign node Identified. Inventory velocity optimized. Deploy next RAG layer?"
                </p>
              </div>

              <Link href="/dashboard/whatsapp"
                className="mt-auto group bg-white text-ink px-7 py-4 rounded-[22px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2.5 hover:bg-emerald-400 hover:text-white transition-all shadow-xl active:scale-[0.98] border border-white/10 font-display">
                <MessageCircle size={18} strokeWidth={2.5} />
                Engage Matrix
              </Link>
            </div>
          </div>
        </div>

        {/* Operational Ledger (Native list refinement) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-ink flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </span>
                Operational Ledger
              </h3>
              <p className="text-[10px] font-bold text-t4 uppercase tracking-[0.15em] mt-2 ml-[22px]">Syncing 5 Most Recent Signal Nodes</p>
            </div>
            <Link href="/dashboard/orders"
              className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 hover:text-primary transition-all flex items-center gap-2.5 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10">
              Spectrum View <ArrowRight size={14} />
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
