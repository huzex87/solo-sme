'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService, Order } from '@/services/orderService';
import {
    Truck,
    PackageCheck,
    Loader2,
    ArrowLeft,
    ClipboardList,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    ExternalLink,
    MessageCircle,
    MoreVertical,
    Clock,
    CheckCircle2,
    Ban,
    Globe,
    RotateCcw,
    Undo2
} from 'lucide-react';
import { PaymentService } from '@/services/paymentService';
import { formatCurrency, cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
    pending: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", description: "Awaiting payment or initial review." },
    paid: { label: "Paid", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", description: "Payment confirmed. Ready for processing." },
    processing: { label: "Processing", icon: Loader2, color: "text-blue-500", bg: "bg-blue-50", description: "Order is being prepared or awaiting driver." },
    dispatched: { label: "Dispatched", icon: Truck, color: "text-indigo-500", bg: "bg-indigo-50", description: "Order is en route to the customer." },
    delivered: { label: "Delivered", icon: PackageCheck, color: "text-primary", bg: "bg-primary/5", description: "Order successfully handed to customer." },
    cancelled: { label: "Cancelled", icon: Ban, color: "text-rose-500", bg: "bg-rose-50", description: "Order has been terminated." },
    refunded: { label: "Refunded", icon: ArrowLeft, color: "text-rose-600", bg: "bg-rose-50", description: "Payment has been returned to customer." },
    partially_refunded: { label: "Partial Refund", icon: ArrowLeft, color: "text-orange-500", bg: "bg-orange-50", description: "Partial payment returned to customer." },
};


export default function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const { can } = usePermissions();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrder(id);
                if (data) setOrder(data);
            } catch (e) {
                toast.error("Error fetching order");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleUpdateStatus = async (newStatus: Order['status']) => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const success = await OrderService.updateOrderStatus(order.id, newStatus);
            if (success) {
                setOrder({ ...order, status: newStatus });
                toast.success(`Order marked as ${newStatus}`);
            }
        } catch (e) {
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Decrypting Order Data...</p>
        </div>
    );

    if (!order) return (
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto">
                <Ban size={40} className="text-slate-200" />
            </div>
            <h2 className="text-2xl font-black text-slate-950 font-display">Order Not Found</h2>
            <button onClick={() => router.push('/dashboard/orders')} className="btn btn-primary">
                Return to Registry
            </button>
        </div>
    );

    const handleRefund = async () => {
        if (!order) return;
        if (!confirm('Are you sure you want to refund this order? This will reverse the transaction and update the ledger.')) return;

        setIsUpdating(true);
        try {
            const success = await PaymentService.refundPayment(order.id);
            if (success) {
                const updatedOrder = await OrderService.getOrder(order.id);
                if (updatedOrder) setOrder(updatedOrder);
                toast.success('Refund processed successfully');
            } else {
                toast.error('Refund failed. Check provider logs.');
            }
        } catch (e) {
            toast.error('Error processing refund');
        } finally {
            setIsUpdating(false);
        }
    };

    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 space-y-8 animate-entrance">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all shadow-soft-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-all flex items-center gap-2 shadow-soft-sm">
                        <ExternalLink size={12} />
                        View Invoice
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all shadow-soft-sm">
                        <MoreVertical size={18} />
                    </button>
                    {can('refund_order') && (order.status === 'paid' || order.status === 'delivered') && (
                        <button
                            onClick={handleRefund}
                            disabled={isUpdating}
                            className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-2 shadow-soft-sm"
                        >
                            <RotateCcw size={12} />
                            Refund Order
                        </button>
                    )}
                </div>
            </div>

            {/* Header / Identity Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-lg bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-premium">
                            #{order.id.slice(0, 8)}
                        </span>
                        <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", status.bg, status.color)}>
                            <status.icon size={12} />
                            {status.label}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-950 tracking-tighter font-display">Transaction Overview</h1>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {new Date(order.created_at).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-premium flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Total</p>
                        <p className="text-3xl font-black text-slate-950 font-display leading-none">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-100" />
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        order.channel === 'whatsapp' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>
                        {order.channel === 'whatsapp' ? <MessageCircle size={24} /> : <Globe size={24} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Order Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Items Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] shadow-premium overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-950 font-display">Manifest Details</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.items?.length || 0} LINE ITEMS</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-50">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                        <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(order.items as Array<{ name: string; sku?: string; quantity: number; price: number }>).map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/30 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-xs">
                                                        IMG
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-950 text-sm tracking-tight">{item.name || 'Unknown Product'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {item.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1 rounded-lg bg-slate-50 font-black text-slate-600 text-xs">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-slate-600 text-sm tracking-tight">
                                                {formatCurrency(item.price || 0)}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-slate-950 text-sm tracking-tight">
                                                {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-slate-50/30 space-y-3">
                            <div className="flex justify-end gap-12">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-bold text-slate-600 w-32 text-right">{formatCurrency(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-end gap-12">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (VAT 7.5%)</span>
                                <span className="text-sm font-bold text-slate-600 w-32 text-right">{formatCurrency(0)}</span>
                            </div>
                            <div className="flex justify-end gap-12 pt-3 border-t border-slate-100">
                                <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Grand Total</span>
                                <span className="text-xl font-black text-slate-950 font-display w-32 text-right">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Audit Log (Placeholder for Week 3) */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-950 font-display">Workflow History</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Audit</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-950 uppercase">Order Created</p>
                                    <p className="text-[11px] font-bold text-slate-400">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Status */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Customer Info Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Identity</h3>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View History</button>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center font-black text-white text-xl font-display uppercase">
                                {order.customer_name?.[0] || 'G'}
                            </div>
                            <div>
                                <h4 className="font-extrabold text-slate-950 tracking-tight">{order.customer_name || 'Guest'}</h4>
                                <p className="text-[11px] font-bold text-slate-400">Regular Patron</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                <Mail size={16} className="text-slate-300" />
                                {order.customer_email || 'No email provided'}
                            </div>
                            {order.customer_phone && (
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <Phone size={16} className="text-slate-300" />
                                    {order.customer_phone}
                                </div>
                            )}
                            {order.delivery_address && (
                                <div className="flex items-start gap-3 text-xs font-bold text-slate-600 leading-relaxed">
                                    <MapPin size={16} className="text-slate-300 mt-0.5" />
                                    {order.delivery_address}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Management Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fulfillment Pipeline</h3>

                        <div className={cn("p-6 rounded-2xl space-y-1 group relative overflow-hidden", status.bg)}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <status.icon size={48} />
                            </div>
                            <h4 className={cn("text-xs font-black uppercase tracking-widest", status.color)}>Currently: {status.label}</h4>
                            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed pr-8">
                                {status.description}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Update Registry Status</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleUpdateStatus(key as Order['status'])}
                                        disabled={isUpdating || order.status === key || !can('update_order_status')}
                                        className={cn(
                                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                                            order.status === key
                                                ? "bg-slate-950 text-white border-slate-950 shadow-soft-sm cursor-default"
                                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-950",
                                            !can('update_order_status') && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {key === 'delivered' && <PackageCheck size={12} />}
                                        {key === 'dispatched' && <Truck size={12} />}
                                        {key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 space-y-4">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                <CreditCard size={16} />
                                <span>
                                    {order.payment_method
                                        ? `Paid via ${order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}`
                                        : 'Payment method unknown'}
                                    {order.payment_ref ? ` · Ref: ${order.payment_ref}` : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
