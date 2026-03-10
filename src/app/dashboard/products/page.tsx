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
  active:       { label: "Active",       class: "bg-emerald-50 text-emerald-600" },
  draft:        { label: "Draft",        class: "bg-gray-100 text-gray-500"      },
  out_of_stock: { label: "Out of Stock", class: "bg-red-50 text-red-500"         },
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
      (filter === "Active"       && p.status === "active")       ||
      (filter === "Draft"        && p.status === "draft")        ||
      (filter === "Out of Stock" && p.status === "out_of_stock");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[#072435] text-xl font-bold tracking-tight">Products</h2>
          <p className="text-gray-400 text-sm mt-0.5">Manage your product catalogue</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-[#409EF2] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#3089d8] transition-colors shadow-sm shadow-[#409EF2]/25"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products, SKU, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-400 text-[#072435]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0",
                filter === f
                  ? "bg-[#409EF2] text-white border-[#409EF2] shadow-sm shadow-[#409EF2]/25"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
            <Package size={24} className="text-gray-300" />
          </div>
          <p className="text-[#072435] font-bold text-base">No products yet</p>
          <p className="text-gray-400 text-sm mt-2 max-w-xs leading-relaxed">
            Add your first product — it will appear in your online store and WhatsApp AI catalogue automatically.
          </p>
          <Link
            href="/dashboard/products/new"
            className="mt-5 inline-flex items-center gap-2 bg-[#409EF2] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#3089d8] transition-colors"
          >
            <Plus size={15} />
            Add your first product
          </Link>
        </div>
      )}

      {/* Product table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <div className="col-span-5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Price</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock</div>
            <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</div>
            <div className="col-span-1" />
          </div>

          {filtered.map((product) => {
            const s = STATUS_STYLES[product.status];
            return (
              <div
                key={product.id}
                className="flex sm:grid sm:grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/40 transition-colors"
              >
                {/* Thumb + name */}
                <div className="flex items-center gap-3 flex-1 min-w-0 sm:col-span-5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      : <ImageOff size={14} className="text-gray-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#072435] text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-gray-400 text-xs truncate">{product.category}</p>
                  </div>
                </div>
                {/* Price */}
                <div className="sm:col-span-2 hidden sm:block">
                  <span className="text-[#072435] text-sm font-bold">₦{product.price.toLocaleString()}</span>
                </div>
                {/* Stock */}
                <div className="sm:col-span-2 hidden sm:block">
                  <span className={`text-sm font-semibold ${product.stock === 0 ? "text-red-500" : "text-[#072435]"}`}>
                    {product.stock}
                  </span>
                </div>
                {/* Status */}
                <div className="sm:col-span-2">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${s.class}`}>{s.label}</span>
                </div>
                {/* Mobile price */}
                <div className="sm:hidden text-right">
                  <p className="text-[#072435] text-sm font-bold">₦{product.price.toLocaleString()}</p>
                  <p className="text-gray-400 text-[11px]">{product.stock} in stock</p>
                </div>
                {/* Actions */}
                <div className="sm:col-span-1 flex justify-end relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openMenu === product.id && (
                    <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/80 py-1.5 w-36">
                      <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#072435]">
                        <Edit2 size={13} /> Edit
                      </Link>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#072435]">
                        <Eye size={13} /> View in Store
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
