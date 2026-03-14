'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function MobileSidebarTrigger() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2.5 -m-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950 rounded-xl transition-all active:scale-95 bg-slate-50 border border-slate-200/50 haptic-touch relative z-50"
                aria-label="Open menu"
            >
                <Menu size={20} strokeWidth={2.5} />
            </button>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] lg:hidden"
                >
                    <div
                        className="absolute inset-0 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-500 ease-out"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-500 cubic-bezier(0.32, 0.72, 0, 1) shadow-[10px_0_50px_rgba(0,0,0,0.2)] border-r border-slate-100/50 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-4 right-4 z-[110]">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-ink haptic-touch bg-slate-50 border border-slate-200/50 rounded-xl"
                            >
                                <X size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="h-full overflow-hidden safe-bottom">
                            {/* Inject Sidebar logic but override its hidden class */}
                            <div className="flex flex-col h-full sidebar-mobile-override pt-4">
                                <Sidebar isMobile={true} />
                            </div>
                        </div>
                        {/* Native-style drag indicator handle decoration (visual only) */}
                        <div className="absolute top-1/2 -right-1 translate-y-1/2 w-1 h-12 bg-slate-300/40 rounded-full" />
                    </div>
                </div>
            )}
        </>
    );
}

// CSS override for Sidebar when in mobile drawer
const mobileSidebarStyles = `
  .sidebar-mobile-override aside {
    display: flex !important;
    width: 100% !important;
    border-right: none !important;
    height: 100% !important;
    background: transparent !important;
  }
`;

export function MobileSidebarStyles() {
    return <style dangerouslySetInnerHTML={{ __html: mobileSidebarStyles }} />;
}
