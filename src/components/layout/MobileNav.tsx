'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    MessageCircle,
    ShoppingBag,
    BarChart2,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Stock', icon: Package, href: '/dashboard/products' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none pb-safe">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
            <nav className="mx-6 mb-6 h-20 bg-slate-950/90 backdrop-blur-3xl flex items-center justify-around rounded-[32px] px-2 shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-auto transition-transform">
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-12 active:scale-90 transition-all duration-500 group"
                            >
                                <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-[0_12px_40px_rgba(16,185,129,0.4)] border-[6px] border-slate-950 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                                    <Icon size={32} className="text-white relative z-10" fill="currentColor" />
                                </div>
                                {isActive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-500 h-full px-4",
                                isActive ? "text-white" : "text-slate-500"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-500",
                                isActive ? "bg-white/10" : "hover:bg-white/5"
                            )}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            {isActive && !item.isFab && (
                                <div className="w-1 h-1 rounded-full bg-primary mt-1" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
