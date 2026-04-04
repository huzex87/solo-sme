"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Bell, ExternalLink, Command, ArrowLeft, LogOut, User, Settings, ChevronDown } from "lucide-react";
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
  const { userName, userRole, subdomain, tenantName, tenant } = useTenant();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeKey = Object.keys(PAGE_TITLES).find(path =>
    path === "/dashboard" ? pathname === path : pathname.startsWith(path)
  );

  const baseTitle = activeKey ? PAGE_TITLES[activeKey] : "Dashboard";
  const subPath = pathname.replace(activeKey || "", "").replace(/^\//, "");
  const formattedSubPath = subPath ? subPath.charAt(0).toUpperCase() + subPath.slice(1) : "";
  const isSubPage = !!formattedSubPath;

  const initials = userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    || (tenantName || "S").charAt(0).toUpperCase();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setUserMenuOpen(false);
    try {
      toast.loading("Signing out...");
      await AuthService.signOut();
      router.push("/login");
      toast.success("Successfully signed out");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="h-[52px] md:h-[60px] shrink-0 flex items-center px-3 md:px-8 bg-[#072435] border-b border-white/[0.06] sticky top-0 z-40 gap-2 md:gap-4 shadow-[0_2px_16px_rgba(7,36,53,0.35)]">

      {/* Mobile Left: Menu or Back */}
      <div className="flex items-center gap-1 lg:hidden shrink-0">
        {isSubPage ? (
          <button
            onClick={() => router.back()}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-white/60 hover:bg-white/10 active:scale-90 transition-all"
            aria-label="Go back"
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

      {/* Page Title / Breadcrumb */}
      <div className="flex-1 min-w-0 flex justify-center lg:justify-start">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {isSubPage ? (
            <>
              {/* Desktop: baseTitle / subPath */}
              <span className="hidden lg:block text-[14px] font-semibold text-white/40 truncate">
                {baseTitle}
              </span>
              <span className="hidden lg:block text-white/20 font-medium shrink-0">/</span>
              <h1 className="text-[15px] md:text-[17px] font-bold text-white tracking-tight truncate">
                {formattedSubPath}
              </h1>
            </>
          ) : (
            <h1 className="text-[15px] md:text-[17px] font-bold text-white tracking-tight truncate">
              {baseTitle}
            </h1>
          )}
        </div>
      </div>

      {/* Search Bar — Desktop only */}
      <div className="hidden md:flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-xl px-4 py-2 w-72 lg:w-80 group transition-all cursor-pointer hover:bg-white/10 hover:border-white/20 shrink-0">
        <Search size={15} className="text-white/35 group-hover:text-white/60 transition-colors shrink-0" />
        <span className="text-[13px] text-white/35 font-medium group-hover:text-white/55 flex-1">Search...</span>
        <div className="pointer-events-none flex items-center gap-1 px-1.5 py-0.5 bg-white/10 border border-white/10 rounded-md opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
          <Command size={10} className="text-white/50" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">K</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">

        {/* View Store — Desktop only */}
        {subdomain && (
          <button
            onClick={() => {
              if (tenant) {
                const url = URLService.getTenantPublicUrl(tenant);
                window.open(url, "_blank");
              }
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 hover:border-amber-400/40 transition-all active:scale-95"
            aria-label="View your store"
          >
            View Store
            <ExternalLink size={13} className="opacity-80" />
          </button>
        )}

        {/* Notification bell */}
        <button
          className="w-11 h-11 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white/80 rounded-xl transition-all relative active:scale-90"
          aria-label="Notifications"
          onClick={() => toast.info("Notifications coming soon")}
        >
          <Bell strokeWidth={2} className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#072435]" aria-hidden="true" />
        </button>

        {/* Divider — Desktop only */}
        <div className="hidden md:block h-5 w-px bg-white/10 mx-0.5 shrink-0" aria-hidden="true" />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className={cn(
              "flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-all active:scale-95",
              "hover:bg-white/10 border border-transparent hover:border-white/10",
              userMenuOpen && "bg-white/10 border-white/10"
            )}
            aria-label="Open user menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center ring-2 ring-amber-400/30 shrink-0">
              <span className="text-slate-900 text-[11px] font-black uppercase">{initials}</span>
            </div>
            {/* User info — Desktop only */}
            <div className="hidden lg:flex flex-col items-start leading-none">
              <span className="text-[12px] font-bold text-white/90 leading-tight max-w-[110px] truncate">
                {userName || tenantName || "My Account"}
              </span>
              {userRole && (
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mt-0.5 capitalize">
                  {userRole}
                </span>
              )}
            </div>
            <ChevronDown
              size={13}
              className={cn(
                "hidden lg:block text-white/30 transition-transform duration-200 shrink-0",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 bg-[#0d3347] border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden z-50"
              role="menu"
            >
              {/* User identity header */}
              <div className="px-4 py-3 border-b border-white/[0.07]">
                <p className="text-[13px] font-bold text-white truncate">{userName || tenantName || "My Account"}</p>
                {userRole && (
                  <p className="text-[11px] text-white/40 capitalize mt-0.5">{userRole}</p>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  role="menuitem"
                  onClick={() => { setUserMenuOpen(false); router.push("/dashboard/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors text-left"
                >
                  <User size={15} className="shrink-0 text-white/40" />
                  Account Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setUserMenuOpen(false); router.push("/dashboard/settings"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors text-left"
                >
                  <Settings size={15} className="shrink-0 text-white/40" />
                  Preferences
                </button>
              </div>

              <div className="border-t border-white/[0.07] py-1.5">
                <button
                  role="menuitem"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left disabled:opacity-50"
                >
                  <LogOut size={15} className="shrink-0" />
                  {signingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
