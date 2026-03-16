'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    CreditCard,
    ShoppingBag,
    Palette,
    ArrowRight,
    Sparkles,
    Loader2
} from 'lucide-react';
import { AuthService } from '@/services/authService';
import { ProductService } from '@/services/productService';
import { createClient } from '@/lib/supabase/client';
import { Tenant } from '@/types';

export default function WelcomeWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [hasPaystack, setHasPaystack] = useState(false);
    const [hasProducts, setHasProducts] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('Midnight');
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function checkStatus() {
            const profile = await AuthService.getProfile();
            if (!profile) {
                console.warn('[WelcomeWizard] Profile not found yet...');
                setLoading(false);
                return;
            }

            // Fetch active tenant
            const { data: tenantData } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', profile.tenant_id)
                .single();

            if (tenantData) {
                setTenant(tenantData);
                setHasPaystack(!!tenantData.business_config?.paystack_secret_key);
                if (tenantData.branding_config?.theme) {
                    setSelectedTheme(tenantData.branding_config.theme);
                }
            }

            // Check if products exist
            const products = await ProductService.getProducts(profile.tenant_id);
            if (products.length > 0) {
                setHasProducts(true);
            }

            setLoading(false);
        }
        checkStatus();
    }, [router]);

    const steps = [
        { title: 'Payments', icon: <CreditCard className="w-5 h-5" />, desc: 'Connect Paystack to accept payments.' },
        { title: 'Products', icon: <ShoppingBag className="w-5 h-5" />, desc: 'Add or verify your first items.' },
        { title: 'Style', icon: <Palette className="w-5 h-5" />, desc: 'Customize your store look & feel.' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0F172A]">
                <Loader2 className="w-8 h-8 text-[#00798C] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 md:p-12 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00798C]/10 border border-[#00798C]/20 mb-4">
                        <Sparkles size={14} className="text-[#9FD0D8]" />
                        <span className="text-xs font-medium text-[#9FD0D8] uppercase tracking-wider">Onboarding Wizard</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Welcome to SOLO, {tenant?.name || 'Partner'}!</h1>
                    <p className="text-gray-400">Let&apos;s get your store ready for your first customer in 3 simple steps.</p>
                </header>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
                    {steps.map((s, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step > i + 1 ? 'bg-emerald-500 border-emerald-500' :
                                step === i + 1 ? 'bg-[#00798C] border-[#00798C]' : 'bg-[#0a0a0a] border-white/10'
                                }`}>
                                {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step === i + 1 ? 'text-white' : 'text-gray-500'}`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="glass-elevated p-8 rounded-3xl border border-white/10 mb-8 min-h-[300px] flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">{steps[step - 1].title}</h2>
                        <p className="text-gray-400 mb-8">{steps[step - 1].desc}</p>

                        {step === 1 && (
                            <div className="space-y-4">
                                {hasPaystack ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
                                        <p className="text-sm text-emerald-300">✓ Your Paystack account is connected and ready to accept payments.</p>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-[#00798C]/5 border border-[#00798C]/10 mb-4">
                                        <p className="text-sm text-[#9FD0D8]">SOLO uses Paystack to process payments securely across Nigeria. Link your account to start selling.</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => router.push('/dashboard/settings')}
                                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    {hasPaystack ? 'Manage Payment Settings' : 'Connect Paystack Account'}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                {hasProducts ? (
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-sm text-emerald-300">We&apos;ve successfully imported products from your social media! Review them below.</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No products added yet.</p>
                                )}
                                <button className="w-full py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center" onClick={() => router.push('/dashboard/products')}>
                                    {hasProducts ? 'Review Imported Products' : 'Add Your First Product'}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid grid-cols-3 gap-4">
                                {['Midnight', 'Emerald', 'Sunset'].map(t => (
                                    <div
                                        key={t}
                                        onClick={() => setSelectedTheme(t)}
                                        className={`p-4 rounded-xl border transition-all text-center cursor-pointer ${selectedTheme === t
                                            ? 'bg-[#00798C]/20 border-[#00798C]'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`h-12 w-full rounded-md mb-2 ${t === 'Midnight' ? 'bg-slate-900' :
                                            t === 'Emerald' ? 'bg-emerald-900' : 'bg-orange-900'
                                            }`} />
                                        <span className="text-xs font-bold">{t}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-8">
                        <button
                            className="text-gray-500 hover:text-white transition-colors text-sm font-medium"
                            onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard')}
                        >
                            Skip for now
                        </button>
                        <button
                            disabled={saving}
                            className="px-8 py-3 bg-[#00798C] hover:bg-[#005F6E] rounded-xl font-bold flex items-center transition-all disabled:opacity-50"
                            onClick={async () => {
                                if (step < 3) {
                                    setStep(step + 1);
                                } else {
                                    setSaving(true);
                                    try {
                                        // Save settings and mark onboarding complete
                                        if (!tenant) throw new Error('Tenant context missing');
                                        await supabase
                                            .from('tenants')
                                            .update({
                                                branding_config: { ...tenant?.branding_config, theme: selectedTheme },
                                                ai_onboarding_completed: true
                                            })
                                            .eq('id', tenant.id);

                                        router.push('/dashboard');
                                    } catch (err) {
                                        console.error('Failed to finish onboarding', err);
                                    } finally {
                                        setSaving(false);
                                    }
                                }
                            }}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {step === 3 ? 'Finish Setup' : 'Continue'}
                            {!saving && <ArrowRight className="ml-2 w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-600">
                    Need help? <a href="#" className="underline">Chat with our support assistant</a>
                </p>
            </div>
        </div>
    );
}
