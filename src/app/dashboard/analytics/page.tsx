"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    BarChart2,
    Activity,
    Download,
    Loader2,
    Sparkles,
    ExternalLink
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn, formatCurrency } from "@/lib/utils";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState } from "@/components/ui/StatusStates";
import { AnalyticsSummary } from "@/services/analyticsService";
import { AIInsight, AIForecast } from "@/services/aiAnalyticsService";


export default function AnalyticsPage() {
    const { tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('7d');
    const [, setExporting] = useState<null | 'csv' | 'json' | 'pdf'>(null);
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [aiInsights, setAiInsights] = useState<AIInsight[] | null>(null);
    const [aiForecasts, setAiForecasts] = useState<AIForecast[] | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!tenant?.id) return;
            setLoading(true);
            setError(null);
            try {
                const { AnalyticsService } = await import('@/services/analyticsService');
                const data = await AnalyticsService.getDashboardStats(tenant.id, dateRange);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
                setError("We were unable to synchronize your performance metrics. Please verify your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [tenant?.id, dateRange]);

    useEffect(() => {
        const fetchAI = async () => {
            if (!stats || !tenant?.id) return;
            setAiLoading(true);
            try {
                const [{ AIAnalyticsService }, { FinanceService }] = await Promise.all([
                    import('@/services/aiAnalyticsService'),
                    import('@/services/financeService'),
                ]);
                const finance = await FinanceService.getFinancialSummary(tenant.id);
                const [insights, forecasts] = await Promise.all([
                    AIAnalyticsService.getBusinessInsights(stats, finance, tenant.currency || 'NGN'),
                    AIAnalyticsService.getSalesForecastAI(
                        stats.salesTrends.map(t => ({ date: t.date, amount: t.revenue })),
                        tenant.currency || 'NGN'
                    ),
                ]);
                setAiInsights(insights);
                setAiForecasts(forecasts);
            } catch (err) {
                console.error('AI insights failed:', err);
            } finally {
                setAiLoading(false);
            }
        };
        fetchAI();
    }, [stats, tenant?.id, tenant?.currency]);

    const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
        const currentStats = stats;
        if (!currentStats) return;
        setExporting(format);
        try {
            const { AnalyticsService } = await import('@/services/analyticsService');
            let blob;
            if (format === 'csv') {
                blob = await AnalyticsService.exportToCSV(currentStats, tenant?.id || 'anonymous');
            } else if (format === 'json') {
                blob = await AnalyticsService.exportToJSON(currentStats, tenant?.id || 'anonymous');
            } else {
                blob = await AnalyticsService.exportToPDF(currentStats, tenant?.name || 'SOLO Merchant');
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SOLO_Performance_Report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(null);
        }
    };

    if (loading) return <PageLoading />;

    if (error || !stats) {
        return <ErrorState
            title="Analytics Unavailable"
            message={error || "We couldn't load your business intelligence data."}
            onRetry={() => window.location.reload()}
        />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between px-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-950 font-display">Reports</h1>
                    <p className="text-[13px] font-semibold text-slate-500 mt-0.5 tracking-tight">Business performance overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('csv')} className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors shadow-soft-sm" title="Export CSV">
                        <Download size={18} />
                    </button>
                    <button onClick={() => handleExport('pdf')} className="px-4 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-900 transition-all shadow-premium" title="Download Report">
                        <BarChart2 size={16} />
                        Report
                    </button>
                </div>
            </div>

            {/* Modern Filter Suite */}
            <div className="px-4">
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                    {[
                        { label: '24 Hours', value: '24h' },
                        { label: '7 Days', value: '7d' },
                        { label: '30 Days', value: '30d' },
                        { label: '3 Months', value: '3m' },
                        { label: '1 Year', value: '1y' },
                        { label: 'All Time', value: 'all' }
                    ].map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setDateRange(f.value)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border",
                                dateRange === f.value
                                    ? "bg-slate-950 border-slate-900 text-white shadow-premium"
                                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-soft-sm"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hero Analytics - Chart Lift */}
            <div className="px-4">
                <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden shadow-premium group min-h-[400px] flex flex-col justify-between">
                    <div className="absolute inset-0 bg-mesh opacity-10 group-hover:opacity-20 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/10">Total Sales</span>
                            <div className={cn(
                                "flex items-center gap-1.5 font-bold text-xs",
                                stats.comparison.revenueDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                <TrendingUp size={14} className={stats.comparison.revenueDelta < 0 ? "rotate-180" : ""} />
                                {stats.comparison.revenueDelta >= 0 ? '+' : ''}{stats.comparison.revenueDelta.toFixed(1)}%
                            </div>
                        </div>
                        <h2 className="text-5xl font-extrabold tracking-tighter font-display mb-2">
                            {formatCurrency(stats.totalRevenue, tenant?.currency)}
                        </h2>
                        <p className="text-slate-400 text-sm font-semibold">vs previous {dateRange === '24h' ? '24 hours' : dateRange}</p>
                    </div>

                    <div className="relative z-10 h-40 mt-8">
                        <svg className="w-full h-full opacity-50" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d={`M0,80 ${stats.salesTrends.map((t, i) => `L${(i / (stats.salesTrends.length - 1)) * 400},${100 - (t.revenue / (Math.max(...stats.salesTrends.map((st) => st.revenue)) || 1)) * 80}`).join(' ')}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-primary"
                            />
                            <path
                                d={`M0,80 ${stats.salesTrends.map((t, i) => `L${(i / (stats.salesTrends.length - 1)) * 400},${100 - (t.revenue / (Math.max(...stats.salesTrends.map((st) => st.revenue)) || 1)) * 80}`).join(' ')} V100 H0 Z`}
                                fill="url(#chartGradient)"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 gap-4 px-4">
                {[
                    { label: "Orders", value: stats.orderCount, delta: stats.comparison.ordersDelta, color: "text-blue-500" },
                    { label: "Customers", value: stats.customerCount, delta: stats.comparison.visitorsDelta, color: "text-indigo-500" },
                ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                        <div className="flex items-center justify-between">
                            <h4 className="text-2xl font-extrabold text-slate-950 font-display">{item.value.toLocaleString()}</h4>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-lg",
                                item.delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {item.delta >= 0 ? '+' : ''}{item.delta.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Channel Breakdown */}
            <div className="px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-extrabold text-slate-950 font-display">Channel Performance</h3>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs">
                            Live updates <Activity size={14} className="animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {stats.channelBreakdown.map((chan) => {
                            const percentage = stats.totalRevenue > 0
                                ? Math.round((chan.revenue / stats.totalRevenue) * 100)
                                : 0;
                            return (
                                <div key={chan.channel}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-600">{chan.channel === 'WHATSAPP' ? 'WhatsApp AI' : chan.channel}</span>
                                        <span className="text-xs font-black text-slate-950">{percentage}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                chan.channel === 'WHATSAPP' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
                    <h3 className="text-lg font-extrabold text-slate-950 font-display mb-8">Top Products</h3>
                    <div className="space-y-6">
                        {stats.topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300">
                                    0{i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-extrabold text-slate-950 truncate">{product.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{product.sales} sales</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-slate-950">{formatCurrency(product.revenue, tenant?.currency)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Amina AI Intelligence */}
            <div className="px-4">
                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-950 font-display leading-none">Amina Intelligence</h3>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">AI-powered growth recommendations</p>
                            </div>
                        </div>
                        {aiLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
                    </div>

                    {/* Revenue Forecasts */}
                    {(aiForecasts || aiLoading) && (
                        <div className="grid grid-cols-2 gap-3">
                            {aiLoading && !aiForecasts
                                ? [0, 1].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-slate-50 animate-pulse" />
                                ))
                                : aiForecasts?.map((forecast) => (
                                    <div key={forecast.period} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{forecast.period}</p>
                                        <p className="text-xl font-black text-slate-950 font-display">
                                            {formatCurrency(forecast.predictedRevenue, tenant?.currency)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", forecast.trendValue === 'up' ? 'bg-emerald-500' : forecast.trendValue === 'down' ? 'bg-rose-500' : 'bg-slate-400')}
                                                    style={{ width: `${Math.round(forecast.confidence * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{Math.round(forecast.confidence * 100)}% confidence</span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Business Insights */}
                    <div className="space-y-3">
                        {aiLoading && !aiInsights
                            ? [0, 1, 2].map(i => (
                                <div key={i} className="h-20 rounded-2xl bg-slate-50 animate-pulse" />
                            ))
                            : aiInsights?.map((insight, i) => (
                                <div key={i} className={cn(
                                    "p-5 rounded-2xl border space-y-2",
                                    insight.impact === 'high' ? 'bg-amber-50 border-amber-100' :
                                    insight.impact === 'medium' ? 'bg-blue-50 border-blue-100' :
                                    'bg-slate-50 border-slate-100'
                                )}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                    insight.impact === 'high' ? 'bg-amber-200 text-amber-800' :
                                                    insight.impact === 'medium' ? 'bg-blue-200 text-blue-800' :
                                                    'bg-slate-200 text-slate-600'
                                                )}>{insight.impact} impact</span>
                                            </div>
                                            <h4 className="text-sm font-extrabold text-slate-950">{insight.title}</h4>
                                            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{insight.description}</p>
                                        </div>
                                        <a
                                            href={insight.actionUrl}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all whitespace-nowrap"
                                        >
                                            {insight.actionLabel}
                                            <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
