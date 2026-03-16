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
