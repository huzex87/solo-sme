'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-instance';
import styles from '../auth.module.css';

function ResetForm() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: FormEvent) => {
        e.preventDefault();
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (password !== confirmPw) { setError('Passwords do not match.'); return; }
        setError(''); setLoading(true);

        try {
            if (!isSupabaseConfigured) {
                setSuccess('Demo mode — password updated (simulated).');
                return;
            }

            const { error: updateErr } = await supabase.auth.updateUser({ password });
            if (updateErr) { setError(updateErr.message || 'Could not update password.'); return; }

            setSuccess('Password updated successfully! Redirecting to login…');
            setTimeout(() => router.push('/login'), 2000);
        } catch {
            setError('An unexpected error occurred.');
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.authLayout}>
            <div className={styles.authLeft}>
                <div className={styles.authLeftBg} />
                <div className={styles.authLeftGrid} />
                <div className={styles.authBrand}>
                    <div className={styles.authLogo}>SOLO<span>.</span></div>
                    <h1 className={styles.authHeadline}>
                        Set your new<br /><em>password.</em>
                    </h1>
                    <p className={styles.authSubhead}>
                        Choose a strong new password for your SOLO account.
                    </p>
                </div>
            </div>

            <div className={styles.authRight}>
                <div className={styles.authCard}>
                    <div className={styles.authCardTop}>
                        <h2 className={styles.authCardTitle}>New Password</h2>
                        <p className={styles.authCardSubtitle}>Must be at least 8 characters.</p>
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

                    {!success && (
                        <form onSubmit={handleReset}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>New password</label>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        className={styles.formInput}
                                        placeholder="At least 8 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        minLength={8} required autoFocus
                                    />
                                    <button type="button" className={styles.inputSuffix} onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirm password</label>
                                <input
                                    type="password"
                                    className={styles.formInput}
                                    placeholder="Re-enter your password"
                                    value={confirmPw}
                                    onChange={e => setConfirmPw(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                {loading ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return <Suspense fallback={null}><ResetForm /></Suspense>;
}
