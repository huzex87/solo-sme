import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import type { Metadata } from 'next';
import { COMPANY, MAIL } from '@/lib/company';

export const metadata: Metadata = {
    title: 'Privacy Policy — SOLO SME',
    description: 'How SOLO SME collects, uses, shares and protects personal data, in compliance with the Nigeria Data Protection Act (NDPA) 2023.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100">
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/">
                        <BrandLogo size={32} />
                    </Link>
                    <Link href="/" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-24 px-6">
                <article className="max-w-3xl mx-auto bg-white rounded-[40px] p-8 md:p-16 shadow-premium border border-slate-100">
                    <div className="mb-12">
                        <span className="text-teal-600 font-bold tracking-widest text-xs uppercase bg-teal-50 px-3 py-1 rounded-full">Legal</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 text-slate-950 tracking-tight font-display">Privacy Policy</h1>
                        <p className="text-slate-500 mt-4 font-medium italic">Last updated: 6 September 2026</p>
                    </div>

                    <div className="prose prose-slate prose-teal lg:prose-lg max-w-none space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">1. Who we are</h2>
                            <p>
                                {COMPANY.product} (&quot;SOLO&quot;, &quot;we&quot;, &quot;our&quot; or &quot;us&quot;) is operated by{' '}
                                <strong>{COMPANY.legalName}</strong>{COMPANY.rcNumber ? ` (${COMPANY.rcNumber})` : ''}, a company
                                incorporated in Nigeria with its registered office at {COMPANY.address}. We are the{' '}
                                <strong>data controller</strong> for the personal data described in this policy and can be reached at{' '}
                                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
                            </p>
                            <p>
                                This policy explains how we collect, use, share and protect personal data when you use the SOLO
                                platform and storefronts. It is issued in compliance with the Nigeria Data Protection Act (NDPA)
                                2023 and the Nigeria Data Protection Regulation (NDPR) 2019.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">2. Controllers, merchants and customers</h2>
                            <p>
                                SOLO serves two groups of people, and our role differs for each:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Merchants</strong> — businesses that use SOLO to run a storefront. For merchant
                                    account data we are the data controller.
                                </li>
                                <li>
                                    <strong>Customers</strong> — people who buy from a merchant&apos;s storefront. For customer
                                    order data, the merchant is the controller of their own customer relationships and SOLO acts
                                    as a data processor on the merchant&apos;s behalf, while also acting as controller for the
                                    limited data we need to run the platform (fraud prevention, security, legal compliance).
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">3. Personal data we collect</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Account &amp; profile:</strong> name, email, phone number, business name, logo and address.</li>
                                <li><strong>Order &amp; customer data:</strong> customer name, phone number, delivery address and order details.</li>
                                <li><strong>Transaction data:</strong> amounts, references and status. Card and bank details are handled solely by our licensed payment partners — SOLO never stores full card numbers.</li>
                                <li><strong>Business records:</strong> products, inventory, sales and ledger entries you create.</li>
                                <li><strong>Integration data:</strong> WhatsApp Business account identifiers and message logs you connect.</li>
                                <li><strong>Technical data:</strong> IP address, device and browser information, and cookies needed to keep you signed in and secure the service.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">4. Why we process your data (lawful basis)</h2>
                            <p>Under the NDPA 2023 we rely on the following lawful bases:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Performance of a contract</strong> — to create your account, run your storefront, process orders and provide support.</li>
                                <li><strong>Consent</strong> — for optional features such as marketing messages and, where required, automated WhatsApp communications. You may withdraw consent at any time.</li>
                                <li><strong>Legal obligation</strong> — to meet tax, anti-fraud, and record-keeping duties.</li>
                                <li><strong>Legitimate interests</strong> — to secure the platform, prevent abuse, and improve our services, balanced against your rights.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">5. How we use your data</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide, maintain and secure the platform and your storefront.</li>
                                <li>Process orders and payments and maintain your business ledger.</li>
                                <li>Send transactional messages (receipts, order updates) and, with consent, notifications.</li>
                                <li>Generate business insights using AI, on your own data and at your request.</li>
                                <li>Detect, prevent and investigate fraud, abuse and security incidents.</li>
                                <li>Comply with legal obligations and enforce our Terms.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">6. Who we share data with</h2>
                            <p>We share personal data only with service providers that help us run SOLO, under contract and only as needed:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Payment processors</strong> (e.g. Paystack, Flutterwave) — to take payment and settle merchants.</li>
                                <li><strong>Infrastructure &amp; database</strong> (e.g. Supabase, Vercel) — to host the application and store data securely.</li>
                                <li><strong>Messaging</strong> (Meta / WhatsApp Business, and our email provider) — to deliver the communications you use.</li>
                                <li><strong>AI processing</strong> (Google Gemini) — to generate insights on your data at your request.</li>
                            </ul>
                            <p>We do not sell your personal data. Merchants receive the customer data relating to their own orders.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">7. International transfers</h2>
                            <p>
                                Some of our service providers store or process data outside Nigeria. Where personal data is
                                transferred abroad, we take steps required by the NDPA 2023 to ensure an adequate level of
                                protection, including contractual safeguards with those providers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">8. Data retention</h2>
                            <p>
                                We keep personal data only for as long as needed for the purposes above and to meet legal,
                                tax and accounting obligations. Business and transaction records are typically retained for the
                                period required by Nigerian law; account data is deleted or anonymised on request once we no
                                longer need it, subject to those obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">9. Your rights</h2>
                            <p>Under the NDPA 2023 you have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access the personal data we hold about you.</li>
                                <li>Correct data that is inaccurate or incomplete.</li>
                                <li>Request deletion of your data where the law allows.</li>
                                <li>Restrict or object to certain processing.</li>
                                <li>Receive your data in a portable format.</li>
                                <li>Withdraw consent at any time, without affecting prior processing.</li>
                                <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC).</li>
                            </ul>
                            <p>
                                To exercise any right, email{' '}
                                <a href={`mailto:${MAIL.legal}`} className="text-teal-600 font-bold">{MAIL.legal}</a>. We respond
                                within the timeframes set by the NDPA.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">10. Security</h2>
                            <p>
                                We apply appropriate technical and organisational measures, including row-level access controls,
                                encryption of sensitive credentials in transit and at rest, restricted access to production
                                systems, and payment handling delegated to licensed processors. No system is perfectly secure,
                                but we work to protect your data and will notify you and the NDPC of a data breach where the law
                                requires.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">11. Cookies</h2>
                            <p>
                                We use strictly necessary cookies to keep you signed in and to secure the service, and limited
                                analytics to understand and improve usage. You can control cookies through your browser settings;
                                disabling necessary cookies may prevent you from signing in.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">12. Children</h2>
                            <p>
                                SOLO is intended for businesses and adults. We do not knowingly collect personal data from
                                children. If you believe a child has provided us data, contact us and we will delete it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">13. Changes to this policy</h2>
                            <p>
                                We may update this policy from time to time. Material changes will be posted here with a new
                                &quot;Last updated&quot; date, and where appropriate we will notify you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">14. Contact us</h2>
                            <p>
                                Data-protection enquiries: <a href={`mailto:${MAIL.legal}`} className="text-teal-600 font-bold">{MAIL.legal}</a>
                                <br />
                                General enquiries: <a href={`mailto:${COMPANY.email}`} className="text-teal-600 font-bold">{COMPANY.email}</a>
                                <br />
                                {COMPANY.legalName}{COMPANY.rcNumber ? `, ${COMPANY.rcNumber}` : ''} — {COMPANY.address}.
                            </p>
                        </section>
                    </div>
                </article>
            </main>
        </div>
    );
}
