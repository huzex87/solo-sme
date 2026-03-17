"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageCircle,
  Globe,
  ChevronRight,
  Filter,
  Truck,
  PackageCheck,
  Ban,
  Archive
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { OrderService, Order } from "@/services/orderService";
import { toast } from "sonner";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState, EmptyState } from "@/components/ui/StatusStates";

type OrderFilterStatus = "all" | Order['status'];

const TABS: { label: string; value: OrderFilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Delivered", value: "delivered" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  paid: { label: "Paid", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  processing: { label: "Processing", icon: Loader2, color: "text-blue-500", bg: "bg-blue-50" },
  dispatched: { label: "Dispatched", icon: Truck, color: "text-indigo-500", bg: "bg-indigo-50" },
  delivered: { label: "Delivered", icon: PackageCheck, color: "text-primary", bg: "bg-primary/5" },
  cancelled: { label: "Cancelled", icon: Ban, color: "text-rose-500", bg: "bg-rose-50" },
  abandoned: { label: "Abandoned", icon: Archive, color: "text-slate-400", bg: "bg-slate-50" },
};

export default function OrdersPage() {
  const { tenantId } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrders(tenantId);
      setOrders(data);
    } catch (e) {
      setError("We were unable to retrieve your orders at this time. Please check your connection.");
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "all" || o.status === activeTab;
    const matchSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(o => o.id));
    }
  };

  const handleBulkUpdate = async (status: Order['status']) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const success = await OrderService.updateBulkOrders(selectedIds, status);
      if (success) {
        toast.success(`Successfully updated ${selectedIds.length} orders to ${status}`);
        setSelectedIds([]);
        await fetchOrders();
      } else {
        toast.error("Bulk update failed partially");
      }
    } catch (e) {
      toast.error("Error performing bulk update");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-premium">
              <ShoppingBag size={20} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-display">Active Orders</h1>
          </div>
          <p className="text-[13px] font-bold text-slate-400 tracking-tight ml-1">
            Managing {orders.length} current merchant orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-12 px-5 rounded-xl bg-white border border-slate-100 shadow-soft-sm flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Control & Tab Bar */}
      <div className="space-y-6">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-950 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name or Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-14 bg-white border border-slate-100 rounded-2xl shadow-soft-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {TABS.map((tab) => {
            const count = tab.value === "all" ? orders.length : orders.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all border flex items-center gap-3 uppercase tracking-wider",
                  activeTab === tab.value
                    ? "bg-slate-950 border-slate-900 text-white shadow-premium"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-soft-sm"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tighter",
                    activeTab === tab.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <PageLoading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={search ? "No matching orders" : "No orders yet"}
          description={search ? `No orders found matching "${search}". Try a different term or clear filters.` : "When customers complete a checkout on your store or via WhatsApp, they'll appear here instantly."}
          action={search ? { label: "Clear Search", onClick: () => setSearch("") } : undefined}
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] shadow-premium overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
              const isSelected = selectedIds.includes(order.id);

              return (
                <div key={order.id} className={cn(
                  "group flex items-center hover:bg-slate-50/50 transition-all",
                  isSelected && "bg-primary/[0.02]"
                )}>
                  <div className="pl-8">
                    <button
                      onClick={() => toggleSelect(order.id)}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                        isSelected
                          ? "bg-slate-950 border-slate-950 text-white"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {isSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex-1 p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-300 font-display text-lg group-hover:bg-white group-hover:scale-105 transition-all">
                        {order.customer_name?.[0] || 'G'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-extrabold text-slate-950 font-display leading-none">{order.customer_name || 'Guest Customer'}</h4>
                          <span className="font-mono text-[10px] font-extrabold text-slate-300 uppercase leading-none mt-0.5">#{order.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest leading-none">
                            {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{order.items?.length || 0} ITEMS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right hidden md:block">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center",
                            order.channel === 'whatsapp' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {order.channel === 'whatsapp' ? <MessageCircle size={12} /> : <Globe size={12} />}
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            order.channel === 'whatsapp' ? "text-emerald-600" : "text-blue-600"
                          )}>
                            {order.channel || 'online'}
                          </span>
                        </div>
                        <div className="font-black text-xl text-slate-950 font-display leading-none">{formatCurrency(order.total_amount)}</div>
                      </div>

                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider shadow-sm min-w-[130px] justify-center",
                        config.bg, config.color, "border-current/10"
                      )}>
                        <config.icon size={14} strokeWidth={3} />
                        {config.label}
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-50 shadow-soft-sm flex items-center justify-center text-slate-200 group-hover:text-slate-950 transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="bg-slate-950 text-white rounded-[24px] px-8 py-5 shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-4 border-r border-white/10 pr-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black">
                {selectedIds.length}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected</p>
                <p className="text-sm font-bold">Orders Ready</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkUpdate('paid')}
                disabled={isBulkProcessing}
                className="h-11 px-6 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                Mark Paid
              </button>
              <button
                onClick={() => handleBulkUpdate('dispatched')}
                disabled={isBulkProcessing}
                className="h-11 px-6 rounded-xl bg-white/10 hover:bg-indigo-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Truck size={14} />
                Ship items
              </button>
              <button
                onClick={() => handleBulkUpdate('cancelled')}
                disabled={isBulkProcessing}
                className="h-11 px-6 rounded-xl bg-white/10 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Ban size={14} />
                Cancel
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="ml-4 text-slate-500 hover:text-white transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
