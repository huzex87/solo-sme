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
  "/dashboard/settings": "Settings",
  "/dashboard/customers": "Customers",
  "/dashboard/marketing": "Marketing",
  "/dashboard/import": "Import",
  "/dashboard/financials": "Financials",
  "/dashboard/content": "Content",
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
  const isSubPage = !!formattedSubPath;

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || (tenantName || "S").charAt(0).toUpperCase();

  return (
    <header className="h-[56px] md:h-[64px] shrink-0 flex items-center px-3 md:px-8 bg-white/90 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-40 gap-2 md:gap-6">

      {/* Mobile Left: Menu or Back */}
      <div className="flex items-center gap-1 lg:hidden shrink-0">
        {isSubPage ? (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <>
            <MobileSidebarTrigger />
            <BrandLogo size={22} showText={false} variant="light" />
          </>
        )}
      </div>

      {/* Page Title */}
      <div className="flex-1 min-w-0 flex justify-center lg:justify-start">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <h1 className={cn(
            "font-bold text-slate-900 tracking-tight truncate",
            "text-[15px] md:text-[17px]",
            isSubPage && "lg:text-[17px]"
          )}>
            {isSubPage ? formattedSubPath : baseTitle}
          </h1>
          {/* Desktop breadcrumb — hidden on mobile */}
          {isSubPage && (
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-300 font-medium shrink-0">/</span>
              <span className="text-[14px] font-bold text-slate-500 tracking-tight truncate">
                {baseTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar — Desktop only */}
      <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-80 lg:w-96 group transition-all cursor-pointer hover:bg-white hover:border-slate-300 hover:shadow-sm">
        <Search size={15} className="text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-[13px] text-slate-400 font-medium group-hover:text-slate-600">Search...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
          <Command size={10} className="text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        {/* View Store — Desktop only */}
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

        {/* Notification bell */}
        <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-950 rounded-xl transition-all relative active:scale-90">
          <Bell strokeWidth={2} className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider — Desktop only */}
        <div className="hidden md:block h-5 w-px bg-slate-200 mx-0.5" />

        {/* Avatar */}
        <button className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-900 flex items-center justify-center active:scale-90 transition-all ring-2 ring-white ring-offset-1 ring-offset-slate-50 relative overflow-hidden">
          <div className="text-white text-[10px] md:text-[11px] font-black uppercase relative z-10">{initials}</div>
        </button>
      </div>
    </header>
  );
}
