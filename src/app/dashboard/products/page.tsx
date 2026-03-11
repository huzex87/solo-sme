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
  ChevronRight,
  MessageCircle
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
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 font-display">Inventory</h1>
          <p className="text-[13px] font-semibold text-slate-500 mt-0.5 tracking-tight">Managing {MOCK_PRODUCTS.length} total products</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-premium"
        >
          <Plus size={24} />
        </Link>
      </div>

      {/* Modern Search & Filter Suite */}
      <div className="px-4 space-y-6">
        <div className="flex gap-3">
          <div className="relative group flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-950 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-14 bg-white border border-slate-100 rounded-2xl shadow-soft-sm outline-none focus:ring-4 focus:ring-slate-950/5 focus:border-slate-300 transition-all font-bold text-sm"
            />
          </div>
          <button className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors shadow-soft-sm">
            <Filter size={20} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border",
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

      {/* Product List - Premium High-Density View */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-20 text-center shadow-premium">
            <div className="w-20 h-20 rounded-[24px] bg-slate-50 flex items-center justify-center mb-6 mx-auto border border-slate-100">
              <Package size={40} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-950 font-display">No products found</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto font-medium">Try adjusting your filters or adding a new product to your inventory.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-premium overflow-hidden">
            <div className="divide-y divide-slate-50">
              {filtered.map((product) => (
                <div key={product.id} className="group p-5 flex items-center gap-5 hover:bg-slate-50/50 transition-all cursor-pointer">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    {product.status === 'out_of_stock' && (
                      <div className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center">
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Sold Out</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-extrabold text-slate-950 truncate font-display">{product.name}</h4>
                      {product.status === 'active' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{product.category}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className={cn(
                        "text-[10px] font-extrabold leading-none",
                        product.stock <= 5 ? "text-red-500" : "text-slate-500"
                      )}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-black text-lg text-slate-950 font-display">₦{product.price.toLocaleString()}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <MessageCircle size={10} />
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">WA Sync</span>
                    </div>
                  </div>

                  <div className="pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-soft-sm flex items-center justify-center text-slate-400 hover:text-slate-950">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
