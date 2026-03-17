'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Store, User, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from '../auth.module.css';
import { BrandLogo } from '@/components/shared/BrandLogo';

import { signUpAction } from '@/app/actions/authActions';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const handleBusinessNameChange = (name: string) => {
    setBusinessName(name);
    // Auto-generate subdomain from business name
    const suggested = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
    setSubdomain(suggested);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('businessName', businessName);
      formData.append('subdomain', subdomain);
      formData.append('fullName', fullName);

      const result = await signUpAction(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      // @ts-expect-error - err is unknown but we're handling the message property
      const errorMessage = err.message || 'An unexpected error occurred during signup.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!fullName || !businessName || !subdomain)) {
      setError('Please fill in all business details.');
      return;
    }
    setError('');
    setStep(2);
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
            The future of commerce is<br /><em>Sovereign.</em>
          </h1>
          <p className={styles.authSubhead}>
            Professional commerce infrastructure for the next generation of
            African merchants. Your store, your brand, your legacy.
          </p>

          <div className={styles.authProof}>
            {[
              { val: 'AES-256', lbl: 'Data encryption' },
              { val: 'Naira', lbl: 'Native payments' },
              { val: 'AI', lbl: 'Catalog builder' },
              { val: '24/7', lbl: 'Support' },
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
          <Link href="/" className={styles.backHomeBtn}>
            <ArrowRight className="rotate-180" size={14} /> Back to Home
          </Link>
          <div className={styles.authCardTop}>
            <BrandLogo size={32} showText={false} className="mb-6 lg:hidden" />
            <h2 className={styles.authCardTitle}>Create account</h2>
            <p className={styles.authCardSubtitle}>Launch your professional digital store in 30 seconds.</p>
          </div>

          {error && (
            <div className={`${styles.alertBox} ${styles.alertError}`}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {step === 1 ? (
              <div className="space-y-4">
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <div className={styles.inputSuffix}><User size={16} /></div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Business name</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Supreme Fabrics"
                      value={businessName}
                      onChange={(e) => handleBusinessNameChange(e.target.value)}
                      required
                    />
                    <div className={styles.inputSuffix}><Store size={16} /></div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Store URL</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="supreme-fabrics"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        required
                      />
                    </div>
                    <span className="text-sm font-semibold opacity-40">.solosme.ng</span>
                  </div>
                  <p className="text-[10px] mt-1 opacity-50 font-medium">This is where customers will visit your store.</p>
                </div>

                <button type="button" className={styles.submitBtn} onClick={nextStep}>
                  Experience the magic <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email address</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                    <div className={styles.inputSuffix}><Mail size={16} /></div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={styles.formInput}
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button type="button" className={styles.inputSuffix} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {loading ? 'Launching your store...' : 'Complete Setup'}
                </button>

                <button type="button" className={styles.secondaryBtnOutline} onClick={() => setStep(1)} disabled={loading}>
                  ← Back to details
                </button>
              </div>
            )}
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link href="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
