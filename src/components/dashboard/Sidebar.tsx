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
  const w = collapsed ? 72 : 260;

  return (
    <aside
      className="desktop-only h-screen flex flex-col transition-all duration-300 ease-in-out border-none"
      style={{
        width: w,
        minWidth: w,
        background: "var(--ink)",
      }}
    >
      {/* ── Brand ── */}
      <div className={cn(
        "flex items-center gap-3 py-8 px-6 border-b border-white/5 flex-shrink-0",
        collapsed ? "justify-center px-0" : "justify-start"
      )}>
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
          <Zap size={20} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-xl tracking-tighter leading-none font-display">SOLO</div>
            <div className="text-white/30 text-[9px] font-bold tracking-widest uppercase mt-1.5 opacity-60">
              Institutional v3.0
            </div>
          </div>
        )}
      </div>

      {/* ── Beta badge ── */}
      <div className={cn("py-4 px-4 flex-shrink-0", collapsed ? "px-2" : "px-4")}>
        <div className={cn(
          "flex items-center gap-2 bg-primary-lt border border-white/5 rounded-2xl p-2.5",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {!collapsed && (
            <span className="text-primary-md font-bold text-[10px] tracking-widest uppercase">
              Institutional Access
            </span>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          const isWhatsApp = item.accent === "whatsapp";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 px-4 rounded-2xl transition-all duration-200 group relative",
                collapsed ? "justify-center" : "justify-start",
                active
                  ? "bg-white/10 text-white shadow-xl shadow-black/20"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  active ? (isWhatsApp ? "text-green" : "text-primary-md") : "group-hover:text-white"
                )}
                strokeWidth={active ? 2.5 : 2}
              />

              {!collapsed && (
                <span className="text-[14px] font-bold tracking-tight">
                  {item.label}
                </span>
              )}

              {!collapsed && isWhatsApp && !active && (
                <span className="ml-auto text-[8px] font-extrabold bg-green/10 text-green px-2 py-0.5 rounded-full border border-green/20">
                  AI
                </span>
              )}

              {active && collapsed && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="p-3 border-t border-white/5 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-2xl transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-[11px] font-bold uppercase tracking-widest">Mastery Collapse</span></>}
        </button>
      </div>

      {/* ── Store card ── */}
      <div className="p-5 border-t border-white/5 flex-shrink-0 bg-black/30">
        <div className={cn(
          "flex items-center gap-4 mb-4",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-dk border-2 border-white/10 flex items-center justify-center shadow-2xl flex-shrink-0">
            <span className="text-white font-extrabold text-sm">{initial}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-[15px] font-bold truncate leading-tight">
                {tenantName || "Sovereign Merchant"}
              </div>
              <div className="text-white/30 text-[10px] font-bold tracking-widest uppercase mt-0.5">SME Mastery</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Link
            href={`/store/${subdomain || tenantId || "demo"}`}
            target="_blank"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-white/40 hover:text-primary-md hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-[11px] font-extrabold uppercase tracking-widest"
          >
            <ExternalLink size={14} />
            <span>Sovereign Store</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
