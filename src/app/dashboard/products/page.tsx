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
  ImageOff,
  Filter,
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

const STATUS_STYLES: Record<Product["status"], { label: string; class: string }> = {
  active: { label: "Active", class: "bg-emerald-50 text-emerald-600" },
  draft: { label: "Draft", class: "bg-gray-100 text-gray-500" },
  out_of_stock: { label: "Out of Stock", class: "bg-red-50 text-red-500" },
};

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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-t1 text-xl font-bold tracking-tight">Products</h2>
          <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1">Manage your business catalogue</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-primary-dk transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add New Product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="space-y-3 px-1">
        <div className="relative group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-t4 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, SKU, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder-t4 text-t1 font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border-none",
                filter === f
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-t3 hover:text-t1 hover:shadow-sm",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state (Institutional Mastery) */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-[32px] shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-lt/30 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
              <Package size={32} className="text-primary" />
            </div>
            <h3 className="text-t1 font-bold text-lg mb-2">No products in catalogue</h3>
            <p className="text-t3 text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed mb-8">
              Launch your business presence. Adding products enables WhatsApp AI orchestration and online storefront availability instantly.
            </p>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-primary-dk transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95"
            >
              <Plus size={18} />
              Add your first product
            </Link>
          </div>
        </div>
      )}

      {/* Product table (Institutional Silhouette) */}
      {filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((product) => {
            const s = STATUS_STYLES[product.status];
            return (
              <div
                key={product.id}
                className="bg-white p-4 rounded-[22px] shadow-sm hover:shadow-md transition-all group flex items-center justify-between border-none"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 shadow-inner flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      : <Package size={20} className="text-t4" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-t1 text-sm font-bold truncate leading-tight mb-1">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-t3 text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                      <span className="w-1 h-1 rounded-full bg-t4" />
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                        product.status === 'active' ? "bg-green-dim text-green" :
                          product.status === 'out_of_stock' ? "bg-danger-lt text-danger" : "bg-surface-2 text-t3"
                      )}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <p className="text-t1 text-sm font-extrabold font-mono tracking-tighter">₦{product.price.toLocaleString()}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                      product.stock === 0 ? "text-danger" : "text-t4"
                    )}>
                      {product.stock} Units left
                    </p>
                  </div>

                  <div className="sm:hidden text-right">
                    <p className="text-t1 text-sm font-bold">₦{product.price.toLocaleString()}</p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-t4 hover:text-primary hover:bg-primary-lt transition-all active:scale-90"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 top-11 z-20 bg-white/80 backdrop-blur-xl border-none rounded-[18px] shadow-2xl py-2 w-44 animate-entrance">
                        <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-t2 hover:bg-primary-lt hover:text-primary transition-colors">
                          <Edit2 size={14} /> Edit Product
                        </Link>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-t2 hover:bg-primary-lt hover:text-primary transition-colors">
                          <Eye size={14} /> Store Preview
                        </button>
                        <div className="h-px bg-surface-2 mx-2 my-1" />
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger-lt transition-colors">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
