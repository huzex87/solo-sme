'use client';

import React, { useState } from 'react';
import { Zap, CreditCard, Map, Eye, EyeOff, Check, Loader2, ShieldCheck, Info, Globe, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';

interface IntegrationPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}

interface SecretFieldProps {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (val: string) => void;
    hint?: string;
}

const SecretField: React.FC<SecretFieldProps> = ({ label, value, placeholder, onChange, hint }) => {
    const [show, setShow] = useState(false);

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">{label}</label>
            <div className="relative group">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-12 py-4 text-sm bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all duration-300 font-mono font-bold shadow-sm placeholder-slate-200"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {hint && <p className="text-[10px] text-slate-400 font-medium ml-0.5">{hint}</p>}
        </div>
    );
};

export const IntegrationPanel: React.FC<IntegrationPanelProps> = ({
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
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">Store Connections</h3>
                    <p className="text-sm text-slate-500 font-medium">Connect your store to the world's most trusted tools for payments and shipping.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Secure Vault</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="space-y-12">
                    {/* Payment Gateways Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">Payments Flow</h4>
                                <p className="text-[11px] text-slate-400 font-medium">Decide how you want to receive money from customers.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-0.5">Preferred Gateway</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfig({ ...config, preferredPaymentGateway: 'paystack' })}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        config.preferredPaymentGateway === 'paystack'
                                            ? "bg-primary/5 border-primary shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn("text-xs font-bold", config.preferredPaymentGateway === 'paystack' ? "text-primary" : "text-slate-600")}>Paystack</span>
                                    {config.preferredPaymentGateway === 'paystack' && <Check size={16} className="text-primary" />}
                                </button>
                                <button
                                    onClick={() => setConfig({ ...config, preferredPaymentGateway: 'flutterwave' })}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                        config.preferredPaymentGateway === 'flutterwave'
                                            ? "bg-primary/5 border-primary shadow-sm"
                                            : "bg-white border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn("text-xs font-bold", config.preferredPaymentGateway === 'flutterwave' ? "text-primary" : "text-slate-600")}>Flutterwave</span>
                                    {config.preferredPaymentGateway === 'flutterwave' && <Check size={16} className="text-primary" />}
                                </button>
                            </div>
                        </div>

                        {/* Paystack Details */}
                        <div className={cn("space-y-6 pt-2 transition-opacity", config.preferredPaymentGateway !== 'paystack' && "opacity-40 grayscale pointer-events-none")}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-black">Ps</div>
                                <span className="text-xs font-bold text-slate-700">Paystack Setup</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <SecretField
                                    label="Public Key"
                                    value={config.paystackPublicKey}
                                    onChange={(val) => setConfig({ ...config, paystackPublicKey: val })}
                                    placeholder="pk_live_..."
                                />
                                <SecretField
                                    label="Secret Key"
                                    value={config.paystackSecretKey}
                                    onChange={(val) => setConfig({ ...config, paystackSecretKey: val })}
                                    placeholder="sk_live_..."
                                />
                            </div>
                        </div>

                        {/* Flutterwave Details */}
                        <div className={cn("space-y-6 pt-2 transition-opacity", config.preferredPaymentGateway !== 'flutterwave' && "opacity-40 grayscale pointer-events-none")}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-500 text-[10px] font-black">Fw</div>
                                <span className="text-xs font-bold text-slate-700">Flutterwave Setup</span>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <SecretField
                                    label="Public Key"
                                    value={config.flutterwavePublicKey}
                                    onChange={(val) => setConfig({ ...config, flutterwavePublicKey: val })}
                                    placeholder="FLWPUBK_..."
                                />
                                <SecretField
                                    label="Secret Key"
                                    value={config.flutterwaveSecretKey}
                                    onChange={(val) => setConfig({ ...config, flutterwaveSecretKey: val })}
                                    placeholder="FLWSECK_..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Mapping & Logistics Infrastructure */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Map size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">Shipping & Distance</h4>
                                <p className="text-[11px] text-slate-400 font-medium">Smart calculation for delivery fees.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <SecretField
                                label="Google Maps API Key"
                                value={config.googleMapsKey}
                                onChange={(val) => setConfig({ ...config, googleMapsKey: val })}
                                placeholder="AIzaSy..."
                                hint="Required for automatic delivery fee calculation based on distance."
                            />

                            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-3">
                                <div className="flex items-center gap-2">
                                    <Info size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Setup Guide</span>
                                </div>
                                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                    Ensure your Google Maps API Key has &quot;Distance Matrix API&quot; and &quot;Places API&quot; enabled in the Google Cloud Console.
                                </p>
                                <a href="https://console.cloud.google.com" target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                                    Access Console <Zap size={10} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Status Monitoring */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                <Globe size={16} />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Webhook Status</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold text-slate-700">Payment Webhook</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Operational</span>
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Business Infrastructure */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <MessageCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900 leading-none">Customer Messaging</h4>
                                    <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white uppercase tracking-widest">Active Hybrid Sync</div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-1">Directly chat with customers on WhatsApp.</p>
                            </div>
                        </div>

                        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SOLO Managed Sync</span>
                            </div>
                            <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                                We&apos;ve already connected our world-class messaging service to your store. Fill this out only if you want to use your own business number.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <SecretField
                                label="Business Connector Key"
                                value={config.whatsappAccessToken}
                                onChange={(val) => setConfig({ ...config, whatsappAccessToken: val })}
                                placeholder="EAAG..."
                                hint="The main security key from your Meta portal."
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <SecretField
                                    label="Business Phone ID"
                                    value={config.whatsappPhoneId}
                                    onChange={(val) => setConfig({ ...config, whatsappPhoneId: val })}
                                    placeholder="1029..."
                                />
                                <SecretField
                                    label="Account Identifier"
                                    value={config.whatsappWabaId}
                                    onChange={(val) => setConfig({ ...config, whatsappWabaId: val })}
                                    placeholder="1045..."
                                />
                            </div>
                            <SecretField
                                label="Connection Verify Token"
                                value={config.whatsappVerifyToken}
                                onChange={(val) => setConfig({ ...config, whatsappVerifyToken: val })}
                                placeholder="solo_verify_..."
                                hint="Used to confirm the link between SOLO and Meta."
                            />
                        </div>
                    </div>
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
                            <span>Hardening...</span>
                        </div>
                    ) : saved ? (
                        <div className="flex items-center gap-2">
                            <Check size={18} strokeWidth={3} />
                            <span>Credentials Saved</span>
                        </div>
                    ) : (
                        "Save Integrations"
                    )}
                </button>
            </div>
        </div>
    );
};
