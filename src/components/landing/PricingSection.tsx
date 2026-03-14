'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import styles from './landing.module.css';

const PLANS = [
    {
        id: 'starter',
        tier: 'Beta Access',
        monthly: 0,
        annual: 0,
        period: 'forever',
        highlight: true,
        badge: 'Free for Early Adopters',
        cta: 'Claim My Store',
        ctaNote: 'No credit card required',
        features: [
            'Verified .solo.ng domain',
            'AI Catalog Assistant (WhatsApp)',
            'Unlimited product uploads',
            'Secure Paystack checkout',
            'Real-time sales dashboard',
            'Sovereign Ground design',
        ],
    },
    {
        id: 'growth',
        tier: 'Growth',
        monthly: 10000,
        annual: 100000,
        highlight: false,
        badge: 'Coming Soon',
        cta: 'Join Waitlist',
        ctaNote: 'Estimated Q3 2026',
        features: [
            'Custom .com / .ng domain',
            'Advanced marketing automation',
            'Multi-staff accounts',
            'Automated inventory syncing',
            'Premium analytics',
            'Priority 24/7 support',
        ],
    },
];


export default function PricingSection() {
    return (
        <section id="pricing" className={styles.lpPricing}>
            <div className={styles.lpPricingInner}>
                <span className={styles.sectionLabel}>Simple Pricing</span>
                <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Grow at your <em>own pace.</em></h2>
                <p className={styles.sectionSubtitle} style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Transparent plans for every stage of your business journey.
                </p>

                <div className={styles.priceGrid}>
                    {PLANS.map((p) => {
                        const amount = p.monthly;
                        const period = p.monthly === 0 ? 'forever' : '/mo';

                        return (
                            <div
                                key={p.id}
                                className={`${styles.priceCard} ${p.highlight ? styles.featured : ''}`}
                            >
                                {p.badge && (
                                    <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: '9.5px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        {p.badge}
                                    </div>
                                )}
                                <div className={styles.priceTitle}>{p.tier}</div>
                                <div className={styles.priceAmount}>
                                    {amount === 0 ? 'Free' : formatCurrency(amount)}
                                    {amount > 0 && <span>{period}</span>}
                                </div>
                                <div className={styles.priceDesc}>Best for small merchants and beginners.</div>
                                <ul className={styles.priceFeatures}>
                                    {p.features.slice(0, 5).map((feat) => (
                                        <li key={feat}>{feat}</li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className={`btn ${p.highlight ? 'btn-primary' : 'btn-outline'} btn-block`}
                                    style={{ marginTop: 'auto', borderRadius: '8px', padding: '10px' }}
                                >
                                    {p.cta}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
