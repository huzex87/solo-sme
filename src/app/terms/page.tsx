import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../privacy/privacy.module.css';

export const metadata: Metadata = {
    title: 'Terms of Service — SOLO SME',
    description: 'SOLO SME Terms of Service. Read our terms and conditions for using the SOLO platform.',
};

export default function TermsOfServicePage() {
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
                    <h1>Terms of Service</h1>
                    <p className={styles.legalDate}>Last updated: March 5, 2026</p>
                </div>

                <section className={styles.legalSection}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using SOLO SME (&quot;SOLO,&quot; &quot;the Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), including all
                        websites, mobile applications, and services operated by SOLO, you agree to be bound by these Terms of
                        Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use the Platform.
                    </p>
                    <p>
                        These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;Merchant,&quot; &quot;you,&quot; or &quot;your&quot;)
                        and SOLO SME, governed by the laws of the Federal Republic of Nigeria.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>2. Description of Service</h2>
                    <p>
                        SOLO provides a cloud-based business management platform that includes, but is not limited to:
                    </p>
                    <ul>
                        <li>Digital storefront creation and management</li>
                        <li>Point-of-Sale (POS) system for physical and online sales</li>
                        <li>Inventory management and tracking</li>
                        <li>AI-powered marketing and business intelligence tools</li>
                        <li>Payment processing (via Paystack integration)</li>
                        <li>Financial record-keeping and ledger management</li>
                        <li>Customer relationship management</li>
                    </ul>
                </section>

                <section className={styles.legalSection}>
                    <h2>3. Account Registration</h2>
                    <p>To use certain features of the Platform, you must register for an account. You agree to:</p>
                    <ul>
                        <li>Provide accurate, current, and complete information during registration</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security and confidentiality of your login credentials</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                    <p>You must be at least 18 years of age to create an account and use the Platform.</p>
                </section>

                <section className={styles.legalSection}>
                    <h2>4. Subscription Plans and Billing</h2>
                    <h3>4.1 Plan Tiers</h3>
                    <p>
                        SOLO offers multiple subscription tiers: Starter (Free), Growth, Business, and Enterprise. Each tier
                        includes different features and limits as described on our Pricing page.
                    </p>
                    <h3>4.2 Payment</h3>
                    <ul>
                        <li>Paid subscriptions are billed monthly or annually in Nigerian Naira (₦)</li>
                        <li>All payments are processed securely through Paystack</li>
                        <li>Prices are subject to change with 30 days&apos; prior notice</li>
                        <li>No refunds for partial billing periods unless required by law</li>
                    </ul>
                    <h3>4.3 Cancellation</h3>
                    <p>
                        You may cancel your subscription at any time. Your access will continue until the end of your current
                        billing period. Downgrading to the Starter plan preserves your data but may limit available features.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>5. Acceptable Use</h2>
                    <p>You agree not to use the Platform to:</p>
                    <ul>
                        <li>Sell illegal, counterfeit, or prohibited goods or services under Nigerian law</li>
                        <li>Engage in fraud, money laundering, or other financial crimes</li>
                        <li>Distribute malware, spam, or unauthorized commercial communications</li>
                        <li>Interfere with or disrupt the Platform&apos;s infrastructure or security</li>
                        <li>Harvest or collect personal information of other users without consent</li>
                        <li>Violate any applicable laws, regulations, or third-party rights</li>
                        <li>Misrepresent your identity or business credentials</li>
                    </ul>
                    <p>
                        We reserve the right to suspend or terminate accounts that violate these terms, with or without prior notice.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>6. Intellectual Property</h2>
                    <h3>6.1 Our Property</h3>
                    <p>
                        The Platform, including its design, code, branding, trademarks, and all associated intellectual property,
                        is owned by SOLO SME. You may not copy, modify, distribute, or reverse-engineer any part of the Platform
                        without our express written permission.
                    </p>
                    <h3>6.2 Your Content</h3>
                    <p>
                        You retain ownership of all content you upload to the Platform (product images, descriptions, business data).
                        By uploading content, you grant SOLO a non-exclusive, worldwide license to host, display, and distribute
                        your content solely for the purpose of providing the Services to you.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>7. Payment Processing</h2>
                    <p>
                        Payment processing services are provided by Paystack and are subject to the
                        Paystack Terms of Service and Privacy Policy. By using SOLO&apos;s payment features, you agree to be bound
                        by Paystack&apos;s terms. SOLO is not responsible for any errors or failures in Paystack&apos;s services.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>8. Data Protection</h2>
                    <p>
                        Your use of the Platform is also governed by our <Link href="/privacy" style={{ color: 'var(--accent-primary)' }}>Privacy Policy</Link>,
                        which details how we collect, use, and protect your data in compliance with the Nigeria Data Protection
                        Regulation (NDPR) and the Nigeria Data Protection Act (NDPA).
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>9. Disclaimer of Warranties</h2>
                    <p>
                        THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                        OR IMPLIED. SOLO DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY
                        SECURE. YOUR USE OF THE PLATFORM IS AT YOUR OWN RISK.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>10. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by Nigerian law, SOLO shall not be liable for any indirect, incidental,
                        special, consequential, or punitive damages, including loss of profits, revenue, data, or business
                        opportunities, arising from your use of the Platform. Our total liability for any claim shall not exceed
                        the amount you paid to us in the 12 months preceding the claim.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>11. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless SOLO and its officers, directors, employees, and
                        agents from any claims, damages, losses, or expenses arising from: (a) your use of the Platform;
                        (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) the content
                        you upload to the Platform.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>12. Governing Law and Dispute Resolution</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of
                        Nigeria. Any disputes arising from these Terms shall first be subject to good-faith negotiation between
                        the parties. If negotiation fails, disputes shall be resolved through arbitration in Katsina, Nigeria,
                        in accordance with the Arbitration and Mediation Act of Nigeria.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>13. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will provide notice of material changes
                        through the Platform or via email. Your continued use of the Platform after changes take effect
                        constitutes acceptance of the modified Terms.
                    </p>
                </section>

                <section className={styles.legalSection}>
                    <h2>14. Contact Information</h2>
                    <p>For questions about these Terms of Service, please contact us:</p>
                    <ul>
                        <li><strong>Email:</strong> <a href="mailto:support@solosme.com">support@solosme.com</a></li>
                        <li><strong>WhatsApp:</strong> <a href="https://wa.me/2348039254849">+234 803 925 4849</a></li>
                        <li><strong>Address:</strong> Katsina, Katsina State, Nigeria</li>
                    </ul>
                </section>

                <div className={styles.legalFooterLinks}>
                    <Link href="/privacy">Privacy Policy →</Link>
                    <Link href="/">← Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
