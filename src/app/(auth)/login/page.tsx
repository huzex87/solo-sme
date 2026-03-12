'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../auth.module.css';
import { AuthService } from '@/services/authService';
import { BrandLogo } from '@/components/shared/BrandLogo';

type LoginMethod = 'email' | 'phone';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [method, setMethod] = useState<LoginMethod>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data, error: authErr } = await AuthService.signIn(email, password);
      if (authErr) { setError(authErr.message || 'Invalid credentials.'); return; }
      if (data?.user) router.push(redirectTo);
    } catch (e: unknown) {
      setError((e as Error).message || 'An unexpected error occurred.');
    } finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Enter a valid phone number with country code (e.g. +2348…)');
      return;
    }
    setError(''); setLoading(true);
    try {
      const { error: otpErr } = await AuthService.signInWithPhone(phone);
      if (otpErr) { setError(otpErr.message || 'Could not send OTP.'); return; }
      setOtpSent(true);
      setSuccess('Verification code sent! Check your phone.');
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) { setError('Enter the 6-digit code.'); return; }
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { error: verErr } = await AuthService.verifyPhoneOTP(phone, otp);
      if (verErr) { setError(verErr.message || 'Invalid code.'); return; }
      router.push(redirectTo);
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const { error: googleErr } = await AuthService.signInWithGoogle();
      if (googleErr) setError(googleErr.message);
    } catch { setError('Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.authLayout}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftBg} />
        <div className={styles.authLeftGrid} />
        <div className={styles.authBrand}>
          <BrandLogo variant="monochrome-white" size={48} className="mb-10" />
          <h1 className={styles.authHeadline}>
            Build your legacy on<br /><em>Sovereign Ground.</em>
          </h1>
          <p className={styles.authSubhead}>
            World-class commerce tools for the next generation of Nigerian merchants.
            Start free. Scale with AI. Run everything from one place.
          </p>
          <div className={styles.authProof}>
            {[
              { val: '2,800+', lbl: 'Active merchants' },
              { val: '₦12.8M', lbl: 'Revenue today' },
              { val: '30 sec', lbl: 'Setup time' },
              { val: '100%', lbl: 'Free to start' },
            ].map(p => (
              <div key={p.lbl} className={styles.proofItem}>
                <div className={styles.proofVal}>{p.val}</div>
                <div className={styles.proofLbl}>{p.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.authRight}>
        <div className={styles.authCard}>
          <div className={styles.authCardTop}>
            <BrandLogo size={32} showText={false} className="mb-6 lg:hidden" />
            <h2 className={styles.authCardTitle}>Welcome back</h2>
            <p className={styles.authCardSubtitle}>Sign in to your SOLO account to continue.</p>
          </div>

          {/* Social Sign In */}
          <button className={styles.socialBtn} onClick={handleGoogleLogin} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className={styles.divider}>or login with</div>

          {/* Method toggle */}
          <div className={styles.tabRow}>
            <button
              className={`${styles.tabBtn} ${method === 'email' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMethod('email'); setError(''); }}
            >
              <Mail size={14} /> Email
            </button>
            <button
              className={`${styles.tabBtn} ${method === 'phone' ? styles.tabBtnActive : ''}`}
              onClick={() => { setMethod('phone'); setError(''); }}
            >
              <Phone size={14} /> Phone
            </button>
          </div>

          {/* Alerts */}
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

          {/* ── EMAIL FORM ── */}
          {method === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.formInput}
                    placeholder="Your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.inputSuffix} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── PHONE FORM ── */}
          {method === 'phone' && !otpSent && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Sending…' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {method === 'phone' && otpSent && (
            <form onSubmit={handleVerifyOTP}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>6-digit code sent to {phone}</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading || otp.length < 6}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                className={styles.secondaryBtnOutline}
                onClick={() => { setOtpSent(false); setOtp(''); setSuccess(''); }}
              >
                ← Change number
              </button>
            </form>
          )}

          <div className={styles.authFooter}>
            Don't have an account? <Link href="/signup">Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
