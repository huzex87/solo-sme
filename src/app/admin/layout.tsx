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

const ADMIN_EMAIL = 'disbursifynig@gmail.com';
const ADMIN_PASS = 'Kats1na@01';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authed, setAuthed] = useState(false);
    const [checking, setChecking] = useState(true);
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');

    // Check if already authenticated
    useEffect(() => {
        const token = sessionStorage.getItem('solo_admin_session');
        if (token === 'authenticated') {
            setAuthed(true);
        }
        setChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (email.trim().toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
            sessionStorage.setItem('solo_admin_session', 'authenticated');
            setAuthed(true);
        } else {
            setError('Invalid credentials. Access restricted to platform administrators.');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('solo_admin_session');
        setAuthed(false);
        setEmail('');
        setPass('');
    };

    if (checking) {
        return (
            <div className={styles.authGate}>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Verifying access…</div>
            </div>
        );
    }

    // Auth gate
    if (!authed) {
        return (
            <div className={styles.authGate}>
                <div className={styles.authCard}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14, margin: '0 auto 20px',
                        background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em',
                        margin: '0 0 6px', fontFamily: 'var(--font-display)',
                    }}>SOLO OS</h1>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 28, fontWeight: 500 }}>
                        Super Admin • Platform Command Center
                    </p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input
                            type="email"
                            placeholder="Admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.authInput}
                            required
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            className={styles.authInput}
                            required
                        />
                        <button type="submit" className={styles.authBtn} style={{ marginTop: 6 }}>
                            Authenticate
                        </button>
                    </form>

                    {error && <p className={styles.authError}>{error}</p>}

                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 24 }}>
                        Secured access • SOLO SME Platform
                    </p>
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
