"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    ImageOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    status: "active" | "draft" | "out_of_stock";
    category: string;
    image?: string;
    sales: number;
}

// ─── Mock data (replace with Supabase query) ─────────────────────────────────
const MOCK_PRODUCTS: Product[] = [];

const STATUS_STYLES = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-600" },
    draft: { label: "Draft", className: "bg-gray-100 text-gray-500" },
    out_of_stock: { label: "Out of Stock", className: "bg-red-50 text-red-500" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const filtered = MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-[#072435] text-xl font-bold">Products</h2>
                    <p className="text-gray-400 text-sm mt-0.5">Manage your product catalogue</p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 bg-[#409EF2] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3089d8] transition-colors shadow-sm shadow-[#409EF2]/30"
                >
                    <Plus size={16} />
                    Add Product
                </Link>
            </div>

            {/* ── Filter bar ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-[#409EF2] focus:ring-2 focus:ring-[#409EF2]/10 transition-all placeholder-gray-400 text-[#072435]"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
                    <Filter size={14} />
                    Filter
                </button>
            </div>

            {/* ── Table / Empty ── */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
                        <Package size={26} className="text-gray-300" />
                    </div>
                    <p className="text-[#072435] font-semibold text-base">No products yet</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-xs">
                        Add your first product and it will appear in your online store and WhatsApp catalogue.
                    </p>
                    <Link
                        href="/dashboard/products/new"
                        className="mt-5 inline-flex items-center gap-2 bg-[#409EF2] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3089d8] transition-colors"
                    >
                        <Plus size={15} />
                        Add your first product
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                        <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                        <div className="col-span-1" />
                    </div>

                    {/* Rows */}
                    {filtered.map((product) => {
                        const status = STATUS_STYLES[product.status];
                        return (
                            <div
                                key={product.id}
                                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                            >
                                {/* Product info */}
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageOff size={14} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[#072435] text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-gray-400 text-xs truncate">{product.category}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-2">
                                    <span className="text-[#072435] text-sm font-semibold">
                                        ₦{product.price.toLocaleString()}
                                    </span>
                                </div>

                                {/* Stock */}
                                <div className="col-span-2">
                                    <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : "text-[#072435]"}`}>
                                        {product.stock}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 flex justify-end relative">
                                    <button
                                        onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                    {openMenu === product.id && (
                                        <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/80 py-1 w-36">
                                            <Link
                                                href={`/dashboard/products/${product.id}`}
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#072435]"
                                            >
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
