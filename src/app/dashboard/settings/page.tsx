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

type Section = "store" | "domain" | "whatsapp" | "notifications" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "store", label: "Store Profile", icon: Store },
  { id: "domain", label: "Custom Domain", icon: Globe },
  { id: "whatsapp", label: "WhatsApp Connection", icon: MessageCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account & Security", icon: Shield },
];

function Field({
  label, placeholder, value = "", hint, disabled = false, type = "text",
}: {
  label: string; placeholder?: string; value?: string;
  hint?: string; disabled?: boolean; type?: string;
}) {
  const [val, setVal] = useState(value);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-[#072435]">{label}</label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          "w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-all",
          disabled
            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 text-[#072435] focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10",
          "placeholder-gray-300",
        ].join(" ")}
      />
      {hint && <p className="text-gray-400 text-[11px]">{hint}</p>}
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-[#409EF2]" : "bg-gray-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${on ? "right-0.5" : "left-0.5"}`} />
    </button>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${saved ? "bg-emerald-500 text-white" : "bg-[#409EF2] text-white hover:bg-[#3089d8] shadow-sm shadow-[#409EF2]/25"}`}
    >
      {saved ? <><Check size={14} />Saved</> : "Save Changes"}
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("store");
  const [copied, setCopied] = useState(false);

  const copyDomain = () => {
    navigator.clipboard.writeText("mystore.solo-sme.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="px-1">
        <h2 className="text-t1 text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1.5">Orchestrate your business configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Section nav — Institutional Glassy Sidebar */}
        <nav className="lg:w-60 shrink-0">
          {/* Mobile: horizontal pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden no-scrollbar">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={[
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border-none shadow-sm",
                    on ? "bg-primary text-white shadow-primary/20" : "bg-white text-t3 hover:text-t1",
                  ].join(" ")}
                >
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>
          {/* Desktop: Glassy elevated list */}
          <div className="hidden lg:block bg-white rounded-[28px] shadow-md overflow-hidden p-2 space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm transition-all rounded-2xl",
                    on
                      ? "bg-primary-lt text-primary font-bold shadow-inner"
                      : "text-t3 hover:bg-surface-2 hover:text-t1 font-medium",
                  ].join(" ")}
                >
                  <Icon size={18} className={on ? "text-primary" : "text-t4"} />
                  <span className="flex-1">{s.label}</span>
                  {on && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content panel (Institutional Crystalline) */}
        <div className="flex-1 min-w-0">

          {/* Store Profile */}
          {active === "store" && (
            <div className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 space-y-8 animate-entrance">
              <div>
                <h3 className="text-t1 font-bold text-lg mb-1">Store Profile</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">Public business identity</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Business Name" placeholder="e.g. Fatima's Fashion House" />
                <Field label="Business Category" placeholder="e.g. Fashion & Apparel" />
                <Field label="Phone Number" placeholder="+234 800 000 0000" />
                <Field label="Email Address" placeholder="hello@mybusiness.com" />
              </div>
              <Field label="Business Description" placeholder="Tell customers what you do and what makes you unique…" />
              <div className="pt-6 border-t border-surface-2 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

          {/* Custom Domain */}
          {active === "domain" && (
            <div className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 space-y-8 animate-entrance">
              <div>
                <h3 className="text-t1 font-bold text-lg mb-1">Custom Domain</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">Sovereign Web presence</p>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold text-t2">Free Institutional Subdomain</p>
                <div className="flex items-center gap-3 bg-surface-2 border-none rounded-2xl px-5 py-4 shadow-inner">
                  <Globe size={18} className="text-primary shrink-0" />
                  <span className="text-t1 text-sm font-bold flex-1 font-mono tracking-tight">mystore.solo-sme.com</span>
                  <button onClick={copyDomain} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dk font-bold transition-colors">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold text-t2">Connect Enterprise Domain</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="e.g. www.myfashionhouse.com"
                    className="flex-1 px-4 py-3.5 text-sm bg-white border-2 border-surface-2 rounded-2xl outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all placeholder-t4 text-t1 font-medium"
                  />
                  <button className="px-6 py-3.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary-dk hover:-translate-y-0.5 shadow-lg shadow-primary/20 transition-all shrink-0">
                    Connect
                  </button>
                </div>
                <div className="bg-primary-lt/50 p-4 rounded-2xl border-none">
                  <p className="text-t2 text-[11px] font-medium leading-relaxed">
                    Point your domain's CNAME record to{" "}
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm text-primary font-bold">cname.solo-sme.com</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Connection */}
          {active === "whatsapp" && (
            <div className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 space-y-8 animate-entrance">
              <div>
                <h3 className="text-t1 font-bold text-lg mb-1">WhatsApp Connection</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">AI Agent Orchestration</p>
              </div>
              <div className="bg-ink rounded-[28px] p-7 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green/5 -translate-y-8 translate-x-8 pointer-events-none blur-3xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center mb-6 shadow-glow-green">
                    <MessageCircle size={24} className="text-green" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Connect WhatsApp Business</h4>
                  <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-sm">
                    Link your number to deploy Amina Farida AI. SOLO handles 24/7 enquiries and automated processing in high-fidelity.
                  </p>
                  <button className="inline-flex items-center gap-2.5 bg-green text-white text-sm font-bold px-6 py-3.5 rounded-2xl hover:bg-green/90 hover:-translate-y-0.5 transition-all shadow-xl shadow-green/20">
                    <Zap size={16} fill="white" />
                    Deploy AI Connector
                  </button>
                </div>
              </div>
              <Field
                label="WhatsApp Business Number"
                placeholder="+234 800 000 0000"
                hint="Authorized number for merchant orchestration"
              />
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 space-y-2 animate-entrance">
              <div className="mb-6">
                <h3 className="text-t1 font-bold text-lg mb-1">Notifications</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">Platform Intelligence Alerts</p>
              </div>
              {[
                { label: "New incoming order", sub: "Real-time alert for storefront transactions", defaultOn: true },
                { label: "AI Journey updates", sub: "Alerts for WhatsApp orchestration flows", defaultOn: true },
                { label: "Inventory Threshold", sub: "Predictive alerts for restocking operations", defaultOn: false },
                { label: "Institutional Digest", sub: "Weekly performance reporting via AI", defaultOn: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-5 border-b border-surface-2 last:border-0 group">
                  <div className="mr-4">
                    <p className="text-t1 text-sm font-bold group-hover:text-primary transition-colors">{n.label}</p>
                    <p className="text-t3 text-[11px] font-medium mt-1 uppercase tracking-wide">{n.sub}</p>
                  </div>
                  <Toggle defaultOn={n.defaultOn} />
                </div>
              ))}
            </div>
          )}

          {/* Account & Security */}
          {active === "account" && (
            <div className="bg-white rounded-[32px] shadow-sm p-6 sm:p-8 space-y-8 animate-entrance">
              <div>
                <h3 className="text-t1 font-bold text-lg mb-1">Account & Security</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">Institutional Access Control</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Full Merchant Name" placeholder="Your full name" />
                <Field label="Authorized Email" placeholder="your@email.com" />
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold text-t1 mb-4">Security Hardening (Password)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Current Password" placeholder="••••••••" type="password" />
                  <Field label="New Secure Password" placeholder="••••••••" type="password" />
                </div>
              </div>
              <div className="pt-6 border-t border-surface-2 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
