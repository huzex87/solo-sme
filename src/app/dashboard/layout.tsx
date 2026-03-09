'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <div className="flex h-screen bg-[#F7F9FC] overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <TopBar />
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto px-6 py-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TenantProvider>
    );
}
