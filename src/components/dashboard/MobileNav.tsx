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
   Mobile Bottom Tab Bar — Premium glassmorphic native-app-feel navigation
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
            className="mobile-only mobile-glass-bar"
            style={{
                position: "fixed",
                bottom: 0, left: 0, right: 0,
                display: "flex", alignItems: "stretch",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                zIndex: 999,
                height: 64,
            }}
        >
            {TABS.map((tab) => {
                const active = isActive(tab.href, tab.exact);
                const Icon = tab.icon;
                const isWhatsApp = tab.accent;
                const activeColor = isWhatsApp ? "#25D366" : "var(--accent)";

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        style={{
                            flex: 1,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            gap: 2,
                            textDecoration: "none",
                            transition: "color 0.12s ease, transform 0.1s ease",
                            position: "relative",
                            color: active ? activeColor : "var(--ghost)",
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {/* Active pill indicator */}
                        {active && (
                            <span style={{
                                position: "absolute", top: -1,
                                width: 24, height: 3, borderRadius: 2,
                                background: activeColor,
                                boxShadow: `0 2px 8px ${isWhatsApp ? "rgba(37,211,102,0.4)" : "rgba(245,166,35,0.4)"}`,
                            }} />
                        )}

                        {/* Active background pill */}
                        {active && (
                            <span style={{
                                position: "absolute",
                                width: 48, height: 32, borderRadius: 12,
                                background: isWhatsApp ? "rgba(37,211,102,0.08)" : "rgba(245,166,35,0.08)",
                                top: "50%", transform: "translateY(-55%)",
                            }} />
                        )}

                        <Icon
                            size={active ? 21 : 20}
                            strokeWidth={active ? 2.4 : 1.5}
                            style={{ position: "relative", zIndex: 1 }}
                        />
                        <span style={{
                            fontSize: 9.5,
                            fontWeight: active ? 800 : 500,
                            letterSpacing: active ? "0.02em" : "0",
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
