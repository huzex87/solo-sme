'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CurrencyService } from '@/services/currencyService';
import { Loader2, CreditCard, ShieldCheck, CheckCircle2, MessageCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/baseUrl';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderDetail {
    id: string;
    tenant_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    status: string;
    currency?: string;
    items?: OrderItem[];
    tenant?: {
        name: string;
        currency: string;
        business_config?: {
            preferred_payment_gateway?: 'paystack' | 'flutterwave';
            paystack_public_key?: string;
            flutterwave_public_key?: string;
        };
    };
}

export default function OrderPaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: orderId } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        async function fetchOrder() {
            setLoading(true);
            try {
                const supabase = createClient();
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select('*, tenant:tenants(name, currency, business_config)')
                    .eq('id', orderId)
                    .single();

                if (orderError || !orderData) {
                    console.error('Failed to load order', orderError);
                    toast.error('Could not load order details');
                } else {
                    setOrder(orderData as unknown as OrderDetail);
                }
            } catch (err) {
                console.error('Fetch order error', err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [orderId]);

    const handlePayment = async () => {
        if (!order || !order.tenant) return;
        setIsProcessing(true);
        try {
            const provider = order.tenant.business_config?.preferred_payment_gateway || 'paystack';
            const res = await fetch(`${getBaseUrl()}/api/payments/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: order.total_amount,
                    email: order.customer_email || 'buyer@solosme.ng',
                    provider: provider,
                    metadata: {
                        orderId: order.id,
                        tenantId: order.tenant_id,
                        phone: order.customer_phone,
                        name: order.customer_name
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.authorization_url) {
                    window.location.href = data.authorization_url;
                    return;
                }
            }
            
            const errData = await res.json().catch(() => ({ error: 'Payment initialization failed' }));
            toast.error(errData.error || 'Payment initialization failed');
        } catch (err) {
            console.error('Payment error', err);
            toast.error('Could not connect to payment gateway. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Resolving payment link...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
                <div className="w-16 h-16 bg-red-950 border border-red-500 rounded-full flex items-center justify-center mb-6 text-red-400">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
                <p className="text-slate-400 max-w-sm mb-6">We could not retrieve any active checkout details for this reference code.</p>
                <button onClick={() => router.push('/')} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-sm font-semibold">
                    Back to Platform
                </button>
            </div>
        );
    }

    if (order.status === 'paid') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
                <div className="w-16 h-16 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mb-6 text-emerald-400">
                    <CheckCircle2 size={32} />
                </div>
                <h1 className="text-xl font-bold mb-2">Order Already Paid</h1>
                <p className="text-slate-400 max-w-sm mb-6">Payment for this order has already been processed and verified successfully.</p>
                <button onClick={() => router.push(`/receipt/${orderId}`)} className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl transition-all text-sm font-bold">
                    View Verified Receipt
                </button>
            </div>
        );
    }

    const currency = order.tenant?.currency || 'NGN';

    return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 md:p-8">
            <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/30 text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-4">
                        <ShieldCheck size={12} /> SECURE GATEWAY
                    </div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pay To</h2>
                    <h1 className="text-xl font-black text-white">{order.tenant?.name}</h1>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl p-5 mb-6">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Order Summary</h3>
                    <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div>
                                    <div className="font-semibold text-white">{item.name}</div>
                                    <div className="text-[11px] text-slate-500">Qty: {item.quantity}</div>
                                </div>
                                <div className="font-mono text-slate-300">{CurrencyService.format(item.price * item.quantity, currency)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-slate-800/60 mt-4 pt-4 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Amount</span>
                        <span className="text-xl font-black text-teal-400 font-mono">{CurrencyService.format(order.total_amount, currency)}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/40 text-slate-950 rounded-2xl font-black tracking-wide hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isProcessing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CreditCard size={18} />
                                Pay {CurrencyService.format(order.total_amount, currency)}
                            </>
                        )}
                    </button>

                    <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={12} className="text-teal-500" /> Secure checkout verified by SOLO SME.
                    </div>
                </div>
            </div>
        </main>
    );
}
