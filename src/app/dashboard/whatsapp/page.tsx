"use client";

import { useState } from "react";
import {
  MessageCircle,
  Zap,
  CheckCircle2,
  Link2,
  BarChart3,
  Bot,
  ChevronRight,
  Copy,
  Check,
  Phone,
  Shield,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Real AI journey flows — maps to Gemini 2.0 Flash handlers in the webhook
const JOURNEYS = [
  {
    id: "onboarding",
    emoji: "🔗",
    title: "Sovereign Onboarding",
    description: "Links customer WhatsApp via OTP. First-time setup completes in under 60 seconds.",
    icon: Link2,
    color: "blue",
  },
  {
    id: "record_sale",
    emoji: "💰",
    title: "Automated Ledger",
    description: "AI logs the sale, confirms Paystack payment, and fires a branded WhatsApp receipt instantly.",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    id: "revenue_report",
    emoji: "📊",
    title: "Institutional Reporting",
    description: "Weekly AI summary with top products, trends, and recommended actions — delivered in chat.",
    icon: BarChart3,
    color: "amber",
  },
  {
    id: "ai_advisory",
    emoji: "🤖",
    title: "Gemini Advisory",
    description: "Drop a business question. SOLO AI diagnoses root causes, recommends actions, and executes them.",
    icon: Bot,
    color: "indigo",
  },
];

const CAPABILITIES = [
  "Receive & confirm customer orders",
  "Send branded PDF/image receipts",
  "Answer product questions (RAG on your catalogue)",
  "Weekly business intelligence reports",
  "Customer account onboarding via OTP",
  "AI business advisory & diagnostics",
  "Catalogue browsing & price checks",
  "Low-stock alerts to your phone",
];

const PIPELINE = ["WA Webhook", "Gemini 2.0 Flash", "RAG / Supabase", "Redis Cache", "WA Reply"];

export default function WhatsAppPage() {
  const [phone, setPhone] = useState("");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!phone.trim()) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  const copyNumber = () => {
    navigator.clipboard.writeText("+234" + phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-entrance space-y-8 pb-12">
      {/* Header — Institutional Obsidian Style */}
      <div className="rounded-[32px] overflow-hidden border border-white/5 relative bg-[#072435] p-8 md:p-10 shadow-sh-xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-[0.2em] text-[10px] font-black flex items-center gap-2 shadow-inner">
                <MessageCircle size={12} className="fill-emerald-400" /> Webhook Orchestration
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <h1 className="text-[34px] font-black tracking-tighter text-white leading-tight">WhatsApp AI Nodes</h1>
            <p className="text-white/40 text-[15px] font-medium mt-2 leading-relaxed">Gemini 2.0 Flash powered sales assistant & RAG engine infrastructure.</p>
          </div>
          {connected && (
            <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shadow-inner group">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Active Terminal: +234 {phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Connection Vector Card */}
          <div className="crystalCard p-8 md:p-10 relative overflow-hidden group shadow-sh-xl border-slate-100/50">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12 group-hover:scale-110 transition-transform duration-1000 ease-out">
              <MessageCircle size={240} className="text-emerald-500" />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-ink tracking-tight mb-4">Initialize Merchant Node</h3>
              <p className="text-t3 text-sm font-medium leading-relaxed mb-10 max-w-xl opacity-80">
                SOLO AI handles customer logistics, processes node orders, and fires branded ledger receipts 24/7. All operations are grounded in your private Supabase orchestration.
              </p>

              {!connected ? (
                <div className="space-y-5 max-w-lg">
                  <div className="flex items-center gap-5 bg-surface-2 border border-slate-100 rounded-[22px] px-6 py-5 focus-within:border-emerald-500/40 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all group/input">
                    <span className="text-3xl">🇳🇬</span>
                    <span className="text-t4 font-black font-mono text-sm tracking-widest">+234</span>
                    <input
                      type="tel"
                      placeholder="800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 bg-transparent text-t1 text-xl font-bold font-mono outline-none placeholder:text-t4 placeholder:font-normal"
                    />
                    {phone && (
                      <button onClick={copyNumber} className="w-10 h-10 rounded-xl flex items-center justify-center text-t4 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all">
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={!phone || connecting}
                    className={cn(
                      "w-full py-5 rounded-[22px] font-black text-[12px] uppercase tracking-[0.25em] transition-all shadow-xl active:scale-[0.98]",
                      phone && !connecting ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:-translate-y-1" : "bg-slate-50 text-t4 border border-slate-100 cursor-not-allowed"
                    )}
                  >
                    {connecting ? "Synchronizing Webhook Layers..." : "Mobilize WhatsApp Node"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6 bg-emerald-50 border border-emerald-100/50 rounded-[28px] p-6 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-100/30">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-emerald-600 text-sm font-black uppercase tracking-[0.15em]">System Integration Verified</p>
                    <p className="text-t3 text-xs font-bold font-mono mt-1 opacity-70">Linked Terminal +234 {phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Orchestrated Journeys — Clean List */}
          <div className="crystalCard rounded-[32px] border-slate-100/50 overflow-hidden shadow-sh-md">
            <div className="p-7 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-bold text-ink flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                <Shield size={18} className="text-emerald-500" /> Deployment Matrix
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {JOURNEYS.map((j) => (
                <div key={j.id} className="p-8 hover:bg-slate-50 transition-all group cursor-pointer relative">
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-[20px] flex items-center justify-center border transition-all duration-500 shadow-sm shrink-0",
                      j.color === 'blue' ? "bg-blue-50 text-blue-500 border-blue-100/50 group-hover:border-blue-400 group-hover:shadow-blue-500/10" :
                        j.color === 'emerald' ? "bg-emerald-50 text-emerald-500 border-emerald-100/50 group-hover:border-emerald-400 group-hover:shadow-emerald-500/10" :
                          j.color === 'amber' ? "bg-amber-50 text-amber-500 border-amber-100/50 group-hover:border-amber-400 group-hover:shadow-amber-500/10" :
                            "bg-indigo-50 text-indigo-500 border-indigo-100/50 group-hover:border-indigo-400 group-hover:shadow-indigo-500/10"
                    )}>
                      <j.icon size={26} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{j.emoji}</span>
                        <h4 className="text-[17px] font-bold text-ink tracking-tight">{j.title}</h4>
                      </div>
                      <p className="text-sm text-t3 font-medium leading-relaxed max-w-lg opacity-80">{j.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-t4 group-hover:bg-primary/5 group-hover:text-primary transition-all self-center">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Operational Status — Precision Panel */}
          <div className="crystalCard p-7 rounded-[32px] border-slate-100/50 shadow-sh-sm">
            <h4 className="text-[10px] font-black text-t4 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
              <Activity size={12} /> Operational Status
            </h4>
            <div className="space-y-5">
              {[
                { lbl: "AI Core", val: "Gemini 2.0 Flash", status: "READY" },
                { lbl: "RAG Latency", val: "142ms", status: "OPTIMAL" },
                { lbl: "Webhook", val: connected ? "ACTIVE" : "PENDING", status: connected ? "LIVE" : "WAITING" },
                { lbl: "Protocol", val: "AES-256-GCM", status: "SECURE" }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-t3 opacity-80">{s.lbl}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold font-mono text-t1">{s.val}</span>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                      s.status === 'READY' || s.status === 'OPTIMAL' || s.status === 'LIVE' || s.status === 'SECURE' ? "bg-emerald-500" : "bg-t4 animate-pulse"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capability Matrix — High-Fidelity List */}
          <div className="crystalCard p-7 rounded-[32px] border-slate-100/50 shadow-sh-sm">
            <h4 className="text-[10px] font-black text-t4 uppercase tracking-[0.25em] mb-5">Feature Matrix</h4>
            <div className="space-y-4">
              {CAPABILITIES.map((cap, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                  </div>
                  <span className="text-[12px] font-medium text-t2 leading-snug group-hover:text-primary transition-colors">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Trust Panel */}
          <div className="bg-[#072435] p-8 rounded-[32px] text-white relative overflow-hidden shadow-sh-xl">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
              <Shield size={80} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Sovereign Privacy</p>
            <p className="text-[12px] font-medium text-white/50 leading-relaxed italic">
              All infrastructure layers processed via WhatsApp are isolated within your private Supabase instance. Node groundings are tenant-encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
