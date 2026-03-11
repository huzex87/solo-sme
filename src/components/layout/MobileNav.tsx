'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    MessageCircle,
    ShoppingBag,
    Settings,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Products', icon: Package, href: '/dashboard/products' },
    { name: 'AI', icon: Zap, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(20px+env(safe-area-inset-bottom,0px))] lg:hidden pointer-events-none">
            <nav className="mx-auto max-w-sm h-16 bg-white flex items-center justify-around rounded-2xl px-2 shadow-xl border border-slate-100 pointer-events-auto">
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
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                                    <Icon size={20} className="text-white" fill="currentColor" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all duration-300",
                                isActive ? "text-primary px-2" : "text-slate-400"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300",
                                isActive ? "bg-primary/5 text-primary" : "hover:bg-slate-50"
                            )}>
                                <Icon size={18} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
