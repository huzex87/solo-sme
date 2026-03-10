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
   Mobile Bottom Tab Bar — Amber-themed for high visibility
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
                background: "linear-gradient(135deg, #F5A623, #E8950D)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                zIndex: 999,
                height: 64,
                boxShadow: "0 -4px 24px rgba(245,166,35,0.25), 0 -1px 4px rgba(0,0,0,0.05)",
            }}
        >
            {TABS.map((tab) => {
                const active = isActive(tab.href, tab.exact);
                const Icon = tab.icon;
                const isWhatsApp = tab.accent;

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
                            color: active ? "#fff" : "rgba(255,255,255,0.55)",
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {/* ── Active top indicator ── */}
                        {active && (
                            <span style={{
                                position: "absolute", top: -1,
                                width: 28, height: 3, borderRadius: 2,
                                background: "#fff",
                            }} />
                        )}

                        {/* ── Active background pill ── */}
                        {active && (
                            <span style={{
                                position: "absolute",
                                width: 50, height: 34, borderRadius: 12,
                                background: "rgba(255,255,255,0.18)",
                                top: "50%", transform: "translateY(-55%)",
                            }} />
                        )}

                        <Icon
                            size={active ? 22 : 20}
                            strokeWidth={active ? 2.4 : 1.5}
                            style={{
                                position: "relative", zIndex: 1,
                                filter: isWhatsApp && active ? "drop-shadow(0 0 4px rgba(255,255,255,0.6))" : "none",
                            }}
                        />
                        <span style={{
                            fontSize: 10,
                            fontWeight: active ? 800 : 600,
                            letterSpacing: active ? "0.02em" : "0",
                            position: "relative", zIndex: 1,
                            fontFamily: "'Outfit', var(--font-sans)",
                            textTransform: "uppercase" as const,
                        }}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
