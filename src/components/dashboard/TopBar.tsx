"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, Command, ArrowLeft, LogOut } from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";
import { MobileSidebarTrigger } from "./MobileSidebar";
import { URLService } from "@/lib/url";
import { AuthService } from "@/services/authService";
import { toast } from "sonner";

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

  const handleSignOut = async () => {
    try {
      toast.loading("Signing out...");
      await AuthService.signOut();
      router.push("/login");
      toast.success("Successfully signed out");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="h-[52px] md:h-[60px] shrink-0 flex items-center px-3 md:px-8 bg-[#072435] border-b border-white/[0.06] sticky top-0 z-40 gap-2 md:gap-6 shadow-[0_2px_16px_rgba(7,36,53,0.35)]">

      {/* Mobile Left: Menu or Back */}
      <div className="flex items-center gap-1 lg:hidden shrink-0">
        {isSubPage ? (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:bg-white/10 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <>
            <MobileSidebarTrigger />
            <BrandLogo size={22} showText={false} variant="dark" />
          </>
        )}
      </div>

      {/* Page Title */}
      <div className="flex-1 min-w-0 flex justify-center lg:justify-start">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <h1 className={cn(
            "font-bold text-white tracking-tight truncate",
            "text-[15px] md:text-[17px]",
            isSubPage && "lg:text-[17px]"
          )}>
            {isSubPage ? formattedSubPath : baseTitle}
          </h1>
          {/* Desktop breadcrumb — hidden on mobile */}
          {isSubPage && (
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-white/20 font-medium shrink-0">/</span>
              <span className="text-[14px] font-bold text-white/40 tracking-tight truncate">
                {baseTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar — Desktop only */}
      <div className="hidden md:flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-2 w-80 lg:w-96 group transition-all cursor-pointer hover:bg-white/10 hover:border-white/20">
        <Search size={15} className="text-white/35 group-hover:text-white/60 transition-colors" />
        <span className="text-[13px] text-white/35 font-medium group-hover:text-white/55">Search...</span>
        <div className="ml-auto pointer-events-none flex items-center gap-1.5 px-1.5 py-0.5 bg-white/10 border border-white/10 rounded-md opacity-60 group-hover:opacity-100 transition-opacity">
          <Command size={10} className="text-white/50" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">K</span>
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
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 hover:border-amber-400/40 transition-all"
          >
            View Store
            <ExternalLink size={14} className="opacity-80" />
          </button>
        )}

        {/* Notification bell */}
        <button className="w-9 h-9 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 rounded-xl transition-all relative active:scale-90">
          <Bell strokeWidth={2} className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#0f172a]" />
        </button>

        {/* Divider — Desktop only */}
        <div className="hidden md:block h-5 w-px bg-white/10 mx-0.5" />

        {/* Avatar */}
        <button
          onClick={handleSignOut}
          className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-amber-400 flex items-center justify-center active:scale-90 transition-all ring-2 ring-amber-400/30 relative overflow-hidden hover:bg-amber-300 group"
          title="Sign Out"
        >
          <div className="text-slate-900 text-[10px] md:text-[11px] font-black uppercase relative z-10 group-hover:opacity-0 transition-opacity">{initials}</div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut size={14} className="text-slate-900" />
          </div>
        </button>
      </div>
    </header>
  );
}
