"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  href: string;
  color: string;
}

// ─── Mock data (replace with real Supabase queries) ───────────────────────────
const STATS: StatCard[] = [
  {
    label: "Total Revenue",
    value: "₦0.00",
    change: "Start selling to see data",
    positive: true,
    icon: TrendingUp,
    href: "/dashboard/analytics",
    color: "#409EF2",
  },
  {
    label: "Total Orders",
    value: "0",
    change: "No orders yet",
    positive: true,
    icon: ShoppingBag,
    href: "/dashboard/orders",
    color: "#10B981",
  },
  {
    label: "Products Listed",
    value: "0",
    change: "Add your first product",
    positive: true,
    icon: Package,
    href: "/dashboard/products",
    color: "#F59E0B",
  },
  {
    label: "WhatsApp Chats",
    value: "0",
    change: "Connect WhatsApp to start",
    positive: true,
    icon: MessageCircle,
    href: "/dashboard/whatsapp",
    color: "#25D366",
  },
];

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Add Product", href: "/dashboard/products/new", icon: Package, color: "#409EF2" },
  { label: "View Orders", href: "/dashboard/orders", icon: ShoppingBag, color: "#10B981" },
  { label: "WhatsApp AI", href: "/dashboard/whatsapp", icon: MessageCircle, color: "#25D366" },
  { label: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, color: "#F59E0B" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[#072435] text-xl font-bold">{greeting} 👋</h2>
          <p className="text-gray-400 text-sm mt-0.5">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#409EF2]/8 border border-[#409EF2]/20 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#409EF2] animate-pulse" />
          <span className="text-[#409EF2] text-xs font-semibold">Closed Beta Access</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md hover:shadow-gray-100 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <ArrowUpRight
                  size={15}
                  className="text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5"
                />
              </div>
              <p className="text-[#072435] text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              <p className="text-gray-400 text-[11px] mt-1.5">{stat.change}</p>
            </Link>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-[#072435] font-semibold text-[13px]">Recent Orders</h3>
            <Link
              href="/dashboard/orders"
              className="text-[#409EF2] text-xs font-medium flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag size={22} className="text-gray-300" />
            </div>
            <p className="text-[#072435] font-medium text-sm">No orders yet</p>
            <p className="text-gray-400 text-xs mt-1 max-w-[200px]">
              Orders from your store and WhatsApp will appear here.
            </p>
            <Link
              href="/dashboard/whatsapp"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#409EF2] bg-[#409EF2]/8 hover:bg-[#409EF2]/15 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MessageCircle size={12} />
              Set up WhatsApp AI
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-[#072435] font-semibold text-[13px] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-150"
                      style={{ backgroundColor: `${action.color}18` }}
                    >
                      <Icon size={16} style={{ color: action.color }} />
                    </div>
                    <span className="text-[#072435] text-[11px] font-medium leading-tight">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-br from-[#072435] to-[#0a3352] rounded-xl p-5 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#409EF2]/10 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-[#25D366]/10 translate-y-6 -translate-x-4" />

            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center mb-3">
                <MessageCircle size={17} className="text-[#25D366]" />
              </div>
              <p className="font-semibold text-sm mb-1">WhatsApp AI is ready</p>
              <p className="text-white/50 text-xs leading-relaxed mb-4">
                Your AI sales assistant handles orders, receipts, and customer queries — 24/7.
              </p>
              <Link
                href="/dashboard/whatsapp"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#25D366] text-white px-3 py-2 rounded-lg hover:bg-[#22c55e] transition-colors"
              >
                <Zap size={12} fill="white" />
                Connect now
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── Beta notice ── */}
      <div className="bg-[#409EF2]/5 border border-[#409EF2]/15 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#409EF2]/15 flex items-center justify-center shrink-0">
          <Zap size={15} className="text-[#409EF2]" />
        </div>
        <div className="flex-1">
          <p className="text-[#072435] font-semibold text-sm">You&apos;re in Closed Beta</p>
          <p className="text-gray-400 text-xs mt-0.5">
            You have access to core features: Products, Orders, Analytics, WhatsApp AI, and Custom Domain.
            More features unlock at full launch — your feedback shapes what we build next.
          </p>
        </div>
        <a
          href="mailto:hello@solo-sme.com"
          className="text-[#409EF2] text-xs font-semibold whitespace-nowrap hover:underline"
        >
          Share feedback →
        </a>
      </div>

    </div>
  );
}
