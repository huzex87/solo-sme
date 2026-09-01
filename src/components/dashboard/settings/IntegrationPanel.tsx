'use client';

import React, { useState } from 'react';
import { Zap, CreditCard, Map, Eye, EyeOff, Check, Loader2, Info, Globe, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsConfig } from '@/types';
import { toast } from 'sonner';

interface IntegrationPanelProps {
    config: SettingsConfig;
    setConfig: React.Dispatch<React.SetStateAction<SettingsConfig>>;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
    tenantId?: string;
}

const SecretField = ({ label, value, placeholder, onChange, hint }: {
    label: string; value: string; placeholder?: string; onChange: (val: string) => void; hint?: string;
}) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-slate-500">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-10 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
            {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
        </div>
    );
};

export const IntegrationPanel: React.FC<IntegrationPanelProps> = ({
    config,
    setConfig,
    onSave,
    saving,
    saved,
    tenantId
}) => {
    const [verifyingWA, setVerifyingWA] = useState(false);
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Integrations</h3>
                <p className="text-sm text-slate-500">Connect payment gateways, maps, and messaging services.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Payments */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" />
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Gateway</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setConfig({ ...config, preferredPaymentGateway: 'paystack' })}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium",
                                config.preferredPaymentGateway === 'paystack'
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            )}
                        >
                            Paystack
                            {config.preferredPaymentGateway === 'paystack' && <Check size={14} />}
                        </button>
                        <button
                            onClick={() => setConfig({ ...config, preferredPaymentGateway: 'flutterwave' })}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium",
                                config.preferredPaymentGateway === 'flutterwave'
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            )}
                        >
                            Flutterwave
                            {config.preferredPaymentGateway === 'flutterwave' && <Check size={14} />}
                        </button>
                    </div>

                    {/* Paystack */}
                    <div className={cn("space-y-3 transition-opacity", config.preferredPaymentGateway !== 'paystack' && "opacity-30 pointer-events-none")}>
                        <p className="text-xs font-medium text-slate-600">Paystack Keys</p>
                        <SecretField label="Public Key" value={config.paystackPublicKey} onChange={(val) => setConfig({ ...config, paystackPublicKey: val })} placeholder="pk_live_..." />
                        <SecretField label="Secret Key" value={config.paystackSecretKey} onChange={(val) => setConfig({ ...config, paystackSecretKey: val })} placeholder="sk_live_..." />
                    </div>

                    {/* Flutterwave */}
                    <div className={cn("space-y-3 transition-opacity", config.preferredPaymentGateway !== 'flutterwave' && "opacity-30 pointer-events-none")}>
                        <p className="text-xs font-medium text-slate-600">Flutterwave Keys</p>
                        <SecretField label="Public Key" value={config.flutterwavePublicKey} onChange={(val) => setConfig({ ...config, flutterwavePublicKey: val })} placeholder="FLWPUBK_..." />
                        <SecretField label="Secret Key" value={config.flutterwaveSecretKey} onChange={(val) => setConfig({ ...config, flutterwaveSecretKey: val })} placeholder="FLWSECK_..." />
                    </div>
                </div>

                {/* Maps & WhatsApp */}
                <div className="space-y-5">
                    {/* Google Maps */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Map size={16} className="text-slate-400" />
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipping & Distance</h4>
                        </div>
                        <SecretField
                            label="Google Maps API Key"
                            value={config.googleMapsKey}
                            onChange={(val) => setConfig({ ...config, googleMapsKey: val })}
                            placeholder="AIzaSy..."
                            hint="Required for automatic delivery fee calculation."
                        />
                        <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <Info size={13} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Enable &quot;Distance Matrix API&quot; and &quot;Places API&quot; in your{' '}
                                <a href="https://console.cloud.google.com" target="_blank" className="text-primary hover:underline">Google Cloud Console</a>.
                            </p>
                        </div>
                    </div>

                    {/* Webhook Status */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium text-slate-600">Payment Webhooks</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Active</span>
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={16} className="text-slate-400" />
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp Business</h4>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!config.whatsappAccessToken || !config.whatsappPhoneId) {
                                        toast.error("Please enter Access Token and Phone ID first.");
                                        return;
                                    }
                                    const testPhone = window.prompt("Enter a phone number to send a test message to (e.g. 08123456789):");
                                    if (!testPhone) return;

                                    setVerifyingWA(true);
                                    try {
                                        const res = await fetch('/api/whatsapp/verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                tenantId: tenantId,
                                                phone: testPhone,
                                                credentials: {
                                                    accessToken: config.whatsappAccessToken,
                                                    phoneNumberId: config.whatsappPhoneId
                                                }
                                            })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            toast.success("Test message sent! Check your phone.");
                                        } else {
                                            toast.error(data.error || "Verification failed. Check your tokens.");
                                        }
                                    } catch (err) {
                                        toast.error("Failed to reach verification service.");
                                    } finally {
                                        setVerifyingWA(false);
                                    }
                                }}
                                disabled={verifyingWA}
                                className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors flex items-center gap-1 uppercase tracking-tight"
                            >
                                {verifyingWA ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                                Verify & Test
                            </button>
                        </div>
                        <div className="flex items-start gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                            <Info size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-emerald-700 leading-relaxed">
                                SOLO messaging is pre-connected. Only fill these if you want to use your own business number.
                            </p>
                        </div>
                        <SecretField label="Access Token" value={config.whatsappAccessToken} onChange={(val) => setConfig({ ...config, whatsappAccessToken: val })} placeholder="EAAG..." hint="From your Meta Business portal." />
                        <div className="grid grid-cols-2 gap-3">
                            <SecretField label="Phone Number ID" value={config.whatsappPhoneId} onChange={(val) => setConfig({ ...config, whatsappPhoneId: val })} placeholder="15-digit ID, e.g. 102954…" hint="Meta → WhatsApp → API Setup. This is a long numeric ID — NOT your phone number." />
                            <SecretField label="WABA ID" value={config.whatsappWabaId} onChange={(val) => setConfig({ ...config, whatsappWabaId: val })} placeholder="15-digit ID, e.g. 104512…" hint="WhatsApp Business Account ID from the same API Setup page — not your phone number." />
                        </div>
                        <SecretField label="Verify Token" value={config.whatsappVerifyToken} onChange={(val) => setConfig({ ...config, whatsappVerifyToken: val })} placeholder="solo_verify_..." />
                    </div>
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
                        "Save Integrations"
                    )}
                </button>
            </div>
        </div>
    );
};
