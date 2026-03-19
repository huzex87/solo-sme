'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Copy, Check, Loader2, Info, ExternalLink, ShieldCheck, AlertCircle, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

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
    tenantId?: string | null;
    tenantName?: string | null;
    onSubdomainChange?: (newSubdomain: string) => void;
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
    copied,
    tenantId,
    tenantName,
    onSubdomainChange,
}) => {
    const [isEditingSubdomain, setIsEditingSubdomain] = useState(false);
    const [newSubdomain, setNewSubdomain] = useState(subdomain || '');
    const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [savingSubdomain, setSavingSubdomain] = useState(false);

    const sanitizeSubdomain = (val: string) =>
        val.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 30);

    const checkAvailability = useCallback(async (value: string) => {
        if (!value || value.length < 3) {
            setSubdomainStatus('invalid');
            return;
        }
        if (value === subdomain) {
            setSubdomainStatus('idle');
            return;
        }
        setSubdomainStatus('checking');
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('tenants')
                .select('id')
                .eq('subdomain', value)
                .maybeSingle();
            setSubdomainStatus(data ? 'taken' : 'available');
        } catch {
            setSubdomainStatus('idle');
        }
    }, [subdomain]);

    useEffect(() => {
        if (!isEditingSubdomain) return;
        const timer = setTimeout(() => checkAvailability(newSubdomain), 500);
        return () => clearTimeout(timer);
    }, [newSubdomain, isEditingSubdomain, checkAvailability]);

    const handleSaveSubdomain = async () => {
        if (!tenantId || !newSubdomain || newSubdomain === subdomain || subdomainStatus !== 'available') return;
        setSavingSubdomain(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.from('tenants').update({ subdomain: newSubdomain }).eq('id', tenantId);
            if (error) throw error;
            toast.success(`Store URL updated to ${newSubdomain}.solosme.ng`);
            setIsEditingSubdomain(false);
            onSubdomainChange?.(newSubdomain);
        } catch (err: any) {
            toast.error(err.message || 'Failed to update subdomain');
        } finally {
            setSavingSubdomain(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Store Domain</h3>
                <p className="text-sm text-slate-500">Set your store URL and connect a custom domain.</p>
            </div>

            {/* ── Store URL (Subdomain Editor) ── */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Store URL</label>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-wider border border-emerald-100">Active</span>
                </div>

                {!isEditingSubdomain ? (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5">
                            <span className="text-base font-bold text-slate-900">{subdomain || 'mystore'}</span>
                            <span className="text-base font-medium text-slate-400">.solosme.ng</span>
                        </div>
                        <button
                            onClick={() => { setIsEditingSubdomain(true); setNewSubdomain(subdomain || ''); setSubdomainStatus('idle'); }}
                            className="h-12 w-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95 flex items-center justify-center"
                            title="Edit subdomain"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={onCopy}
                            className="h-12 w-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95 flex items-center justify-center"
                            title="Copy URL"
                        >
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center bg-white border-2 border-primary/30 rounded-xl px-5 py-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                            <input
                                type="text"
                                value={newSubdomain}
                                onChange={(e) => setNewSubdomain(sanitizeSubdomain(e.target.value))}
                                placeholder="your-business-name"
                                className="flex-1 text-base font-bold text-slate-900 bg-transparent outline-none placeholder-slate-300"
                                autoFocus
                                maxLength={30}
                            />
                            <span className="text-base font-medium text-slate-400 shrink-0">.solosme.ng</span>
                        </div>
                        <div className="flex items-center gap-2 min-h-[20px]">
                            {subdomainStatus === 'checking' && <><Loader2 size={14} className="animate-spin text-slate-400" /><span className="text-xs text-slate-400">Checking...</span></>}
                            {subdomainStatus === 'available' && <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-xs font-semibold text-emerald-600">{newSubdomain}.solosme.ng is available</span></>}
                            {subdomainStatus === 'taken' && <><XCircle size={14} className="text-rose-500" /><span className="text-xs font-semibold text-rose-600">Already taken</span></>}
                            {subdomainStatus === 'invalid' && newSubdomain.length > 0 && <><AlertCircle size={14} className="text-amber-500" /><span className="text-xs font-semibold text-amber-600">Min 3 characters (letters, numbers, hyphens)</span></>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSaveSubdomain}
                                disabled={savingSubdomain || subdomainStatus !== 'available'}
                                className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold transition-all disabled:opacity-40 active:scale-95 flex items-center gap-2"
                            >
                                {savingSubdomain ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                Claim URL
                            </button>
                            <button
                                onClick={() => { setIsEditingSubdomain(false); setNewSubdomain(subdomain || ''); }}
                                className="h-10 px-4 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {!isEditingSubdomain && suggestedDomains.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggestions based on your business name</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedDomains.map((dom) => (
                                <button
                                    key={dom}
                                    onClick={() => { setNewSubdomain(dom.replace('.solosme.ng', '')); setIsEditingSubdomain(true); }}
                                    className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-white hover:border-primary/30 hover:text-primary transition-all active:scale-95"
                                >
                                    {dom}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Custom Domain ── */}
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Domain</label>
                <p className="text-sm text-slate-400 -mt-2">Optional — connect your own domain for a fully branded URL.</p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. shop.yourbrand.com"
                        className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all placeholder-slate-300 font-medium"
                    />
                    <button
                        onClick={onVerify}
                        disabled={verifying || !customDomain}
                        className="h-[46px] px-6 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-30 active:scale-95 flex items-center gap-2 shrink-0"
                    >
                        {verifying ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                        Connect
                    </button>
                </div>

                {domainStatus?.status === 'verified' && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
                        <ShieldCheck size={14} /><span className="text-xs font-bold">Verified & Active</span>
                    </div>
                )}

                {/* DNS instructions — only show when custom domain entered but not verified */}
                {customDomain && domainStatus && domainStatus.status !== 'verified' && (
                    <div className="mt-2 p-5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-4">
                        <p className="text-xs font-bold text-amber-700">Add these DNS records at your domain registrar:</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                <div>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">A Record</span>
                                    <code className="text-sm font-mono font-bold text-slate-800">76.76.21.21</code>
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText('76.76.21.21'); toast.success("Copied"); }}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-primary active:scale-90"><Copy size={14} /></button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                                <div>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">CNAME</span>
                                    <code className="text-sm font-mono font-bold text-slate-800">cname.vercel-dns.com</code>
                                </div>
                                <button onClick={() => { navigator.clipboard.writeText('cname.vercel-dns.com'); toast.success("Copied"); }}
                                    className="p-1.5 rounded-md text-slate-400 hover:text-primary active:scale-90"><Copy size={14} /></button>
                            </div>
                        </div>
                        <p className="text-[11px] text-amber-600 font-medium">DNS propagation can take up to 48 hours. Click Connect to re-check.</p>
                    </div>
                )}

                {!customDomain && (
                    <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Point your domain&apos;s DNS to our servers for a branded store experience with automatic SSL.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
