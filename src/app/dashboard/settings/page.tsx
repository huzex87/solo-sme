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
  { id: "store",         label: "Store Profile",         icon: Store        },
  { id: "domain",        label: "Custom Domain",         icon: Globe        },
  { id: "whatsapp",      label: "WhatsApp Connection",   icon: MessageCircle},
  { id: "notifications", label: "Notifications",         icon: Bell         },
  { id: "account",       label: "Account & Security",    icon: Shield       },
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
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-[#072435] text-xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-400 text-sm mt-0.5">Manage your store configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Section nav — horizontal scroll on mobile, vertical on desktop */}
        <nav className="lg:w-52 shrink-0">
          {/* Mobile: horizontal pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all",
                    on ? "bg-[#409EF2] text-white border-[#409EF2]" : "bg-white text-gray-500 border-gray-200",
                  ].join(" ")}
                >
                  <Icon size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
          {/* Desktop: vertical list */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors",
                    i !== SECTIONS.length - 1 ? "border-b border-gray-50" : "",
                    on ? "bg-[#409EF2]/8 text-[#409EF2] font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-[#072435]",
                  ].join(" ")}
                >
                  <Icon size={15} className={on ? "text-[#409EF2]" : "text-gray-400"} />
                  <span className="flex-1">{s.label}</span>
                  {on && <ChevronRight size={13} />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0">

          {/* Store Profile */}
          {active === "store" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-[#072435] font-bold text-base">Store Profile</h3>
                <p className="text-gray-400 text-xs mt-0.5">Your public-facing business information</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Name"     placeholder="e.g. Fatima's Fashion House" />
                <Field label="Business Category" placeholder="e.g. Fashion & Apparel"       />
                <Field label="Phone Number"      placeholder="+234 800 000 0000"            />
                <Field label="Email Address"     placeholder="hello@mybusiness.com"         />
              </div>
              <Field label="Business Description" placeholder="Tell customers what you do and what makes you unique…" />
              <div className="pt-2 border-t border-gray-50 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

          {/* Custom Domain */}
          {active === "domain" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-[#072435] font-bold text-base">Custom Domain</h3>
                <p className="text-gray-400 text-xs mt-0.5">Connect your own domain or use your free SOLO subdomain</p>
              </div>
              {/* Free subdomain */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#072435]">Your Free Subdomain</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Globe size={14} className="text-[#409EF2] shrink-0" />
                  <span className="text-[#072435] text-sm font-semibold flex-1 font-mono">mystore.solo-sme.com</span>
                  <button onClick={copyDomain} className="flex items-center gap-1 text-xs text-[#409EF2] hover:text-[#3089d8] font-bold">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a href="#" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                    <ExternalLink size={12} />Open
                  </a>
                </div>
              </div>
              {/* Custom domain */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#072435]">Connect Custom Domain</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. www.myfashionhouse.com"
                    className="flex-1 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-300 text-[#072435]"
                  />
                  <button className="px-4 py-2.5 bg-[#409EF2] text-white text-sm font-bold rounded-xl hover:bg-[#3089d8] transition-colors shrink-0">
                    Connect
                  </button>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Point your domain's CNAME record to{" "}
                  <span className="font-mono bg-gray-100 px-1 rounded text-gray-600">cname.solo-sme.com</span>, then enter your domain above.
                </p>
              </div>
            </div>
          )}

          {/* WhatsApp Connection */}
          {active === "whatsapp" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-[#072435] font-bold text-base">WhatsApp Connection</h3>
                <p className="text-gray-400 text-xs mt-0.5">Link your WhatsApp Business number to SOLO AI</p>
              </div>
              <div className="bg-[#072435] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-[#25D366]/8 -translate-y-8 translate-x-8 pointer-events-none" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/25 flex items-center justify-center mb-4">
                    <MessageCircle size={18} className="text-[#25D366]" />
                  </div>
                  <p className="font-bold text-sm mb-1">Connect WhatsApp Business</p>
                  <p className="text-white/45 text-xs leading-relaxed mb-4">
                    Once connected, SOLO AI handles customer chats, takes orders, sends receipts, and answers product enquiries automatically — 24/7.
                  </p>
                  <button className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#22c55e] transition-colors shadow-lg shadow-[#25D366]/25">
                    <Zap size={14} fill="white" />
                    Connect WhatsApp
                  </button>
                </div>
              </div>
              <Field
                label="WhatsApp Business Number"
                placeholder="+234 800 000 0000"
                hint="Enter the number registered on your WhatsApp Business account"
              />
            </div>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-1">
              <div className="mb-4">
                <h3 className="text-[#072435] font-bold text-base">Notifications</h3>
                <p className="text-gray-400 text-xs mt-0.5">Choose what alerts you receive</p>
              </div>
              {[
                { label: "New order received",   sub: "Alert when a customer places an order",         defaultOn: true  },
                { label: "WhatsApp message",     sub: "Alert when your AI receives a new message",     defaultOn: true  },
                { label: "Low stock warning",    sub: "Alert when product stock falls below 5 units",  defaultOn: false },
                { label: "Weekly report",        sub: "AI performance summary every Monday",           defaultOn: false },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                  <div className="mr-4">
                    <p className="text-[#072435] text-sm font-semibold">{n.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{n.sub}</p>
                  </div>
                  <Toggle defaultOn={n.defaultOn} />
                </div>
              ))}
            </div>
          )}

          {/* Account & Security */}
          {active === "account" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-[#072435] font-bold text-base">Account & Security</h3>
                <p className="text-gray-400 text-xs mt-0.5">Manage your login and security settings</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"      placeholder="Your full name"    />
                <Field label="Email Address"  placeholder="your@email.com"   />
              </div>
              <div className="pt-1 border-t border-gray-50">
                <p className="text-xs font-bold text-[#072435] mb-3">Change Password</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Current Password" placeholder="••••••••" type="password" />
                  <Field label="New Password"      placeholder="••••••••" type="password" />
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
