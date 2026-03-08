'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import styles from './landing.module.css';

const PLANS = [
    {
        id: 'starter',
        tier: 'Starter',
        monthly: 0,
        annual: 0,
        period: 'forever',
        highlight: false,
        badge: null,
        cta: 'Get Started',
        ctaNote: 'No credit card required',
        features: [
            'Up to 50 products',
            'SOLO subdomain (yourstore.solo.ng)',
            'Basic analytics',
            'WhatsApp receipts',
            'Email support',
        ],
    },
    {
        id: 'growth',
        tier: 'Growth',
        monthly: 9900,
        annual: 99000,
        highlight: false,
        badge: null,
        cta: 'Get Started',
        ctaNote: 'Cancel anytime',
        features: [
            'Unlimited products',
            'Custom domain',
            'Detailed analytics',
            'All-in-one inbox',
            'AI sales assistant',
            'Priority support',
        ],
    },
    {
        id: 'business',
        tier: 'Business',
        monthly: 24900,
        annual: 249000,
        highlight: true,
        badge: 'Most Popular',
        cta: 'Get Started',
        ctaNote: 'Cancel anytime',
        features: [
            'Everything in Growth',
            'Full POS dashboard (physical + digital)',
            'Marketing automation',
            'Structured financial ledger',
            'Customer loyalty program',
            'Up to 5 staff accounts',
            'Advanced analytics & reports',
            'WhatsApp receipt sharing',
            'Priority support',
        ],
    },
    {
        id: 'enterprise',
        tier: 'Enterprise',
        monthly: 49900,
        annual: 499000,
        highlight: false,
        badge: null,
        cta: 'Contact Sales',
        ctaNote: null,
        features: [
            'Everything in Business',
            'Multi-store management',
            'API access',
            'White-label mobile app',
            'Dedicated account manager',
            'Custom integrations',
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
