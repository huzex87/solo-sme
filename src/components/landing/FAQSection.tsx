'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './landing.module.css';

const FAQS = [
    {
        q: 'Is SOLO really free to start?',
        a: 'Yes. During our Closed Beta phase, the Starter plan is 100% free with no hidden charges. You get a professional .solo.ng domain, unlimited product uploads, and your own AI Sales Assistant at zero cost.',
    },
    {
        q: 'Can I use my own custom domain?',
        a: 'Every SOLO store comes with a free professional subdomain (e.g., brandname.solosme.ng). Support for custom domains (e.g., .com, .ng) is mapped directly for our Growth plan users.',
    },
    {
        q: 'How do customers pay me?',
        a: 'SOLO is integrated with Paystack, Nigeria&apos;s leading payment gateway. Your customers can pay via Bank Transfer, Debit Card, or USSD directly on your store. Funds are settled to your bank account automatically.',
    },
    {
        q: 'Is my business data secure?',
        a: 'We take security seriously. SOLO is built on enterprise-grade infrastructure by Supabase with 256-bit encryption. We are NDPR compliant and ensure your customer data is safe and private.',
    },
    {
        q: 'Do I need to download an app?',
        a: 'No. SOLO is accessible through any web browser and is fully managed via WhatsApp. You can add products, update prices, and view sales reports just by chatting with our AI assistant.',
    },
    {
        q: 'Does it work for my type of business?',
        a: 'Whether you sell fashion, electronics, food, or beauty products, SOLO is built for you. If you traditionally sell on Instagram or WhatsApp, SOLO will professionalize your business instantly.',
    },
    {
        q: 'How do I get support?',
        a: 'Our official WhatsApp support line is the fastest way to get help. We also provide email support and a detailed help center for common questions.',
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
