'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <div className="flex h-[100dvh] overflow-hidden bg-slate-50">
                {/* Sidebar */}
                <Sidebar />

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
                        <div className="w-full max-w-[var(--content-max)] mx-auto p-4 md:p-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <MobileNav />
        </TenantProvider>
    );
}
