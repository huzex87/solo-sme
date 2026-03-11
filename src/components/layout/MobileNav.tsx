'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Stock', icon: Package, href: '/dashboard/products' },
    { name: 'Amina', icon: Zap, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
    { name: 'Set', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-8 pb-[calc(24px+env(safe-area-inset-bottom,0px))] lg:hidden pointer-events-none">
            <nav className="mx-auto max-w-sm h-14 bg-white/95 backdrop-blur-md flex items-center justify-around rounded-[1.25rem] px-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100/50 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-10 active:scale-95 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border-[3px] border-white group-hover:scale-105 transition-transform">
                                    <Icon size={18} className="text-white" fill="currentColor" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                                isActive ? "text-slate-900" : "text-slate-400"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300",
                                isActive ? "bg-slate-50" : "hover:bg-slate-50/50"
                            )}>
                                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
