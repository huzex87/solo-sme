"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, Command } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/whatsapp": "AI Assistant",
  "/dashboard/pos": "Point of Sale",
  "/dashboard/settings": "Settings",
  "/dashboard/customers": "Customers",
  "/dashboard/marketing": "Marketing",
};

export default function TopBar() {
  const pathname = usePathname();
  const { userName, subdomain, tenantName } = useTenant();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  )?.[1] || "Dashboard";

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || (tenantName || "S").charAt(0).toUpperCase();

  return (
    <header className="h-[52px] shrink-0 flex items-center px-8 bg-white/80 backdrop-blur-md border-b border-slate-100/60 sticky top-0 z-40 gap-6">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all">
        <Menu size={18} />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Search Bar - Minimalist Command Style */}
      <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200/50 rounded-md px-3 py-1.5 w-72 lg:w-80 group transition-all cursor-pointer hover:bg-slate-100/50">
        <Search size={14} className="text-slate-400 group-focus-within:text-slate-600 transition-colors" />
        <span className="text-[13px] text-slate-400 font-medium">Search or jump...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm opacity-60">
          <Command size={10} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">K</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-md transition-all relative">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button className="w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center shadow-sm shrink-0 overflow-hidden active:scale-95 transition-all group ring-2 ring-white ring-offset-1 ring-offset-slate-50">
          <div className="text-white text-[10px] font-bold uppercase group-hover:scale-110 transition-transform">{initials}</div>
        </button>
      </div>
    </header>
  );
}
