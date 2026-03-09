'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, Store, User, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import styles from '../auth.module.css';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep]           = useState(1);
  const [businessName, setBiz]    = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [fullName, setName]       = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [acceptTerms, setTerms]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const bn = searchParams.get('businessName');
    const sd = searchParams.get('subdomain');
    if (bn) setBiz(bn);
    if (sd) setSubdomain(sd.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }, [searchParams]);

  const handleBizChange = (v: string) => {
    setBiz(v);
    setSubdomain(v.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) { setError('Please accept the terms and conditions.'); return; }
    setError(''); setLoading(true);
    try {
      const { AuthService } = await import('@/services/authService');
      const { data, error: authErr } = await AuthService.signUp(email, password, fullName, businessName, subdomain);
      if (authErr) { setError(authErr.message || 'Could not create account.'); return; }
      if (data?.user) router.push('/dashboard/welcome');
    } catch (e: unknown) {
      setError((e as Error).message || 'An unexpected error occurred.');
    } finally { setLoading(false); }
  };

  const STEPS = [
    { num: 1, label: 'Business', icon: Store },
    { num: 2, label: 'Account',  icon: User  },
  ];

  return (
    <div className={styles.authLayout}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftBg} />
        <div className={styles.authLeftGrid} />
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>SOLO<span>.</span></div>
          <h1 className={styles.authHeadline}>
            Start selling<br /><em>in 30 seconds.</em>
          </h1>
          <p className={styles.authSubhead}>
            Set up your store, start accepting payments, and manage your entire business from one simple platform.
            No technical skills needed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Free online store with your custom URL',
              'AI-powered inventory & order management',
              'WhatsApp business assistant included',
              'Accept Paystack & bank transfers instantly',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,121,140,.2)', border: '1px solid rgba(0,121,140,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="var(--primary-md)" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authCardTop}>
            <h2 className={styles.authCardTitle}>Create your free store</h2>
            <p className={styles.authCardSubtitle}>No credit card needed. Start in under a minute.</p>
          </div>

          {/* Progress indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{
                flex: 1, height: 3, borderRadius: 4,
                background: s.num <= step ? 'var(--primary)' : 'var(--border)',
                transition: 'background .3s'
              }} />
            ))}
          </div>

          {error && (
            <div className={`${styles.alertBox} ${styles.alertError}`}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          {/* ── STEP 1: Business ── */}
          {step === 1 && (
            <div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Business name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Amina's Fabrics"
                  value={businessName}
                  onChange={e => handleBizChange(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your store URL</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={subdomain}
                    onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    style={{ paddingLeft: 140 }}
                    placeholder="my-store"
                  />
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 12, color: 'var(--muted)', fontWeight: 600, pointerEvents: 'none',
                    fontFamily: 'var(--font-mono)'
                  }}>solo-sme.app/</span>
                </div>
              </div>
              <button
                className={styles.submitBtn}
                onClick={() => { if (!businessName.trim()) { setError('Please enter your business name.'); return; } setError(''); setStep(2); }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Account ── */}
          {step === 2 && (
            <form onSubmit={handleSignup}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your full name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Amina Yusuf"
                  value={fullName}
                  onChange={e => setName(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={styles.formInput}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <button type="button" className={styles.inputSuffix} onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  I agree to the <Link href="/terms" style={{ color: 'var(--primary)', fontWeight: 700 }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--primary)', fontWeight: 700 }}>Privacy Policy</Link>
                </span>
              </label>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {loading ? 'Creating your store…' : 'Create My Free Store'}
              </button>
              <button
                type="button"
                style={{ width: '100%', marginTop: 10, padding: '10px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 'var(--rl)', fontSize: 13, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
            </form>
          )}

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense fallback={null}><SignupForm /></Suspense>;
}
