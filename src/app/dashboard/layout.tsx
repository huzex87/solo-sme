import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TenantProvider } from '@/context/TenantContext';
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <TenantProvider>
            <DashboardContent>{children}</DashboardContent>
        </TenantProvider>
    );
}

function DashboardContent({ children }: { children: ReactNode }) {
    const { isLoading, isAuthenticated } = useTenant();

    if (isLoading && isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600 font-medium animate-pulse">Initializing your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
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
            <MobileNav />
            <MobileSidebarStyles />
        </div>
    );
}
