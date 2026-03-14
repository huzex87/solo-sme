'use client';

import React from 'react';
import { Globe, Copy, Check, Loader2, Info, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainPanelProps {
    subdomain: string;
    customDomain: string;
    setCustomDomain: (val: string) => void;
    verifying: boolean;
    onVerify: () => void;
    domainStatus: any;
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Primary Domain</label>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-tighter border border-emerald-100">Active</span>
                        </div>
                        <div className="group relative flex items-center gap-4 bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 transition-all hover:bg-white hover:shadow-md hover:border-primary/20">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                <Globe size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">Platform URL</p>
                                <span className="text-slate-900 text-sm font-bold truncate block">
                                    {subdomain || "mystore"}.solosme.ng
                                </span>
                            </div>
                            <button
                                onClick={onCopy}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm active:scale-95"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>

                        {suggestedDomains.length > 0 && !customDomain && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 ml-0.5">
                                    <Info size={12} className="text-primary" />
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personalized Suggestions</label>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedDomains.map((dom) => (
                                        <button
                                            key={dom}
                                            onClick={() => setCustomDomain(dom)}
                                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-primary hover:text-primary hover:shadow-sm transition-all whitespace-nowrap active:scale-95"
                                        >
                                            {dom}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Domain Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-0.5">Custom Domain</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                                <input
                                    type="text"
                                    value={customDomain}
                                    onChange={(e) => setCustomDomain(e.target.value)}
                                    placeholder="e.g. store.yourbrand.com"
                                    className="w-full pl-5 pr-4 py-4 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder-slate-300 text-slate-900 font-bold shadow-sm"
                                />
                            </div>
                            <button
                                onClick={onVerify}
                                disabled={verifying || !customDomain}
                                className="bg-primary text-white ml-2 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2"><Globe size={14} /> Connect</div>}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 ml-0.5 font-medium leading-relaxed">
                            Use your own domain name (e.g. shop.luxury.ng) to provide a fully branded experience.
                        </p>
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
                                    <div className="bg-white/80 backdrop-blur-sm border border-amber-100 rounded-2xl p-5 space-y-4">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Required DNS Records</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">A Record</span>
                                                    <span className="text-sm font-mono font-bold text-slate-800">76.76.21.21</span>
                                                </div>
                                                <button onClick={() => navigator.clipboard.writeText('76.76.21.21')} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-all">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">CNAME Record</span>
                                                    <span className="text-sm font-mono font-bold text-slate-800">cname.vercel-dns.com</span>
                                                </div>
                                                <button onClick={() => navigator.clipboard.writeText('cname.vercel-dns.com')} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-primary transition-all">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl">
                                        <Info size={16} className="text-primary mt-0.5" />
                                        <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                                            Propagation can take up to 24 hours depending on your registrar. Once configured, your domain will automatically activate.
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
                        <div className="h-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
                                <Globe size={32} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-400">DNS Infrastructure Ready</h4>
                            <p className="text-xs text-slate-400 max-w-[200px] mt-2 leading-relaxed">
                                Connect your custom domain to unlock advanced DNS management and SSL automation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
