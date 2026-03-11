'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    MessageCircle,
    BarChart3,
    Settings,
    ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Stock', icon: Package, href: '/dashboard/products' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
    { name: 'Account', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(16px+env(safe-area-inset-bottom,0px))] lg:hidden pointer-events-none">
            <nav className="mx-auto max-w-sm h-18 bg-white/90 backdrop-blur-3xl flex items-center justify-around rounded-[32px] px-3 shadow-[0_20px_50px_rgba(7,36,53,0.15)] border border-white/60 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-10 active:scale-90 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)] border-2 border-white/20">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all duration-300",
                                isActive ? "text-primary scale-105" : "text-t4/70"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300",
                                isActive ? "bg-primary/10 text-primary shadow-inner" : "hover:bg-slate-50"
                            )}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[9px] font-black tracking-[0.1em] uppercase">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
