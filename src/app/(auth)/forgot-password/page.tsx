'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        setError(''); setSuccess(''); setLoading(true);

        try {
            if (!isSupabaseConfigured) {
                setSuccess('Demo mode — password reset unavailable. Use any email/password to sign in.');
                return;
            }

            const supabase = createClient();
            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetErr) {
                setError(resetErr.message || 'Could not send reset email.');
                return;
            }

            setSuccess('If an account exists with that email, we\'ve sent a password reset link. Check your inbox (and spam folder).');
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authLayout}>
            <div className={styles.authLeft}>
                <div className={styles.authLeftBg} />
                <div className={styles.authLeftGrid} />
                <div className={styles.authBrand}>
                    <div className={styles.authLogo}>SOLO<span>.</span></div>
                    <h1 className={styles.authHeadline}>
                        Forgot your<br /><em>password?</em>
                    </h1>
                    <p className={styles.authSubhead}>
                        No worries — it happens! Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>
            </div>

            <div className={styles.authRight}>
                <div className={styles.authCard}>
                    <div className={styles.authCardTop}>
                        <h2 className={styles.authCardTitle}>Reset Password</h2>
                        <p className={styles.authCardSubtitle}>
                            Enter the email address you used to create your account.
                        </p>
                    </div>

                    {error && (
                        <div className={`${styles.alertBox} ${styles.alertError}`}>
                            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className={`${styles.alertBox} ${styles.alertSuccess}`}>
                            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {success}
                        </div>
                    )}

                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{
                                        position: 'absolute', left: 14, top: '50%',
                                        transform: 'translateY(-50%)', color: 'var(--ghost)',
                                    }} />
                                    <input
                                        type="email"
                                        className={styles.formInput}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ paddingLeft: 40 }}
                                        required autoFocus
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                {loading ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <Mail size={40} style={{ color: 'var(--primary)', marginBottom: 12, opacity: 0.6 }} />
                            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                                Didn&apos;t receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                className={styles.submitBtn}
                                onClick={() => { setSuccess(''); setEmail(''); }}
                                style={{ marginTop: 12 }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <div className={styles.authFooter}>
                        Remember your password? <Link href="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
