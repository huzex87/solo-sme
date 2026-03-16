'use client';

import React from 'react';
import { User, Shield, Lock, Check, Loader2, Mail, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

interface AccountPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

export const AccountPanel: React.FC<AccountPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Profile & Security</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage your personal credentials and secure access keys.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <User size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Full Name</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            value={config.fullName}
                            onChange={(e) => setConfig({ ...config, fullName: e.target.value })}
                            placeholder="Your name"
                            className="w-full pl-12 pr-4 py-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 font-bold shadow-sm placeholder-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Email Address</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={config.email}
                            onChange={(e) => setConfig({ ...config, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full pl-12 pr-4 py-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 font-bold shadow-sm placeholder-slate-200"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        <Lock size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Security Credentials</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Current Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            disabled
                            className="w-full px-5 py-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-300 outline-none cursor-not-allowed font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            disabled
                            className="w-full px-5 py-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-300 outline-none cursor-not-allowed font-mono"
                        />
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <Shield size={16} className="text-primary mt-0.5" />
                    <p className="text-[11px] text-primary/80 font-medium leading-relaxed">
                        Password changes require active session verification. A secure reset link will be sent to your registered email if requested.
                    </p>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={cn(
                        "px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95 disabled:opacity-50",
                        saved
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-primary text-white shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
                    )}
                >
                    {saving ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Security Updated</span>
                        </div>
                    ) : (
                        "Update Profile"
                    )}
                </button>
            </div>
        </div>
    );
};
