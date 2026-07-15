'use client';

import React, { useState } from 'react';
import { CreditCard, Check, ShieldAlert, Sparkles, Zap, Award, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

export const BillingPanel: React.FC = () => {
    const { tenant, tenantId } = useTenant();
    const [submitting, setSubmitting] = useState<string | null>(null);

    const currentTier = (tenant?.platform_tier?.toLowerCase() || 'starter') as 'starter' | 'growth' | 'enterprise';

    const tiers = [
        {
            id: 'starter',
            name: 'Starter Plan',
            price: '₦0',
            frequency: 'forever',
            description: 'Essential tools for small shops starting their digital journey.',
            icon: Zap,
            color: 'text-slate-400',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            features: [
                'Up to 20 active products',
                'Basic sales reporting',
                'WhatsApp catalog checkout',
                'Standard checkout page (subdomain)',
                '1 staff account'
            ]
        },
        {
            id: 'growth',
            name: 'Growth Plan',
            price: '₦9,900',
            frequency: 'month',
            description: 'Scale your business with AI operations and custom branding.',
            icon: Sparkles,
            color: 'text-teal-600',
            bg: 'bg-teal-500/5',
            border: 'border-teal-500/20',
            highlight: true,
            features: [
                'Unlimited products',
                'Amina AI assistant & sales forecasting',
                'Custom domain mapping (e.g. yourname.ng)',
                'Automated dispute & invoice system',
                'Up to 5 staff accounts',
                'Paystack Subaccount auto-settlement'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise Plan',
            price: '₦49,900',
            frequency: 'month',
            description: 'For mature SMEs requiring dedicated APIs and scale.',
            icon: Award,
            color: 'text-amber-500',
            bg: 'bg-amber-500/5',
            border: 'border-amber-500/20',
            features: [
                'Dedicated Meta WhatsApp API account',
                'Advanced Loyalty HQ & VIP rewards',
                'SLA support with designated agent',
                'Multi-location inventory tracking',
                'Unlimited staff accounts',
                'Custom integrations support'
            ]
        }
    ];

    const handleUpgrade = async (tierId: string) => {
        if (tierId === 'starter') {
            toast.info('You are already on the Starter plan.');
            return;
        }

        setSubmitting(tierId);
        toast.loading(`Initializing upgrade to ${tierId === 'growth' ? 'Growth' : 'Enterprise'} plan...`, { id: 'billing-upgrade' });

        try {
            const res = await fetch('/api/payments/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    tier: tierId
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to initialize subscription checkout.');
            }

            const data = await res.json();
            if (data.checkoutUrl) {
                toast.success('Redirecting to Paystack Secure Checkout...', { id: 'billing-upgrade' });
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned.');
            }
        } catch (error) {
            console.error('[Billing Panel Upgrade Error]:', error);
            toast.error(error instanceof Error ? error.message : 'Upgrade initialization failed', { id: 'billing-upgrade' });
            setSubmitting(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Billing & Subscriptions</h3>
                <p className="text-sm text-slate-500">Upgrade your tier to unlock advanced features like custom domains, AI, and VIP loyalty programs.</p>
            </div>

            {/* Current Tier Alert */}
            <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 flex items-center gap-3">
                <CreditCard className="text-primary shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                        Current Tier: <span className="capitalize text-primary font-bold">{currentTier}</span>
                    </p>
                    <p className="text-xs text-slate-500">Your tier dictates inventory limits, API access, and transaction capabilities.</p>
                </div>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {tiers.map((t) => {
                    const Icon = t.icon;
                    const isCurrent = currentTier === t.id;
                    const isUpgradeable = !isCurrent && t.id !== 'starter';

                    return (
                        <div
                            key={t.id}
                            className={cn(
                                "rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all",
                                t.highlight ? "shadow-md ring-1 ring-primary/20" : "",
                                isCurrent ? "bg-slate-50/50 border-slate-300" : "bg-white hover:border-slate-300"
                            )}
                        >
                            {isCurrent && (
                                <div className="absolute top-3 right-3 bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                                    Active
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className={cn("p-1.5 rounded-lg bg-slate-100", t.color)}>
                                        <Icon size={16} />
                                    </div>
                                    <h4 className="font-bold text-slate-950 text-base">{t.name}</h4>
                                </div>

                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-extrabold text-slate-950 font-display">{t.price}</span>
                                    <span className="text-xs text-slate-500">/ {t.frequency}</span>
                                </div>

                                <p className="text-xs text-slate-500 mb-5 leading-relaxed">{t.description}</p>

                                <div className="space-y-2 mb-6">
                                    {t.features.map((f, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                            <Check className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleUpgrade(t.id)}
                                disabled={isCurrent || submitting !== null}
                                className={cn(
                                    "w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                                    isCurrent 
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                        : "bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]",
                                    submitting === t.id && "opacity-80"
                                )}
                            >
                                {submitting === t.id ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : isCurrent ? (
                                    "Current Tier"
                                ) : (
                                    `Upgrade to ${t.name.split(' ')[0]}`
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
