"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Package, MessageCircle,
  ArrowRight, Zap, Plus, MonitorSmartphone, BarChart3,
  Bell, Search, Menu, UserCircle, Sparkles
} from "lucide-react";
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
  const { tenantId, tenantName } = useTenant();
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
    <div className="flex flex-col min-h-full -mt-[clamp(12px,3vw,32px)] -mx-[clamp(12px,3vw,32px)] overflow-x-hidden">
      {/* ── High-Fidelity Header (Obsidian Dark) ── */}
      <div className="dh">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue to-blue-dim border border-white/10 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">{(tenantName || "S").charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                {greeting}
              </p>
              <h2 className="text-white text-lg font-extrabold tracking-tight font-display m-0">
                {tenantName || "SOLO Merchant"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60">
              <Search size={18} />
            </div>
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60 relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue rounded-full border border-ink"></span>
            </div>
          </div>
        </div>

        {/* ── Revenue Card (Glassmorphic) ── */}
        <div className="crystalCard p-6 rounded-[28px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-t3 text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
            Gross Revenue
            <span className="beta-chip">v3.0</span>
          </p>
          <div className="flex items-end gap-2 mb-4">
            <h1 className="text-t1 text-3xl font-extrabold tracking-tight font-mono m-0">
              {formatCurrency(revenue)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1",
              revenueDelta >= 0 ? "bg-green/10 text-green" : "bg-red/10 text-red"
            )}>
              {revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
            </div>
            <span className="text-t4 text-[11px] font-medium">higher than last period</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Area (Light Surface) ── */}
      <div className="px-5 -mt-6 relative z-10 pb-32">
        {/* ── Mini Action Grid ── */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {MINI_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sh-sm border border-border flex items-center justify-center group-active:scale-95 transition-all">
                  <Icon size={20} className="text-blue" />
                </div>
                <span className="text-t2 text-[10px] font-bold uppercase tracking-tight">{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* ── Recent Activity ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-t1 text-sm font-bold tracking-tight uppercase">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-blue text-[10px] font-bold uppercase tracking-widest">
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-white animate-pulse rounded-2xl border border-border"></div>
              ))
            ) : recentOrders.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-surface mb-4 flex items-center justify-center text-t4">
                  <ShoppingBag size={24} />
                </div>
                <p className="text-t2 text-sm font-bold mb-1">No orders yet</p>
                <p className="text-t4 text-xs font-medium">Your store is live and ready to sell.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders`}
                  className="bg-white p-4 rounded-2xl border border-border shadow-sh-sm flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      order.channel === 'whatsapp' ? "bg-green-dim text-green" : "bg-blue-dim text-blue"
                    )}>
                      {order.channel === 'whatsapp' ? <MessageCircle size={18} /> : <ShoppingBag size={18} />}
                    </div>
                    <div>
                      <p className="text-t1 text-sm font-bold leading-tight">
                        {order.customer_name || "Guest User"}
                      </p>
                      <p className="text-t3 text-[10px] font-medium uppercase mt-0.5">
                        {order.channel || "Web Store"} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-t1 text-sm font-extrabold font-mono">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                      order.status === 'paid' ? "text-green" : "text-amber"
                    )}>
                      {order.status}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* ── WhatsApp AI Banner (Mockup 02 Style) ── */}
        <div className="bg-ink p-5 rounded-[28px] shadow-sh-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-green/10 group-hover:text-green/20 transition-colors">
            <Sparkles size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-green mb-4">
              <Zap size={20} className="fill-green" />
            </div>
            <h3 className="text-white text-lg font-extrabold tracking-tight mb-1 font-display">Amina Farida AI</h3>
            <p className="text-white/40 text-xs font-medium leading-relaxed mb-4">
              Your intelligent WhatsApp assistant is online. Handling 12 active queries in English & Pidgin.
            </p>
            <Link href="/dashboard/whatsapp" className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue/20">
              Manage AI <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
