"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, ShoppingBag, MessageCircle, BarChart2, Calendar, MonitorSmartphone, AlertTriangle } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { AnalyticsService } from "@/services/analyticsService";
import { AnalyticsSummary } from "@/services/analyticsService";
import { formatCurrency } from "@/lib/formatCurrency";

const PERIODS = ["7 days", "30 days", "90 days"] as const;
type Period = (typeof PERIODS)[number];

export default function AnalyticsPage() {
    const { tenantId } = useTenant();
    const [period, setPeriod] = useState<Period>("30 days");
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;
        setLoading(true);
        AnalyticsService.getDashboardStats(tenantId)
            .then(setData)
            .catch(err => console.error("[Analytics] Error:", err))
            .finally(() => setLoading(false));
    }, [tenantId]);

    const metrics = data ? [
        { label: "Total Revenue", value: formatCurrency(data.totalRevenue), sub: data.orderCount > 0 ? `${data.comparison.revenueDelta >= 0 ? "↑" : "↓"} ${Math.abs(data.comparison.revenueDelta).toFixed(1)}%` : "No sales yet", icon: TrendingUp, color: "var(--accent-revenue)", bg: "var(--success-lt)" },
        { label: "Total Orders", value: String(data.orderCount), sub: data.orderCount > 0 ? `AOV ${formatCurrency(data.averageOrderValue)}` : "No orders yet", icon: ShoppingBag, color: "var(--accent-orders)", bg: "var(--info-lt)" },
        { label: "Unique Customers", value: String(data.customerCount), sub: data.customerCount > 0 ? `${data.customerRetentionRate.toFixed(0)}% retention` : "No customers yet", icon: Users, color: "var(--accent)", bg: "var(--accent-lt)" },
        { label: "Conversion Rate", value: `${data.conversionRate.toFixed(1)}%`, sub: `~${data.activeUsers7d} estimated visitors`, icon: MessageCircle, color: "#25D366", bg: "rgba(37,211,102,0.08)" },
    ] : [];

    const channelIcons: Record<string, typeof TrendingUp> = { whatsapp: MessageCircle, pos: MonitorSmartphone, online: TrendingUp, marketplace: ShoppingBag };
    const channelColors: Record<string, string> = { whatsapp: "#25D366", pos: "var(--primary)", online: "var(--accent)", marketplace: "var(--accent-orders)" };

    const maxTrend = data?.salesTrends.length ? Math.max(...data.salesTrends.map(t => t.amount), 1) : 1;

    return (
        <div className="animate-entrance" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div className="desktop-only">
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0, fontFamily: "var(--font-display)" }}>Analytics</h2>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Track your store performance</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--rl)", padding: 3 }}>
                    <Calendar size={13} style={{ color: "var(--ghost)", margin: "0 6px 0 8px" }} />
                    {PERIODS.map((p) => (
                        <button key={p} onClick={() => setPeriod(p)} style={{
                            padding: "6px 12px", borderRadius: "var(--r)", border: "none",
                            fontSize: 12, fontWeight: period === p ? 700 : 500,
                            background: period === p ? "var(--accent)" : "transparent",
                            color: period === p ? "#fff" : "var(--muted)",
                            cursor: "pointer", transition: "var(--transition-fast)",
                            boxShadow: period === p ? "0 1px 4px rgba(245,166,35,0.25)" : "none",
                        }}>{p}</button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12 }}>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                        <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 14 }} />
                        <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6, marginBottom: 6 }} />
                        <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4 }} />
                    </div>
                )) : metrics.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div key={m.label} className="card" style={{ padding: 20, borderRadius: "var(--rl)", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: m.color, opacity: 0.5 }} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={17} style={{ color: m.color }} />
                                </div>
                            </div>
                            <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{m.value}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 6 }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: "var(--ghost)", fontWeight: 500, marginTop: 3 }}>{m.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Revenue Chart — simple bar visualization */}
            <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>Revenue Over Time</h3>
                    <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>{period}</span>
                </div>
                {loading ? (
                    <div className="skeleton" style={{ height: 200, borderRadius: "var(--rl)" }} />
                ) : !data?.salesTrends.length ? (
                    <div style={{
                        height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                        background: "var(--surface)", borderRadius: "var(--rl)", border: "1px dashed var(--border)",
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BarChart2 size={22} strokeWidth={1.5} style={{ color: "var(--ghost)" }} />
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", margin: 0 }}>No data yet</p>
                        <p style={{ fontSize: 11, color: "var(--ghost)", maxWidth: 240, textAlign: "center", lineHeight: 1.5 }}>Revenue chart appears once your first sale is recorded.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180, padding: "0 4px" }}>
                        {data.salesTrends.map((t, i) => {
                            const pct = (t.amount / maxTrend) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <span style={{ fontSize: 9, color: "var(--ghost)", fontFamily: "var(--font-mono)" }}>
                                        {formatCurrency(t.amount).replace(/\.00$/, "")}
                                    </span>
                                    <div style={{
                                        width: "100%", minHeight: 4, height: `${Math.max(pct, 3)}%`,
                                        background: "linear-gradient(180deg, var(--accent), var(--accent-dk))",
                                        borderRadius: "4px 4px 0 0", transition: "height 0.3s ease",
                                    }} />
                                    <span style={{ fontSize: 8, color: "var(--ghost)", whiteSpace: "nowrap" }}>
                                        {new Date(t.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
                {/* Top Products */}
                <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Top Products</h3>
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />)}
                        </div>
                    ) : !data?.topProducts.length ? (
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            padding: "32px 16px", gap: 8, background: "var(--surface)", borderRadius: "var(--rl)", border: "1px dashed var(--border)",
                        }}>
                            <ShoppingBag size={18} strokeWidth={1.5} style={{ color: "var(--ghost)" }} />
                            <p style={{ fontSize: 11, color: "var(--ghost)", margin: 0, textAlign: "center" }}>Products will rank here once you have sales</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {data.topProducts.slice(0, 5).map((p, i) => (
                                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ghost)", width: 20, textAlign: "center" }}>#{i + 1}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                                        <p style={{ fontSize: 10, color: "var(--muted)", margin: 0 }}>{p.sales} sales</p>
                                    </div>
                                    <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-revenue)" }}>{formatCurrency(p.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Channel Breakdown */}
                <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Sales by Channel</h3>
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
                        </div>
                    ) : !data?.channelBreakdown || Object.keys(data.channelBreakdown).length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { name: "WhatsApp", icon: MessageCircle, color: "#25D366", bg: "rgba(37,211,102,0.08)" },
                                { name: "Online Store", icon: TrendingUp, color: "var(--accent)", bg: "var(--accent-lt)" },
                            ].map((ch) => {
                                const Icon = ch.icon;
                                return (
                                    <div key={ch.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 10, background: ch.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={14} style={{ color: ch.color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{ch.name}</span>
                                                <span className="font-mono" style={{ fontSize: 11, color: "var(--ghost)" }}>0 orders</span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)" }}>
                                                <div style={{ height: 4, borderRadius: 2, background: ch.color, width: 0 }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {(data.channelBreakdown as { channel: string; revenue: number; orders: number }[]).map((info) => {
                                const channelKey = info.channel.toLowerCase();
                                const Icon = channelIcons[channelKey] || TrendingUp;
                                const color = channelColors[channelKey] || "var(--primary)";
                                const totalOrders = data.orderCount || 1;
                                const pct = (info.orders / totalOrders) * 100;
                                return (
                                    <div key={info.channel} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={14} style={{ color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", textTransform: "capitalize" }}>{channelKey}</span>
                                                <span className="font-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{info.orders} orders · {formatCurrency(info.revenue)}</span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)" }}>
                                                <div style={{ height: 4, borderRadius: 2, background: color, width: `${pct}%`, transition: "width 0.3s ease" }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Stock Alerts */}
                {data?.stockAlerts && data.stockAlerts.length > 0 && (
                    <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
                            <AlertTriangle size={13} style={{ marginRight: 6, color: "var(--accent)" }} />
                            Stock Alerts
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {data.stockAlerts.slice(0, 5).map((alert) => (
                                <div key={alert.productId} style={{
                                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                                    borderRadius: 8, background: alert.severity === "critical" ? "rgba(239,68,68,0.06)" : "var(--accent-lt)",
                                    border: `1px solid ${alert.severity === "critical" ? "rgba(239,68,68,0.15)" : "rgba(245,166,35,0.15)"}`,
                                }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {alert.productName}
                                    </span>
                                    <span className="font-mono" style={{
                                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                                        color: alert.severity === "critical" ? "#ef4444" : "var(--accent)",
                                    }}>
                                        {alert.currentStock} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
