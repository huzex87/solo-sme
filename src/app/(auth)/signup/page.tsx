'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import styles from '../auth.module.css';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);

    // Step 1: Business
    const [businessName, setBusinessName] = useState('');
    const [subdomain, setSubdomain] = useState('');

    // Step 2: Account
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    useEffect(() => {
        const bName = searchParams.get('businessName');
        const sDomain = searchParams.get('subdomain');
        if (bName) setBusinessName(bName);
        if (sDomain) {
            setSubdomain(sDomain.toLowerCase().replace(/[^a-z0-9-]/g, ''));
        }
    }, [searchParams]);

    const handleBusinessNameChange = (value: string) => {
        setBusinessName(value);
        setSubdomain(value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    };

    const handleNextStep = (e: FormEvent) => {
        e.preventDefault();
        if (!businessName || !subdomain || subdomain.length < 3) {
            setError('Please provide a valid business name and store URL (min 3 chars).');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const { AuthService } = await import('@/services/authService');
            const { data, error: signUpError } = await AuthService.signUp(
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

            // Check if we have imported data to finalize
            if (typeof window !== 'undefined' && data?.user?.id) {
                const importData = sessionStorage.getItem('solo_onboarding_import');
                if (importData) {
                    try {
                        const { OnboardingService } = await import('@/services/onboardingService');
                        const parsed = JSON.parse(importData);

                        const tenantId = data.tenant_id;

                        if (tenantId) {
                            await OnboardingService.finalizeOnboarding(tenantId, parsed);
                        }

                        sessionStorage.removeItem('solo_onboarding_import');
                    } catch (e) {
                        console.error("Failed to finalize onboarding import", e);
                    }
                }
            }

            router.push('/dashboard/welcome');
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
            {/* Left Section: Branding */}
            <div className={styles.brandSection}>
                <div className={styles.brandContent}>
                    <div className={styles.brandLogo}>
                        SOLO<span>.</span>
                    </div>
                    <h1 className={styles.brandTitle}>
                        The Operating System for <em>Small Business.</em>
                    </h1>
                    <p className={styles.brandDesc}>
                        Join 12,000+ Nigerian merchants powering their growth with SOLO's all-in-one business engine.
                    </p>

                    <div style={{ marginTop: '3.5rem', display: 'flex', gap: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>₦2.4B+</div>
                            <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Total Volume</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>12k+</div>
                            <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Verified Merchants</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section: Form */}
            <div className={styles.formSection}>
                <div className={styles.authCard}>
                    <div className={styles.logo}>
                        <h2>Create Your Account</h2>
                        <p className={styles.subtitle}>
                            Step {step} of 2: {step === 1 ? 'Business Details' : 'Account Security'}
                        </p>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    {step === 1 ? (
                        <form className={styles.form} onSubmit={handleNextStep}>
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

                            <div className={styles.divider}>or start with email</div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="businessName">Business Name</label>
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

                            <div className={styles.inputGroup}>
                                <label htmlFor="subdomain">Store URL</label>
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
                                        color: 'var(--muted)',
                                        fontSize: '0.75rem',
                                        pointerEvents: 'none',
                                    }}>
                                        .solo.app
                                    </span>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Next: Account Setup <ArrowRight size={16} />
                            </button>
                        </form>
                    ) : (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="fullName">Full Name</label>
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

                            <div className={styles.inputGroup}>
                                <label htmlFor="signupEmail">Email Address</label>
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

                            <div className={styles.inputGroup}>
                                <label htmlFor="signupPassword">Password</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        id="signupPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="Min. 8 characters"
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
                                {password.length > 0 && (
                                    <div className={styles.passwordStrength}>
                                        <div className={styles.strengthBar}>
                                            <div
                                                className={styles.strengthFill}
                                                style={{
                                                    width: `${Math.min((password.length / 10) * 100, 100)}%`,
                                                    backgroundColor: password.length < 6 ? '#EF4444' : password.length < 10 ? '#F59E0B' : '#10B981'
                                                }}
                                            />
                                        </div>
                                        <span className={styles.strengthLabel}>
                                            {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.checkboxGroup}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        required
                                    />
                                    <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link></span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading || !acceptTerms}
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Launch My Store
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ width: '100%', marginTop: '0.5rem' }}
                                onClick={() => setStep(1)}
                            >
                                Back to Business Details
                            </button>
                        </form>
                    )}

                    {/* Social Media Import CTA */}
                    {step === 1 && (
                        <Link href="/onboarding/instagram" className={styles.importCard}>
                            <div className={styles.importIconWrapper}>
                                <Sparkles size={20} />
                            </div>
                            <div className={styles.importText}>
                                <h4>Selling on Instagram?</h4>
                                <p>Import your catalog instantly with AI</p>
                            </div>
                            <ArrowRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                        </Link>
                    )}

                    <p className={styles.footer}>
                        Already have a store? <Link href="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div >
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className={styles.authLayout}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                </div>
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}

