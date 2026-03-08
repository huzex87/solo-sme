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
            {/* ── LEFT — BRAND PANEL ── */}
            <div className={styles.authLeft}>
                <div className={styles.authLeftMesh} />
                <div className={styles.authLeftGrid} />

                <div className={styles.authBrand}>
                    <div className={styles.authLogo}>
                        SOLO<span>.</span>
                    </div>

                    <h1 className={styles.authHeadline}>
                        Scale your vision <br />
                        on <em>Nigerian Soil.</em>
                    </h1>

                    <p className={styles.authSubhead}>
                        The most powerful commerce infrastructure for the next generation of African entrepreneurs.
                    </p>

                    <div className={styles.authProof}>
                        <div className={styles.proofItem}>
                            <div className={styles.proofVal}>2.8k+</div>
                            <div className={styles.proofLbl}>Merchants</div>
                        </div>
                        <div className={styles.proofItem}>
                            <div className={styles.proofVal}>₦1.2B</div>
                            <div className={styles.proofLbl}>GMV Tracked</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT — FORM PANEL ── */}
            <div className={styles.authRight}>
                <div className={styles.authCard}>
                    <div className="mb-8">
                        <h2 className={styles.authCardTitle}>Empower Your Business</h2>
                        <p className={styles.authCardSub}>
                            Step {step} of 2: {step === 1 ? 'Market Positioning' : 'Access Control'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-100 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleNextStep}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Business Identity</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Awesome Boutique"
                                    value={businessName}
                                    onChange={(e) => handleBusinessNameChange(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Sovereign Store URL</label>
                                <div className={styles.formInputWrap}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="awesome-boutique"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        required
                                    />
                                    <div className={styles.formInputIcon} style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700 }}>
                                        .solo.app
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Next: Security Setup <ArrowRight size={16} />
                            </button>

                            <div className={styles.authDivider}>Or start with social</div>

                            <div className={styles.socialBtns}>
                                <button type="button" className={styles.socialBtn} onClick={handleGoogleSignIn} disabled={!!socialLoading}>
                                    {socialLoading === 'google' ? <Loader2 size={14} className="animate-spin" /> : 'Google'}
                                </button>
                                <button type="button" className={styles.socialBtn}>Apple</button>
                            </div>

                            <Link href="/onboarding/instagram" className="mt-6 flex items-center justify-between p-4 rounded-xl border border-dashed border-border-md bg-surface hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-accent-lt text-accent flex items-center justify-center"><Sparkles size={16} /></div>
                                    <div>
                                        <div className="text-[11px] font-bold text-ink">Selling on Instagram?</div>
                                        <div className="text-[10px] text-muted">Import items instantly with AI</div>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-ghost" />
                            </Link>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Legal Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

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
                                <label className={styles.formLabel}>Set Master Password</label>
                                <div className={styles.formInputWrap}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="input-field"
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className={styles.formInputIcon} onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-start gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        required
                                    />
                                    <span className="text-[11px] text-muted leading-relaxed group-hover:text-ink transition-colors">
                                        I verify that I am a business owner in Nigeria and agree to the
                                        <Link href="/terms" className="text-primary font-bold mx-1">Terms</Link> and
                                        <Link href="/privacy" className="text-primary font-bold ml-1">Privacy Policy</Link>.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading || !acceptTerms}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Launch My Sovereign Store <ArrowRight size={16} /></>}
                            </button>

                            <button type="button" className="w-full mt-3 text-[11px] font-bold text-ghost hover:text-ink transition-colors" onClick={() => setStep(1)}>
                                ← Back to Business Details
                            </button>
                        </form>
                    )}

                    <div className={styles.authFooter}>
                        Already have a store? <Link href="/login">Sign in</Link>
                    </div>
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

