"use client";

import { useState } from "react";
import {
  Globe,
  Shield,
  Check,
  Copy,
  Zap,
  Lock,
  ChevronRight,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "domain" | "account";

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
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">{label}</label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 text-sm rounded-xl outline-none transition-all font-medium",
          disabled
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-white border border-slate-200 text-slate-900 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5",
          "placeholder-slate-300"
        )}
      />
      {hint && <p className="text-slate-400 text-[11px] font-medium ml-0.5">{hint}</p>}
    </div>
  );
}

function SaveButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
      className={cn(
        "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95",
        saved ? "bg-emerald-500 text-white" : "bg-primary text-white"
      )}
    >
      {saved ? <div className="flex items-center gap-2"><Check size={16} /> Saved</div> : "Save Changes"}
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your store configuration and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="lg:w-64 shrink-0 space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const on = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  on
                    ? "bg-white text-primary shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  on ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                  <Icon size={18} />
                </div>
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
          {/* Custom Domain Section */}
          {active === "domain" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Store Domain</h3>
                <p className="text-sm text-slate-500">Configure how customers access your store online.</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Domain</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <Globe size={18} className="text-slate-400" />
                  <span className="text-slate-900 text-sm font-medium flex-1">mystore.solo-sme.com</span>
                  <button onClick={copyDomain} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custom Domain</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. store.yourbrand.com"
                    className="flex-1 px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder-slate-300 text-slate-900 font-medium shadow-sm"
                  />
                  <button className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-sm shrink-0">
                    Connect Domain
                  </button>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Zap size={16} className="text-blue-500 mt-0.5" />
                  <p className="text-slate-600 text-[12px] leading-relaxed">
                    To connect a custom domain, point your CNAME record to{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-blue-100 text-blue-600 font-bold font-mono">cname.solo-sme.com</code>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}

          {/* Account & Security Section */}
          {active === "account" && (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Profile & Security</h3>
                  <p className="text-sm text-slate-500">Manage your personal information and login credentials.</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200">
                  <User size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name" placeholder="Your name" value="Farida Al-Hassan" />
                <Field label="Email Address" placeholder="your@email.com" value="farida@example.com" />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={16} className="text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-900">Change Password</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Current Password" placeholder="••••••••" type="password" />
                  <Field label="New Password" placeholder="••••••••" type="password" />
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg">
                <Shield size={64} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Security Note</h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  Two-factor authentication is enabled to keep your account secure. Session data is encrypted at rest.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <SaveButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
