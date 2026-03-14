"use client";

import { useState } from "react";
import {
  MessageCircle,
  Zap,
  CheckCircle2,
  BarChart3,
  Bot,
  ChevronRight,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CAPABILITIES = [
  {
    id: "sales",
    title: "AI Sales Engine",
    description: "Takes orders and answers questions 24/7",
    icon: ShoppingCart,
    color: "bg-emerald-50 text-emerald-500",
    active: true
  },
  {
    id: "receipts",
    title: "Smart Receipts",
    description: "Sends branded receipts instantly after sale",
    icon: Receipt,
    color: "bg-blue-50 text-blue-500",
    active: true
  },
  {
    id: "reports",
    title: "Insight Reports",
    description: "Weekly summaries delivered to your chat",
    icon: BarChart3,
    color: "bg-amber-50 text-amber-500",
    active: false
  }
];

export default function WhatsAppPage() {
  const { tenant, updateTenantState } = useTenant();
  const [phone, setPhone] = useState(tenant?.whatsapp_phone || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleConnect = async () => {
    if (!phone || !tenant) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ whatsapp_phone: phone })
        .eq('id', tenant.id);

      if (error) throw error;

      updateTenantState({ whatsapp_phone: phone });
      toast.success("WhatsApp Business connected");
    } catch (err) {
      toast.error("Failed to connect WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = async (id: string) => {
    if (!tenant) return;
    const field = id === 'sales' ? 'ai_sales_enabled' :
      id === 'receipts' ? 'ai_receipts_enabled' :
        'ai_reports_enabled';

    const newValue = !tenant[field as keyof typeof tenant];

    try {
      const { error } = await supabase
        .from('tenants')
        .update({ [field]: newValue })
        .eq('id', tenant.id);

      if (error) throw error;
      updateTenantState({ [field]: newValue });
    } catch (err) {
      toast.error("Failed to update AI settings");
    }
  };

  const capabilities = [
    {
      id: "sales",
      title: "AI Sales Engine",
      description: "Takes orders and answers questions 24/7",
      icon: ShoppingCart,
      color: "bg-emerald-50 text-emerald-500",
      active: !!tenant?.ai_sales_enabled
    },
    {
      id: "receipts",
      title: "Smart Receipts",
      description: "Sends branded receipts instantly after sale",
      icon: Receipt,
      color: "bg-blue-50 text-blue-500",
      active: !!tenant?.ai_receipts_enabled
    },
    {
      id: "reports",
      title: "Insight Reports",
      description: "Weekly summaries delivered to your chat",
      icon: BarChart3,
      color: "bg-amber-50 text-amber-500",
      active: !!tenant?.ai_reports_enabled
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Premium Gradient Header */}
      <div className="relative rounded-[32px] overflow-hidden bg-ink p-8 md:p-12 text-white shadow-premium">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <MessageCircle size={20} className="text-emerald-400 fill-emerald-400/20" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">WhatsApp AI</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter font-display leading-tight">
              Your 24/7 AI <br className="hidden md:block" /> Sales Engine.
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              SOLO handles your customers, takes orders, and manages your ledger — all through WhatsApp.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold font-display">247</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Chats</div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold font-display">94%</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Success</div>
              </div>
            </div>
            {tenant?.whatsapp_phone && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Activity size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">+234 {tenant.whatsapp_phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">

          {/* Connection Card */}
          <div className="card-premium p-8 md:p-10 bg-white rounded-[32px] border-border shadow-soft-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <MessageCircle size={200} className="text-emerald-500" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-slate-950 tracking-tight font-display">Connect your business</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Link your WhatsApp number to start taking orders automatically.
                </p>
              </div>

              {!tenant?.whatsapp_phone ? (
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/5 focus-within:border-emerald-500/40 transition-all duration-300">
                    <span className="text-2xl">🇳🇬</span>
                    <span className="text-slate-400 font-bold font-mono">+234</span>
                    <input
                      type="tel"
                      placeholder="800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="flex-1 bg-transparent text-xl font-bold font-mono outline-none text-slate-950 placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={!phone || loading || phone === tenant?.whatsapp_phone}
                    className={cn(
                      "w-full py-5 rounded-2xl font-extrabold text-[13px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg",
                      phone && !loading && phone !== tenant?.whatsapp_phone
                        ? "bg-slate-950 text-white hover:bg-slate-900 hover:-translate-y-1 shadow-slate-950/20"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                    )}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : tenant?.whatsapp_phone ? "Update Number" : "Connect WhatsApp AI"}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-5 p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Active Connection</p>
                    <p className="text-lg font-bold text-slate-950 mt-0.5">+234 {tenant?.whatsapp_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Preview */}
          <div className="space-y-4 px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Sparkles size={12} /> Live Preview
            </h3>
            <div className="bg-[#E5DDD5] rounded-[32px] p-6 shadow-inner border-4 border-white/50">
              <div className="space-y-4">
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-[13px] font-medium text-slate-800">
                    Hi! I&apos;d like to order the Ankara Dress in Small.
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase tracking-wider">10:24 AM</span>
                </div>

                <div className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
                  <div className="bg-emerald-100 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm text-[13px] font-medium text-slate-800">
                    Excellent choice! 🎉 I see we have 3 left in stock at ₦18,500. Should I confirm this order for you?
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mr-1 uppercase tracking-wider text-right flex items-center gap-1">
                    10:24 AM <CheckCircle2 size={10} className="text-emerald-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Capabilities List */}
          <div className="card-premium bg-white border-border rounded-[32px] overflow-hidden shadow-soft-xl">
            <div className="p-6 md:p-8 space-y-6">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">AI Capabilities</h4>
              <div className="space-y-6">
                {capabilities.map((cap) => (
                  <div key={cap.id} className="flex items-start gap-5 group">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent group-hover:scale-110 transition-transform duration-300",
                      cap.color
                    )}>
                      <cap.icon size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-slate-950 tracking-tight">{cap.title}</h5>
                        <button
                          onClick={() => toggleCapability(cap.id)}
                          className={cn(
                            "w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 outline-none",
                            cap.active ? "bg-emerald-500 justify-end" : "bg-slate-100 justify-start"
                          )}
                        >
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy/Trust Card */}
          <div className="bg-ink rounded-[32px] p-8 text-white relative overflow-hidden group shadow-premium border border-white/5">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Shield size={60} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Merchant Security</div>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed italic">
                &quot;All chats and business data are secured in your private cloud instance. Your customer data never leaves your workspace.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
