"use client";

import { useState, useEffect, useCallback } from "react";
import { RotateCcw, Search, Loader2, AlertCircle, CheckCircle2, PackageCheck, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { OrderService, Order } from "@/services/orderService";
import { RefundService, RefundReason } from "@/services/refundService";
import { toast } from "sonner";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { EmptyState } from "@/components/ui/StatusStates";

const REASON_LABELS: Record<RefundReason, string> = {
    customer_request: "Customer Request",
    damaged_item: "Damaged Item",
    wrong_item: "Wrong Item Sent",
    not_delivered: "Not Delivered",
    duplicate_order: "Duplicate Order",
    other: "Other",
};

interface RefundModalProps {
    order: Order;
    onClose: () => void;
    onSuccess: () => void;
    tenantId: string;
}

function RefundModal({ order, onClose, onSuccess, tenantId }: RefundModalProps) {
    const [amount, setAmount] = useState(String(order.total_amount));
    const [reason, setReason] = useState<RefundReason>("customer_request");
    const [notes, setNotes] = useState("");
    const [restoreInventory, setRestoreInventory] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            toast.error("Enter a valid refund amount");
            return;
        }
        if (parsedAmount > order.total_amount) {
            toast.error(`Refund cannot exceed order total of ${formatCurrency(order.total_amount)}`);
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/refund`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId, amount: parsedAmount, reason, notes, restoreInventory }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Refund failed");
            toast.success("Refund processed successfully");
            onSuccess();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Refund failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Process Refund</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Order #{order.id.slice(0, 8)} &mdash; {order.customer_name}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Refund Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₦</span>
                            <input
                                type="number"
                                className="w-full pl-7 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min="1"
                                max={order.total_amount}
                                step="0.01"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Max: {formatCurrency(order.total_amount)}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Reason
                        </label>
                        <select
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all bg-white"
                            value={reason}
                            onChange={e => setReason(e.target.value as RefundReason)}
                            required
                        >
                            {(Object.entries(REASON_LABELS) as [RefundReason, string][]).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Notes (optional)
                        </label>
                        <textarea
                            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Additional context..."
                        />
                    </div>

                    {order.channel !== 'pos' && (
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                checked={restoreInventory}
                                onChange={e => setRestoreInventory(e.target.checked)}
                            />
                            <span className="text-sm text-slate-700">Restore items to inventory</span>
                        </label>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-2.5 text-sm font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
                            {processing ? "Processing..." : "Confirm Refund"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const REFUNDABLE_STATUSES: Order['status'][] = ['paid', 'delivered', 'processing', 'dispatched', 'partially_refunded'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    refunded: { label: "Refunded", color: "text-rose-600", bg: "bg-rose-50" },
    partially_refunded: { label: "Partial Refund", color: "text-orange-600", bg: "bg-orange-50" },
    paid: { label: "Paid", color: "text-emerald-600", bg: "bg-emerald-50" },
    delivered: { label: "Delivered", color: "text-primary", bg: "bg-primary/5" },
    processing: { label: "Processing", color: "text-blue-600", bg: "bg-blue-50" },
    dispatched: { label: "Dispatched", color: "text-indigo-600", bg: "bg-indigo-50" },
};

export default function RefundsPage() {
    const { tenantId } = useTenant();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"eligible" | "refunded">("eligible");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const all = await OrderService.getOrders(tenantId);
            setOrders(all);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleRefundSuccess = () => {
        setSelectedOrder(null);
        fetchOrders();
    };

    const filtered = orders.filter(o => {
        const matchesSearch =
            o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase());
        if (activeTab === "eligible") return matchesSearch && REFUNDABLE_STATUSES.includes(o.status);
        return matchesSearch && (o.status === "refunded" || o.status === "partially_refunded");
    });

    const refundedTotal = orders
        .filter(o => o.status === "refunded" || o.status === "partially_refunded")
        .length;

    if (loading) return <PageLoading />;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Refund Management</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Process refunds and view refund history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-100 text-center">
                        <div className="text-lg font-black text-rose-600">{refundedTotal}</div>
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Refunded</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by customer name or order ID..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white">
                    {(["eligible", "refunded"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-2.5 text-sm font-semibold capitalize transition-all",
                                activeTab === tab
                                    ? "bg-primary text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {tab === "eligible" ? "Eligible for Refund" : "Refunded"}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={activeTab === "eligible" ? AlertCircle : CheckCircle2}
                    title={activeTab === "eligible" ? "No refundable orders" : "No refunds yet"}
                    description={activeTab === "eligible"
                        ? "Paid, dispatched, or delivered orders will appear here."
                        : "Processed refunds will appear here."}
                />
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                {activeTab === "eligible" && (
                                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(order => {
                                const statusCfg = STATUS_CONFIG[order.status];
                                return (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-slate-600">#{order.id.slice(0, 8)}</td>
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-900">{order.customer_name}</div>
                                            <div className="text-xs text-slate-400">{order.customer_email}</div>
                                        </td>
                                        <td className="px-5 py-4 font-mono font-bold text-slate-900">{formatCurrency(order.total_amount)}</td>
                                        <td className="px-5 py-4">
                                            {statusCfg ? (
                                                <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", statusCfg.color, statusCfg.bg)}>
                                                    {statusCfg.label}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 capitalize">{order.status}</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        {activeTab === "eligible" && (
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-all active:scale-95"
                                                >
                                                    <RotateCcw size={12} />
                                                    Refund
                                                </button>
                                            </td>
                                        )}
                                        {activeTab === "refunded" && (
                                            <td className="px-5 py-4 text-right">
                                                <PackageCheck size={16} className="inline text-rose-400" />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && tenantId && (
                <RefundModal
                    order={selectedOrder}
                    tenantId={tenantId}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={handleRefundSuccess}
                />
            )}
        </div>
    );
}
