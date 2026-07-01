"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { ProductService, Product } from "@/services/productService";
import { toast } from "sonner";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import { exportToCSV } from "@/utils/csvExport";
import { Upload, Instagram } from "lucide-react";
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!tenantId) return;
    try {
      if (isInitialLoad) setLoading(true);
      setError(null);
      const data = await ProductService.getProducts(tenantId);
      setProducts(data);
    } catch {
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
    const name = p.name || "Untitled Product";
    const sku = p.sku || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Active" && p.is_active) ||
      (filter === "Out of Stock" && (p.stock_quantity || 0) <= 0);

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
    } catch {
      toast.error("An error occurred during deletion");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 md:space-y-8 pb-32 lg:pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-premium">
              <Package size={18} />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-950 tracking-tight font-display">Inventory</h1>
              <p className="text-[11px] md:text-[13px] font-medium text-slate-500 tracking-tight">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/products/new"
            className="h-10 md:h-12 px-4 md:px-6 rounded-xl bg-slate-950 text-white flex items-center gap-2 text-sm font-bold shadow-premium hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => exportToCSV(products as unknown as Record<string, unknown>[], "inventory_export")}
            className="h-9 px-3 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
          >
            <Filter size={14} />
            Export
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-3 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
          >
            <Upload size={14} />
            Import
          </button>
          <Link
            href="/dashboard/import"
            className="h-9 px-3 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all whitespace-nowrap shrink-0"
          >
            <Instagram size={14} className="text-pink-500" />
            Social Import
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="space-y-3">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-950 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-12 md:h-14 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-semibold text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border uppercase tracking-wider shrink-0",
                filter === f
                  ? "bg-slate-950 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="group bg-white border border-slate-100 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-soft-sm hover:shadow-premium transition-all duration-500 relative flex flex-col justify-between active:scale-[0.98]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group-hover:scale-105 transition-transform duration-700">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="80px" />
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

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === product.id ? null : product.id);
                      }}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex items-center justify-center"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === product.id && (
                      <div className="absolute right-0 top-12 z-20 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 size={14} />
                          Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(null);
                            handleDelete(product.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-extrabold text-slate-950 font-display truncate leading-tight">{product.name || 'Untitled Product'}</h4>
                    {product.is_active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{product.category || 'General'}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[11px] font-semibold text-slate-400 tracking-wide">SKU: {product.sku || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Price</p>
                  <p className="text-xl font-bold text-slate-950 font-display">{formatCurrency(product.price || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Stock</p>
                  <p className={cn(
                    "text-sm font-black uppercase tracking-tighter",
                    (product.stock_quantity || 0) <= 0 ? "text-rose-500" :
                      (product.stock_quantity || 0) <= 5 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {(product.stock_quantity || 0) <= 0 ? "Out of Stock" : `${product.stock_quantity || 0} Left`}
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
