'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './landing.module.css';

const FAQS = [
    {
        q: 'Is SOLO really free to start?',
        a: 'Yes. The Starter plan is free forever with no credit card required. You get a branded storefront, 50 products, WhatsApp receipts, and basic analytics at zero cost.',
    },
    {
        q: 'Can I use my own domain name?',
        a: 'Yes — on the Growth plan and above. You can connect your existing domain or purchase a new one through SOLO. The Starter plan uses a SOLO subdomain (yourstore.solo.ng).',
    },
    {
        q: 'What payment methods can my customers use?',
        a: 'SOLO supports all major payment methods in Nigeria via Paystack: debit cards (Visa, Mastercard, Verve), bank transfers, and USSD. Customers can pay directly from your storefront.',
    },
    {
        q: 'Is my business data safe?',
        a: 'Absolutely. SOLO uses 256-bit SSL encryption and bank-level security powered by Supabase. Your data is yours — we never sell it or share it with third parties. SOLO is NDPR compliant.',
    },
    {
        q: 'Can I manage both my physical store and online store?',
        a: "Yes — this is one of SOLO's biggest advantages. The SOLO POS works with your physical store and syncs inventory in real-time with your online storefront. One platform, both channels.",
    },
    {
        q: "What happens if I reach my plan's product limit?",
        a: "You'll receive an in-app notification when you're approaching your limit. You can upgrade to a higher plan at any time with no disruption to your store or customer data.",
    },
    {
        q: 'Does SOLO work for my type of business?',
        a: 'SOLO is designed for Nigerian and African SMEs across retail, fashion, food & beverage, agribusiness, beauty, electronics, and more. If you sell a product, SOLO works for you.',
    },
    {
        q: 'How do I get support if I have a problem?',
        a: 'Support is available via WhatsApp (fastest response), email, and our in-app help center. Growth and Enterprise merchants receive priority support with guaranteed response times.',
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={styles.faqSection} id="faq">
            <span className={styles.sectionLabel}>FAQ</span>
            <h2 className={styles.sectionTitle}>
                Got Questions? We&apos;ve Got Answers
            </h2>
            <p className={styles.sectionSubtitle}>
                Everything you need to know about SOLO before getting started.
            </p>

            <div className={styles.faqGrid}>
                {FAQS.map((faq, index) => (
                    <div
                        key={index}
                        className={`${styles.faqItem} ${openIndex === index ? styles.faqItemOpen : ''}`}
                    >
                        <button
                            className={styles.faqQuestion}
                            onClick={() => toggle(index)}
                            aria-expanded={openIndex === index}
                        >
                            <span>{faq.q}</span>
                            <ChevronDown
                                size={20}
                                className={`${styles.faqChevron} ${openIndex === index ? styles.faqChevronOpen : ''}`}
                            />
                        </button>
                        <div
                            className={`${styles.faqAnswer} ${openIndex === index ? styles.faqAnswerOpen : ''}`}
                        >
                            <p>{faq.a}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
