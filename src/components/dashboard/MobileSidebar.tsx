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
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 rounded-xl transition-all active:scale-95 bg-slate-50 border border-slate-200/50"
            >
                <Menu size={18} strokeWidth={2.5} />
            </button>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] lg:hidden"
                >
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-in slide-in-from-left duration-500 ease-out shadow-2xl"
                    >
                        <div className="absolute top-4 right-4 z-[110]">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-slate-400 hover:text-ink transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-full overflow-hidden">
                            {/* Inject Sidebar logic but override its hidden class */}
                            <div className="flex flex-col h-full sidebar-mobile-override">
                                <Sidebar isMobile={true} />
                            </div>
                        </div>
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
  }
`;

export function MobileSidebarStyles() {
    return <style dangerouslySetInnerHTML={{ __html: mobileSidebarStyles }} />;
}
