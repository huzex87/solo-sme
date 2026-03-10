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
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(8px+env(safe-area-inset-bottom,0px))] md:hidden pointer-events-none">
            <nav className="mx-auto max-w-md h-16 mobile-glass-bar flex items-center justify-around rounded-[24px] px-2 shadow-lg border border-white/20 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isFab) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative -mt-10 group"
                            >
                                <div className="wa-fab group-active:scale-95 transition-transform duration-200">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200",
                                isActive ? "text-primary scale-110" : "text-t3"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-colors",
                                isActive ? "bg-blue-dim" : "bg-transparent"
                            )}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[9px] font-bold tracking-tight uppercase">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
