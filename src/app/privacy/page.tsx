import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './privacy.module.css';

export const metadata: Metadata = {
    title: 'Privacy Policy — SOLO SME',
    description: 'SOLO SME Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with NDPR.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.legalPage}>
            <nav className={styles.legalNav}>
                <Link href="/" className={styles.legalBrand}>
                    <span className="gradient-text" style={{ fontWeight: 800, letterSpacing: '4px', fontSize: '1.25rem' }}>SOLO</span>
                </Link>
                <Link href="/" className="btn btn-ghost btn-sm">← Back to Home</Link>
            </nav>

            <main className={styles.legalContent}>
                <div className={styles.legalHeader}>
                    <span className={styles.legalLabel}>Legal</span>
                    <h1>Privacy Policy</h1>
                    <p className={styles.legalDate}>Last updated: March 5, 2026</p>
                </div>

                <section className={styles.legalSection}>
                    <h2>1. Introduction</h2>
                    <p>
                        SOLO SME (&quot;SOLO,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy and security
                        of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
                        your information when you use our platform, website, and services (collectively, the &quot;Services&quot;).
                    </p>
                    <p>
                        This policy complies with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data
                        Protection Act (NDPA) 2023. By using our Services, you consent to the data practices described in this policy.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>2. Information We Collect</h2>
                    <h3>2.1 Information You Provide</h3>
                    <ul>
                        <li><strong>Account Information:</strong> Name, email address, phone number, business name, and business category when you register.</li>
                        <li><strong>Business Data:</strong> Product listings, inventory data, pricing information, and storefront customization preferences.</li>
                        <li><strong>Financial Information:</strong> Transaction records, sales data, and ledger entries processed through SOLO. Payment card details are processed and stored by Paystack — we do not store your card numbers.</li>
                        <li><strong>Communications:</strong> Messages sent through our platform, support requests, and feedback.</li>
                    </ul>
                    <h3>2.2 Information Collected Automatically</h3>
                    <ul>
                        <li><strong>Usage Data:</strong> Pages visited, features used, interaction patterns, and session duration.</li>
                        <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
                        <li><strong>Location Data:</strong> Approximate location based on IP address (city/state level only).</li>
                        <li><strong>Cookies:</strong> Essential and analytics cookies as described in Section 7.</li>
                    </ul>
                </section>

                <section className={styles.legalSection}>
                    <h2>3. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our Services</li>
                        <li>Process transactions and send related information</li>
                        <li>Personalize your experience and provide AI-powered features</li>
                        <li>Send you updates, marketing communications, and promotional materials (with your consent)</li>
                        <li>Respond to your comments, questions, and support requests</li>
                        <li>Monitor and analyze usage trends to improve our platform</li>
                        <li>Detect, prevent, and address technical issues and security threats</li>
                        <li>Comply with legal obligations under Nigerian law</li>
                    </ul>
                </section>

                <section className={styles.legalSection}>
                    <h2>4. Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal data. We may share information with:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> Paystack (payment processing), Supabase (data hosting), Google (AI services) — each bound by data protection agreements.</li>
                        <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process under Nigerian jurisdiction.</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to affected users.</li>
                    </ul>
                </section>

                <section className={styles.legalSection}>
                    <h2>5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures including 256-bit SSL/TLS encryption, secure data
                        hosting with Supabase (SOC 2 Type II certified), role-based access controls, and regular security audits.
                        However, no method of electronic transmission or storage is 100% secure.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>6. Your Rights Under NDPR</h2>
                    <p>Under the Nigeria Data Protection Regulation, you have the right to:</p>
                    <ul>
                        <li>Access the personal data we hold about you</li>
                        <li>Rectify inaccurate or incomplete personal data</li>
                        <li>Request deletion of your personal data</li>
                        <li>Object to or restrict processing of your personal data</li>
                        <li>Data portability — receive your data in a structured, commonly used format</li>
                        <li>Withdraw consent at any time for consent-based processing</li>
                    </ul>
                    <p>
                        To exercise any of these rights, contact us at <a href="mailto:support@solosme.com">support@solosme.com</a> or
                        via WhatsApp at <a href="https://wa.me/2348039254849">+234 803 925 4849</a>.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>7. Cookies</h2>
                    <p>
                        We use essential cookies to ensure our platform functions correctly and analytics cookies (with your consent)
                        to understand usage patterns. You can manage cookie preferences through the consent banner shown on your first visit.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>8. Data Retention</h2>
                    <p>
                        We retain your personal data for as long as your account is active or as needed to provide you Services.
                        Upon account deletion, we will delete or anonymize your data within 90 days, except where retention is
                        required by law (e.g., financial records as required by Nigerian tax regulations).
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>9. Children&apos;s Privacy</h2>
                    <p>
                        Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal
                        information from children. If we become aware that a child under 18 has provided us with personal data,
                        we will take steps to delete such information.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any material changes by
                        posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use
                        of the Services after any changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>11. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us:</p>
                    <ul>
                        <li><strong>Email:</strong> <a href="mailto:support@solosme.com">support@solosme.com</a></li>
                        <li><strong>WhatsApp:</strong> <a href="https://wa.me/2348039254849">+234 803 925 4849</a></li>
                        <li><strong>Address:</strong> Katsina, Katsina State, Nigeria</li>
                    </ul>
                </section>

                <div className={styles.legalFooterLinks}>
                    <Link href="/terms">Terms of Service →</Link>
                    <Link href="/">← Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
