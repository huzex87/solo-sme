import { BrandLogo } from "@/components/shared/BrandLogo";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — SOLO SME',
    description: 'SOLO SME Privacy Policy. Learn how we collect, use, and protect your personal data in compliance with NDPR.',
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
                        <p className="text-slate-500 mt-4 font-medium italic">Last updated: March 12, 2026</p>
                    </div>

                    <div className="prose prose-slate prose-teal lg:prose-lg max-w-none space-y-8 text-slate-600 leading-relaxed font-medium">
                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to SOLO ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
                            </p>
                            <p>
                                This policy complies with the Nigeria Data Protection Regulation (NDPR) 2019 and the Nigeria Data
                                Protection Act (NDPA) 2023. By using our Services, you consent to the data practices described in this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">2. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Business profile information (name, logo, contact details).</li>
                                <li>Merchant data (inventory, sales records, financial ledgers).</li>
                                <li>Customer data provided during transactions (phone numbers, names).</li>
                                <li>Integration data (WhatsApp Business account details).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">3. Use of Data</h2>
                            <p>
                                We use the collected data to provide, maintain, and improve our services, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Processing transactions and maintaining your business ledger.</li>
                                <li>Generating AI-powered business insights via Gemini AI.</li>
                                <li>Facilitating automated WhatsApp communications.</li>
                                <li>Developing new features and internal analytics.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">4. Data Security</h2>
                            <p>
                                We implement industry-standard security measures, including Row-Level Security (RLS) via Supabase and AES encryption for sensitive integration tokens.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-950 mb-4">5. Contact Us</h2>
                            <p>
                                If you have questions about this policy, please contact our legal team at:
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
