'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, Phone, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../auth.module.css';

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
      const { AuthService } = await import('@/services/authService');
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
      const { AuthService } = await import('@/services/authService');
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
      const { AuthService } = await import('@/services/authService');
      const { error: verErr } = await AuthService.verifyPhoneOTP(phone, otp);
      if (verErr) { setError(verErr.message || 'Invalid code.'); return; }
      router.push(redirectTo);
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.authLayout}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftBg} />
        <div className={styles.authLeftGrid} />
        <div className={styles.authBrand}>
          <div className={styles.authLogo}>SOLO<span>.</span></div>
          <h1 className={styles.authHeadline}>
            Run your business<br /><em>from one place.</em>
          </h1>
          <p className={styles.authSubhead}>
            SOLO gives Nigerian small businesses a digital store, smart POS,
            AI marketing, and financial ledger — all in one platform.
          </p>
          <div className={styles.authProof}>
            {[
              { val: '10,000+', lbl: 'Active merchants' },
              { val: '₦2.4B+', lbl: 'Transactions processed' },
              { val: '30 sec', lbl: 'Average setup time' },
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
            <h2 className={styles.authCardTitle}>Welcome back</h2>
            <p className={styles.authCardSubtitle}>Sign in to your SOLO account to continue.</p>
          </div>

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
            <div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
              <button className={styles.submitBtn} onClick={handleSendOTP} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Sending…' : 'Send Verification Code'}
              </button>
            </div>
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
                style={{ width: '100%', marginTop: 10, padding: '10px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 'var(--rl)', fontSize: 13, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}
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
