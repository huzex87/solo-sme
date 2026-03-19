'use client';

import React from 'react';
import { User, Shield, Lock, Check, Loader2, Mail } from 'lucide-react';
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
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Account</h3>
                <p className="text-sm text-slate-500">Manage your profile and security settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-500">Full Name</label>
                    <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            value={config.fullName}
                            onChange={(e) => setConfig({ ...config, fullName: e.target.value })}
                            placeholder="Your name"
                            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-500">Email Address</label>
                    <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="email"
                            value={config.email}
                            onChange={(e) => setConfig({ ...config, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <Lock size={15} className="text-slate-400" />
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">Current Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            disabled
                            className="w-full h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-sm text-slate-300 outline-none cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            disabled
                            className="w-full h-10 bg-slate-50 border border-slate-100 rounded-lg px-3 text-sm text-slate-300 outline-none cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                    <Shield size={13} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-primary/80 leading-relaxed">
                        Password changes require email verification. A secure reset link will be sent to your registered email.
                    </p>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={saving}
                    className={cn(
                        "h-10 px-6 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50",
                        saved
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-950 text-white hover:bg-primary"
                    )}
                >
                    {saving ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                    ) : saved ? (
                        <span className="flex items-center gap-2"><Check size={16} /> Saved</span>
                    ) : (
                        "Save Profile"
                    )}
                </button>
            </div>
        </div>
    );
};
