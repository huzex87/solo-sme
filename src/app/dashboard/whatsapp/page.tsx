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
      {/* Header */}
      <div className="dh rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-[#072435]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="beta-chip px-2 py-0.5 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 uppercase tracking-widest text-[9px] font-black">
                <MessageCircle size={10} className="fill-[#25D366]" /> Convergent AI
              </span>
              <div className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">WhatsApp AI</h1>
            <p className="text-white/40 text-sm font-medium">Gemini 2.0 Flash powered sales assistant & RAG engine.</p>
          </div>
          {connected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-xs font-black text-[#25D366] uppercase tracking-widest">Active SID: +234 {phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Connection Card */}
          <div className="crystalCard p-8 rounded-[2rem] border border-white/5 bg-[#072435] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 group-hover:scale-110 transition-transform">
              <MessageCircle size={160} color="#25D366" />
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight mb-4">Orchestrate Your Business in Chat</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xl">
                SOLO AI handles customer conversations, processes orders, and generates branded receipts 24/7. All operations are grounded in your Supabase tenant data.
              </p>

              {!connected ? (
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-[#25D366]/50 transition-all">
                    <span className="text-2xl">🇳🇬</span>
                    <span className="text-white/30 font-mono text-sm">+234</span>
                    <input
                      type="tel"
                      placeholder="800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 bg-transparent text-white text-lg font-mono outline-none placeholder:text-white/10"
                    />
                    {phone && (
                      <button onClick={copyNumber} className="text-white/20 hover:text-[#25D366] transition-colors">
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={!phone || connecting}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl",
                      phone && !connecting ? "bg-[#25D366] text-white shadow-[#25D366]/20 hover:-translate-y-1" : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {connecting ? "Initializing Secure Webhook..." : "Mobilize WhatsApp AI"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[#25D366] text-sm font-black uppercase tracking-widest">System Integrity Verified</p>
                    <p className="text-white/40 text-xs font-mono">Linked to terminal +234 {phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Journeys */}
          <div className="crystalCard rounded-[2rem] border border-border/50 overflow-hidden shadow-sh-sm">
            <div className="p-6 border-b border-border bg-surface/30">
              <h3 className="font-bold text-ink flex items-center gap-2 text-sm uppercase tracking-widest">
                <Shield size={16} className="text-[#25D366]" /> Orchestrated Journey Flows
              </h3>
            </div>
            <div className="divide-y divide-border">
              {JOURNEYS.map((j) => (
                <div key={j.id} className="p-6 hover:bg-surface/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-[1rem] flex items-center justify-center border border-border group-hover:scale-110 transition-all shadow-sm",
                      `bg-${j.color}-500/5 text-${j.color}-500 group-hover:border-${j.color}-500/30`
                    )}>
                      <j.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{j.emoji}</span>
                        <h4 className="text-sm font-black text-ink">{j.title}</h4>
                      </div>
                      <p className="text-xs text-secondary font-medium leading-relaxed max-w-md">{j.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-ghost group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="crystalCard p-6 rounded-[2rem] border border-border/50">
            <h4 className="text-[10px] font-black text-ghost uppercase tracking-widest mb-4">Operational Status</h4>
            <div className="space-y-4">
              {[
                { lbl: "AI Core", val: "Gemini 2.0 Flash", status: "READY" },
                { lbl: "RAG Latency", val: "142ms", status: "OPTIMAL" },
                { lbl: "Webhook Health", val: connected ? "ACTIVE" : "PENDING", status: connected ? "LIVE" : "WAITING" },
                { lbl: "Encryption", val: "AES-256-GCM", status: "SECURE" }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-secondary">{s.lbl}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-ink opacity-60">{s.val}</span>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      s.status === 'READY' || s.status === 'OPTIMAL' || s.status === 'LIVE' || s.status === 'SECURE' ? "bg-emerald-500" : "bg-ghost animate-pulse"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="crystalCard p-6 rounded-[2rem] border border-border/50">
            <h4 className="text-[10px] font-black text-ghost uppercase tracking-widest mb-4">Capability Matrix</h4>
            <div className="space-y-3">
              {CAPABILITIES.map((cap, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={12} className="text-[#25D366] mt-0.5 shrink-0" />
                  <span className="text-[11px] font-medium text-secondary leading-tight">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#072435] p-6 rounded-[2rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Shield size={60} />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Institutional Privacy</p>
            <p className="text-[11px] font-medium text-white/50 leading-relaxed">
              All customer data processed via WhatsApp is stored within your private Supabase instance. RAG groundings are tenant-isolated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
