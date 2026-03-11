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
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Products', icon: Package, href: '/dashboard/products' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Insights', icon: BarChart3, href: '/dashboard/analytics' },
    { name: 'Account', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] lg:hidden pointer-events-none">
            <nav className="mx-auto max-w-md h-18 bg-white/80 backdrop-blur-2xl flex items-center justify-around rounded-[32px] px-3 shadow-2xl border border-white/40 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-12 group"
                            >
                                <div className="wa-fab group-active:scale-90 transition-all duration-300 shadow-[0_0_30px_rgba(37,211,102,0.4)]">
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
                                "flex flex-col items-center justify-center gap-1.5 min-w-[68px] transition-all duration-300",
                                isActive ? "text-primary scale-105" : "text-t3 hover:text-t1"
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-[18px] transition-all duration-300",
                                isActive ? "bg-primary-lt shadow-inner" : "bg-transparent"
                            )}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
