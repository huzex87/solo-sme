"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, RotateCcw, Search, AlertCircle, CheckCircle2, Loader2, PackageOpen, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { RefundService, RefundReason } from "@/services/refundService";
import { OrderService, Order } from "@/services/orderService";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
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

export default function RefundsPage() {
  const router = useRouter();
  const { tenantId } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refundedOrders, setRefundedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"process" | "history">("process");

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState<RefundReason>("customer_request");
  const [refundNotes, setRefundNotes] = useState("");
  const [restoreInventory, setRestoreInventory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [all, refunded] = await Promise.all([
        OrderService.getOrders(tenantId),
        RefundService.getRefunds(tenantId),
      ]);
      const eligible = all.filter(o =>
        ["paid", "delivered", "processing", "dispatched", "partially_refunded"].includes(o.status)
      );
      setOrders(eligible);
      setRefundedOrders(refunded as Order[]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleSubmit = async () => {
    if (!selectedOrderId || !refundAmount || !tenantId) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Enter a valid refund amount"); return; }
    if (selectedOrder && amount > selectedOrder.total_amount) { toast.error("Refund amount cannot exceed order total"); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, amount, reason: refundReason, notes: refundNotes || undefined, restoreInventory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
      toast.success("Refund processed successfully");
      setSelectedOrderId(""); setRefundAmount(""); setRefundNotes(""); setRestoreInventory(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHistory = refundedOrders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95" aria-label="Go back">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Refund Management</h1>
          <p className="text-sm text-slate-500">Process and track order refunds</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["process", "history"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {tab === "process" ? "Process Refund" : `History (${refundedOrders.length})`}
          </button>
        ))}
      </div>

      {activeTab === "process" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
          {orders.length === 0 ? (
            <EmptyState icon={PackageOpen} title="No Eligible Orders" description="Only paid, dispatched, or delivered orders can be refunded." />
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Order</label>
                <select value={selectedOrderId} onChange={e => { setSelectedOrderId(e.target.value); const o = orders.find(o => o.id === e.target.value); if (o) setRefundAmount(String(o.total_amount)); }} className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all">
                  <option value="">Choose an order...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>#{o.id.slice(0, 8).toUpperCase()} — {o.customer_name} — {formatCurrency(o.total_amount)} ({o.status})</option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <ReceiptText size={18} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-slate-400">{selectedOrder.items?.length ?? 0} item(s) · {selectedOrder.channel ?? "online"}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 font-mono shrink-0">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refund Amount</label>
                <input type="number" min="1" step="0.01" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all font-mono" />
                {selectedOrder && refundAmount && parseFloat(refundAmount) < selectedOrder.total_amount && (
                  <p className="text-xs text-amber-600 font-medium">Partial refund — order will be marked as partially refunded</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
                <select value={refundReason} onChange={e => setRefundReason(e.target.value as RefundReason)} className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all">
                  {Object.entries(REASON_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes <span className="normal-case font-normal text-slate-400">(optional)</span></label>
                <textarea value={refundNotes} onChange={e => setRefundNotes(e.target.value)} placeholder="Additional context for this refund..." rows={3} className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white transition-all resize-none" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative shrink-0">
                  <input type="checkbox" className="sr-only" checked={restoreInventory} onChange={e => setRestoreInventory(e.target.checked)} />
                  <div className={cn("w-10 h-6 rounded-full transition-colors", restoreInventory ? "bg-primary" : "bg-slate-200")} />
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", restoreInventory ? "translate-x-5" : "translate-x-1")} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Restore inventory</p>
                  <p className="text-xs text-slate-400">Add returned items back to stock</p>
                </div>
              </label>

              <div className="flex gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium leading-relaxed">Refunds are recorded in the ledger and cannot be undone. Ensure the amount and reason are correct before submitting.</p>
              </div>

              <button onClick={handleSubmit} disabled={submitting || !selectedOrderId || !refundAmount} className="w-full h-12 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-40 active:scale-[0.98] flex items-center justify-center gap-2">
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><RotateCcw size={16} /> Process Refund</>}
              </button>
            </>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer or order ID..." className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all" />
          </div>
          {filteredHistory.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No Refunds Yet" description="Processed refunds will appear here." />
          ) : (
            <div className="space-y-2">
              {filteredHistory.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <RotateCcw size={16} className="text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{order.customer_name}</p>
                    <p className="text-xs text-slate-400">Order #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-rose-600 font-mono">{formatCurrency(order.total_amount)}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1", order.status === "refunded" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600")}>
                      {order.status === "refunded" ? "Refunded" : "Partial"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
