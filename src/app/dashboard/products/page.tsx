"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  ChevronRight,
  MessageCircle,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { ProductService, Product } from "@/services/productService";
import { toast } from "sonner";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import { exportToCSV } from "@/utils/csvExport";
import { Upload } from "lucide-react";
import { PageLoading } from "@/components/ui/LoadingIndicator";
import { ErrorState, EmptyState } from "@/components/ui/StatusStates";

const FILTERS = ["All", "Active", "Out of Stock"] as const;

export default function ProductsPage() {
  const { tenantId } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!tenantId) return;
    try {
      if (isInitialLoad) setLoading(true);
      setError(null);
      const data = await ProductService.getProducts(tenantId);
      setProducts(data);
    } catch (error) {
      console.error("[ProductsPage] Fetch error:", error);
      setError("We encountered an error while synchronizing your inventory catalog.");
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [tenantId, isInitialLoad]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku?.toLowerCase().includes(search.toLowerCase()));

    const matchFilter =
      filter === "All" ||
      (filter === "Active" && p.is_active) ||
      (filter === "Out of Stock" && p.stock_quantity <= 0);

    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const success = await ProductService.deleteProduct(id);
      if (success) {
        toast.success("Product deleted successfully");
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-premium">
              <Package size={20} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-display">Inventory</h1>
          </div>
          <p className="text-[13px] font-bold text-slate-400 tracking-tight ml-1">
            {products.length} products found in your catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(products as any, "inventory_export")}
            className="h-12 px-5 rounded-xl bg-white border border-slate-100 shadow-soft-sm flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Filter size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-12 px-5 rounded-xl bg-white border border-slate-100 shadow-soft-sm flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <Link
            href="/dashboard/products/new"
            className="h-12 px-6 rounded-xl bg-slate-950 text-white flex items-center gap-2 text-sm font-bold shadow-premium hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-950 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-14 bg-white border border-slate-100 rounded-2xl shadow-soft-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all border uppercase tracking-wider",
                filter === f
                  ? "bg-slate-950 border-slate-900 text-white shadow-premium"
                  : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-soft-sm"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <PageLoading />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search ? "No matching products" : "Your catalog is empty"}
          description={search ? `No products found matching "${search}". Try a different term.` : "Start building your digital inventory by adding your first product. We'll automatically sync it to your store and WhatsApp Assistant."}
          action={search ? { label: "Clear Search", onClick: () => setSearch("") } : { label: "Launch First Product", href: "/dashboard/products/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="group bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm hover:shadow-premium transition-all duration-500 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group-hover:scale-105 transition-transform duration-700">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Package size={32} />
                      </div>
                    )}
                    {product.stock_quantity <= 5 && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(product.id);
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-extrabold text-slate-950 font-display truncate leading-tight">{product.name}</h4>
                    {product.is_active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">{product.category || 'General'}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">SKU: {product.sku || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                  <p className="text-xl font-black text-slate-950 font-display">₦{product.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Stock</p>
                  <p className={cn(
                    "text-sm font-black uppercase tracking-tighter",
                    product.stock_quantity <= 0 ? "text-rose-500" :
                      product.stock_quantity <= 5 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {product.stock_quantity <= 0 ? "Out of Stock" : `${product.stock_quantity} Left`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
