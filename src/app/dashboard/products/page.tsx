"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Filter,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  category: string;
  image?: string;
}

// Replace with Supabase query: supabase.from("products").select("*").eq("tenant_id", tenantId)
const MOCK_PRODUCTS: Product[] = [];

const FILTERS = ["All", "Active", "Draft", "Out of Stock"] as const;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "Active" && p.status === "active") ||
      (filter === "Draft" && p.status === "draft") ||
      (filter === "Out of Stock" && p.status === "out_of_stock");
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your store inventory and listing details.</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn btn-primary px-6 py-2.5 rounded-xl shadow-sm self-start flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Add Product</span>
        </Link>
      </div>

      {/* Control Suite */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full md:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                filter === f
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="card text-center py-20 bg-white border-dashed border-2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
            <Package size={32} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed mb-8">
            Start adding your product inventory to see them listed here.
          </p>
          <Link
            href="/dashboard/products/new"
            className="btn btn-primary px-8 py-3 rounded-xl shadow-sm"
          >
            <Plus size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Add Your First Product</span>
          </Link>
        </div>
      )}

      {/* Product List */}
      {filtered.length > 0 && (
        <div className="table-container bg-white shadow-sm">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock</th>
                <th className="text-right">Price</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="group cursor-pointer hover:bg-slate-50 transition-colors">
                  <td>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        : <Package size={18} className="text-slate-300" />
                      }
                    </div>
                  </td>
                  <td className="font-semibold text-slate-900">{product.name}</td>
                  <td>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{product.category}</span>
                  </td>
                  <td>
                    <span className={cn(
                      "badge",
                      product.status === 'active' ? "badge-success" :
                        product.status === 'out_of_stock' ? "badge-danger" : "badge-info"
                    )}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="font-medium text-slate-600">{product.stock} units</td>
                  <td className="text-right font-bold text-slate-900">₦{product.price.toLocaleString()}</td>
                  <td className="text-right">
                    <button
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
