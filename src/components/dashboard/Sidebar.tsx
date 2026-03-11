"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  ChevronLeft, ChevronRight, Zap, ExternalLink,
  Users, Settings, HelpCircle, Bell, Store
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Point of Sale", href: "/dashboard/pos", icon: Store },
    ]
  },
  {
    label: "Reports",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Marketing", href: "/dashboard/marketing", icon: Zap },
      { label: "Customers", href: "/dashboard/customers", icon: Users },
    ]
  },
  {
    label: "Settings",
    items: [
      { label: "Preferences", href: "/dashboard/settings", icon: Settings },
      { label: "Help", href: "/dashboard/help", icon: HelpCircle },
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
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen shrink-0 border-r border-slate-200/60 bg-white transition-all duration-300 ease-in-out z-50",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center shrink-0 h-[56px] px-6",
        collapsed && "justify-center px-0"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white transition-transform group-hover:scale-105">
            <Zap size={14} fill="currentColor" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-slate-900">SOLO</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-7 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-[0.08em] mb-2 opacity-80">
                {group.label}
              </h3>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-[13px] font-medium outline-none relative overflow-hidden",
                      active
                        ? "bg-slate-900 text-white shadow-md shadow-slate-200/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && !collapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary z-20" />
                    )}
                    <Icon
                      size={16}
                      strokeWidth={active ? 2.5 : 2}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-primary shadow-glow-sm" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate tracking-tight relative z-10">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group active:scale-95",
          collapsed ? "justify-center" : "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 text-white font-bold text-[10px] shrink-0 shadow-sm ring-2 ring-white ring-offset-2 ring-offset-slate-50">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-900 truncate tracking-tight">
                {userName || "Merchant"}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Starter Plan</p>
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
