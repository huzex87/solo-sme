"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, UserCircle } from "lucide-react";
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
      {/* ═══ DESKTOP TopBar — Institutional Mastery ═══ */}
      <header className="desktop-only h-[var(--topbar-height)] flex items-center px-8 bg-white border-none gap-4 sticky top-0 z-40 shadow-sm">
        <div className="flex-1">
          <h1 className="text-[18px] font-bold text-t1 tracking-tight font-display m-0">{title}</h1>
        </div>

        {/* Search bar — Institutional Depth */}
        <div className="flex items-center gap-3 bg-surface-2 border-none rounded-[16px] px-4 py-2.5 w-64 cursor-pointer group active:scale-[0.98] transition-all shadow-inner">
          <Search size={16} className="text-t4 group-hover:text-primary transition-colors" />
          <span className="text-[12px] text-t4 font-bold uppercase tracking-wider">Search Hub Intelligence…</span>
          <kbd className="ml-auto text-[9px] text-t4 bg-white px-2 py-0.5 rounded-lg shadow-sm border-none font-mono font-black">⌘K</kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-11 h-11 rounded-2xl hover:bg-surface-2 flex items-center justify-center text-t3 relative cursor-pointer transition-colors">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white animate-pulse"></span>
          </div>
          <div className="h-6 w-px bg-surface-2 mx-2" />
          <a
            href={storeUrl}
            target="_blank"
            className="flex items-center gap-2 bg-white border-2 border-surface-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-t1 hover:bg-primary-lt hover:border-primary/20 hover:text-primary transition-all shadow-sm"
          >
            <ExternalLink size={14} />
            View Storefront
          </a>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dk flex items-center justify-center shadow-xl border border-white/10 ml-3">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE TopBar — Hidden (Handled by Dashboard and Page headers) ═══ */}
      {/* We hide the global mobile topbar because the new screens have integrated high-fidelity headers per mockup */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-topbar-global { display: none !important; }
        }
      `}</style>
    </>
  );
}
