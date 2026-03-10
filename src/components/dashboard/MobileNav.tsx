"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    BarChart3,
    MessageCircle,
    Settings,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   Mobile Bottom Tab Bar — App-like navigation for mobile devices
   Only 5 core tabs shown to keep it clean
   ────────────────────────────────────────────────────────────────────────── */

const TABS = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Products", href: "/dashboard/products", icon: Package },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "WhatsApp", href: "/dashboard/whatsapp", icon: MessageCircle, accent: true },
    { label: "More", href: "/dashboard/settings", icon: Settings },
];

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <nav className="mobile-only" style={{
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            display: "flex", alignItems: "stretch",
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            zIndex: 999,
            boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        }}>
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
                            padding: "8px 0 6px",
                            textDecoration: "none",
                            transition: "color 0.15s ease",
                            position: "relative",
                            color: active
                                ? (isWhatsApp ? "#25D366" : "var(--accent)")
                                : "var(--ghost)",
                        }}
                    >
                        {/* Active indicator line */}
                        {active && (
                            <span style={{
                                position: "absolute", top: 0, left: "25%", right: "25%",
                                height: 2, borderRadius: "0 0 2px 2px",
                                background: isWhatsApp ? "#25D366" : "var(--accent)",
                            }} />
                        )}
                        <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                        <span style={{
                            fontSize: 10, fontWeight: active ? 700 : 500,
                            letterSpacing: active ? "0.01em" : "0",
                        }}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
