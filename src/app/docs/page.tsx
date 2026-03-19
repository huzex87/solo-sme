import Link from 'next/link';
import { BookOpen, MessageCircle, CreditCard, ShoppingBag, Truck, Shield, Zap, Mail } from 'lucide-react';

export const metadata = {
    title: 'Help Center | SOLO SME',
    description: 'Get help setting up and managing your SOLO store.',
};

const SECTIONS = [
    {
        title: 'Getting Started',
        icon: ShoppingBag,
        items: [
            { q: 'How do I create my store?', a: 'Sign up at solosme.ng, fill in your business details, and your store is live within minutes. You\'ll get a free subdomain like yourstore.solosme.ng.' },
            { q: 'How do I add products?', a: 'Go to Dashboard → Products → Add Product. Fill in the name, price, description, stock quantity, and upload images.' },
            { q: 'How do I customize my storefront?', a: 'Go to Dashboard → Settings → Branding to change colors, fonts, and logo. Use Settings → Storefront to update your hero text and SEO description.' },
        ]
    },
    {
        title: 'Payments',
        icon: CreditCard,
        items: [
            { q: 'Which payment providers are supported?', a: 'SOLO supports Paystack and Flutterwave. Go to Settings → Integrations to enter your API keys.' },
            { q: 'How do I test payments?', a: 'Use your Paystack/Flutterwave test keys (starting with pk_test_ or FLWPUBK_TEST). Process a test order on your storefront, then switch to live keys when ready.' },
            { q: 'When do I receive payouts?', a: 'Payouts are handled by your payment provider (Paystack/Flutterwave) according to their settlement schedule — typically T+1 for Paystack in Nigeria.' },
        ]
    },
    {
        title: 'Delivery',
        icon: Truck,
        items: [
            { q: 'How does delivery pricing work?', a: 'Set a base fee and per-km rate in Settings → Delivery. If you add a Google Maps API key, delivery fees are calculated automatically based on distance.' },
            { q: 'Can I offer free delivery?', a: 'Yes — set both the base fee and per-km fee to 0 in your delivery settings.' },
        ]
    },
    {
        title: 'WhatsApp & Messaging',
        icon: MessageCircle,
        items: [
            { q: 'Is WhatsApp already connected?', a: 'Yes — SOLO provides managed WhatsApp messaging out of the box. If you want to use your own business number, enter your Meta API credentials in Settings → Integrations.' },
            { q: 'How do customers reach me?', a: 'Customers can chat with your AI sales assistant on your storefront. Messages and orders are also sent to your connected WhatsApp number.' },
        ]
    },
    {
        title: 'Domains',
        icon: Zap,
        items: [
            { q: 'How do I get a custom domain?', a: 'Go to Settings → Domain → Custom Domain. Enter your domain, then add the DNS records shown to your domain registrar. SSL is automatic.' },
            { q: 'Can I change my subdomain?', a: 'Yes — click the edit button next to your store URL in Settings → Domain. Choose any available subdomain.' },
        ]
    },
    {
        title: 'Account & Security',
        icon: Shield,
        items: [
            { q: 'How do I add staff members?', a: 'Go to Settings → Team, enter their email and assign a role. They\'ll receive an invite link.' },
            { q: 'Is my data secure?', a: 'Yes — SOLO uses Supabase with Row Level Security, ensuring complete tenant isolation. All API keys are encrypted at rest.' },
        ]
    },
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="mb-10">
                    <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">← Back to SOLO</Link>
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={24} className="text-primary" />
                        <h1 className="text-2xl font-bold text-slate-900">Help Center</h1>
                    </div>
                    <p className="text-slate-500">Everything you need to set up and manage your SOLO store.</p>
                </div>

                <div className="space-y-10">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        return (
                            <div key={section.title}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon size={18} className="text-primary" />
                                    <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                                </div>
                                <div className="space-y-3">
                                    {section.items.map((item, i) => (
                                        <details key={i} className="group border border-slate-100 rounded-lg">
                                            <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors rounded-lg">
                                                {item.q}
                                                <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg">+</span>
                                            </summary>
                                            <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                                                {item.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <Mail size={20} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Still need help?</p>
                    <p className="text-xs text-slate-400 mt-1">Email us at <a href="mailto:hello@solosme.ng" className="text-primary hover:underline">hello@solosme.ng</a></p>
                </div>
            </div>
        </div>
    );
}
