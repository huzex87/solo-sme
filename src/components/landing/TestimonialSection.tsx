'use client';

import { Star } from 'lucide-react';
import styles from './landing.module.css';

const TESTIMONIALS = [
    {
        name: 'Aisha Lawal',
        biz: "Aisha's Boutique, Katsina",
        quote: "SOLO changed everything for me. I used to struggle with WhatsApp orders, but now my customers just checkout on my site. The AI assistant even helps me write my Instagram captions!",
        color: '#E8721A'
    },
    {
        name: 'Ibrahim Musa',
        biz: "Ibrahim Spice & Grains, Kano",
        quote: "The inventory sync is magic. I sell in my shop and online, and SOLO keeps it all organized. My revenue has grown 40% since I joined.",
        color: '#1A3C5E'
    },
    {
        name: 'Sarah Okon',
        biz: "Sarah's Natural Glow, Abuja",
        quote: "I love the professional look of my store. Customers trust me more because it looks world-class. Best decision for my business.",
        color: '#0E6B44'
    }
];

export default function TestimonialSection() {
    return (
        <section className={styles.testimonials} id="testimonials">
            <span className={styles.sectionLabel}>Testimonials</span>
            <h2 className={styles.sectionTitle}>Trusted by Merchants Across Nigeria</h2>
            <p className={styles.sectionSubtitle}>
                Join over 1,400+ businesses already growing their revenue with SOLO.
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
