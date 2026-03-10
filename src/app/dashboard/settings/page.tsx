"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────── */

type Section = "store" | "domain" | "whatsapp" | "notifications" | "security";

const SECTIONS = [
    { id: "store" as Section, label: "Store Profile", icon: Store },
    { id: "domain" as Section, label: "Custom Domain", icon: Globe },
    { id: "whatsapp" as Section, label: "WhatsApp Connection", icon: MessageCircle },
    { id: "notifications" as Section, label: "Notifications", icon: Bell },
    { id: "security" as Section, label: "Account & Security", icon: Shield },
];

/* ── Input ── */
function Field({ label, placeholder, hint, disabled }: {
    label: string; placeholder?: string; hint?: string; disabled?: boolean
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                className="input-field"
                style={{
                    fontSize: 13,
                    ...(disabled ? { background: "var(--surface)", color: "var(--ghost)", cursor: "not-allowed" } : {}),
                }}
            />
            {hint && <p style={{ fontSize: 11, color: "var(--ghost)", margin: 0 }}>{hint}</p>}
        </div>
    );
}

export default function SettingsPage() {
    const [section, setSection] = useState<Section>("store");
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
    const handleCopy = () => {
        navigator.clipboard.writeText("mystore.solo-sme.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-entrance" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── Header ── */}
            <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>Settings</h2>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>Manage your store configuration</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* ── Section nav ── */}
                <nav
                    className="card"
                    style={{
                        padding: 4,
                        borderRadius: "var(--rl)",
                        flexShrink: 0,
                        display: "flex",
                        gap: 2,
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {SECTIONS.map((s) => {
                        const Icon = s.icon;
                        const active = section === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSection(s.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 14px",
                                    borderRadius: "var(--r)",
                                    border: "none",
                                    background: active ? "var(--primary-lt)" : "transparent",
                                    color: active ? "var(--primary)" : "var(--muted)",
                                    fontSize: 12,
                                    fontWeight: active ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "var(--transition-fast)",
                                    textAlign: "left",
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={15} />
                                <span style={{ flex: 1 }}>{s.label}</span>
                                {active && <ChevronRight size={13} />}
                            </button>
                        );
                    })}
                </nav>

                {/* ── Content ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {section === "store" && (
                        <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Store Profile</h3>
                            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Public-facing business information</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 16 }}>
                                <Field label="Business Name" placeholder="e.g. Fatima's Fashion House" />
                                <Field label="Category" placeholder="e.g. Fashion & Apparel" />
                                <Field label="Phone" placeholder="+234 800 000 0000" />
                                <Field label="Email" placeholder="hello@mybusiness.com" />
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <Field label="Description" placeholder="What makes your business unique…" />
                            </div>
                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                                <button onClick={handleSave} className={`btn ${saved ? "btn-accent" : "btn-primary"}`}>
                                    {saved ? <><Check size={14} /> Saved</> : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {section === "domain" && (
                        <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Custom Domain</h3>
                            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Connect your own domain or use your free subdomain</p>

                            {/* Free subdomain */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 8 }}>Your Free Subdomain</label>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding: "10px 14px",
                                        borderRadius: "var(--rl)",
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <Globe size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                                    <span className="font-mono" style={{ flex: 1, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>mystore.solo-sme.com</span>
                                    <button
                                        onClick={handleCopy}
                                        className="btn btn-xs btn-ghost"
                                        style={{ fontSize: 11 }}
                                    >
                                        {copied ? <Check size={11} /> : <Copy size={11} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            {/* Custom domain */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 8 }}>Connect Custom Domain</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input className="input-field" placeholder="e.g. www.mybusiness.com" style={{ flex: 1, fontSize: 13 }} />
                                    <button className="btn btn-primary" style={{ fontSize: 12 }}>Connect</button>
                                </div>
                                <p style={{ fontSize: 11, color: "var(--ghost)", marginTop: 8 }}>
                                    Point your domain&apos;s CNAME to <span className="font-mono" style={{ color: "var(--muted)" }}>cname.solo-sme.com</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {section === "whatsapp" && (
                        <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>WhatsApp Connection</h3>
                            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Link your business WhatsApp to SOLO AI</p>

                            <div
                                style={{
                                    borderRadius: "var(--rl)",
                                    padding: 22,
                                    background: "linear-gradient(145deg, var(--sidebar-bg), #0a3352)",
                                    color: "#fff",
                                    marginBottom: 20,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div style={{ position: "absolute", top: -20, right: -12, width: 70, height: 70, borderRadius: "50%", background: "rgba(0,121,140,0.12)" }} />
                                <div style={{ position: "relative" }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(37,211,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                                        <MessageCircle size={17} style={{ color: "#25D366" }} />
                                    </div>
                                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>Connect WhatsApp Business</p>
                                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                                        Your SOLO AI assistant handles customer chats, takes orders, sends receipts, and answers enquiries — 24/7.
                                    </p>
                                    <Link
                                        href="/dashboard/whatsapp"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            background: "#25D366",
                                            color: "#fff",
                                            padding: "9px 16px",
                                            borderRadius: "var(--r)",
                                            textDecoration: "none",
                                            boxShadow: "0 2px 12px rgba(37,211,102,0.3)",
                                        }}
                                    >
                                        <Zap size={12} fill="white" />
                                        Connect WhatsApp
                                    </Link>
                                </div>
                            </div>

                            <Field label="WhatsApp Business Number" placeholder="+234 800 000 0000" hint="Enter the number registered on your WhatsApp Business account" />
                        </div>
                    )}

                    {section === "notifications" && (
                        <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Notifications</h3>
                            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Choose what alerts you receive</p>
                            {[
                                { label: "New order received", sub: "Get notified when a customer places an order", on: true },
                                { label: "WhatsApp message", sub: "Alert when your AI receives a new customer message", on: true },
                                { label: "Low stock warning", sub: "Alert when product stock falls below 5 units", on: false },
                                { label: "Weekly performance", sub: "Receive a weekly summary of your store metrics", on: false },
                            ].map((n) => (
                                <div
                                    key={n.label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "14px 0",
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{n.label}</p>
                                        <p style={{ fontSize: 11, color: "var(--ghost)", marginTop: 3 }}>{n.sub}</p>
                                    </div>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 22,
                                            borderRadius: 11,
                                            background: n.on ? "var(--primary)" : "var(--border)",
                                            cursor: "pointer",
                                            position: "relative",
                                            flexShrink: 0,
                                            transition: "var(--transition-fast)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 2,
                                                width: 18,
                                                height: 18,
                                                borderRadius: "50%",
                                                background: "#fff",
                                                boxShadow: "var(--shadow-xs)",
                                                transition: "var(--transition-fast)",
                                                ...(n.on ? { right: 2 } : { left: 2 }),
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {section === "security" && (
                        <div className="card" style={{ padding: 24, borderRadius: "var(--rl)" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>Account & Security</h3>
                            <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 20px" }}>Manage your login details</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 16 }}>
                                <Field label="Full Name" placeholder="Your name" />
                                <Field label="Email Address" placeholder="your@email.com" />
                            </div>
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 12 }}>Change Password</label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 16 }}>
                                    <Field label="Current Password" placeholder="••••••••" />
                                    <Field label="New Password" placeholder="••••••••" />
                                </div>
                            </div>
                            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                                <button onClick={handleSave} className={`btn ${saved ? "btn-accent" : "btn-primary"}`}>
                                    {saved ? <><Check size={14} /> Saved</> : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
