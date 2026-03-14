'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './Sidebar';
import styles from './admin.module.css';

/* ──────────────────────────────────────────────────────────────────────────────
   Super Admin Layout — With Auth Gate
   
   Credentials: disbursifynig@gmail.com / Kats1na@01
   
   In production this would use server-side session checking.
   For now, a client-side gate protects the admin console.
   ────────────────────────────────────────────────────────────────────────── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

return (
    <div className={styles.adminLayout}>
        <AdminSidebar onLogout={handleLogout} />
        <main className={styles.content}>
            {children}
        </main>
    </div>
);
}
