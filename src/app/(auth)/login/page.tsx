'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Phone, Mail, Smartphone, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

type LoginMethod = 'email' | 'phone';

export default function LoginPage() {
    const router = useRouter();
    const [method, setMethod] = useState<LoginMethod>('email');

    // Email state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Phone state
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { AuthService } = await import('@/services/authService');
            const { data, error: authError } = await AuthService.signIn(email, password);

            if (authError) {
                setError(authError.message || 'Invalid credentials. Please try again.');
                setLoading(false);
                return;
            }

            if (data?.user) {
                router.push('/dashboard');
            }
        } catch (e: unknown) {
            const error = e as Error;
            console.error('[Auth] Login error:', error);
            setError(error.message || 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid phone number with country code (e.g., +234...)');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const { AuthService } = await import('@/services/authService');
            const { error: otpError } = await AuthService.signInWithPhone(phone);

            if (otpError) {
                setError(otpError.message || 'Could not send OTP. Please try again.');
                setLoading(false);
                return;
            }

            setOtpSent(true);
            setSuccess('Verification code sent! Check your phone.');
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setError('Please enter the 6-digit code');
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { AuthService } = await import('@/services/authService');
            const { error: verifyError } = await AuthService.verifyPhoneOTP(phone, otp);

            if (verifyError) {
                setError(verifyError.message || 'Invalid code. Please try again.');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setSocialLoading('google');
        try {
            const { AuthService } = await import('@/services/authService');
            const { error: googleError } = await AuthService.signInWithGoogle();

            if (googleError) {
                setError(googleError.message || 'Google sign-in failed.');
                setSocialLoading('');
            }
            // If successful, the browser redirects to Google OAuth —
            // no need to handle the success case here.
        } catch {
            setError('An unexpected error occurred.');
            setSocialLoading('');
        }
    };

    return (
        <div className={styles.authLayout}>
            {/* ── LEFT — BRAND PANEL ── */}
            <div className={styles.authLeft}>
                <div className={styles.authLeftMesh} />
                <div className={styles.authLeftGrid} />

                <div className={styles.authBrand}>
                    <div className={styles.authLogo}>
                        SOLO<span>.</span>
                    </div>

                    <h1 className={styles.authHeadline}>
                        The Operating System for <br />
                        <em>Small Business.</em>
                    </h1>

                    <p className={styles.authSubhead}>
                        Join 2,800+ Nigerian merchants powering their growth with SOLO's world-class business engine.
                    </p>

                    <div className={styles.authProof}>
                        <div className={styles.proofItem}>
                            <div className={styles.proofVal}>₦12.8M</div>
                            <div className={styles.proofLbl}>Daily Volume</div>
                        </div>
                        <div className={styles.proofItem}>
                            <div className={styles.proofVal}>99.9%</div>
                            <div className={styles.proofLbl}>Uptime Core</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT — FORM PANEL ── */}
            <div className={styles.authRight}>
                <div className={styles.authCard}>
                    <div className="mb-8">
                        <h2 className={styles.authCardTitle}>Welcome Back</h2>
                        <p className={styles.authCardSub}>Sign in to manage your sovereign store</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-xs font-semibold border border-green-100">
                            {success}
                        </div>
                    )}

                    {/* Method Toggle */}
                    <div className={styles.methodToggle}>
                        <button
                            type="button"
                            className={`${styles.methodBtn} ${method === 'email' ? styles.methodBtnActive : ''}`}
                            onClick={() => { setMethod('email'); setError(''); setSuccess(''); }}
                        >
                            <Mail size={14} /> Email
                        </button>
                        <button
                            type="button"
                            className={`${styles.methodBtn} ${method === 'phone' ? styles.methodBtnActive : ''}`}
                            onClick={() => { setMethod('phone'); setError(''); setSuccess(''); setOtpSent(false); }}
                        >
                            <Smartphone size={14} /> Phone
                        </button>
                    </div>

                    {/* Email Form */}
                    {method === 'email' && (
                        <form onSubmit={handleEmailLogin}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Business Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="you@business.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Secure Password</label>
                                <div className={styles.formInputWrap}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div
                                        className={styles.formInputIcon}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In to Dashboard <ArrowRight size={16} /></>}
                            </button>
                        </form>
                    )}

                    {/* Phone Form */}
                    {method === 'phone' && (
                        <form onSubmit={otpSent ? handleVerifyOTP : (e) => { e.preventDefault(); handleSendOTP(); }}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Phone Number</label>
                                <div className={styles.formInputWrap}>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        placeholder="+234 801 234 5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        disabled={otpSent}
                                    />
                                    {!otpSent && (
                                        <div
                                            className={styles.formInputIcon}
                                            style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}
                                            onClick={handleSendOTP}
                                        >
                                            {loading ? '...' : 'Send'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {otpSent && (
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>6-Digit Code</label>
                                    <input
                                        type="text"
                                        className="input-field text-center tracking-[0.5em] font-mono"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        autoFocus
                                    />
                                </div>
                            )}

                            {otpSent && (
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Continue'}
                                </button>
                            )}
                        </form>
                    )}

                    <div className={styles.authDivider}>Or continue with social</div>

                    <div className={styles.socialBtns}>
                        <button className={styles.socialBtn} onClick={handleGoogleSignIn} disabled={!!socialLoading}>
                            {socialLoading === 'google' ? <Loader2 size={14} className="animate-spin" /> : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )} Google
                        </button>
                        <button className={styles.socialBtn}>Apple</button>
                    </div>

                    <div className={styles.authFooter}>
                        Don't have an account? <Link href="/signup">Create your store</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
