import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from './Sidebar';
import styles from './admin.module.css';

/* ──────────────────────────────────────────────────────────────────────────────
   Super Admin Layout — Server-side Auth Gate

   Uses Supabase auth + profiles.is_superadmin check.
   Middleware also guards this route, but this is the second layer.
   ────────────────────────────────────────────────────────────────────────── */

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/admin');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_superadmin) {
        redirect('/dashboard');
    }

    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
