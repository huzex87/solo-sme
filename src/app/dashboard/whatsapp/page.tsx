"use client";

import { useState } from "react";
import Link from "next/link";
import {
    MessageCircle,
    Zap,
    CheckCircle2,
    ArrowRight,
    Bot,
    Smartphone,
    Languages,
    History,
    MoreVertical,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_FEATURES = [
    { name: "Auto-Catalog", status: "Active", icon: Zap, color: "var(--blue)" },
    { name: "AI Order Assistant", status: "Active", icon: Bot, color: "var(--green)" },
    { name: "Hybrid Support", status: "Enabled", icon: Smartphone, color: "var(--amber)" },
    { name: "Multi-Lingual", status: "Enabled", icon: Languages, color: "var(--blue)" },
];

export default function WhatsAppAIPage() {
    return (
        <div className="flex flex-col gap-6 animate-entrance pb-32">
            {/* ── High-Fidelity Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-t1 text-xl font-extrabold tracking-tight font-display m-0">WhatsApp AI</h2>
                    <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1">Amina Farida Assistant</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sh-sm border border-border flex items-center justify-center text-t2 active:scale-95 transition-all">
                        <History size={18} />
                    </div>
                </div>
            </div>

            {/* ── AI Status Card ── */}
            <div className="bg-ink p-5 rounded-[28px] shadow-sh-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-green/5 group-hover:text-green/10 transition-colors">
                    <Zap size={100} />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center text-green relative">
                            <Bot size={24} />
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green rounded-full border-2 border-ink animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-white text-[15px] font-extrabold tracking-tight font-display">Amina Farida AI</h3>
                            <p className="text-green text-[10px] font-black uppercase tracking-widest mt-0.5">Online & Handling Queries</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <span className="text-white text-[9px] font-black uppercase tracking-widest">Active</span>
                    </div>
                </div>
            </div>

            {/* ── Chat Preview (Mockup Style) ── */}
            <div className="bg-white rounded-[32px] border border-border mt-4 overflow-hidden shadow-sh-sm">
                <div className="p-4 border-b border-border bg-surface/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center">
                            <MessageCircle size={16} fill="white" />
                        </div>
                        <span className="text-t1 text-xs font-black uppercase tracking-widest">Live Preview</span>
                    </div>
                    <span className="text-t4 text-[10px] font-bold">Today</span>
                </div>

                <div className="p-6 space-y-4">
                    {/* Bot Message */}
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-xl bg-ink text-white flex-shrink-0 flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-surface p-4 rounded-2xl rounded-tl-none border border-border">
                            <p className="text-t1 text-xs font-medium leading-relaxed">
                                Alhamdulillah, done. Amina Farida&apos;s order for <span className="text-blue font-bold">Kandur Gown</span> has been confirmed. Generating receipt now...
                            </p>
                        </div>
                    </div>

                    {/* Customer Message */}
                    <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-green-dim text-green flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] font-black">AF</span>
                        </div>
                        <div className="bg-green text-white p-4 rounded-2xl rounded-tr-none shadow-sh-green/20">
                            <p className="text-xs font-medium leading-relaxed">
                                I want to place an order for Kandur Gown. Size M.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface/30 border-t border-border flex items-center gap-3">
                    <div className="flex-1 bg-white border border-border h-10 rounded-xl px-4 flex items-center text-t4 text-xs font-medium italic">
                        Type a message...
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green text-white flex items-center justify-center shadow-lg shadow-green/20">
                        <Send size={18} />
                    </div>
                </div>
            </div>

            {/* ── Feature Grid ── */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                {AI_FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <div key={feature.name} className="bg-white p-4 rounded-[24px] border border-border shadow-sh-sm flex flex-col gap-3 group active:scale-95 transition-all">
                            <div className="flex items-center justify-between">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    "bg-surface text-t3 group-hover:bg-blue-dim group-hover:text-blue transition-colors"
                                )}>
                                    <Icon size={20} />
                                </div>
                                <div className="p-1 rounded-full bg-green/10 text-green inline-flex">
                                    <CheckCircle2 size={12} />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-t1 text-xs font-extrabold tracking-tight leading-tight">{feature.name}</h4>
                                <p className="text-t4 text-[9px] font-black uppercase tracking-widest mt-1">{feature.status}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Setup Flow (Collapsed for Mockup Style) ── */}
            <div className="bg-gradient-to-br from-blue-dim to-transparent p-6 rounded-[28px] border border-blue/10 mt-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-t1 text-sm font-bold tracking-tight mb-1">Onboarding Guide</h4>
                        <p className="text-t3 text-[10px] font-black uppercase tracking-widest">Connect your Meta Business Account</p>
                    </div>
                    <ArrowRight size={20} className="text-blue" />
                </div>
            </div>
        </div>
    );
}
