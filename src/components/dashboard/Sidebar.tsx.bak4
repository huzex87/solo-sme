"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, MessageCircle,
  MonitorSmartphone, ChevronLeft, ChevronRight, Zap, ExternalLink,
  Users, Star, Megaphone, Store, Layers, CreditCard, UserCheck
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Business",
    items: [
      { label: "Overview",    href: "/dashboard",             icon: LayoutDashboard, exact: true },
      { label: "Inbox",       href: "/dashboard/hub",         icon: MessageCircle },
      { label: "POS",         href: "/dashboard/pos",         icon: MonitorSmartphone },
      { label: "Orders",      href: "/dashboard/orders",      icon: ShoppingBag },
      { label: "Products",    href: "/dashboard/products",    icon: Package },
      { label: "Customers",   href: "/dashboard/customers",   icon: Users },
      { label: "Loyalty",     href: "/dashboard/loyalty",     icon: Star },
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Analytics",   href: "/dashboard/analytics",   icon: BarChart3 },
      { label: "Marketing",   href: "/dashboard/marketing",   icon: Megaphone },
      { label: "Marketplace", href: "/dashboard/marketplace", icon: Store },
      { label: "Content Lab", href: "/dashboard/content",     icon: Layers },
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Payments",    href: "/dashboard/financials",  icon: CreditCard },
      { label: "My Team",     href: "/dashboard/staff",       icon: UserCheck },
      { label: "WhatsApp AI", href: "/dashboard/whatsapp",    icon: MessageCircle, accent: "whatsapp" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, tenantId, userName } = useTenant();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const userInitial = (userName || tenantName || "S").charAt(0).toUpperCase();

  return (
    // Use Tailwind hidden/lg:flex directly — NOT .desktop-only class
    // This guarantees correct flex behavior regardless of globals.css
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen flex-shrink-0",
        "border-r border-white/5 transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{ background: "var(--ink)", zIndex: 100 }}
    >
      {/* ── Brand ── */}
      <div className={cn(
        "flex items-center gap-3 py-7 flex-shrink-0",
        collapsed ? "justify-center" : "px-5"
      )}>
        <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-lg flex-shrink-0">
          <Zap size={17} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-[18px] tracking-tighter leading-none font-display">SOLO</div>
            <div className="text-white/25 text-[8px] font-bold tracking-[0.2em] uppercase mt-1">Business Platform</div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2.5 overflow-y-auto no-scrollbar space-y-4 py-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 text-[9px] font-black text-white/20 uppercase tracking-[0.18em] mb-2 mt-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item: any) => {
                const active = isActive(item.href, item.exact);
                const Icon   = item.icon;
                const isWA   = item.accent === "whatsapp";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 py-2.5 rounded-xl transition-all duration-150 group",
                      collapsed ? "justify-center px-2" : "px-3",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    )}
                  >
                    <Icon
                      size={17}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        active ? (isWA ? "text-green-400" : "text-teal-300") : "group-hover:text-white/70"
                      )}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    {!collapsed && (
                      <span className="text-[13px] font-semibold tracking-tight truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="p-3 border-t border-white/5 space-y-3 flex-shrink-0">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-sm">{userInitial}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-[12px] font-bold truncate">{userName || "Merchant"}</div>
              <div className="text-amber-400 text-[9px] font-bold tracking-[0.12em] uppercase">Growth Plan</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <Link
            href={`/store/${subdomain || tenantId || "demo"}`}
            target="_blank"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/10 text-white/35 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <ExternalLink size={11} />
            View My Store
          </Link>
        )}
      </div>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-white/5 text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
