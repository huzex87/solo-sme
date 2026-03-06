'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
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

function formatPrice(amount: number): string {
    if (amount === 0) return 'Free';
    return `₦${amount.toLocaleString()}`;
}

export default function PricingSection() {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="pricing" className={styles.pricingSectionNew}>
            <span className={styles.sectionLabel}>Pricing</span>
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>
                Start free. Scale when you&apos;re ready.
            </p>

            {/* Billing toggle */}
            <div className={styles.billingToggle}>
                <button
                    className={`${styles.billingOption} ${!annual ? styles.billingActive : ''}`}
                    onClick={() => setAnnual(false)}
                >
                    Monthly
                </button>
                <button
                    className={`${styles.billingOption} ${annual ? styles.billingActive : ''}`}
                    onClick={() => setAnnual(true)}
                >
                    Annual
                    <span className={styles.saveBadge}>Save 17%</span>
                </button>
            </div>

            <div className={styles.pricingGridNew}>
                {PLANS.map((p) => {
                    const price = annual ? p.annual : p.monthly;
                    const period = p.monthly === 0 ? 'forever' : annual ? '/year' : '/month';

                    return (
                        <div
                            key={p.id}
                            className={`${styles.pricingCardNew} ${p.highlight ? styles.pricingHighlight : ''}`}
                        >
                            {p.badge && (
                                <span className={styles.pricingBadge}>{p.badge}</span>
                            )}
                            <div className={styles.pricingTierNew}>{p.tier}</div>
                            <div className={styles.pricingAmountNew}>
                                {formatPrice(price)}
                            </div>
                            <div className={styles.pricingPeriodNew}>{period}</div>
                            <ul className={styles.pricingFeaturesNew}>
                                {p.features.map((feat) => (
                                    <li key={feat}>
                                        <CheckCircle2 size={16} className={styles.pricingCheck} /> {/* Replaced Check with CheckCircle2 and removed span */}
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/signup"
                                className={`btn ${p.highlight ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%' }}
                            >
                                {p.cta}
                            </Link>
                            {p.ctaNote && (
                                <span className={styles.pricingNote}>{p.ctaNote}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
