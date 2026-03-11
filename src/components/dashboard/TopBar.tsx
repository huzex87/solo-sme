"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, UserCircle, Moon } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/whatsapp": "WhatsApp AI",
  "/dashboard/pos": "Point of Sale",
  "/dashboard/settings": "Settings",
  "/dashboard/customers": "Customers",
  "/dashboard/marketing": "Marketing",
  "/dashboard/financials": "Financials",
  "/dashboard/payouts": "Payouts",
  "/dashboard/hub": "Hub",
  "/dashboard/invoices": "Invoices",
  "/dashboard/content": "Content Lab",
  "/dashboard/staff": "Staff",
  "/dashboard/marketplace": "Marketplace",
};

export default function TopBar() {
  const pathname = usePathname();
  const { userName, subdomain, tenantName } = useTenant();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  )?.[1] || "Dashboard";

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || (tenantName || "S").charAt(0).toUpperCase();
  const storeUrl = subdomain ? `/store/${subdomain}` : "#";

  return (
    <>
      <header className="h-[var(--topbar-height)] flex items-center px-4 md:px-10 bg-white/70 backdrop-blur-3xl border-b border-slate-200/40 gap-6 sticky top-0 z-[100] shadow-[0_1px_2px_rgba(7,36,53,0.02)]">

        {/* Mobile menu button — hidden on LG (1024px+) to match sidebar visibility */}
        <button className="lg:hidden p-2 text-t2 hover:bg-surface-2 rounded-xl transition-colors">
          <Menu size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] md:text-[20px] font-black text-ink tracking-tight font-display m-0 truncate uppercase">{title}</h1>
        </div>

        {/* Search Bar — Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-3 bg-surface-2/80 border-none rounded-[16px] px-4 py-2 w-48 lg:w-72 cursor-pointer group active:scale-[0.98] transition-all shadow-inner">
          <Search size={16} className="text-t4 group-hover:text-primary transition-colors flex-shrink-0" />
          <span className="text-[11px] text-t4 font-bold uppercase tracking-wider truncate">Search…</span>
          <kbd className="hidden lg:flex ml-auto text-[9px] text-t4 bg-white px-2 py-0.5 rounded-lg shadow-sm font-mono font-black">⌘K</kbd>
        </div>

        {/* Action Suite */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Quick Actions */}
          <button className="hidden sm:flex w-10 h-10 rounded-2xl hover:bg-surface-2 items-center justify-center text-t3 transition-colors">
            <Moon size={18} />
          </button>

          <div className="w-10 h-10 rounded-2xl hover:bg-surface-2 flex items-center justify-center text-t3 relative cursor-pointer transition-colors">
            <Bell size={18} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </div>

          <div className="hidden md:block h-6 w-px bg-surface-2 mx-1" />

          {/* User Profile / View Store */}
          <a
            href={storeUrl}
            target="_blank"
            className="hidden lg:flex items-center gap-2 bg-white border-2 border-surface-2 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-t1 hover:bg-primary-lt hover:border-primary/20 hover:text-primary transition-all shadow-sm"
          >
            <ExternalLink size={12} />
            <span>Storefront</span>
          </a>

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-lg border border-white/10 ml-1">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>
    </>
  );
}
