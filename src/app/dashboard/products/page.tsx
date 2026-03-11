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
    <div className="space-y-8 animate-entrance">

      {/* Header — Institutional Standard */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-t1 text-2xl font-bold tracking-tighter">Stock Catalogue</h2>
          <p className="text-t3 text-xs font-black uppercase tracking-[0.15em] mt-1.5 opacity-80">Portfolio Orchestration</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn btn-primary shadow-glow-primary shadow-primary/20 px-6 py-3 rounded-2xl"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Control Suite — Clean & Minimal */}
      <div className="space-y-4 px-1">
        <div className="relative group max-w-2xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-t4 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalogue nodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-sm bg-white border border-slate-100 rounded-2xl shadow-sh-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder-t4 text-t1 font-medium"
          />
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 border",
                filter === f
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white border-slate-100 text-t3 hover:text-t1 hover:border-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State — Premium Minimalist */}
      {filtered.length === 0 && (
        <div className="crystalCard border-none flex flex-col items-center justify-center py-28 px-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center mb-10 mx-auto group-hover:scale-110 transition-transform duration-700 ease-out glass-halo">
              <Package size={36} className="text-primary" />
            </div>
            <h3 className="text-t1 font-bold text-xl tracking-tight mb-3">Catalogue Empty</h3>
            <p className="text-t3 text-sm font-medium mt-2 max-w-sm mx-auto leading-relaxed mb-10 opacity-80">
              Initialize your business presence by adding your first product node to the ecosystem.
            </p>
            <Link
              href="/dashboard/products/new"
              className="btn btn-primary px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:-translate-y-1"
            >
              <Plus size={20} />
              Provision First Product
            </Link>
          </div>
        </div>
      )}

      {/* Product Grid — Crystalline Nodes */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((product) => {
            return (
              <div
                key={product.id}
                className="crystalCard p-4 md:p-5 hover:shadow-sh-xl hover:bg-white transition-all duration-300 group flex items-center justify-between border-slate-100/50"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2 shadow-inner flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500 border border-slate-100">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      : <Package size={24} className="text-t4/50" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-t1 text-[15px] font-bold truncate leading-tight mb-1.5 tracking-tight group-hover:text-primary transition-colors">{product.name}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-t3 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">{product.category}</span>
                      <span className="w-1 h-1 rounded-full bg-t4/30" />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        product.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" :
                          product.status === 'out_of_stock' ? "bg-red-50 text-red-500 border-red-100/50" : "bg-slate-50 text-t3 border-slate-200/50"
                      )}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-t1 text-lg font-black font-mono tracking-tighter">₦{product.price.toLocaleString()}</p>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest mt-1 opacity-60",
                      product.stock === 0 ? "text-danger" : "text-t3"
                    )}>
                      {product.stock} Units Inventory
                    </p>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-t4 hover:text-primary hover:bg-primary/5 transition-all active:scale-90"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenu === product.id && (
                      <div className="absolute right-0 top-12 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl py-2.5 w-48 animate-entrance overflow-hidden">
                        <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-t2 hover:bg-primary-lt hover:text-primary transition-colors">
                          <Edit2 size={16} /> Edit Node
                        </Link>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-t2 hover:bg-primary-lt hover:text-primary transition-colors">
                          <Eye size={16} /> Market Preview
                        </button>
                        <div className="h-px bg-slate-50 mx-2 my-1.5" />
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-danger hover:bg-danger-lt transition-colors">
                          <Trash2 size={16} /> decommission
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
