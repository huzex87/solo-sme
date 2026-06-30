"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  ChevronLeft, ChevronRight, Zap, ExternalLink,
  Users, Settings, HelpCircle, Store, MessageCircle, Instagram, LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { URLService } from "@/lib/url";
import { hasRoutePermission } from "@/utils/permission";

const NAV_GROUPS = [
  {
    label: "Intelligence",
    items: [
      { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle },
      { label: "Social Import", href: "/dashboard/import", icon: Instagram },
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
      { label: "Reports", href: "/dashboard/analytics", icon: BarChart3 },
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
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, userName, userRole } = useTenant();

  const handleSignOut = async () => {
    try {
      toast.loading("Signing out...");
      await AuthService.signOut();
      router.push("/login");
      toast.success("Successfully signed out");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const userInitial = (userName || tenantName || "S").charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "flex-col h-screen shrink-0 border-r border-slate-800 bg-[#072435] transition-all duration-500 ease-in-out z-50 shadow-xl",
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
            variant="dark"
          />
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scrollbar-none">
        {subdomain && (
          <div className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Public Store
              </h3>
            )}
            <div className="space-y-1">
              <button
                onClick={() => {
                  const url = URLService.getStoreUrl(subdomain);
                  window.open(url, '_blank');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group text-[13px] font-medium outline-none relative overflow-hidden",
                  "text-teal-400 hover:bg-white/5 hover:translate-x-0.5 border border-white/5 bg-white/5"
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

        {NAV_GROUPS.map((group) => {
          const allowedItems = group.items.filter(item => hasRoutePermission(userRole, item.href));
          if (allowedItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-2">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-4 opacity-70">
                  {group.label}
                </h3>
              )}
              <div className="space-y-1">
                {allowedItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group text-[13px] font-medium outline-none relative overflow-hidden",
                        active
                          ? "bg-white/10 text-white shadow-soft-md shadow-black/20 translate-x-1"
                          : "text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-0.5"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.5 : 2}
                        className={cn(
                          "shrink-0 transition-all duration-300",
                          active ? "text-teal-400 scale-110" : "text-slate-400 group-hover:text-white group-hover:scale-105"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate tracking-tight relative z-10 font-medium">{item.label}</span>
                      )}
                      {active && !collapsed && (
                        <div className="ml-auto w-1 h-1 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/10">
        <div
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 cursor-pointer group active:scale-95 hover:bg-red-500/10 border border-transparent hover:border-red-500/20",
            collapsed ? "justify-center" : "px-3"
          )}
          title="Sign Out"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 text-white font-bold text-xs shrink-0 shadow-lg ring-2 ring-white/10 ring-offset-2 ring-offset-slate-950 transition-transform group-hover:rotate-3">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate tracking-tight group-hover:text-red-400 transition-colors">
                {userName || "Merchant"}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-[11px] text-slate-400 font-medium tracking-tight truncate">Free Plan</p>
                </div>
                <LogOut size={12} className="text-slate-500 group-hover:text-red-400 transition-colors ml-2 shrink-0" />
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
    </aside >
  );
}
