"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, Plus, Users, Package, ShoppingBag, BarChart3, MessageCircle, Sparkles, TrendingUp, TrendingDown, CreditCard, Store, Palette, Megaphone
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
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
import { APP_VERSION } from "@/lib/version";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StoreHealthScore } from "@/components/dashboard/StoreHealthScore";
import { RevenueGoal } from "@/components/dashboard/RevenueGoal";

interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  customerCount: number;
  averageOrderValue: number;
  comparison: {
    revenueDelta: number;
  };
}

const QUICK_ACTIONS = [
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const { tenantId, tenantName, userName, tenant, requiresOnboarding, isLoading: isTenantLoading } = useTenant();
  const [greeting, setGreeting] = useState("Welcome back");
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [revenue, setRevenue] = useState<number>(0);
  const [revenueDelta, setRevenueDelta] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        setRecentOrders(orders.slice(0, 5));
      } catch (e) {
        console.error("[Dashboard] Fetch error:", e);
        setError("We couldn't synchronize your business data. This might be a temporary connection issue.");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId, isTenantLoading, requiresOnboarding]);

  const statCards = [
    { label: "Total Orders", value: stats?.orderCount?.toLocaleString() || "0", icon: ShoppingBag, color: "text-primary", bg: "bg-primary/5" },
    { label: "Customers", value: stats?.customerCount?.toLocaleString() || "0", icon: Users, color: "text-accent", bg: "bg-accent/5" },
    { label: "Retention", value: stats?.customerRetentionRate != null ? `${stats.customerRetentionRate.toFixed(0)}%` : "—", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Avg. Sale", value: formatCurrency(stats?.averageOrderValue || 0, tenant?.currency), icon: Sparkles, color: "text-accent", bg: "bg-accent/5" },
  ];

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32 lg:pb-12 px-2 md:px-0">

      {!tenant?.ai_onboarding_completed && (
        <OnboardingChecklist
          steps={[
            { id: 'products', title: 'Add Products', description: 'Import or create your first products to start selling.', isCompleted: (stats?.orderCount ?? 0) > 0 || !!(tenant?.business_config as Record<string, unknown>)?.products_added, href: '/dashboard/products', icon: Package },
            { id: 'payments', title: 'Connect Payments', description: 'Set up Paystack or Flutterwave to accept payments.', isCompleted: !!tenant?.business_config?.paystack_secret_key || !!tenant?.business_config?.flutterwave_secret_key, href: '/dashboard/settings', icon: CreditCard },
            { id: 'branding', title: 'Customize Branding', description: 'Add your logo, colors, and store description.', isCompleted: !!tenant?.branding_config?.theme || !!tenant?.branding_config?.logoUrl, href: '/dashboard/welcome', icon: Palette },
            { id: 'whatsapp', title: 'Set Up WhatsApp', description: 'Connect your WhatsApp number for AI-powered sales.', isCompleted: !!tenant?.business_config?.whatsapp_phone_id, href: '/dashboard/whatsapp', icon: MessageCircle },
            { id: 'share', title: 'Share Your Store', description: 'Copy your store link and share with customers.', isCompleted: !!(tenant?.business_config as Record<string, unknown>)?.store_shared, href: `/store/${tenant?.subdomain || ''}`, icon: Megaphone },
          ]}
        />
      )}

      {/* Quick Actions Bar */}
      <QuickActions />

      {/* Empty State Wizard - Amina AI Guided Onboarding */}
      {(stats?.orderCount === 0 && recentOrders.length === 0) && (
        <div className="bg-gradient-to-br from-primary to-accent rounded-[32px] p-8 md:p-12 text-white shadow-premium relative overflow-hidden animate-entrance border border-white/10">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] bg-white text-primary flex items-center justify-center shadow-xl animate-float">
              <Sparkles size={48} />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-tight">Your store is live, but empty.</h2>
              <p className="text-white/80 font-semibold text-sm max-w-xl">
                Amina AI is ready to help you stock your shelves. Send your product photos to our WhatsApp bot, or use our premium bulk importer to launch in seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <Link href="/dashboard/import" className="btn bg-white text-slate-950 border-none h-14 rounded-2xl px-8 font-black text-sm active:scale-95 shadow-xl">
                  <Sparkles size={18} className="mr-2" />
                  Import from Instagram
                </Link>
                <Link href="/dashboard/whatsapp" className="btn bg-white/20 hover:bg-white/30 text-white border-white/20 h-14 rounded-2xl px-8 font-black text-sm backdrop-blur-md active:scale-95 transition-all">
                  <MessageCircle size={18} className="mr-2" />
                  WhatsApp Bot
                </Link>
                <Link href="/dashboard/products/new" className="btn bg-white/20 hover:bg-white/30 text-white border-white/20 h-14 rounded-2xl px-8 font-black text-sm backdrop-blur-md active:scale-95 transition-all">
                  <Plus size={18} className="mr-2" />
                  Manual Entry
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Revenue Float */}
      <div className="bg-ink rounded-[32px] p-6 md:p-12 text-white relative overflow-hidden shadow-premium group min-h-[220px] md:min-h-[320px] flex flex-col justify-between border border-white/5">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">Revenue · All Time</span>
              <div className={cn(
                "flex items-center gap-1.5 font-bold text-[11px]",
                revenueDelta >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {revenueDelta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {revenueDelta > 0 ? "+" : ""}{revenueDelta.toFixed(1)}%
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-display">
              {formatCurrency(revenue, tenant?.currency)}
            </h1>
          </div>

          <div className="flex-1 w-full max-w-sm hidden lg:block">
            <AnalyticsChart data={stats?.salesTrends || []} height={140} />
          </div>

          <Link href="/dashboard/analytics" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-accent-vivid flex items-center justify-center transition-all group/btn active:scale-95 shadow-inner self-end md:self-auto hover:shadow-[var(--glow-accent)]">
            <ArrowUpRight size={22} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform group-hover/btn:text-accent" />
          </Link>
        </div>

        <div className="relative z-10 mt-8 md:mt-12 flex flex-wrap gap-3 md:gap-4">
          <Link href="/dashboard/products/new" className="btn bg-white text-slate-950 hover:bg-slate-50 transition-all font-extrabold text-[13px] h-12 md:h-14 rounded-2xl border-none shadow-xl active:scale-[0.98] px-6 md:px-8">
            <Plus size={18} className="mr-2" />
            Add Product
          </Link>
          <div className="h-12 md:h-14 flex items-center gap-4 px-4 md:px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-ink bg-slate-800 flex items-center justify-center text-[8px] md:text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-slate-400">{stats?.customerCount || 0} total customers</span>
          </div>
        </div>
      </div>

      {/* Stat Strip - Horizontal Mini Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-100 rounded-3xl p-4 md:p-5 shadow-soft-sm hover:shadow-premium transition-all duration-300 relative overflow-hidden group/stat hover:border-accent-border">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover/stat:scale-x-100 transition-transform duration-500 origin-left opacity-30" />
            <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl mb-3 flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={18} className="md:size-5" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-none mb-1.5">{stat.label}</p>
            <p className="text-lg md:text-xl font-bold text-slate-950 font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* WhatsApp Assistant Activation Card - Critical for WhatsApp First */}
          <div className={cn(
            "rounded-[32px] p-8 shadow-premium relative overflow-hidden group border transition-all duration-500",
            tenant?.ai_sales_enabled
              ? "bg-gradient-to-br from-white to-emerald-50/20 border-accent-border hover:border-accent-border-vivid shadow-[var(--glow-accent)]"
              : "bg-white border-slate-100 grayscale-[0.5] opacity-80"
          )}>
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110",
                tenant?.ai_sales_enabled ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-400 shadow-slate-200"
              )}>
                <MessageCircle size={32} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-950">
                    {tenant?.ai_sales_enabled ? "Amina AI is Active" : "Amina AI is Paused"}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium max-w-md">
                    Your WhatsApp Business engine is {tenant?.ai_sales_enabled ? "listening and handling orders." : "currently disabled in settings."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link href="/dashboard/whatsapp" className="btn btn-primary h-12 rounded-2xl px-8 active:scale-95 shadow-lg shadow-primary/20 font-bold border-none transition-all">
                    {tenant?.ai_sales_enabled ? "Manage AI" : "Enable Assistant"}
                  </Link>
                  {tenant?.ai_sales_enabled && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Connected</span>
                    </div>
                  )}
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
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Channel</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
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
                            <div className="text-xs text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
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
                        {formatCurrency(order.total_amount, tenant?.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3 font-display">
                Channel Growth
              </h3>
            </div>
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
              <AnalyticsChart
                data={stats?.channelBreakdown?.map(c => ({ date: c.channel, revenue: c.revenue })) || []}
                type="bar"
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="lg:col-span-4 space-y-6">
          {/* Store Health Score */}
          <StoreHealthScore tenant={tenant} stats={stats} />

          {/* Revenue Goal Tracker */}
          <RevenueGoal currentRevenue={revenue} currency={tenant?.currency} />

          <PredictiveInventoryCard items={stats?.predictiveInventory || []} />

          <AIInsightCard stats={stats} tenantName={tenantName} />

          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm">
            <h4 className="text-sm font-bold text-slate-950">What&apos;s New</h4>
            <p className="text-slate-500 text-[13px] mt-2 leading-relaxed">Social import, store health scoring, express checkout, and smart reorder are now live.</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300">{APP_VERSION}</span>
              <Link href="/dashboard/help" className="text-primary font-bold text-xs hover:underline">Release Notes</Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
