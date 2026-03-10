"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    MessageCircle,
    MoreHorizontal,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   Mobile Bottom Tab Bar — Clean white bar with teal active state
   Designed to complement the dark teal TopBar header
   ────────────────────────────────────────────────────────────────────────── */

const TABS = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageCircle, accent: true },
    { label: "More", href: "/dashboard/settings", icon: MoreHorizontal },
];

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <nav
            className="mobile-only"
            style={{
                position: "fixed",
                bottom: 0, left: 0, right: 0,
                display: "flex", alignItems: "stretch",
                background: "#fff",
                borderTop: "1px solid #E8EEF1",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                zIndex: 999,
                height: 64,
                boxShadow: "0 -4px 20px rgba(0,0,0,0.05), 0 -1px 4px rgba(0,0,0,0.03)",
            }}
        >
            {TABS.map((tab) => {
                const active = isActive(tab.href, tab.exact);
                const Icon = tab.icon;
                const isWhatsApp = tab.accent;
                const activeColor = isWhatsApp ? "#25D366" : "#00798C";
                const inactiveColor = "#9AAFB8";

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        style={{
                            flex: 1,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 3,
                            textDecoration: "none",
                            transition: "color 0.15s ease",
                            position: "relative",
                            color: active ? activeColor : inactiveColor,
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {/* ── Active top bar indicator ── */}
                        {active && (
                            <span style={{
                                position: "absolute", top: -1,
                                width: 28, height: 3, borderRadius: 2,
                                background: activeColor,
                            }} />
                        )}

                        {/* ── Active background pill ── */}
                        {active && (
                            <span style={{
                                position: "absolute",
                                width: 52, height: 34, borderRadius: 12,
                                background: isWhatsApp ? "rgba(37,211,102,0.06)" : "rgba(0,121,140,0.06)",
                                top: "50%", transform: "translateY(-55%)",
                            }} />
                        )}

                        <Icon
                            size={active ? 22 : 20}
                            strokeWidth={active ? 2.3 : 1.5}
                            style={{ position: "relative", zIndex: 1 }}
                        />
                        <span style={{
                            fontSize: 10,
                            fontWeight: active ? 800 : 500,
                            letterSpacing: active ? "0.01em" : "0",
                            position: "relative", zIndex: 1,
                            fontFamily: "var(--font-sans)",
                        }}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
