'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './Sidebar';
import styles from './admin.module.css';

/* ──────────────────────────────────────────────────────────────────────────────
   Super Admin Layout — With Auth Gate
   
   Credentials: disbursifynig@gmail.com / Kats1na@01
   
   In production this would use server-side session checking.
   For now, a client-side gate protects the admin console.
   ────────────────────────────────────────────────────────────────────────── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const auth = localStorage.getItem('solo_admin_authenticated');
        setIsAuthorized(auth === 'true');
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Super admin credentials from institutional security comments
        if (email === 'disbursifynig@gmail.com' && password === 'Kats1na@01') {
            localStorage.setItem('solo_admin_authenticated', 'true');
            setIsAuthorized(true);
            setError('');
        } else {
            setError('Unauthorized: Invalid credentials');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('solo_admin_authenticated');
        setIsAuthorized(false);
        router.push('/');
    };

    // Prevent hydration flicker
    if (isAuthorized === null) return null;

    if (!isAuthorized) {
        return (
            <div className={styles.authGate}>
                <div className={styles.authCard}>
                    <div className={styles.adminBadge}>⚡ Secure Access</div>
                    <h2 className={styles.brandLogo} style={{ marginBottom: 8 }}>SOLO <span style={{ color: 'var(--accent)' }}>OS</span></h2>
                    <p className={styles.adminSubtitle}>Enter institutional credentials to manage the platform.</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input
                            type="email"
                            className={styles.authInput}
                            placeholder="Institutional Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className={styles.authInput}
                            placeholder="Access Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit" className={styles.authBtn}>Authorize Access</button>
                    </form>
                    {error && <div className={styles.authError}>{error}</div>}
                </div>
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
