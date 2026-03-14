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
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/40 to-transparent pointer-events-none" />
            <nav className="mx-6 mb-6 h-20 bg-ink/90 backdrop-blur-3xl flex items-center justify-around rounded-[32px] px-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 pointer-events-auto transition-transform relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh-gradient opacity-10 pointer-events-none" />
                {navItems.map((item) => {
                    // Logic: Strict match for dashboard home, prefix match for others
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : (pathname === item.href || pathname.startsWith(`${item.href}/`));

                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-12 active:scale-95 hover:scale-105 transition-all duration-300 group"
                            >
                                <div className={cn(
                                    "w-18 h-18 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] flex items-center justify-center border-[6px] border-ink transition-all duration-500 relative overflow-hidden",
                                    isActive
                                        ? "bg-primary shadow-[0_8px_32px_rgba(245,158,11,0.3),_0_0_0_1px_rgba(255,255,255,0.1)]"
                                        : "bg-emerald-500 shadow-[0_8px_32px_rgba(16,185,129,0.3),_0_0_0_1px_rgba(255,255,255,0.1)]"
                                )}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                                    <Icon size={28} className="text-white relative z-10" fill="currentColor" />
                                </div>
                                {isActive && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(245,158,11,1)]" />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full px-2 md:px-4 relative",
                                isActive ? "text-white scale-110" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300",
                                isActive ? "bg-white/10" : "hover:bg-white/5"
                            )}>
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn("transition-transform", isActive && "animate-pulse")}
                                />
                            </div>
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
