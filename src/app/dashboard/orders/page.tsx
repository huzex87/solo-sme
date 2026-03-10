"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ShoppingBag,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    MessageCircle,
    Globe,
    ArrowRight,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────── */

type TabValue = "all" | "pending" | "processing" | "completed" | "cancelled";

const TABS: { label: string; value: TabValue }[] = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export default function OrdersPage() {
    const [tab, setTab] = useState<TabValue>("all");
    const [search, setSearch] = useState("");

    return (
        <div className="animate-entrance" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <div className="desktop-only">
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>Orders</h2>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Track and manage customer orders</p>
            </div>

            {/* ── Filters ── */}
            <div className="card" style={{ padding: 16, borderRadius: "var(--rl)", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setTab(t.value)}
                            style={{
                                padding: "7px 14px",
                                borderRadius: "var(--r)",
                                border: "none",
                                fontSize: 12,
                                fontWeight: tab === t.value ? 700 : 500,
                                background: tab === t.value ? "var(--primary)" : "transparent",
                                color: tab === t.value ? "#fff" : "var(--muted)",
                                cursor: "pointer",
                                transition: "var(--transition-fast)",
                                whiteSpace: "nowrap",
                                boxShadow: tab === t.value ? "0 1px 4px rgba(0,121,140,0.2)" : "none",
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: "relative" }}>
                    <Search
                        size={14}
                        style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--ghost)",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search by customer or order number…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: 34, fontSize: 13 }}
                    />
                </div>
            </div>

            {/* ── Empty State ── */}
            <div
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "64px 24px",
                    borderRadius: "var(--rl)",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 20,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                    }}
                >
                    <ShoppingBag size={26} strokeWidth={1.5} style={{ color: "var(--ghost)" }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>No orders yet</p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, maxWidth: 300, lineHeight: 1.6 }}>
                    When customers place orders through your online store or WhatsApp, they&apos;ll show up here.
                </p>
                <Link
                    href="/dashboard/whatsapp"
                    style={{
                        marginTop: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#25D366",
                        background: "rgba(37,211,102,0.08)",
                        padding: "10px 18px",
                        borderRadius: "var(--r)",
                        textDecoration: "none",
                        border: "1px solid rgba(37,211,102,0.15)",
                        transition: "var(--transition)",
                    }}
                >
                    <MessageCircle size={14} />
                    Set up WhatsApp AI to receive orders
                    <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
