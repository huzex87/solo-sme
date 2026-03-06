'use client';

import { Star } from 'lucide-react';
import styles from './landing.module.css';

const TESTIMONIALS = [
    {
        name: 'Founding Merchant Slot #1',
        biz: "Available for Early Adopters",
        quote: "Join our first 10 selected merchants in Katsina to receive white-glove onboarding and premium support.",
        color: '#6366f1'
    },
    {
        name: 'Founding Merchant Slot #2',
        biz: "Available for Early Adopters",
        quote: "We are building SOLO together with real business owners. Your feedback will shape the future of commerce in Nigeria.",
        color: '#10b981'
    },
    {
        name: 'Founding Merchant Slot #3',
        biz: "Available for Early Adopters",
        quote: "Take your business digital today. High-fidelity stores, AI assistants, and real-time inventory at your fingertips.",
        color: '#f59e0b'
    }
];

export default function TestimonialSection() {
    return (
        <section className={styles.testimonials} id="testimonials">
            <span className={styles.sectionLabel}>Testimonials</span>
            <h2 className={styles.sectionTitle}>Trusted by Merchants Across Nigeria</h2>
            <p className={styles.sectionSubtitle}>
                Be among our founding merchants and help us bridge the digital gap for SMEs.
            </p>

            <div className={styles.testimonialGrid}>
                {TESTIMONIALS.map((t, idx) => (
                    <div key={idx} className={styles.testimonialCard}>
                        <div className={styles.testimonialStars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill="var(--color-warning)" color="var(--color-warning)" />
                            ))}
                        </div>
                        <p className={styles.testimonialQuote}>&quot;{t.quote}&quot;</p>
                        <div className={styles.testimonialAuthor}>
                            <div
                                className={styles.testimonialAvatar}
                                style={{ background: t.color }}
                            >
                                {t.name.charAt(0)}
                            </div>
                            <div className={styles.testimonialMeta}>
                                <div className={styles.testimonialName}>{t.name}</div>
                                <div className={styles.testimonialBiz}>{t.biz}</div>
                            </div>
                        </div>
                        <div className={styles.mockBadge}>Verified Merchant</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
