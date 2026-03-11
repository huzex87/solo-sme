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
    <header className="h-[52px] shrink-0 flex items-center px-8 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 gap-6 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all">
        <Menu size={18} />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-slate-950 tracking-tight">{title}</h1>
      </div>

      {/* Search Bar - Integrated Command Trigger */}
      <div className="hidden md:flex items-center gap-3 bg-slate-100/50 border border-slate-200/40 rounded-lg px-3 py-1.5 w-72 lg:w-80 group transition-all cursor-pointer hover:bg-white hover:border-slate-300 hover:shadow-sm">
        <Search size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        <span className="text-[13px] text-slate-400 font-medium group-hover:text-slate-500">Search or jump...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm opacity-80">
          <Command size={10} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-950 rounded-lg transition-all relative group shadow-sm bg-white border border-slate-200/50">
          <Bell size={16} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-white shadow-glow-sm" />
        </button>

        <div className="h-4 w-px bg-slate-200/80 mx-1" />

        <button className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-all group ring-2 ring-white ring-offset-2 ring-offset-slate-50 relative overflow-hidden">
          <div className="text-white text-[10px] font-bold uppercase group-hover:scale-110 transition-transform relative z-10">{initials}</div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>
      </div>
    </header>
  );
}
