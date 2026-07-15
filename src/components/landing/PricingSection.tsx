'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';
import styles from './landing.module.css';

const PLANS = [
    {
        id: 'starter',
        tier: 'Starter Plan',
        monthly: 0,
        desc: 'Essential tools for small shops starting their digital journey.',
        highlight: false,
        badge: 'Free Forever',
        cta: 'Claim My Store',
        features: [
            'Up to 20 active products',
            'Basic sales reporting',
            'WhatsApp catalog checkout',
            'Standard checkout page (subdomain)',
            '1 staff account',
        ],
    },
    {
        id: 'growth',
        tier: 'Growth Plan',
        monthly: 9900,
        desc: 'Scale your business with AI operations and custom branding.',
        highlight: true,
        badge: 'Most Popular',
        cta: 'Start Free Trial',
        features: [
            'Unlimited products',
            'Amina AI assistant & sales forecasting',
            'Custom domain mapping (e.g. yourname.ng)',
            'Automated dispute & invoice system',
            'Up to 5 staff accounts',
            'Paystack Subaccount auto-settlement',
        ],
    },
    {
        id: 'enterprise',
        tier: 'Enterprise Plan',
        monthly: 49900,
        desc: 'For mature SMEs requiring dedicated APIs and scale.',
        highlight: false,
        badge: 'For Large Scale',
        cta: 'Contact Sales',
        features: [
            'Dedicated Meta WhatsApp API account',
            'Advanced Loyalty HQ & VIP rewards',
            'SLA support with designated agent',
            'Multi-location inventory tracking',
            'Unlimited staff accounts',
            'Custom integrations support',
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
                                <div className={styles.priceDesc}>{p.desc}</div>
                                <ul className={styles.priceFeatures}>
                                    {p.features.map((feat) => (
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
