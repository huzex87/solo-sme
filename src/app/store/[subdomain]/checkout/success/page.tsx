'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PaymentService } from '@/services/paymentService';
import { TenantService, Tenant } from '@/services/tenantService';
import { CheckCircle, MessageCircle, ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [tenant, setTenant] = useState<Tenant | null>(null);

    useEffect(() => {
        async function verify() {
            // 1. Fetch Tenant
            const tenantData = await TenantService.getTenantBySubdomain(subdomain);
            if (tenantData) setTenant(tenantData);

            // 2. Verify Payment if reference exists
            if (reference && tenantData) {
                try {
                    // Note: verifyPayment updates the order status and ledger
                    // We call it here as a client-side "confirm" but the webhook usually beats us
                    const success = await PaymentService.verifyPayment(
                        reference,
                        'paystack',
                        '', // orderId is handled via reference lookup in backend if possible, 
                        // but here we primarily care about the UI feedback.
                        tenantData.id
                    );
                    setStatus(success ? 'success' : 'error');
                } catch (err) {
                    console.error('Verification failed', err);
                    setStatus('error');
                }
            } else if (!reference) {
                // No reference might mean it was a COD or 0-amount order
                setStatus('success');
            }
        }
        verify();
    }, [subdomain, reference]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-medium text-slate-600">Verifying your payment...</h2>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <ArrowLeft size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Delayed</h1>
                <p className="text-slate-500 mb-8">
                    We couldn&apos;t instantly confirm your payment. Don&apos;t worry, our system will sync with Paystack shortly. Check your email for confirmation.
                </p>
                <div className="flex flex-col w-full gap-3">
                    <button
                        onClick={() => router.push(`/store/${subdomain}`)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all"
                    >
                        Back to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto text-center px-4">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 text-emerald-500 relative">
                <div className="absolute inset-0 bg-emerald-400 opacity-20 rounded-full animate-ping"></div>
                <CheckCircle size={48} className="relative z-10" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Order Confirmed!</h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                Thank you for shopping with <span className="font-bold text-slate-900">{tenant?.name}</span>.
                Your order is being prepared and a confirmation has been sent to your email.
            </p>

            <div className="w-full bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Payment Reference</span>
                    <span className="font-mono text-slate-900">{reference?.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Method</span>
                    <span className="text-slate-900 font-medium">Paystack Secure Checkout</span>
                </div>
            </div>

            <div className="flex flex-col w-full gap-4">
                <button
                    onClick={() => router.push(`/store/${subdomain}`)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all transform active:scale-[0.98]"
                >
                    <ShoppingBag size={20} />
                    <span>Continue Shopping</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions?</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <a
                    href={`https://wa.me/${(tenant?.business_config?.whatsapp_number || tenant?.business_config?.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-200 transition-all transform active:scale-[0.98]"
                >
                    <MessageCircle size={20} fill="currentColor" />
                    <span>Chat with Merchant</span>
                </a>
            </div>

            <p className="mt-12 text-[11px] text-slate-400 font-medium tracking-wide">
                Securely processed by SOLO SME · High-Fidelity Commerce
            </p>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
