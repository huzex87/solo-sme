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
      { label: "Overview",   href: "/dashboard",            icon: LayoutDashboard, exact: true },
      { label: "Inbox",      href: "/dashboard/hub",        icon: MessageCircle },
      { label: "POS",        href: "/dashboard/pos",        icon: MonitorSmartphone },
      { label: "Orders",     href: "/dashboard/orders",     icon: ShoppingBag },
      { label: "Products",   href: "/dashboard/products",   icon: Package },
      { label: "Customers",  href: "/dashboard/customers",  icon: Users },
      { label: "Loyalty",    href: "/dashboard/loyalty",    icon: Star },
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Analytics",    href: "/dashboard/analytics",  icon: BarChart3 },
      { label: "Marketing",    href: "/dashboard/marketing",  icon: Megaphone },
      { label: "Marketplace",  href: "/dashboard/marketplace",icon: Store },
      { label: "Content Lab",  href: "/dashboard/content",    icon: Layers },
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Payments",     href: "/dashboard/financials", icon: CreditCard },
      { label: "My Team",      href: "/dashboard/staff",      icon: UserCheck },
      { label: "WhatsApp AI",  href: "/dashboard/whatsapp",   icon: MessageCircle, accent: "whatsapp" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, tenantId, userName } = useTenant();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initial     = tenantName?.charAt(0)?.toUpperCase() || "S";
  const userInitial = userName?.charAt(0)?.toUpperCase()   || initial;

  return (
    <aside
      className={cn(
        "hidden lg:flex h-screen flex-col transition-all duration-300 ease-in-out border-r border-white/5 flex-shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{ background: "var(--ink)", position: "relative", zIndex: 100 }}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center gap-3 py-8 px-6 flex-shrink-0",
        collapsed ? "justify-center px-0" : "justify-start"
      )}>
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
          <Zap size={20} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-bold text-xl tracking-tighter leading-none font-display">SOLO</div>
            <div className="text-white/30 text-[9px] font-bold tracking-widest uppercase mt-1.5 opacity-60">Business Platform</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!collapsed && (
              <h3 className="px-4 text-[10px] font-extrabold text-white/20 uppercase tracking-[0.14em] mb-3">
                {group.label}
              </h3>
            )}
            {group.items.map((item: any) => {
              const active    = isActive(item.href, item.exact);
              const Icon      = item.icon;
              const isWA      = item.accent === "whatsapp";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-200 group relative",
                    collapsed ? "justify-center" : "justify-start",
                    active ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors duration-200",
                      active ? (isWA ? "text-green-400" : "text-primary-md") : "group-hover:text-white"
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {!collapsed && (
                    <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
                  )}
                  {active && collapsed && (
                    <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 flex-shrink-0 space-y-4 bg-black/10">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "justify-start")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white font-bold text-sm">{userInitial}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-[13px] font-bold truncate">{userName || "Merchant"}</div>
              <div className="text-amber-400 text-[9px] font-bold tracking-widest uppercase">Growth Plan</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <Link
            href={`/store/${subdomain || tenantId || "demo"}`}
            target="_blank"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest"
          >
            <ExternalLink size={14} />
            <span>View My Store</span>
          </Link>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-white/5 flex flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-white/20 hover:text-white/60 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
