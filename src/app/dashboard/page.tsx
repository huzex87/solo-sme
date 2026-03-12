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
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/StatusStates";

const QUICK_ACTIONS = [
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const { tenantId, tenantName, userName } = useTenant();
  const [greeting, setGreeting] = useState("Welcome back");
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<number>(0);
  const [revenueDelta, setRevenueDelta] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [analytics, orders] = await Promise.all([
          AnalyticsService.getDashboardStats(tenantId),
          OrderService.getOrders(tenantId),
        ]);
        setStats(analytics);
        setRevenue(analytics.totalRevenue);
        setRevenueDelta(analytics.comparison.revenueDelta);
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        console.error("[Dashboard]", e);
        setError("We couldn't synchronize your business data. This might be a temporary connection issue.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId]);

  const statCards = [
    { label: "Total Orders", value: stats?.orderCount?.toLocaleString() || "0", icon: ShoppingBag, color: "text-indigo-500", bg: "bg-indigo-500/5" },
    { label: "Customers", value: stats?.customerCount?.toLocaleString() || "0", icon: Users, color: "text-orange-500", bg: "bg-orange-500/5" },
    { label: "WhatsApp Ads", value: "0", icon: MessageCircle, color: "text-emerald-500", bg: "bg-emerald-500/5" },
    { label: "Avg. Sale", value: `₦${stats?.averageOrderValue?.toLocaleString() || "0"}`, icon: Sparkles, color: "text-primary", bg: "bg-primary/5" },
  ];

  if (loading) return <PageLoading />;

  if (error || !stats) {
    return (
      <div className="px-4">
        <ErrorState
          title="Dashboard Unavailable"
          message={error || "We're having trouble retrieving your merchant metrics."}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-8 pb-12">

      {/* Hero Section - Revenue Float */}
      <div className="bg-slate-950 rounded-[32px] p-6 md:p-12 text-white relative overflow-hidden shadow-premium group min-h-[280px] md:min-h-[320px] flex flex-col justify-between mx-0 md:mx-4">
        <div className="absolute inset-0 bg-mesh opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/10">Revenue · All Time</span>
              <div className={cn(
                "flex items-center gap-1.5 font-bold text-xs",
                revenueDelta >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {revenueDelta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {revenueDelta > 0 ? "+" : ""}{revenueDelta.toFixed(1)}% vs last week
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter font-display">
              <span className="text-slate-500 font-medium mr-2">₦</span>
              {revenue.toLocaleString()}
            </h1>
          </div>

          <Link href="/dashboard/analytics" className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all group/btn active:scale-95 shadow-inner">
            <ArrowUpRight size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="relative z-10 mt-12 flex flex-wrap gap-4">
          <Link href="/dashboard/products/new" className="btn bg-white text-slate-950 hover:bg-slate-50 transition-all font-extrabold text-sm h-14 rounded-2xl border-none shadow-xl active:scale-[0.98] px-8">
            <Plus size={20} className="mr-2" />
            Add Product
          </Link>
          <div className="h-14 flex items-center gap-4 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400">{stats?.customerCount || 0} total customers</span>
          </div>
        </div>
      </div>

      {/* Stat Strip - Horizontal Mini Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-0 md:px-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-soft-sm hover:shadow-premium transition-all duration-300">
            <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
            <p className="text-xl font-extrabold text-slate-950 font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start px-0 md:px-4">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* WhatsApp Assistant Activation Card - Critical for WhatsApp First */}
          <div className="bg-gradient-to-br from-white to-slate-50 border border-emerald-100 rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-[20px] bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
                <MessageCircle size={32} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-950 font-display">Amina AI is Ready</h3>
                  <p className="text-slate-500 text-sm font-semibold max-w-md">Your WhatsApp Business engine is listening. Every conversation is being handled automatically.</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/whatsapp" className="btn btn-primary h-12 rounded-xl px-6 active:scale-95 shadow-lg shadow-primary/20">
                    Manage Assistant
                  </Link>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider">Live Webhook</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3 font-display">
                Recent Transactions
              </h3>
              <Link href="/dashboard/orders" className="text-sm font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-[32px] shadow-premium overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Channel</th>
                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse"><td colSpan={3} className="h-20" /></tr>
                    ))
                  ) : recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                            {order.customer_name?.[0] || "G"}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-950">{order.customer_name || "Guest"}</div>
                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider",
                          order.channel === 'whatsapp'
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          {order.channel === 'whatsapp' ? <MessageCircle size={12} /> : <ShoppingBag size={12} />}
                          {order.channel || 'online'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-extrabold text-slate-950 font-display">
                        ₦{order.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Insights - Mini Terminal */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-950">AI Strategy</h4>
                <p className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">Active Forecast</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 text-sm leading-relaxed text-slate-600 font-medium">
                "Sales are spiking from WhatsApp links. Recommend increasing stock of <span className="text-slate-950 font-bold">Lagos Silk Dress</span> for the weekend."
              </div>
              <button className="w-full btn btn-primary h-14 rounded-2xl shadow-lg shadow-primary/10">
                Execute Growth Play
              </button>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[32px] p-8 text-white shadow-premium relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-10" />
            <h4 className="text-xl font-extrabold font-display relative z-10">Beta Update</h4>
            <p className="text-slate-400 text-sm mt-2 relative z-10 leading-relaxed font-semibold">We've just enabled real-time inventory syncing across all WhatsApp orders.</p>
            <div className="mt-6 flex items-center justify-between relative z-10">
              <span className="text-[11px] font-extrabold text-white/40 uppercase tracking-widest">v0.1.2</span>
              <div className="text-primary font-bold text-sm">Release Notes</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
