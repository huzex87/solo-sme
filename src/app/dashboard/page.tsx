"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Zap,
  Plus,
  MonitorSmartphone,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   Dashboard Overview — Closed Beta
   Stat cards + Recent Orders + Quick Actions + WhatsApp CTA
   ────────────────────────────────────────────────────────────────────────── */

const STATS = [
  { label: "Total Revenue", value: "₦0.00", sub: "Start selling to see data", icon: TrendingUp, color: "var(--accent-revenue)", bg: "var(--success-lt)" },
  { label: "Total Orders", value: "0", sub: "No orders yet", icon: ShoppingBag, color: "var(--accent-orders)", bg: "var(--info-lt)" },
  { label: "Products Listed", value: "0", sub: "Add your first product", icon: Package, color: "var(--primary)", bg: "var(--primary-lt)" },
  { label: "WhatsApp Chats", value: "0", sub: "Connect WhatsApp to start", icon: MessageCircle, color: "#25D366", bg: "rgba(37,211,102,0.08)" },
];

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/dashboard/products/new", icon: Plus, color: "var(--primary)", bg: "var(--primary-lt)" },
  { label: "View Orders", href: "/dashboard/orders", icon: ShoppingBag, color: "var(--accent-orders)", bg: "var(--info-lt)" },
  { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle, color: "#25D366", bg: "rgba(37,211,102,0.08)" },
  { label: "Open POS", href: "/dashboard/pos", icon: MonitorSmartphone, color: "var(--accent)", bg: "var(--accent-lt)" },
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <div className="animate-entrance" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>
            {greeting} 👋
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--primary-lt)",
            border: "1px solid rgba(0,121,140,0.15)",
            borderRadius: 10,
            padding: "6px 14px",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite" }} />
          <span style={{ color: "var(--primary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>Closed Beta</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                padding: "20px",
                borderRadius: "var(--rl)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative top gradient */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.6, borderRadius: "var(--rl) var(--rl) 0 0" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} strokeWidth={2} style={{ color: s.color }} />
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              </div>

              <div style={{ fontSize: 11, color: "var(--ghost)", fontWeight: 500 }}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0, borderRadius: "var(--rl)", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Recent Orders</h3>
            <Link
              href="/dashboard/orders"
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <ShoppingBag size={22} strokeWidth={1.5} style={{ color: "var(--ghost)" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: 0 }}>No orders yet</p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, maxWidth: 240, lineHeight: 1.5 }}>
              Orders from your online store and WhatsApp will appear here.
            </p>
            <Link
              href="/dashboard/whatsapp"
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "#25D366",
                background: "rgba(37,211,102,0.08)",
                padding: "8px 14px",
                borderRadius: "var(--r)",
                textDecoration: "none",
                border: "1px solid rgba(37,211,102,0.15)",
                transition: "var(--transition)",
              }}
            >
              <MessageCircle size={13} />
              Set up WhatsApp AI
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 20, borderRadius: "var(--rl)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 14px" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {QUICK_ACTIONS.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "14px 8px",
                      borderRadius: "var(--rl)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                      transition: "var(--transition)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: a.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--body)", lineHeight: 1.2 }}>{a.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div
            style={{
              borderRadius: "var(--rl)",
              padding: 22,
              background: "linear-gradient(145deg, var(--sidebar-bg), #0a3352)",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorations */}
            <div style={{ position: "absolute", top: -24, right: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(0,121,140,0.12)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -10, width: 60, height: 60, borderRadius: "50%", background: "rgba(37,211,102,0.08)" }} />

            <div style={{ position: "relative" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(37,211,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <MessageCircle size={17} style={{ color: "#25D366" }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>WhatsApp AI is ready</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                Your AI assistant handles orders, receipts, and queries — 24/7, in English, Hausa & Pidgin.
              </p>
              <Link
                href="/dashboard/whatsapp"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "#25D366",
                  color: "#fff",
                  padding: "9px 16px",
                  borderRadius: "var(--r)",
                  textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(37,211,102,0.3)",
                  transition: "var(--transition)",
                }}
              >
                <Zap size={12} fill="white" />
                Connect now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Beta footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          borderRadius: "var(--rl)",
          background: "var(--primary-lt)",
          border: "1px solid rgba(0,121,140,0.12)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,121,140,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={15} style={{ color: "var(--primary)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>You&apos;re in Closed Beta</p>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>
            Core features available: Products, Orders, Analytics, WhatsApp AI, and POS. More unlocks at full launch.
          </p>
        </div>
        <a
          href="mailto:hello@solo-sme.com"
          style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          Share feedback →
        </a>
      </div>
    </div>
  );
}
