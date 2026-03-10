"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Package,
    Plus,
    Search,
    Filter,
    Upload,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────── */

export default function ProductsPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="animate-entrance" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>Products</h2>
                    <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Manage your product catalogue</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                        <Upload size={14} />
                        Import
                    </button>
                    <Link href="/dashboard/products/new" className="btn btn-primary" style={{ fontSize: 12 }}>
                        <Plus size={15} />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* ── Filter bar ── */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
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
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: 34, fontSize: 13 }}
                    />
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                    <Filter size={14} />
                    Filter
                </button>
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
                        width: 72,
                        height: 72,
                        borderRadius: 22,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 20,
                    }}
                >
                    <Package size={30} strokeWidth={1.3} style={{ color: "var(--ghost)" }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>No products yet</p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, maxWidth: 320, lineHeight: 1.6 }}>
                    Add your first product and it will appear in your online store and WhatsApp catalogue automatically.
                </p>
                <Link
                    href="/dashboard/products/new"
                    className="btn btn-primary"
                    style={{
                        marginTop: 20,
                        fontSize: 13,
                        padding: "10px 22px",
                    }}
                >
                    <Plus size={16} />
                    Add your first product
                </Link>
            </div>
        </div>
    );
}
