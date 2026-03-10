"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

/* ──────────────────────────────────────────────────────────────────────────────
   TopBar — Contextual title + search + actions
   ────────────────────────────────────────────────────────────────────────── */

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/whatsapp": "WhatsApp AI",
  "/dashboard/pos": "Point of Sale",
  "/dashboard/settings": "Settings",
};

export default function TopBar() {
  const pathname = usePathname();
  const { userName } = useTenant();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  )?.[1] || "Dashboard";

  const initials = userName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "SO";

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        display: "flex",
        alignItems: "center",
        padding: "0 clamp(16px, 3vw, 32px)",
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        gap: 16,
        flexShrink: 0,
        position: "relative",
        zIndex: 40,
      }}
    >
      {/* ── Title ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            margin: 0,
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h1>
      </div>

      {/* ── Search ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--rl)",
          padding: "7px 12px",
          width: 200,
          transition: "var(--transition)",
          cursor: "pointer",
        }}
        onClick={() =>
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
        }
      >
        <Search size={13} strokeWidth={2} style={{ color: "var(--ghost)", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "var(--ghost)", fontWeight: 500, whiteSpace: "nowrap" }}>Search… </span>
        <kbd
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "var(--ghost)",
            background: "var(--card)",
            padding: "1px 5px",
            borderRadius: 4,
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <IconBtn title="Help">
          <HelpCircle size={16} strokeWidth={1.8} />
        </IconBtn>

        <IconBtn title="Notifications" badge>
          <Bell size={16} strokeWidth={1.8} />
        </IconBtn>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 6px" }} />

        {/* User avatar */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 8px",
            borderRadius: "var(--r)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            transition: "var(--transition-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--primary-dk))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,121,140,0.2)",
            }}
          >
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.02em" }}>{initials}</span>
          </div>
        </button>
      </div>
    </header>
  );
}

/* ── Icon button helper ── */
function IconBtn({ children, title, badge }: { children: React.ReactNode; title: string; badge?: boolean }) {
  return (
    <button
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: "var(--r)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        background: "transparent",
        color: "var(--muted)",
        cursor: "pointer",
        transition: "var(--transition-fast)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface)";
        e.currentTarget.style.color = "var(--body)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--muted)";
      }}
    >
      {children}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--primary)",
            border: "2px solid var(--card)",
          }}
        />
      )}
    </button>
  );
}
