"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, Command } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/products": "Products",
  "/dashboard/orders": "Orders",
  "/dashboard/analytics": "Analytics",
  "/dashboard/whatsapp": "AI Assistant",
  "/dashboard/pos": "Point of Sale",
  "/dashboard/settings": "Preferences",
  "/dashboard/customers": "Customers",
  "/dashboard/marketing": "Marketing",
};

export default function TopBar() {
  const pathname = usePathname();
  const { userName, subdomain, tenantName } = useTenant();

  const activeKey = Object.keys(PAGE_TITLES).find(path =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  );

  const baseTitle = activeKey ? PAGE_TITLES[activeKey] : "Dashboard";
  const subPath = pathname.replace(activeKey || "", "").replace(/^\//, "");
  const formattedSubPath = subPath ? subPath.charAt(0).toUpperCase() + subPath.slice(1) : "";

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || (tenantName || "S").charAt(0).toUpperCase();

  return (
    <header className="h-[64px] shrink-0 flex items-center px-8 bg-white/80 backdrop-blur-2xl border-b border-border sticky top-0 z-40 gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all">
          <Menu size={20} />
        </button>
        <BrandLogo size={28} showText={false} variant="light" />
      </div>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-[17px] font-extrabold text-slate-950 tracking-tight font-display">{baseTitle}</h1>
          {formattedSubPath && (
            <>
              <span className="text-slate-300 font-medium">/</span>
              <span className="text-[14px] font-bold text-slate-500 tracking-tight">{formattedSubPath}</span>
            </>
          )}
        </div>
      </div>

      {/* Search Bar - Refined SaaS Style */}
      <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-border rounded-xl px-4 py-2 w-80 lg:w-96 group transition-all cursor-pointer hover:bg-white hover:border-border-strong hover:shadow-soft-md">
        <Search size={15} className="text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[13px] text-slate-400 font-semibold group-hover:text-slate-600">Search or jump...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-border rounded-lg shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
          <Command size={10} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-3">
        {subdomain && (
          <button
            onClick={() => {
              const protocol = window.location.protocol;
              const host = window.location.host;
              const isLocal = host.includes('localhost');
              const url = isLocal
                ? `${protocol}//${subdomain}.${host}`
                : `${protocol}//${subdomain}.solo-sme.com`;
              window.open(url, '_blank');
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            View Store
            <ExternalLink size={14} className="opacity-70" />
          </button>
        )}

        <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all relative group shadow-soft-sm bg-white border border-border">
          <Bell size={17} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white shadow-[0_0_8px_var(--primary)]" />
        </button>

        <div className="h-5 w-px bg-border-strong mx-1" />

        <button className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center shadow-lg active:scale-95 transition-all group ring-2 ring-white ring-offset-2 ring-offset-slate-50 relative overflow-hidden">
          <div className="text-white text-[11px] font-bold uppercase group-hover:scale-110 transition-transform relative z-10">{initials}</div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </header>
  );
}
