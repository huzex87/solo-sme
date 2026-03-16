"use client";

import {
    HelpCircle,
    MessageCircle,
    BookOpen,
    Zap,
    Shield,
    Truck,
    CreditCard,
    ExternalLink,
    Search,
    ArrowRight,
    Sparkles,
    LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = [
    {
        title: "Getting Started",
        description: "Master the basics of setting up your store in under 2 minutes.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-50",
        links: ["Quick Start Guide", "Branding Your Store", "Adding Your First Product"]
    },
    {
        title: "Payments & Payouts",
        description: "Everything you need to know about getting paid securely.",
        icon: CreditCard,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        links: ["Setting up Paystack", "Flutterwave Integration", "Payout Schedules"]
    },
    {
        title: "Logistics & Delivery",
        description: "Coordinate couriers and set delivery fees for your customers.",
        icon: Truck,
        color: "text-blue-500",
        bg: "bg-blue-50",
        links: ["Delivery Zones", "Flat-rate Fees", "Order Fulfillment"]
    },
    {
        title: "Account & Security",
        description: "Keep your data locked down and your staff roles configured.",
        icon: Shield,
        color: "text-purple-500",
        bg: "bg-purple-50",
        links: ["Staff Permissions", "Changing Password", "Two-Factor Auth"]
    }
];

export default function HelpPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 sm:px-6">
            {/* Premium Hero Section */}
            <div className="relative overflow-hidden rounded-[3rem] bg-ink p-12 text-white">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold tracking-widest uppercase">
                        <LifeBuoy size={14} className="text-primary" />
                        Support Center
                    </div>
                    <h1 className="text-5xl font-black tracking-tight max-w-2xl">
                        How can we help you SCALE today?
                    </h1>
                    <div className="relative max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-white transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search guides, tutorials, and more..."
                            className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORIES.map((cat) => (
                    <div key={cat.title} className="group p-8 bg-white border border-slate-200 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20 transition-all duration-500">
                        <div className="flex items-start gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500", cat.bg, cat.color)}>
                                <cat.icon size={28} />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{cat.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{cat.description}</p>
                                </div>
                                <ul className="space-y-2">
                                    {cat.links.map(link => (
                                        <li key={link}>
                                            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                                                <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                {link}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Assistant Callout */}
            <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={12} />
                        AI Enabled Support
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Meet Amina, your growth partner</h2>
                    <p className="text-slate-600 text-sm font-medium max-w-md">
                        Instead of searching, just ask Amina. She can help you configure your store, analyze sales, and even write marketing copies directly via WhatsApp.
                    </p>
                </div>
                <Link
                    href="/dashboard/whatsapp"
                    className="px-8 py-4 bg-ink text-white rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all shrink-0"
                >
                    <MessageCircle size={20} className="text-emerald-400" />
                    Chat with Amina
                </Link>
            </div>

            {/* Still need help? */}
            <div className="text-center space-y-4 pt-10 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Still Have Questions?</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                        Contact Support <ExternalLink size={14} />
                    </button>
                    <div className="w-1 h-1 rounded-full bg-slate-300 self-center" />
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                        Developer Docs <ExternalLink size={14} />
                    </button>
                    <div className="w-1 h-1 rounded-full bg-slate-300 self-center" />
                    <button className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                        System Status <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
