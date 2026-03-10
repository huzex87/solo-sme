"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  MessageCircle,
  MonitorSmartphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";

/* ──────────────────────────────────────────────────────────────────────────────
   SOLO Beta Sidebar — 7 Routes Only
   Post-beta: restore previous Sidebar from Git.
   ────────────────────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle, accent: "whatsapp" },
  { label: "POS", href: "/dashboard/pos", icon: MonitorSmartphone },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, tenantId } = useTenant();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initial = tenantName?.charAt(0)?.toUpperCase() || "S";
  const w = collapsed ? 68 : 240;

  return (
    <aside
      style={{
        width: w, minWidth: w, height: "100vh",
        display: "flex", flexDirection: "column",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        transition: "width 0.25s var(--ease), min-width 0.25s var(--ease)",
        position: "relative", zIndex: 50,
      }}
    >
      {/* ── Brand ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: collapsed ? "20px 0" : "20px 20px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, var(--accent), var(--accent-dk))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(245,166,35,0.35)", flexShrink: 0,
        }}>
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "var(--font-display)" }}>SOLO</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
              SME Platform
            </div>
          </div>
        )}
      </div>

      {/* ── Beta badge ── */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 16px", flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start", gap: 6,
          background: "rgba(245,166,35,0.1)",
          border: "1px solid rgba(245,166,35,0.18)",
          borderRadius: 8, padding: collapsed ? "6px" : "6px 10px",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 8px rgba(245,166,35,0.6)",
            animation: "pulse 2s cubic-bezier(.4,0,.6,1) infinite", flexShrink: 0,
          }} />
          {!collapsed && (
            <span style={{ color: "var(--accent-md)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Closed Beta
            </span>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: "4px 8px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          const isWhatsApp = item.accent === "whatsapp";
          const activeColor = isWhatsApp ? "#25D366" : "var(--accent)";

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 10, marginBottom: 2,
                fontSize: 13, fontWeight: active ? 600 : 500,
                fontFamily: "var(--font-sans)",
                color: active ? "#fff"
                  : isWhatsApp ? "rgba(37,211,102,0.7)" : "rgba(255,255,255,0.45)",
                background: active
                  ? isWhatsApp ? "rgba(37,211,102,0.15)" : "rgba(245,166,35,0.15)"
                  : "transparent",
                transition: "all 0.15s ease", textDecoration: "none", position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = isWhatsApp ? "#25D366" : "rgba(255,255,255,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = isWhatsApp ? "rgba(37,211,102,0.7)" : "rgba(255,255,255,0.45)";
                }
              }}
            >
              {active && !collapsed && (
                <span style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 18, borderRadius: "0 3px 3px 0",
                  background: activeColor,
                  boxShadow: `0 0 8px ${isWhatsApp ? "rgba(37,211,102,0.4)" : "rgba(245,166,35,0.4)"}`,
                }} />
              )}
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8}
                style={{ flexShrink: 0, color: active ? (isWhatsApp ? "#25D366" : "var(--accent)") : "inherit", transition: "color 0.15s ease" }}
              />
              {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              {!collapsed && isWhatsApp && !active && (
                <span style={{
                  marginLeft: "auto", fontSize: 9, fontWeight: 700,
                  background: "rgba(37,211,102,0.15)", color: "#25D366",
                  padding: "2px 6px", borderRadius: 99, letterSpacing: "0.04em",
                }}>AI</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div style={{ padding: "8px", flexShrink: 0 }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "8px 0", borderRadius: 8, border: "none", background: "transparent",
          color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s ease",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>

      {/* ── Store card ── */}
      <div style={{ padding: "0 10px 14px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: collapsed ? "12px 0" : "12px 8px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dk))",
            border: "2px solid rgba(245,166,35,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initial}</span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tenantName || "My Store"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 500 }}>Beta Member</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Link href={`/store/${subdomain || tenantId || "demo"}`} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)",
            fontSize: 11, fontWeight: 500, textDecoration: "none", transition: "all 0.15s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(245,166,35,0.3)"; e.currentTarget.style.color = "var(--accent-md)"; e.currentTarget.style.background = "rgba(245,166,35,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
          >
            <ExternalLink size={11} />
            <span>View Store</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
