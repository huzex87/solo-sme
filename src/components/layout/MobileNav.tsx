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
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent pointer-events-none" />
            <nav className="mx-5 mb-4 h-[76px] bg-ink/80 backdrop-blur-3xl flex items-center justify-around rounded-[32px] px-3 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10 pointer-events-auto relative overflow-hidden ring-1 ring-black/20">
                <div className="absolute inset-0 bg-mesh-gradient opacity-10 pointer-events-none" />

                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : (pathname === item.href || pathname.startsWith(`${item.href}/`));

                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-10 haptic-touch group py-2"
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-[22px] flex items-center justify-center border-[4px] border-ink/80 transition-all duration-500 relative overflow-hidden spring-bounce shadow-lg",
                                    isActive
                                        ? "bg-primary glow-primary rotate-0"
                                        : "bg-emerald-500 shadow-xl"
                                )}>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-white/10 opacity-60" />
                                    <Icon size={26} className="text-white relative z-10" fill="currentColor" />
                                </div>
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(245,158,11,1)] animate-pulse" />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 transition-all duration-500 h-full px-2 relative haptic-touch",
                                isActive ? "text-white" : "text-slate-400 active:text-slate-200"
                            )}
                        >
                            <div className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-[16px] transition-all duration-500",
                                isActive ? "bg-white/15 scale-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "scale-100"
                            )}>
                                <Icon
                                    size={21}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn("transition-transform duration-500", isActive && "spring-bounce")}
                                />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                            )}>
                                {item.name}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary glow-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
