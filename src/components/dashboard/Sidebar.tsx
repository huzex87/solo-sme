"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, MessageCircle,
  MonitorSmartphone, ChevronLeft, ChevronRight, Zap, ExternalLink,
  Users, Star, Megaphone, Store, Layers, CreditCard, UserCheck
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle, accent: "whatsapp" },
    ]
  },
  {
    label: "Configuration",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Store },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { tenantName, subdomain, tenantId, userName } = useTenant();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const userInitial = (userName || tenantName || "S").charAt(0).toUpperCase();
  const width = collapsed ? 72 : 260;

  return (
    // Inline styles guarantee correct flex behaviour — no CSS class can override
    <aside style={{
      display: 'flex',
      flexDirection: 'column',
      width: `${width}px`,
      minWidth: `${width}px`,
      height: '100vh',
      flexShrink: 0,
      background: 'var(--ink)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      transition: 'width 0.3s ease',
      zIndex: 100,
      position: 'relative',
      overflowX: 'hidden',
    }}
      className="hidden lg:flex lg:flex-col"
    >
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '28px 0' : '28px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--sovereign) 0%, var(--primary-dk) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(15,118,110,0.3)',
        }}>
          <Zap size={16} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-0.04em', lineHeight: 1 }}>SOLO</div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>Business Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto', overflowX: 'hidden' }}
        className="no-scrollbar space-y-4"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p style={{
                padding: '0 12px', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.2)',
                textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 6, marginTop: 8,
              }}>
                {group.label}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((item: any) => {
                const active = isActive(item.href, item.exact);
                const Icon = item.icon;
                const isWA = item.accent === "whatsapp";
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? '10px 0' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 10,
                      background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                      transition: 'all 0.15s ease',
                      textDecoration: 'none',
                    }}
                    className="group hover:bg-white/5 hover:!text-white/80"
                  >
                    <Icon size={16} strokeWidth={active ? 2.5 : 2}
                      style={{ flexShrink: 0, color: active ? (isWA ? '#4ade80' : 'var(--sovereign-md)') : 'inherit' }}
                    />
                    {!collapsed && (
                      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(217,119,6,0.3)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{userInitial}</span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userName || "Merchant"}
              </div>
              <div style={{ color: '#fbbf24', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                Growth Plan
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <Link href={`/store/${subdomain || tenantId || "demo"}`} target="_blank"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              transition: 'all 0.2s ease', textDecoration: 'none',
            }}
            className="hover:border-white/20 hover:text-white hover:bg-white/5"
          >
            <ExternalLink size={11} />
            View My Store
          </Link>
        )}
      </div>

      {/* Collapse button */}
      <button onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.2)', background: 'transparent', border: 'none',
          cursor: 'pointer', transition: 'color 0.2s',
          flexShrink: 0,
        }}
        className="hover:!text-white/50"
        aria-label={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
