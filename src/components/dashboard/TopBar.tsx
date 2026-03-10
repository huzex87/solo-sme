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
      {/* ═══ DESKTOP TopBar — Obsidian Premium ═══ */}
      <header className="desktop-only h-[var(--topbar-height)] flex items-center px-8 bg-white border-b border-border gap-3 sticky top-0 z-40 shadow-sm">
        <div className="flex-1">
          <h1 className="text-[17px] font-extrabold text-t1 tracking-tight font-display m-0">{title}</h1>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2 w-56 cursor-pointer group active:scale-[0.98] transition-all">
          <Search size={14} className="text-t4 group-hover:text-t2" />
          <span className="text-[12px] text-t4 font-bold uppercase tracking-tight">Search hub…</span>
          <kbd className="ml-auto text-[9px] text-t4 bg-white px-1.5 py-0.5 rounded border border-border font-mono font-black">⌘K</kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-10 h-10 rounded-xl hover:bg-surface flex items-center justify-center text-t3 relative cursor-pointer">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue rounded-full border border-white"></span>
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          <a
            href={storeUrl}
            target="_blank"
            className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-t2 hover:bg-white hover:border-blue/30 hover:text-blue transition-all"
          >
            <ExternalLink size={14} />
            View Store
          </a>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue to-blue-dim flex items-center justify-center shadow-lg border border-white/10 ml-2">
            <span className="text-white text-xs font-black">{initials}</span>
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
