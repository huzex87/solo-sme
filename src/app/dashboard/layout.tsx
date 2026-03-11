'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <div className="flex h-[100dvh] overflow-hidden bg-surface">
                {/* Sidebar handles its own desktop visibility via hidden lg:flex */}
                <Sidebar />

                <div className="flex-1 flex flex-col min-w-0 bg-surface overflow-hidden relative">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden mobile-bottom-pad scroll-smooth native-scroll">
                        <div className="w-full max-w-[var(--content-max)] mx-auto p-4 md:p-8 lg:p-12">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <MobileNav />
        </TenantProvider>
    );
}
