"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ExternalLink, Menu, Command, LayoutGrid } from "lucide-react";
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
  "/dashboard/hub": "Hub",
  "/dashboard/invoices": "Invoices",
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
    <header className="h-16 shrink-0 flex items-center px-6 bg-white border-b border-slate-100 sticky top-0 z-40 gap-4">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all">
        <Menu size={20} />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Search Bar - Minimalist */}
      <div className="hidden md:flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 w-64 lg:w-96 group transition-all focus-within:bg-white focus-within:border-primary/20 focus-within:shadow-sm">
        <Search size={14} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search for orders, products..."
          className="bg-transparent border-none outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium w-full"
        />
        <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
          <Command size={10} className="text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase">K</span>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-3">
        <button className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-px bg-slate-100" />

        <a
          href={storeUrl}
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all uppercase tracking-wider shadow-sm"
        >
          <ExternalLink size={14} />
          <span>Store</span>
        </a>

        <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm shrink-0 overflow-hidden active:scale-95 transition-all">
          <div className="text-slate-600 text-xs font-bold uppercase">{initials}</div>
        </button>
      </div>
    </header>
  );
}
