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
  Sparkles
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

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
  const w = collapsed ? 68 : 248;

  return (
    <aside
      className="desktop-only h-screen flex flex-col transition-all duration-300 ease-in-out border-r border-white/5"
      style={{
        width: w,
        minWidth: w,
        background: "var(--ink)",
      }}
    >
      {/* ── Brand ── */}
      <div className={cn(
        "flex items-center gap-3 py-6 px-5 border-b border-white/5 flex-shrink-0",
        collapsed ? "justify-center px-0" : "justify-start"
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue to-blue-dim flex items-center justify-center shadow-lg shadow-blue/20 flex-shrink-0">
          <Zap size={16} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-extrabold text-lg tracking-tighter leading-none font-display">SOLO</div>
            <div className="text-white/30 text-[9px] font-bold tracking-widest uppercase mt-1">
              Obsidian v3.0
            </div>
          </div>
        )}
      </div>

      {/* ── Beta badge ── */}
      <div className={cn("py-4 px-4 flex-shrink-0", collapsed ? "px-2" : "px-4")}>
        <div className={cn(
          "flex items-center gap-2 bg-blue-dim border border-white/5 rounded-xl p-2",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="beta-chip border-none bg-transparent p-0"></div>
          {!collapsed && (
            <span className="text-blue font-bold text-[10px] tracking-wider uppercase">
              Closed Beta
            </span>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          const isWhatsApp = item.accent === "whatsapp";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 group relative",
                collapsed ? "justify-center" : "justify-start",
                active
                  ? "bg-white/10 text-white shadow-xl shadow-black/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue rounded-r-full shadow-[0_0_12px_var(--blue)]" />
              )}

              <Icon
                size={18}
                className={cn(
                  "transition-colors duration-200",
                  active ? (isWhatsApp ? "text-green" : "text-blue") : "group-hover:text-white"
                )}
                strokeWidth={active ? 2.5 : 2}
              />

              {!collapsed && (
                <span className="text-[13px] font-semibold tracking-tight">
                  {item.label}
                </span>
              )}

              {!collapsed && isWhatsApp && !active && (
                <span className="ml-auto text-[8px] font-extrabold bg-green/10 text-green px-1.5 py-0.5 rounded-full border border-green/20">
                  AI
                </span>
              )}

              {active && collapsed && (
                <div className="absolute inset-0 bg-blue/10 rounded-xl" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="p-2 border-t border-white/5 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 text-white/20 hover:text-white/50 hover:bg-white/5 rounded-xl transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="text-[11px] font-bold uppercase tracking-wider">Collapse</span></>}
        </button>
      </div>

      {/* ── Store card ── */}
      <div className="p-4 border-t border-white/5 flex-shrink-0 bg-black/20">
        <div className={cn(
          "flex items-center gap-3 mb-3",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-blue-dim border-2 border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-xs">{initial}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-bold truncate leading-tight">
                {tenantName || "My Store"}
              </div>
              <div className="text-white/30 text-[10px] font-medium tracking-tight">Beta Institutional</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Link
            href={`/store/${subdomain || tenantId || "demo"}`}
            target="_blank"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/10 text-white/40 hover:text-blue hover:border-blue/30 hover:bg-blue/5 transition-all duration-200 text-[11px] font-bold uppercase tracking-wider"
          >
            <ExternalLink size={12} />
            <span>View Store</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
