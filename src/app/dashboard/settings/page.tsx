"use client";

import { useState } from "react";
import {
    Globe,
    Store,
    Bell,
    Shield,
    ChevronRight,
    Check,
    Copy,
    ExternalLink,
    MessageCircle,
    Zap,
    Lock,
} from "lucide-react";

// ─── Section types ────────────────────────────────────────────────────────────
type Section = "store" | "domain" | "whatsapp" | "notifications" | "account";

const SECTIONS = [
    { id: "store" as Section, label: "Store Profile", icon: Store },
    { id: "domain" as Section, label: "Custom Domain", icon: Globe },
    { id: "whatsapp" as Section, label: "WhatsApp Connection", icon: MessageCircle },
    { id: "notifications" as Section, label: "Notifications", icon: Bell },
    { id: "account" as Section, label: "Account & Security", icon: Shield },
];

// ─── Input component ──────────────────────────────────────────────────────────
function Field({ label, placeholder, value, hint, disabled }: {
    label: string;
    placeholder?: string;
    value?: string;
    hint?: string;
    disabled?: boolean;
}) {
    const [val, setVal] = useState(value ?? "");
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#072435]">{label}</label>
            <input
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all
          ${disabled
                        ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-200 text-[#072435] focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10"
                    }
          placeholder-gray-300`}
            />
            {hint && <p className="text-gray-400 text-[11px]">{hint}</p>}
        </div>
    );
}

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveButton() {
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    return (
        <button
            onClick={handleSave}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${saved
                    ? "bg-emerald-500 text-white"
                    : "bg-[#409EF2] text-white hover:bg-[#3089d8] shadow-sm shadow-[#409EF2]/30"
                }`}
        >
            {saved ? <><Check size={14} /> Saved</> : "Save Changes"}
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<Section>("store");
    const [copied, setCopied] = useState(false);

    const copySubdomain = () => {
        navigator.clipboard.writeText("mystore.solo-sme.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div>
                <h2 className="text-[#072435] text-xl font-bold">Settings</h2>
                <p className="text-gray-400 text-sm mt-0.5">Manage your store configuration</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">

                {/* ── Sidebar nav ── */}
                <nav className="lg:w-52 shrink-0">
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {SECTIONS.map((s, i) => {
                            const Icon = s.icon;
                            const active = activeSection === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm
                    ${i !== SECTIONS.length - 1 ? "border-b border-gray-50" : ""}
                    ${active
                                            ? "bg-[#409EF2]/8 text-[#409EF2] font-semibold"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-[#072435]"
                                        }`}
                                >
                                    <Icon size={15} className={active ? "text-[#409EF2]" : "text-gray-400"} />
                                    <span className="flex-1">{s.label}</span>
                                    {active && <ChevronRight size={13} />}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* ── Content panel ── */}
                <div className="flex-1 min-w-0">

                    {/* Store Profile */}
                    {activeSection === "store" && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-[#072435] font-semibold text-[15px]">Store Profile</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Your public-facing business information</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Business Name" placeholder="e.g. Fatima's Fashion House" />
                                <Field label="Business Category" placeholder="e.g. Fashion & Apparel" />
                                <Field label="Phone Number" placeholder="+234 800 000 0000" />
                                <Field label="Email Address" placeholder="hello@mybusiness.com" />
                            </div>
                            <Field label="Business Description" placeholder="Tell customers what you do and what makes you unique..." />
                            <div className="pt-2 border-t border-gray-50 flex justify-end">
                                <SaveButton />
                            </div>
                        </div>
                    )}

                    {/* Custom Domain */}
                    {activeSection === "domain" && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-[#072435] font-semibold text-[15px]">Custom Domain</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Connect your own domain or use your free SOLO subdomain</p>
                            </div>

                            {/* Free subdomain */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-[#072435]">Your Free Subdomain</p>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                    <Globe size={14} className="text-[#409EF2] shrink-0" />
                                    <span className="text-[#072435] text-sm font-medium flex-1">mystore.solo-sme.com</span>
                                    <button
                                        onClick={copySubdomain}
                                        className="flex items-center gap-1 text-xs text-[#409EF2] hover:text-[#3089d8] font-medium"
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                    <a
                                        href="#"
                                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                                    >
                                        <ExternalLink size={12} />
                                        Open
                                    </a>
                                </div>
                            </div>

                            {/* Custom domain */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-[#072435]">Connect Custom Domain</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. www.myfashionhouse.com"
                                        className="flex-1 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-300 text-[#072435]"
                                    />
                                    <button className="px-4 py-2.5 bg-[#409EF2] text-white text-sm font-semibold rounded-xl hover:bg-[#3089d8] transition-colors">
                                        Connect
                                    </button>
                                </div>
                                <p className="text-gray-400 text-[11px]">
                                    Point your domain&apos;s CNAME to <span className="font-mono text-gray-500">cname.solo-sme.com</span>, then enter it here.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* WhatsApp Connection */}
                    {activeSection === "whatsapp" && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-[#072435] font-semibold text-[15px]">WhatsApp Connection</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Link your business WhatsApp number to SOLO AI</p>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-[#072435] to-[#0a3352] rounded-xl p-5 text-white">
                                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center mb-4">
                                    <MessageCircle size={18} className="text-[#25D366]" />
                                </div>
                                <p className="font-semibold text-sm mb-1">Connect WhatsApp Business</p>
                                <p className="text-white/50 text-xs leading-relaxed mb-5">
                                    Once connected, your SOLO AI assistant will handle customer chats, take orders, send receipts, and answer product enquiries automatically — 24/7.
                                </p>
                                <button className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#22c55e] transition-colors">
                                    <Zap size={14} fill="white" />
                                    Connect WhatsApp
                                </button>
                            </div>

                            <Field
                                label="WhatsApp Business Number"
                                placeholder="+234 800 000 0000"
                                hint="Enter the number registered on your WhatsApp Business account"
                            />
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === "notifications" && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-[#072435] font-semibold text-[15px]">Notifications</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Choose what alerts you receive</p>
                            </div>
                            {[
                                { label: "New order received", sub: "Get notified when a customer places an order", enabled: true },
                                { label: "WhatsApp message", sub: "Alert when your AI receives a new message", enabled: true },
                                { label: "Low stock warning", sub: "Alert when a product stock falls below 5 units", enabled: false },
                                { label: "Weekly report", sub: "Receive a weekly summary of your store performance", enabled: false },
                            ].map((n) => (
                                <div key={n.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-[#072435] text-sm font-medium">{n.label}</p>
                                        <p className="text-gray-400 text-xs mt-0.5">{n.sub}</p>
                                    </div>
                                    <button
                                        className={`w-10 h-6 rounded-full transition-colors relative ${n.enabled ? "bg-[#409EF2]" : "bg-gray-200"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${n.enabled ? "right-0.5" : "left-0.5"
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Account & Security */}
                    {activeSection === "account" && (
                        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
                            <div>
                                <h3 className="text-[#072435] font-semibold text-[15px]">Account & Security</h3>
                                <p className="text-gray-400 text-xs mt-0.5">Manage your login details and security</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" placeholder="Your full name" />
                                <Field label="Email Address" placeholder="your@email.com" />
                            </div>
                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-xs font-semibold text-[#072435] mb-3">Change Password</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Current Password" placeholder="••••••••" />
                                    <Field label="New Password" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-50 flex justify-end">
                                <SaveButton />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
