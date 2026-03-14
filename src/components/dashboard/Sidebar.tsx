"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  ChevronLeft, ChevronRight, Zap, ExternalLink,
  Users, Settings, HelpCircle, Bell, Store, MessageCircle
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Intelligence",
    items: [
      { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle },
    ]
  },
  {
    label: "Store Management",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Point of Sale (POS)", href: "/dashboard/pos", icon: Store },
    ]
  },
  {
    label: "Growth & Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Marketing Hub", href: "/dashboard/marketing", icon: Zap },
      { label: "Customers", href: "/dashboard/customers", icon: Users },
    ]
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Help Center", href: "/dashboard/help", icon: HelpCircle },
    ]
  }
];

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, tenantId, userName } = useTenant();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const userInitial = (userName || tenantName || "S").charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "flex-col h-screen shrink-0 border-r border-border bg-white transition-all duration-500 ease-in-out z-50 shadow-[1px_0_0_0_rgba(0,0,0,0.02)]",
        !isMobile && "hidden lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center shrink-0 h-[64px] px-6 mb-2 mt-2",
        collapsed && "justify-center px-0"
      )}>
        <Link href="/dashboard" className="transition-transform active:scale-95">
          <BrandLogo
            size={collapsed ? 32 : 36}
            showText={!collapsed}
            variant="light"
          />
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scrollbar-none">
        {subdomain && (
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 opacity-70">
                Public Store
              </h3>
            )}
            <div className="space-y-1">
              <button
                onClick={() => {
                  const protocol = window.location.protocol;
                  const host = window.location.host;
                  const isLocal = host.includes('localhost');
                  const url = isLocal
                    ? `${protocol}//${subdomain}.${host}`
                    : `${protocol}//${subdomain}.solosme.ng`;
                  window.open(url, '_blank');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group text-[13px] font-medium outline-none relative overflow-hidden",
                  "text-primary hover:bg-primary/5 hover:translate-x-0.5 border border-primary/10 bg-primary/[0.02]"
                )}
                title={collapsed ? "View Store" : undefined}
              >
                <ExternalLink
                  size={18}
                  className="shrink-0 transition-all duration-300 group-hover:scale-110"
                />
                {!collapsed && (
                  <span className="truncate tracking-tight relative z-10 font-bold">View Store</span>
                )}
              </button>
            </div>
          </div>
        )}

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 opacity-70">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group text-[13px] font-medium outline-none relative overflow-hidden",
                      active
                        ? "bg-ink text-white shadow-soft-md shadow-slate-900/10 translate-x-1"
                        : "text-slate-500 hover:text-slate-950 hover:bg-slate-50 hover:translate-x-0.5"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.5 : 2}
                      className={cn(
                        "shrink-0 transition-all duration-300",
                        active ? "text-primary scale-110" : "text-slate-400 group-hover:text-slate-600 group-hover:scale-105"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate tracking-tight relative z-10 font-semibold">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        <div className={cn(
          "flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 cursor-pointer group active:scale-95",
          collapsed ? "justify-center" : "hover:bg-white hover:shadow-soft-md border border-transparent hover:border-slate-100/50"
        )}>
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-ink text-white font-bold text-xs shrink-0 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-slate-50 transition-transform group-hover:rotate-3">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-950 truncate tracking-tight">
                {userName || "Merchant"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Starter Plan</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full mt-3 py-1 text-slate-300 hover:text-slate-500 transition-colors"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} className="opacity-50" />}
        </button>
      </div>
    </aside>
  );
}
