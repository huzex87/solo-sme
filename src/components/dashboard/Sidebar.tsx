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
} from "lucide-react";

// ─── SOLO Beta Navigation ────────────────────────────────────────────────────
// Only these 7 items are visible during closed beta.
// All other routes remain in the codebase but are not surfaced in navigation.
// To re-enable all features post-beta, restore the previous Sidebar from Git.
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/dashboard/products",
    icon: Package,
    exact: false,
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
    exact: false,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    exact: false,
  },
  {
    label: "WhatsApp AI",
    href: "/dashboard/whatsapp",
    icon: MessageCircle,
    exact: false,
    highlight: true,
  },
  {
    label: "POS",
    href: "/dashboard/pos",
    icon: MonitorSmartphone,
    exact: false,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    exact: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="relative flex flex-col h-screen bg-[#072435] border-r border-white/5 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? "72px" : "232px", minWidth: collapsed ? "72px" : "232px" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-16 px-4 border-b border-white/5 shrink-0 overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#409EF2] flex items-center justify-center shrink-0">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-[15px] tracking-tight">SOLO</span>
              <span className="text-white/40 text-[10px] font-medium tracking-widest uppercase">SME Platform</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#409EF2] flex items-center justify-center mx-auto">
            <Zap size={16} className="text-white" fill="white" />
          </div>
        )}
      </div>

      {/* ── Beta badge ── */}
      {!collapsed && (
        <div className="mx-4 mt-4 mb-1">
          <div className="flex items-center gap-1.5 bg-[#409EF2]/10 border border-[#409EF2]/20 rounded-md px-2.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#409EF2] animate-pulse shrink-0" />
            <span className="text-[#409EF2] text-[10px] font-semibold tracking-wider uppercase">Closed Beta</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center mt-4 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#409EF2] animate-pulse" />
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-all duration-150 ease-in-out
                ${active
                  ? "bg-[#409EF2] text-white shadow-lg shadow-[#409EF2]/20"
                  : item.highlight
                    ? "text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90"
                }
              `}
            >
              {/* Active left bar */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/60 rounded-r-full" />
              )}

              <Icon
                size={18}
                className={`shrink-0 transition-colors ${active ? "text-white" : item.highlight ? "text-[#25D366]" : "text-white/40 group-hover:text-white/70"
                  }`}
              />

              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* WhatsApp "AI" badge */}
              {!collapsed && item.highlight && !active && (
                <span className="ml-auto text-[9px] font-bold bg-[#25D366]/20 text-[#25D366] px-1.5 py-0.5 rounded-full tracking-wider">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="px-3 pb-4 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-150 text-xs"
        >
          {collapsed ? <ChevronRight size={15} /> : (
            <>
              <ChevronLeft size={15} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* ── User / bottom ── */}
      {!collapsed && (
        <div className="px-3 pb-4 shrink-0 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#409EF2] to-[#072435] border border-[#409EF2]/40 flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium truncate">My Store</p>
              <p className="text-white/30 text-[10px] truncate">Beta Member</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
