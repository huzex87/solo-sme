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
import { cn } from "@/lib/utils";

type Section = "store" | "domain" | "whatsapp" | "notifications" | "account";

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "domain", label: "Custom Domain", icon: Globe },
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
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-t3 ml-0.5">{label}</label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3.5 text-sm rounded-2xl outline-none transition-all font-medium",
          disabled
            ? "bg-slate-50 border-slate-100 text-t4 cursor-not-allowed"
            : "bg-white border border-slate-100 text-t1 shadow-sh-sm focus:border-primary/20 focus:ring-4 focus:ring-primary/5",
          "placeholder-slate-300"
        )}
      />
      {hint && <p className="text-t4 text-[11px] font-medium ml-0.5 opacity-80">{hint}</p>}
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "w-11 h-6 rounded-full relative transition-all duration-300 shrink-0",
        on ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-slate-200"
      )}
    >
      <span className={cn(
        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
        on ? "left-6" : "left-1"
      )} />
    </button>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      className={cn(
        "btn px-8 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]",
        saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-white shadow-primary/20"
      )}
    >
      {saved ? <><Check size={16} className="mr-2" /> Provisioned</> : "Commit Changes"}
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("domain");
  const [copied, setCopied] = useState(false);

  const copyDomain = () => {
    navigator.clipboard.writeText("mystore.solo-sme.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-entrance space-y-8 pb-12">

      {/* Header — Institutional Standard */}
      <div className="px-1">
        <h2 className="text-ink text-2xl font-bold tracking-tighter">Configuration Matrix</h2>
        <p className="text-t3 text-xs font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">System Orchestration & Security</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Section nav — Transparent Glassy Sidebar */}
        <nav className="lg:w-72 shrink-0">
          {/* Mobile: horizontal pills */}
          <div className="flex gap-2.5 overflow-x-auto pb-3 lg:hidden no-scrollbar">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0 border",
                    on ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-t3 hover:text-t1"
                  )}
                >
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>
          {/* Desktop: Transparent stack with animated state */}
          <div className="hidden lg:block space-y-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-5 text-left text-sm transition-all rounded-[22px] group relative overflow-hidden",
                    on
                      ? "bg-white text-primary font-bold shadow-sh-md border border-slate-100/50"
                      : "text-t3 hover:bg-white/50 hover:text-t2 font-medium"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    on ? "bg-primary/10 text-primary shadow-inner" : "bg-slate-50 text-t4 group-hover:bg-primary/5 group-hover:text-primary"
                  )}>
                    <Icon size={20} />
                  </div>
                  <span className="flex-1 tracking-tight">{s.label}</span>
                  {on && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-l-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content panel (Crystalline Precision) */}
        <div className="flex-1 min-w-0">

          {/* Custom Domain Section */}
          {active === "domain" && (
            <div className="crystalCard p-8 md:p-10 space-y-10 animate-entrance border-slate-100/50">
              <div>
                <h3 className="text-ink font-bold text-xl tracking-tight mb-2">Endpoint Configuration</h3>
                <p className="text-t3 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Sovereign Web Orchestration</p>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-t2 ml-0.5">Primary Subdomain</p>
                <div className="flex items-center gap-4 bg-surface-2 border border-slate-100/80 rounded-[22px] px-6 py-5 shadow-inner group">
                  <Globe size={20} className="text-primary shrink-0 transition-transform group-hover:rotate-12" />
                  <span className="text-t1 text-[16px] font-bold flex-1 font-mono tracking-tighter">mystore.solo-sme.com</span>
                  <button onClick={copyDomain} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sh-sm box-content">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Log Copied" : "Copy Link"}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-t2 ml-0.5">Enterprise Pointing</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. store.excellence.com"
                    className="flex-1 px-5 py-4 text-sm bg-white border border-slate-100 rounded-[22px] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder-slate-300 text-t1 font-bold shadow-sh-sm"
                  />
                  <button className="btn btn-primary px-8 py-4 rounded-[22px] shadow-xl shadow-primary/20 active:scale-[0.98] shrink-0">
                    Propagate Node
                  </button>
                </div>
                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Zap size={14} />
                  </div>
                  <p className="text-t2 text-[12px] font-medium leading-relaxed">
                    Orchestration required: Point your domain’s CNAME record to{" "}
                    <code className="bg-white px-2 py-0.5 rounded shadow-sm text-primary font-bold font-mono">cname.solo-sme.com</code>
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

          {/* Account & Security Section */}
          {active === "account" && (
            <div className="crystalCard p-8 md:p-10 space-y-10 animate-entrance border-slate-100/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-ink font-bold text-xl tracking-tight mb-2">Security Hardening</h3>
                  <p className="text-t3 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Identity & Access Orchestration</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100/50">
                  <Shield size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="Authorized Identity" placeholder="Sovereign Merchant" value="Farida Al-Hassan" />
                <Field label="Primary Node Email" placeholder="merchant@ecosystem.com" value="farida@example.com" />
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-t4" />
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-t2">Protocol Update (Password)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="Atmosphere Password" placeholder="••••••••" type="password" />
                  <Field label="New Secure Vector" placeholder="••••••••" type="password" />
                </div>
              </div>

              <div className="bg-[#072435] p-7 rounded-[28px] text-white relative overflow-hidden shadow-sh-lg border border-white/5">
                <div className="absolute top-0 right-0 p-5 opacity-[0.03] pointer-events-none">
                  <Shield size={64} />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-white/30 mb-3">Institutional Shield</h4>
                <p className="text-[12px] font-medium text-white/60 leading-relaxed italic">
                  Two-factor authentication is enforced across all sovereign nodes. Your session is currently hardware-encrypted.
                </p>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
