"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, MessageCircle,
  ChevronLeft, ChevronRight, Zap, ExternalLink,
  Store, Users, Settings, Bell, HelpCircle
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
    ]
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Marketing", href: "/dashboard/marketing", icon: Zap },
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
        "hidden lg:flex flex-col h-screen shrink-0 border-r border-slate-200 transition-all duration-300 ease-in-out z-50 bg-white",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex items-center shrink-0 h-16 px-6",
        collapsed && "justify-center px-0"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
            <Zap size={18} fill="currentColor" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">Solo SME</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
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
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-[13px] font-medium outline-none",
                      active
                        ? "bg-primary/5 text-primary"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 space-y-3">
        {!collapsed && (
          <Link
            href={`/store/${subdomain || tenantId || "demo"}`}
            target="_blank"
            className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all bg-white shadow-sm"
          >
            <span>Preview Store</span>
            <ExternalLink size={12} />
          </Link>
        )}

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-slate-50",
          collapsed && "justify-center"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-xs shrink-0 shadow-sm">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userName || "Merchant"}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Free Tier</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={14} /> Collapse</div>}
        </button>
      </div>
    </aside>
  );
}
