'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift } from 'lucide-react';
import styles from './landing.module.css';

export default function ExitIntentPopup() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleMouseLeave = useCallback((e: MouseEvent) => {
        if (e.clientY <= 0 && !sessionStorage.getItem('exitIntentShown')) {
            setShow(true);
            sessionStorage.setItem('exitIntentShown', 'true');
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mouseout', handleMouseLeave);
        return () => document.removeEventListener('mouseout', handleMouseLeave);
    }, [handleMouseLeave]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // TODO: Wire to Supabase leads table
        setSubmitted(true);
        setTimeout(() => setShow(false), 2500);
    };

    if (!show) return null;

    return (
        <div className={styles.exitOverlay}>
            <div className={styles.exitModal}>
                <button
                    className={styles.exitClose}
                    onClick={() => setShow(false)}
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {submitted ? (
                    <div className={styles.exitSuccess}>
                        <span className={styles.exitSuccessIcon}>🎉</span>
                        <h3>You&apos;re in!</h3>
                        <p>Check your email for the exclusive offer.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.exitEmoji}>
                            <Gift size={48} className="text-accent mx-auto" strokeWidth={1.5} />
                        </div>
                        <h3 className={styles.exitTitle}>
                            Wait — Get 3 months of SOLO Growth for the price of 1
                        </h3>
                        <p className={styles.exitDesc}>
                            Limited to our first 100 merchants. Enter your email to claim this exclusive launch offer.
                        </p>
                        <form onSubmit={handleSubmit} className={styles.exitForm}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`input-field ${styles.exitInput}`}
                                required
                            />
                            <button type="submit" className="btn btn-primary">
                                Claim My Offer →
                            </button>
                        </form>
                        <span className={styles.exitDisclaimer}>
                            No spam. Unsubscribe anytime.
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
