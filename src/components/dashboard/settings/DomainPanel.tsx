'use client';

import React from 'react';
import { Globe, Copy, Check, Loader2, Info, ExternalLink, ShieldCheck, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DomainStatus {
    status: 'verified' | 'pending' | 'error' | 'failed' | 'configuring';
    message?: string;
    details?: any;
}

interface DomainPanelProps {
    subdomain: string;
    customDomain: string;
    setCustomDomain: (val: string) => void;
    verifying: boolean;
    onVerify: () => void;
    domainStatus: DomainStatus | null;
    suggestedDomains: string[];
    onCopy: () => void;
    copied: boolean;
}

export const DomainPanel: React.FC<DomainPanelProps> = ({
    subdomain,
    customDomain,
    setCustomDomain,
    verifying,
    onVerify,
    domainStatus,
    suggestedDomains,
    onCopy,
    copied
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Store Domain</h3>
                <p className="text-sm text-slate-500">Configure how customers access your store online.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Primary Platform Domain */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Primary Domain</label>
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-tighter border border-emerald-100 shadow-sm shadow-emerald-500/5">Active</span>
                        </div>
                        <div className="group relative flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-5 transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] hover:border-primary/20">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <Globe size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Platform URL</p>
                                <span className="text-slate-900 text-base font-black truncate block tracking-tight">
                                    {subdomain || "mystore"}.solosme.ng
                                </span>
                            </div>
                            <button
                                onClick={onCopy}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all active:scale-95"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy URL"}
                            </button>
                        </div>

                        {suggestedDomains.length > 0 && !customDomain && (
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2.5 ml-0.5">
                                    <div className="w-1 h-3 bg-primary/40 rounded-full" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personalized Suggestions</label>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {suggestedDomains.map((dom) => (
                                        <button
                                            key={dom}
                                            onClick={() => setCustomDomain(dom)}
                                            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 hover:bg-white hover:border-primary/30 hover:text-primary hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 whitespace-nowrap active:scale-95"
                                        >
                                            {dom}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Domain Input */}
                    <div className="space-y-5 pt-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Custom Domain</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                    placeholder="e.g. store.yourbrand.com"
                                    className="w-full pl-6 pr-4 py-4.5 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 placeholder-slate-300 text-slate-900 font-bold shadow-sm"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                    <ArrowRight size={18} />
                                </div>
                            </div>
                            <button
                                onClick={onVerify}
                                disabled={verifying || !customDomain}
                                className="bg-primary text-white h-[60px] px-10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/20 shrink-0 disabled:opacity-30 disabled:shadow-none active:scale-95 flex items-center justify-center gap-3"
                            >
                                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Globe size={16} /> Connect Domain</>}
                            </button>
                        </div>
                        <div className="flex items-start gap-2.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                            <Info size={14} className="text-slate-400 mt-0.5" />
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Use your own domain name (e.g. shop.luxury.ng) to provide a premium, fully institutionalized branded experience for your elite clientele.
                            </p>
                        </div>
                    </div>
                </div>

                {/* DNS Configuration / Status Card */}
                <div className="min-h-[300px]">
                    {domainStatus ? (
                        <div className={cn(
                            "h-full p-8 rounded-3xl border transition-all duration-500 flex flex-col",
                            domainStatus.status === 'verified'
                                ? "bg-emerald-50/30 border-emerald-100 shadow-xl shadow-emerald-500/5"
                                : "bg-amber-50/30 border-amber-100 shadow-xl shadow-amber-500/5 ripple-amber"
                        )}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        domainStatus.status === 'verified' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                    )}>
                                        {domainStatus.status === 'verified' ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900 leading-none mb-1">
                                            {domainStatus.status === 'verified' ? "Domain Verified" : "Verification Pending"}
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {domainStatus.status === 'verified' ? "Your store is live on your custom domain" : "Finish configuration to go live"}
                                        </p>
                                    </div>
                                </div>
                                {domainStatus.status !== 'verified' && (
                                    <button
                                        onClick={onVerify}
                                        className="flex items-center gap-2 text-primary font-bold text-xs hover:opacity-80 transition-opacity"
                                    >
                                        <Loader2 size={14} className={cn(verifying && "animate-spin")} />
                                        Refresh
                                    </button>
                                )}
                            </div>

                            {domainStatus.status !== 'verified' ? (
                                <div className="space-y-6 flex-1">
                                    <div className="bg-white/90 backdrop-blur-xl border border-amber-100 shadow-2xl shadow-amber-500/5 rounded-3xl p-6 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required DNS Records</p>
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                                <Settings size={14} className="animate-spin-slow" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/5 border border-slate-900/5 group hover:bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">A Record (Value)</span>
                                                    <code className="text-[13px] font-mono font-black text-slate-800 tracking-tight">76.76.21.21</code>
                                                </div>
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText('76.76.21.21');
                                                    toast.success("A Record copied");
                                                }} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary shadow-sm transition-all active:scale-90">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/5 border border-slate-900/5 group hover:bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">CNAME Record (Host)</span>
                                                    <code className="text-[13px] font-mono font-black text-slate-800 tracking-tight">cname.vercel-dns.com</code>
                                                </div>
                                                <button onClick={() => {
                                                    navigator.clipboard.writeText('cname.vercel-dns.com');
                                                    toast.success("CNAME Record copied");
                                                }} className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary shadow-sm transition-all active:scale-90">
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-5 bg-amber-50/50 border border-amber-100/50 rounded-2xl animate-pulse">
                                        <div className="mt-1">
                                            <Info size={16} className="text-amber-600" />
                                        </div>
                                        <p className="text-[11px] text-amber-700/80 leading-relaxed font-bold">
                                            Global propagation is underway. Once detected, your store will seamlessly transition to your custom domain.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Check size={32} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Infrastructure Optimized</p>
                                        <p className="text-xs text-slate-500 px-8">SSL Certificate issued and global CDN distribution complete.</p>
                                    </div>
                                    <a
                                        href={`https://${customDomain}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
                                    >
                                        Visit Custom Store <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full bg-slate-50/50 border border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 transition-all duration-500 hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
                            <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-700">
                                <Globe size={40} className="opacity-40" />
                            </div>
                            <h4 className="text-base font-black text-slate-400 uppercase tracking-[0.2em] mb-3">DNS Infrastructure Ready</h4>
                            <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed font-medium">
                                Connect your custom domain to unlock advanced DNS management and institutional SSL automation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
