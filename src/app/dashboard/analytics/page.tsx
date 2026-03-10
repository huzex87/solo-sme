"use client";

import { useState } from "react";
import { TrendingUp, Users, ShoppingBag, MessageCircle, BarChart2, Calendar } from "lucide-react";

const PERIODS = ["7 days", "30 days", "90 days"] as const;
type Period = (typeof PERIODS)[number];

const METRICS = [
    { label: "Total Revenue", value: "₦0", sub: "No sales yet", icon: TrendingUp, color: "var(--accent-revenue)", bg: "var(--success-lt)" },
    { label: "Total Orders", value: "0", sub: "No orders yet", icon: ShoppingBag, color: "var(--accent-orders)", bg: "var(--info-lt)" },
    { label: "Unique Customers", value: "0", sub: "No customers yet", icon: Users, color: "var(--accent)", bg: "var(--accent-lt)" },
    { label: "WhatsApp Enquiries", value: "0", sub: "Connect WhatsApp", icon: MessageCircle, color: "#25D366", bg: "rgba(37,211,102,0.08)" },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<Period>("7 days");

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
                {METRICS.map((m) => {
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

            {/* Chart */}
            <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.02em" }}>Revenue Over Time</h3>
                    <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>{period}</span>
                </div>
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
            </div>

            {/* Bottom grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
                <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Top Products</h3>
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        padding: "32px 16px", gap: 8, background: "var(--surface)", borderRadius: "var(--rl)", border: "1px dashed var(--border)",
                    }}>
                        <ShoppingBag size={18} strokeWidth={1.5} style={{ color: "var(--ghost)" }} />
                        <p style={{ fontSize: 11, color: "var(--ghost)", margin: 0, textAlign: "center" }}>Products will rank here once you have sales</p>
                    </div>
                </div>

                <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 14px", letterSpacing: "-0.02em" }}>Sales by Channel</h3>
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
                    <p style={{ fontSize: 10, color: "var(--ghost)", marginTop: 14, textAlign: "center", fontWeight: 500 }}>
                        Channel breakdown appears once orders are recorded
                    </p>
                </div>
            </div>
        </div>
    );
}
