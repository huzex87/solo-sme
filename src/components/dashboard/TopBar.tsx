"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/whatsapp": "WhatsApp AI",
  "/dashboard/pos": "Point of Sale",
  "/dashboard/settings": "Settings",
  "/dashboard/customers": "Customers",
  "/dashboard/marketing": "Marketing",
  "/dashboard/financials": "Financials",
  "/dashboard/payouts": "Payouts",
  "/dashboard/hub": "Hub",
  "/dashboard/invoices": "Invoices",
  "/dashboard/content": "Content Lab",
  "/dashboard/staff": "Staff",
  "/dashboard/marketplace": "Marketplace",
};

export default function TopBar() {
  const pathname = usePathname();
  const { userName, subdomain } = useTenant();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  )?.[1] || "Dashboard";

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "SO";
  const storeUrl = subdomain ? `/store/${subdomain}` : "/store";

  return (
    <>
      {/* ═══ DESKTOP TopBar — Light ═══ */}
      <header className="desktop-only" style={{
        height: "var(--topbar-height)", display: "flex", alignItems: "center",
        padding: "0 32px",
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        gap: 12, flexShrink: 0, position: "relative", zIndex: 40,
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 17, fontWeight: 800, color: "var(--ink)",
            letterSpacing: "-0.03em", margin: 0, fontFamily: "var(--font-display)",
          }}>{title}</h1>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--rl)", padding: "7px 12px", width: 200,
          cursor: "pointer",
        }}
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        >
          <Search size={13} strokeWidth={2} style={{ color: "var(--ghost)", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "var(--ghost)", fontWeight: 500 }}>Search…</span>
          <kbd style={{
            marginLeft: "auto", fontSize: 10, color: "var(--ghost)",
            background: "var(--card)", padding: "1px 5px", borderRadius: 4,
            border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontWeight: 500,
          }}>⌘K</kbd>
        </div>

        {/* Desktop actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <DeskIconBtn title="Notifications" badge><Bell size={16} strokeWidth={1.8} /></DeskIconBtn>
          <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 6px" }} />
          <button style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 8px",
            borderRadius: "var(--r)", border: "none", background: "transparent",
            cursor: "pointer",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent-dk))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(245,166,35,0.2)",
            }}>
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</span>
            </div>
          </button>
        </div>
      </header>

      {/* ═══ MOBILE TopBar — Dark Teal Brand Header ═══ */}
      <header className="mobile-only" style={{
        height: 56, display: "flex", alignItems: "center",
        padding: "0 14px",
        background: "linear-gradient(135deg, #00798C, #005F6E)",
        gap: 8, flexShrink: 0, position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,121,140,0.15)",
      }}>
        {/* Brand mark */}
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)" }}>S</span>
        </div>

        {/* Page title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: 15, fontWeight: 700, color: "#fff",
            letterSpacing: "-0.02em", margin: 0, fontFamily: "var(--font-display)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{title}</h1>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View Store"
            style={{
              width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <ExternalLink size={16} strokeWidth={1.8} />
          </a>
          <MobIconBtn title="Search"><Search size={17} strokeWidth={1.8} /></MobIconBtn>
          <MobIconBtn title="Notifications" badge><Bell size={17} strokeWidth={1.8} /></MobIconBtn>
        </div>
      </header>
    </>
  );
}

/* ── Desktop icon button ── */
function DeskIconBtn({ children, title, badge }: { children: React.ReactNode; title: string; badge?: boolean }) {
  return (
    <button title={title} style={{
      width: 34, height: 34, borderRadius: "var(--r)",
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "none", background: "transparent", color: "var(--muted)",
      cursor: "pointer", position: "relative",
    }}>
      {children}
      {badge && (
        <span style={{
          position: "absolute", top: 7, right: 7, width: 7, height: 7,
          borderRadius: "50%", background: "var(--accent)",
          border: "2px solid var(--card)",
        }} />
      )}
    </button>
  );
}

/* ── Mobile icon button — white on teal ── */
function MobIconBtn({ children, title, badge }: { children: React.ReactNode; title: string; badge?: boolean }) {
  return (
    <button title={title} style={{
      width: 36, height: 36, borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)",
      cursor: "pointer", position: "relative",
      WebkitTapHighlightColor: "transparent",
    }}>
      {children}
      {badge && (
        <span style={{
          position: "absolute", top: 6, right: 6, width: 7, height: 7,
          borderRadius: "50%", background: "#F5A623",
          border: "2px solid #005F6E",
          boxShadow: "0 0 6px rgba(245,166,35,0.5)",
        }} />
      )}
    </button>
  );
}
