"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Search, Bell, ShoppingBag, ArrowRight, Package, Users, BarChart3, MessageCircle, MonitorSmartphone, Settings, Sparkles } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn, formatCurrency } from "@/lib/utils";

const MINI_ACTIONS = [
  { label: "POS", href: "/dashboard/pos", icon: MonitorSmartphone, color: "var(--blue)" },
  { label: "Products", href: "/dashboard/products", icon: Package, color: "var(--blue)" },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag, color: "var(--blue)" },
  { label: "Insights", href: "/dashboard/analytics", icon: BarChart3, color: "var(--blue)" },
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
        console.error("[Dashboard] Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* ── High-Fidelity Header (Institutional) ── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-t1 text-2xl font-bold tracking-tight">
            {greeting}, {userName?.split(' ')[0] || 'Merchant'}
          </h2>
          <p className="text-t3 text-sm font-medium mt-1">
            Here's what's happening with <span className="text-primary font-bold">{tenantName}</span> today.
          </p>
        </div>
      </div>

      {/* ── Revenue Card (Institutional Precision) ── */}
      <div className="crystalCard p-8 md:p-10 rounded-[32px] relative overflow-hidden group border-none shadow-xl bg-white">
        {/* Subtle Gradient Glow instead of overlapping text */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-all"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-t3 text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              Gross Revenue
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] tracking-normal font-bold">V3.0 MASTERY</span>
            </p>
            <TrendingUp size={24} className="text-primary/20 group-hover:text-primary/40 transition-colors" />
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <h1 className="text-t1 text-5xl md:text-6xl font-bold tracking-tighter font-mono m-0 flex items-center gap-2">
              <span className="text-primary/30 text-3xl font-medium">₦</span>
              {revenue.toLocaleString()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-2 rounded-2xl text-[12px] font-bold flex items-center gap-2 shadow-sm",
              revenueDelta >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red"
            )}>
              {revenueDelta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
            <span className="text-t3 text-[13px] font-medium opacity-60">Revenue growth this month</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="space-y-12">
        {/* ── Mini Action Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {MINI_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white shadow-md border border-white/40 flex items-center justify-center group-active:scale-95 transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                  <Icon size={action.label === "POS" ? 28 : 24} className="text-primary" />
                </div>
                <span className="text-t2 text-[11px] font-bold uppercase tracking-widest">{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* ── Recent Activity & AI Assistant ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-t1 text-sm font-bold tracking-[0.1em] uppercase">Recent Orders</h3>
              <Link href="/dashboard/orders" className="text-primary text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Full Overview <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white/50 animate-pulse rounded-[28px] border border-white/40"></div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="py-20 bg-white rounded-[32px] shadow-sm border border-white/40 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 rounded-3xl bg-surface-2 mb-6 flex items-center justify-center text-t4">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-t1 text-lg font-bold mb-2">No active orders</p>
                  <p className="text-t3 text-sm max-w-[240px]">Once you start making sales, they will appear here in real-time.</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-white/40 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-t1 font-mono font-bold">
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

          {/* AI Advisor Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-ink to-ink80 p-8 rounded-[32px] shadow-2xl relative overflow-hidden h-full min-h-[400px]">
              {/* Decorative AI Sparkles - Back - constrained z-index and opacity */}
              <div className="absolute top-0 right-0 p-8 text-primary opacity-10 -mr-16 -mt-16 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Sparkles size={240} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-auto">
                  <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-md px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    AI Intel Core
                  </div>
                  <h2 className="text-white text-3xl font-bold tracking-tight mb-4">
                    Meet Amina Farida
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Your AI growth partner is analyzing 48 new shop signals today. She has identified 3 opportunities to increase your conversion rate.
                  </p>
                </div>

                <Link
                  href="/dashboard/whatsapp"
                  className="w-full bg-white text-ink py-4 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-primary-md hover:text-white transition-all shadow-xl shadow-black/20"
                >
                  <MessageCircle size={18} />
                  Consult Intelligence
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
