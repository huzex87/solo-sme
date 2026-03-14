'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift } from 'lucide-react';
import styles from './landing.module.css';
import { createClient } from '@/lib/supabase/client';

export default function ExitIntentPopup() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || loading) return;

        try {
            setLoading(true);
            const supabase = createClient();
            const { error } = await supabase
                .from('marketing_leads')
                .insert([{ email, source: 'exit_intent_popup' }]);

            if (error) {
                if (error.code === '23505') {
                    // Unique constraint violation — email already exists
                    setSubmitted(true);
                } else {
                    console.error('[ExitIntent] Error saving lead:', error);
                    alert('There was an error claiming your offer. Please try again.');
                }
            } else {
                setSubmitted(true);
            }
        } catch (err) {
            console.error('[ExitIntent] Unexpected error:', err);
        } finally {
            setLoading(false);
            if (submitted) {
                setTimeout(() => setShow(false), 3000);
            }
        }
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
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Claim My Offer →'}
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
