'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBusinessNameChange = (value: string) => {
        setBusinessName(value);
        // Auto-generate subdomain from business name
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
                        <input
                            id="signupPassword"
                            type="password"
                            className="input-field"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating your store...' : 'Launch My Store'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already have a store? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
