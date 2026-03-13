import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import type { Metadata } from 'next';

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
                        <p className="text-slate-500 mt-4 font-medium italic">Last updated: March 12, 2026</p>
                    </div>

                    <div className="prose prose-slate prose-teal lg:prose-lg max-w-none space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the SOLO platform, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                            </p>
                            <p>
                                These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;Merchant,&quot; &quot;you,&quot; or &quot;your&quot;)
                                and SOLO SME, governed by the laws of the Federal Republic of Nigeria.
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
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">5. Limitation of Liability</h2>
                            <p>
                                SOLO is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">6. Contact Information</h2>
                            <p>
                                For questions about these Terms of Service, please contact us:
                                <br />
                                <strong className="text-teal-600">legal@solosme.com</strong>
                            </p>
                        </section>
                    </div>
                </article>
            </main>
        </div>
    );
}
