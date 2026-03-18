"use client";

import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AnalyticsSummary } from "@/services/analyticsService";
import { cn } from "@/lib/utils";

interface AIInsightCardProps {
    stats: AnalyticsSummary | null;
    tenantName?: string;
}

function buildInsight(stats: AnalyticsSummary, tenantName?: string): { headline: string; detail: string; type: 'positive' | 'warning' | 'neutral' } {
    const { topProducts, stockAlerts, comparison, orderCount, channelBreakdown } = stats;

    // Critical stock alert takes highest priority
    const criticalStock = stockAlerts?.find(a => a.currentStock <= 2);
    if (criticalStock) {
        return {
            headline: `Stock critical: ${criticalStock.productName}`,
            detail: `Only ${criticalStock.currentStock} unit${criticalStock.currentStock === 1 ? '' : 's'} remaining. Restock now to avoid lost sales.`,
            type: 'warning',
        };
    }

    // Revenue trending up with a top product driver
    if (comparison.revenueDelta > 10 && topProducts.length > 0) {
        const top = topProducts[0];
        return {
            headline: `Revenue up ${comparison.revenueDelta.toFixed(1)}% — ${top.name} is driving it`,
            detail: `${top.name} generated ${top.sales} sale${top.sales === 1 ? '' : 's'} this period. Consider promoting it further or stocking up.`,
            type: 'positive',
        };
    }

    // WhatsApp is the dominant channel
    const whatsappChannel = channelBreakdown?.find(c => c.channel === 'whatsapp');
    const totalRevenue = channelBreakdown?.reduce((s, c) => s + c.revenue, 0) || 0;
    if (whatsappChannel && totalRevenue > 0 && whatsappChannel.revenue / totalRevenue > 0.5) {
        return {
            headline: `${Math.round((whatsappChannel.revenue / totalRevenue) * 100)}% of revenue from WhatsApp`,
            detail: 'Your WhatsApp channel is your strongest asset. Enable automation to handle more orders without extra effort.',
            type: 'positive',
        };
    }

    // Revenue declining
    if (comparison.revenueDelta < -10) {
        return {
            headline: `Revenue down ${Math.abs(comparison.revenueDelta).toFixed(1)}% this period`,
            detail: 'Sales are slower than last period. Consider a flash promotion or re-engaging dormant customers via WhatsApp.',
            type: 'warning',
        };
    }

    // Low order volume — new merchant prompt
    if (orderCount === 0) {
        return {
            headline: `${tenantName || 'Your store'} is live — share your link`,
            detail: 'No orders yet. Share your store link on WhatsApp and social media to get your first sale today.',
            type: 'neutral',
        };
    }

    // Stock alert (non-critical)
    if (stockAlerts?.length > 0) {
        return {
            headline: `${stockAlerts.length} product${stockAlerts.length === 1 ? '' : 's'} running low`,
            detail: `${stockAlerts.map(a => a.productName).slice(0, 2).join(', ')}${stockAlerts.length > 2 ? ` and ${stockAlerts.length - 2} more` : ''} need restocking soon.`,
            type: 'warning',
        };
    }

    // Healthy state
    if (topProducts.length > 0) {
        const top = topProducts[0];
        return {
            headline: `${top.name} is your top seller`,
            detail: `${top.sales} unit${top.sales === 1 ? '' : 's'} sold, generating ${top.revenue.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })} in revenue this period.`,
            type: 'positive',
        };
    }

    return {
        headline: 'Your business is steady',
        detail: 'Keep adding products and engaging customers via WhatsApp to grow your revenue.',
        type: 'neutral',
    };
}

export function AIInsightCard({ stats, tenantName }: AIInsightCardProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    if (!stats) {
        return (
            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-100 mb-6" />
                <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-3" />
                <div className="h-3 bg-slate-50 rounded-lg w-full mb-2" />
                <div className="h-3 bg-slate-50 rounded-lg w-5/6" />
            </div>
        );
    }

    const insight = buildInsight(stats, tenantName);

    const typeStyles = {
        positive: { accent: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: TrendingUp },
        warning: { accent: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertTriangle },
        neutral: { accent: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10', icon: Sparkles },
    };

    const style = typeStyles[insight.type];

    return (
        <div
            key={refreshKey}
            className="bg-white border border-slate-100 hover:border-accent-border rounded-[32px] p-8 shadow-premium transition-all duration-300 relative overflow-hidden"
        >
            <div className="absolute left-0 top-0 w-[2px] h-full bg-accent opacity-20" />

            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-950">AI Strategy</h4>
                        <p className={cn("text-[10px] font-extrabold uppercase tracking-widest", style.accent)}>
                            Live Analysis
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    title="Refresh insight"
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            <div className={cn("p-5 rounded-3xl border mb-6", style.bg, style.border)}>
                <div className={cn("flex items-start gap-2 mb-2", style.accent)}>
                    <style.icon size={14} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-extrabold text-slate-950 leading-snug">{insight.headline}</p>
                </div>
                <p className="text-[12px] leading-relaxed text-slate-500 font-medium pl-5">{insight.detail}</p>
            </div>

            <button className="w-full btn btn-primary h-14 rounded-2xl shadow-lg shadow-primary/10 font-bold">
                Execute Growth Play
            </button>
        </div>
    );
}
