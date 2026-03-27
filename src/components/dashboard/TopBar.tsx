"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, Command, ArrowLeft } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";
import { MobileSidebarTrigger } from "./MobileSidebar";
import { URLService } from "@/lib/url";

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
  const router = useRouter();
  const { userName, subdomain, tenantName, tenant } = useTenant();

  const activeKey = Object.keys(PAGE_TITLES).find(path =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  );

  const baseTitle = activeKey ? PAGE_TITLES[activeKey] : "Dashboard";
  const subPath = pathname.replace(activeKey || "", "").replace(/^\//, "");
  const formattedSubPath = subPath ? subPath.charAt(0).toUpperCase() + subPath.slice(1) : "";

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || (tenantName || "S").charAt(0).toUpperCase();

  return (
    <header className="h-[64px] shrink-0 flex items-center px-4 md:px-8 bg-white/90 backdrop-blur-2xl border-b border-border sticky top-0 z-40 gap-2 md:gap-6 shadow-sm">
      <div className="flex items-center gap-1.5 lg:hidden shrink-0">
        <MobileSidebarTrigger />
        <BrandLogo size={24} showText={false} variant="light" />
      </div>

      {/* Page Title - Centered on Mobile for Native Feel */}
      <div className="flex-1 min-w-0 flex justify-center lg:justify-start">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
          {formattedSubPath && (
            <button
              onClick={() => router.back()}
              className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-ink haptic-touch"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-[14px] md:text-[17px] font-[700] text-ink tracking-tight font-display truncate">
            {baseTitle}
          </h1>
          {formattedSubPath && (
            <>
              <span className="text-slate-300 font-medium shrink-0">/</span>
              <span className="text-[12px] md:text-[14px] font-bold text-slate-500 tracking-tight truncate">
                {formattedSubPath}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Search Bar - Refined SaaS Style */}
      <div className="hidden md:flex items-center gap-3 bg-[var(--background)] border border-border rounded-xl px-4 py-2 w-80 lg:w-96 group transition-all cursor-pointer hover:bg-white hover:border-border-strong hover:shadow-soft-md">
        <Search size={15} className="text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[13px] text-slate-400 font-semibold group-hover:text-slate-600">Search or jump...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-border rounded-lg shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
          <Command size={10} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {subdomain && (
          <button
            onClick={() => {
              if (tenant) {
                const url = URLService.getTenantPublicUrl(tenant);
                window.open(url, '_blank');
              }
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            View Store
            <ExternalLink size={14} className="opacity-70" />
          </button>
        )}

        <button className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all relative group shadow-soft-sm bg-white border border-border">
          <Bell strokeWidth={2} className="w-4 h-4 md:w-[17px] md:h-[17px] group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full ring-2 ring-white shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        </button>

        <div className="hidden md:block h-5 w-px bg-border-strong mx-1" />

        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-ink flex items-center justify-center shadow-lg active:scale-95 transition-all group ring-2 ring-white ring-offset-2 ring-offset-slate-50 relative overflow-hidden">
          <div className="text-white text-[10px] md:text-[11px] font-black uppercase group-hover:scale-110 transition-transform relative z-10">{initials}</div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </header>
  );
}
