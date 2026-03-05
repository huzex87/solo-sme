'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');

    const handleBusinessNameChange = (value: string) => {
        setBusinessName(value);
        setSubdomain(value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (!subdomain || subdomain.length < 3) {
            setError('Store URL must be at least 3 characters');
            setLoading(false);
            return;
        }

        try {
            const { AuthService } = await import('@/services/authService');
            const { error: signUpError } = await AuthService.signUp(
                email,
                password,
                businessName,
                subdomain,
                fullName,
            );

            if (signUpError) {
                setError(signUpError.message || 'Could not create account. Please try again.');
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
                setError(googleError.message || 'Google sign-up failed.');
                setSocialLoading('');
            }
        } catch {
            setError('An unexpected error occurred.');
            setSocialLoading('');
        }
    };

    return (
        <div className={styles.authLayout}>
            <div className={`${styles.nebula} ${styles.nebula1}`} />
            <div className={`${styles.nebula} ${styles.nebula2}`} />

            <div className={`glass-elevated ${styles.authCard}`}>
                <div className={styles.logo}>
                    <span className={`gradient-text ${styles.logoText}`}>SOLO</span>
                    <p className={styles.subtitle}>Launch your business in seconds</p>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* Google Sign-Up */}
                <div className={styles.socialButtons}>
                    <button
                        className={styles.socialBtnGoogle}
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={!!socialLoading}
                    >
                        {socialLoading === 'google' ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Sign up with Google
                    </button>
                </div>

                <div className={styles.divider}>or create with email</div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="fullName">Your Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            className="input-field"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="businessName">Business Name</label>
                        <input
                            id="businessName"
                            type="text"
                            className="input-field"
                            placeholder="Awesome Boutique"
                            value={businessName}
                            onChange={(e) => handleBusinessNameChange(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="subdomain">Your Store URL</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="subdomain"
                                type="text"
                                className="input-field"
                                placeholder="awesome-boutique"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                required
                                style={{ paddingRight: '8rem' }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)',
                                fontSize: 'var(--font-size-xs)',
                                pointerEvents: 'none',
                            }}>
                                .solo.app
                            </span>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="signupEmail">Email Address</label>
                        <input
                            id="signupEmail"
                            type="email"
                            className="input-field"
                            placeholder="you@business.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="signupPassword">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="signupPassword"
                                type={showPassword ? 'text' : 'password'}
                                className="input-field"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Creating your store...</>
                        ) : 'Launch My Store'}
                    </button>
                </form>

                {/* Social Media Import CTA */}
                <Link href="/dashboard/onboarding/instagram" className={styles.importCard}>
                    <div className={styles.importIconWrapper}>
                        <Sparkles size={20} />
                    </div>
                    <div className={styles.importText}>
                        <h4>Already selling on social media?</h4>
                        <p>Import your Instagram or website catalog instantly with AI</p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </Link>

                <p className={styles.footer}>
                    Already have a store? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
