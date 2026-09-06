import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import type { Metadata } from 'next';
import { COMPANY, MAIL } from '@/lib/company';

export const metadata: Metadata = {
    title: 'Terms of Service — SOLO SME',
    description: 'SOLO SME Terms of Service. Read our terms and conditions for using the SOLO platform.',
};

export default function TermsPage() {
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 text-slate-950 tracking-tight font-display">Terms of Service</h1>
                        <p className="text-slate-500 mt-4 font-medium italic">Last updated: 6 September 2026</p>
                    </div>

                    <div className="prose prose-slate prose-teal lg:prose-lg max-w-none space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the SOLO platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;Merchant,&quot; &quot;you,&quot; or &quot;your&quot;)
                                and <strong>{COMPANY.legalName}</strong>{COMPANY.rcNumber ? ` (${COMPANY.rcNumber})` : ''}, the company that
                                owns and operates {COMPANY.product}, registered in Nigeria with its registered office at{' '}
                                {COMPANY.address}. These Terms are governed by the laws of the Federal Republic of Nigeria.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">2. Description of Service</h2>
                            <p>
                                SOLO provides an AI-powered suite of business tools including digital storefronts, POS systems, inventory management, and automated WhatsApp commerce features.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">3. Merchant Responsibilities</h2>
                            <p>
                                You are responsible for all activity that occurs under your account. You must provide accurate business information and comply with all applicable local and international laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">4. WhatsApp Usage Guidelines</h2>
                            <p>
                                Merchants using our WhatsApp integration must adhere to the <strong>Meta Business Message Policy</strong>. We are not responsible for account suspensions resulting from spam or violations of Meta&apos;s policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">5. Payments and Fees</h2>
                            <p>
                                Payments on the platform are processed by licensed third-party payment providers. Merchant
                                payouts, settlement timing and any payment charges are governed by those providers&apos; terms in
                                addition to these Terms.
                            </p>
                            <p>
                                SOLO&apos;s own fees are transparent and structured on a <strong>non-interest, Shariah-compatible
                                basis</strong>. We do not charge or earn interest (riba), and any financing features offered
                                through the platform use non-interest structures. Applicable fees are shown before you incur them
                                and may be updated on notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">6. Orders, Refunds and Returns</h2>
                            <p>
                                Storefronts are operated by independent merchants. The contract of sale for any order is between
                                the customer and the merchant. Each merchant is responsible for fulfilling orders and for its own
                                refund, return, cancellation and delivery policies, which should be made available to customers.
                            </p>
                            <p>
                                SOLO provides the technology that facilitates the transaction and is not a party to the sale.
                                Payment disputes are handled in line with the relevant payment provider&apos;s chargeback and
                                dispute processes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">7. Acceptable Use</h2>
                            <p>You agree not to use the platform to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Sell goods or services that are illegal under Nigerian law or infringe third-party rights.</li>
                                <li>Send spam or messages that violate Meta&apos;s or any provider&apos;s policies.</li>
                                <li>Attempt to breach, probe or disrupt the security or integrity of the platform.</li>
                                <li>Misrepresent your identity, your business, or the goods and services you offer.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">8. Intellectual Property</h2>
                            <p>
                                The SOLO platform, software, and branding are owned by {COMPANY.legalName} and its licensors. You
                                retain ownership of the content and data you upload; by using the platform you grant us the limited
                                licence needed to host and display that content to operate your storefront.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">9. Suspension and Termination</h2>
                            <p>
                                You may stop using the platform at any time. We may suspend or terminate access where you breach
                                these Terms, where required by law, or to protect the platform, its users or third parties. On
                                termination, your right to use the platform ends; provisions that by their nature should survive
                                (such as fees due, liability and governing law) will continue to apply.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">10. Disclaimers</h2>
                            <p>
                                The platform is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
                                kind, whether express or implied, to the fullest extent permitted by law. We do not warrant that
                                the service will be uninterrupted or error-free.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">11. Limitation of Liability</h2>
                            <p>
                                To the fullest extent permitted by law, {COMPANY.legalName} is not liable for any indirect,
                                incidental, special or consequential damages, or loss of profits, revenue, data or goodwill,
                                arising from your use of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">12. Governing Law and Disputes</h2>
                            <p>
                                These Terms are governed by the laws of the Federal Republic of Nigeria. The parties will seek to
                                resolve any dispute amicably; failing that, disputes are subject to the jurisdiction of the
                                Nigerian courts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">13. Changes and Contact</h2>
                            <p>
                                We may update these Terms from time to time; material changes will be posted here with a new
                                &quot;Last updated&quot; date. For questions about these Terms, contact us:
                                <br />
                                <a href={`mailto:${MAIL.legal}`} className="text-teal-600 font-bold">{MAIL.legal}</a>
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
