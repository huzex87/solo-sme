"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Plus, Users, Package, ShoppingBag,
  MessageCircle, Sparkles, TrendingUp, TrendingDown, Globe,
  ChevronRight, CreditCard, Palette, Share2, Zap
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { useDashboardLanguage } from "@/context/DashboardLanguageContext";
import { AnalyticsService } from "@/services/analyticsService";
import { OrderService, Order } from "@/services/orderService";
import { cn } from "@/lib/utils";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/StatusStates";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";
import { formatCurrency } from "@/lib/formatCurrency";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { PredictiveInventoryCard } from "@/components/dashboard/PredictiveInventoryCard";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { AnalyticsSummary } from "@/services/analyticsService";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StoreHealthScore } from "@/components/dashboard/StoreHealthScore";
import { RevenueGoal } from "@/components/dashboard/RevenueGoal";

const ORDER_STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  pending:   { label: "Pending",    classes: "bg-amber-50 text-amber-600 border-amber-100" },
  paid:      { label: "Paid",       classes: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  processing:{ label: "Processing", classes: "bg-blue-50 text-blue-600 border-blue-100" },
  dispatched:{ label: "Shipped",    classes: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  delivered: { label: "Delivered",  classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "Cancelled",  classes: "bg-rose-50 text-rose-600 border-rose-100" },
  refunded:  { label: "Refunded",   classes: "bg-slate-50 text-slate-500 border-slate-100" },
};

export default function DashboardPage() {
  const { tenantId, tenantName, subdomain, userName, tenant, requiresOnboarding, isLoading: isTenantLoading } = useTenant();
  const { t } = useDashboardLanguage();
  const [greeting, setGreeting] = useState("welcome_back");
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [revenue, setRevenue] = useState(0);
  const [revenueDelta, setRevenueDelta] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    if (isTenantLoading) return;
    if (!tenantId) {
      setStats(AnalyticsService.getEmptyStats());
      setLoading(false);
      return;
    }
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
        setRecentOrders(orders.slice(0, 6));
      } catch (e) {
        console.error("[Dashboard] Fetch error:", e);
        setError("We couldn't synchronize your business data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId, isTenantLoading, requiresOnboarding]);

  if (isTenantLoading || loading) return <PageLoading />;

  if (error || (!stats && !requiresOnboarding)) {
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

  const statCards = [
    {
      label: t("Total Orders"),
      value: stats?.orderCount?.toLocaleString() ?? "0",
      delta: stats?.comparison.ordersDelta,
      icon: ShoppingBag,
      href: "/dashboard/orders",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: t("Active Customers"),
      value: stats?.customerCount?.toLocaleString() ?? "0",
      delta: stats?.comparison.visitorsDelta,
      icon: Users,
      href: "/dashboard/customers",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("Avg. Order"),
      value: formatCurrency(stats?.averageOrderValue ?? 0, tenant?.currency),
      delta: null,
      icon: Sparkles,
      href: "/dashboard/analytics",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: t("Retention"),
      value: stats?.customerRetentionRate != null ? `${stats.customerRetentionRate.toFixed(0)}%` : "—",
      delta: null,
      icon: TrendingUp,
      href: "/dashboard/customers",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const isNewStore = (stats?.orderCount ?? 0) === 0;
  const firstName = userName?.split(" ")[0] || tenantName || "there";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-32 lg:pb-12 px-2 md:px-0">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-sm font-semibold text-slate-400">{t(greeting)},</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight font-display leading-tight">
            {firstName} 👋
          </h1>
        </div>
        <a
          href={`https://${subdomain}.solosme.ng`}
          target="_blank"
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-950 hover:border-slate-300 transition-all shadow-soft-sm shrink-0 group"
        >
          <Globe size={13} className="text-slate-400" />
          <span className="hidden sm:inline">{subdomain}.solosme.ng</span>
          <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* ── Onboarding Checklist ── */}
      {!tenant?.ai_onboarding_completed && (
        <OnboardingChecklist
          steps={[
            { id: "products", title: "Add Products", description: "Import or create your first products.", isCompleted: (stats?.topProducts?.length ?? 0) > 0 || !!(tenant?.business_config as Record<string, unknown>)?.products_added, href: "/dashboard/products/new", icon: Package },
            { id: "payments", title: "Connect Payments", description: "Accept card and bank payments.", isCompleted: !!tenant?.business_config?.paystack_secret_key || !!tenant?.business_config?.flutterwave_secret_key, href: "/dashboard/settings?tab=payment", icon: CreditCard },
            { id: "branding", title: "Customize Branding", description: "Add logo, colors, and description.", isCompleted: !!tenant?.branding_config?.theme || !!tenant?.branding_config?.logoUrl, href: "/dashboard/settings?tab=branding", icon: Palette },
            { id: "whatsapp", title: "Set Up WhatsApp", description: "AI-powered sales on WhatsApp.", isCompleted: !!tenant?.business_config?.whatsapp_phone_id, href: "/dashboard/whatsapp", icon: MessageCircle },
            { id: "share", title: "Share Your Store", description: "Get your first customer.", isCompleted: !!(tenant?.business_config as Record<string, unknown>)?.store_shared, href: "/dashboard/share", icon: Share2 },
          ]}
        />
      )}

      {/* ── Revenue Hero ── */}
      <div className="bg-slate-950 rounded-[28px] md:rounded-[36px] overflow-hidden shadow-premium relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("Total Sales")}</span>
                <span className={cn(
                  "flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full",
                  revenueDelta >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                )}>
                  {revenueDelta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {revenueDelta > 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-display">
                {formatCurrency(revenue, tenant?.currency)}
              </h2>
              <p className="text-slate-500 text-xs font-semibold">vs. previous period</p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all group"
            >
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Inline chart */}
          <div className="h-24 md:h-32 opacity-60 -mx-2">
            <AnalyticsChart data={stats?.salesTrends || []} height={128} />
          </div>
        </div>

        {/* Bottom action strip */}
        <div className="relative z-10 border-t border-white/5 px-6 md:px-10 py-4 flex items-center gap-3 bg-white/3">
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-white text-slate-950 text-xs font-black hover:bg-slate-100 transition-all active:scale-95"
          >
            <Plus size={14} />
            {t("Add Product")}
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all active:scale-95"
          >
            <ShoppingBag size={14} />
            {t("Orders")}
          </Link>
          <div className="ml-auto flex items-center gap-2 text-slate-500 text-xs font-bold">
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-black text-slate-400">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="hidden sm:inline">{stats?.customerCount ?? 0} customers</span>
          </div>
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-soft-sm hover:shadow-premium hover:border-slate-200 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", card.bg, card.color)}>
                <card.icon size={15} />
              </div>
              {card.delta != null && (
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded-lg",
                  card.delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                )}>
                  {card.delta >= 0 ? "+" : ""}{card.delta.toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-xl md:text-2xl font-black text-slate-950 font-display tracking-tight">{card.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />

      {/* ── Empty state (no orders yet) ── */}
      {isNewStore && (
        <div className="bg-gradient-to-br from-primary to-accent rounded-[28px] p-7 md:p-10 text-white shadow-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Sparkles size={32} className="text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl md:text-2xl font-black font-display tracking-tight">Your store is live — now get your first sale</h2>
              <p className="text-white/70 text-sm font-medium max-w-lg">
                Share your store link, add products via WhatsApp, or import from Instagram to start selling today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/dashboard/products/new" className="h-11 px-6 rounded-2xl bg-white text-slate-950 text-sm font-black flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
                <Plus size={16} />
                Add Product
              </Link>
              <Link href="/dashboard/import" className="h-11 px-6 rounded-2xl bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-bold flex items-center gap-2 hover:bg-white/30 transition-all active:scale-95">
                <Zap size={16} />
                Import Store
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Recent Orders */}
          <div className="bg-white border border-slate-100 rounded-[28px] overflow-hidden shadow-soft-sm">
            <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-slate-50">
              <h3 className="text-base font-black text-slate-950 font-display">{t("Recent Orders")}</h3>
              <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                {t("view_all")} <ChevronRight size={13} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                  <ShoppingBag size={22} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400">No orders yet</p>
                <p className="text-xs text-slate-300 mt-1">Share your store to get your first order</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map((order) => {
                  const statusStyle = ORDER_STATUS_STYLES[order.status] || ORDER_STATUS_STYLES.pending;
                  return (
                    <Link
                      key={order.id}
                      href={`/dashboard/orders/${order.id}`}
                      className="flex items-center gap-4 px-6 md:px-8 py-4 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs shrink-0">
                        {order.customer_name?.[0]?.toUpperCase() || "G"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-950 truncate">{order.customer_name || "Guest"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-lg border",
                            statusStyle.classes
                          )}>
                            {order.channel === "whatsapp" ? <MessageCircle size={9} /> : <ShoppingBag size={9} />}
                            {statusStyle.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black text-slate-950 font-display">
                          {formatCurrency(order.total_amount, tenant?.currency)}
                        </span>
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Amina WhatsApp Status */}
          <div className={cn(
            "rounded-[28px] p-6 md:p-8 border relative overflow-hidden transition-all duration-300",
            tenant?.ai_sales_enabled
              ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-100"
              : "bg-white border-slate-100"
          )}>
            {tenant?.ai_sales_enabled && (
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />
            )}
            <div className="relative z-10 flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0",
                tenant?.ai_sales_enabled ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-300"
              )}>
                <MessageCircle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-black text-slate-950">
                    {tenant?.ai_sales_enabled ? "Amina AI is active" : "Amina AI is paused"}
                  </h3>
                  {tenant?.ai_sales_enabled && (
                    <div className="flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Live</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {tenant?.ai_sales_enabled
                    ? "Handling orders and customer inquiries on WhatsApp automatically."
                    : "Enable your WhatsApp assistant to handle orders 24/7."}
                </p>
              </div>
              <Link
                href={tenant?.ai_sales_enabled ? "/dashboard/whatsapp" : "/dashboard/settings?tab=integrations"}
                className={cn(
                  "shrink-0 flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold transition-all active:scale-95",
                  tenant?.ai_sales_enabled
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-950 hover:bg-slate-800 text-white"
                )}
              >
                {tenant?.ai_sales_enabled ? "Manage" : "Set up"}
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <StoreHealthScore tenant={tenant} stats={stats} />
          <RevenueGoal currentRevenue={revenue} currency={tenant?.currency} />
          <PredictiveInventoryCard items={stats?.predictiveInventory || []} />
          <AIInsightCard stats={stats} tenantName={tenantName} />
        </div>
      </div>

    </div>
  );
}
