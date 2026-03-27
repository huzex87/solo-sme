'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    MessageCircle,
    ShoppingBag,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Products', icon: Package, href: '/dashboard/products' },
    { name: 'WhatsApp', icon: MessageCircle, href: '/dashboard/whatsapp', isFab: true },
    { name: 'Orders', icon: ShoppingBag, href: '/dashboard/orders' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Gradient fade above bar */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            <nav
                className="relative mx-3 mb-2 bg-[#0d1b24]/90 backdrop-blur-2xl flex items-end justify-around rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/[0.08]"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 4px)' }}
            >
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
                                className="relative -mt-5 flex flex-col items-center"
                            >
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-90",
                                    isActive
                                        ? "bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.4)]"
                                        : "bg-[#25D366]/80 shadow-xl"
                                )}>
                                    <Icon size={24} className="text-white" fill="currentColor" />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-semibold mt-1 mb-1.5 transition-colors",
                                    isActive ? "text-[#25D366]" : "text-slate-500"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center py-2.5 px-3 transition-all duration-200 active:scale-90",
                                isActive ? "text-white" : "text-slate-500"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200",
                                isActive && "bg-white/10"
                            )}>
                                <Icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                            </div>
                            <span className={cn(
                                "text-[10px] font-semibold transition-all duration-200",
                                isActive ? "opacity-100" : "opacity-60"
                            )}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
