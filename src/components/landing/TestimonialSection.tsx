'use client';

import { Star } from 'lucide-react';
import styles from './landing.module.css';

const TESTIMONIALS = [
    {
        name: 'Amina Bello',
        biz: "Amina Fabrics, Kaduna",
        quote: "Managing my fabrics business on WhatsApp used to be exhausting. Now with SOLO, customers check out themselves and my inventory updates automatically. It has completely freed up my time!",
        color: '#00798C'
    },
    {
        name: 'Chidi Okafor',
        biz: "Okafor Electronics, Lagos",
        quote: "I was skeptical about setting up an online shop, but with SOLO I literally just sent pictures of my chargers and accessories to the AI on WhatsApp. In 2 minutes, my storefront was live and accepting bank transfers.",
        color: '#10b981'
    },
    {
        name: 'Tunde Adebayo',
        biz: "Alara Beauty, Abuja",
        quote: "The Paystack subaccount integration is incredible. Payments from my store checkout go directly to my business bank account automatically, and transaction charges are handled seamlessly. 10/10 platform.",
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
