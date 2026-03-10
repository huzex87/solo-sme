"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Package,
    Plus,
    Search,
    Filter,
    Upload,
    MoreVertical,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const MOCK_PRODUCTS = [
    { id: 1, name: "Kandur Gown", price: 12500, stock: 0, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop" },
    { id: 2, name: "Luxury Silk Abaya", price: 45000, stock: 12, image: "https://images.unsplash.com/photo-1544441893-675973e31d85?w=200&h=200&fit=crop" },
    { id: 3, name: "Embroidered Pashmina", price: 8500, stock: 5, image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=200&h=200&fit=crop" },
    { id: 4, name: "Leather Mojari", price: 15000, stock: 3, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop" },
];

export default function ProductsPage() {
    const [search, setSearch] = useState("");

    return (
        <div className="flex flex-col gap-6 animate-entrance pb-32">
            {/* ── High-Fidelity Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-t1 text-xl font-extrabold tracking-tight font-display m-0">Products</h2>
                    <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1">{MOCK_PRODUCTS.length} Total Items</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sh-sm border border-border flex items-center justify-center text-t2 active:scale-95 transition-all">
                        <Search size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sh-sm border border-border flex items-center justify-center text-t2 active:scale-95 transition-all">
                        <Filter size={18} />
                    </div>
                    <Link href="/dashboard/products/new" className="w-10 h-10 rounded-xl bg-blue shadow-sh-blue flex items-center justify-center text-white active:scale-95 transition-all">
                        <Plus size={20} strokeWidth={3} />
                    </Link>
                </div>
            </div>

            {/* ── Product List ── */}
            <div className="space-y-4">
                {MOCK_PRODUCTS.length === 0 ? (
                    <div className="py-20 bg-white rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center px-10">
                        <div className="w-16 h-16 rounded-3xl bg-surface mb-6 flex items-center justify-center text-t4">
                            <Package size={32} />
                        </div>
                        <h3 className="text-t1 text-lg font-bold mb-2">No products found</h3>
                        <p className="text-t3 text-sm font-medium mb-8 leading-relaxed max-w-xs">
                            Start building your digital catalogue. Your products will automatically sync to WhatsApp.
                        </p>
                        <Link href="/dashboard/products/new" className="btn btn-primary btn-lg rounded-2xl">
                            <Plus size={18} strokeWidth={2.5} />
                            Add Product
                        </Link>
                    </div>
                ) : (
                    MOCK_PRODUCTS.map((product) => (
                        <div key={product.id} className="bg-white p-3 rounded-[24px] border border-border shadow-sh-sm flex items-center gap-4 active:scale-[0.98] transition-all relative group">
                            {/* Product Image */}
                            <div className="w-20 h-20 rounded-[18px] overflow-hidden bg-surface flex-shrink-0 relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Sold Out</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 pr-8">
                                <h3 className="text-t1 text-[15px] font-extrabold tracking-tight truncate mb-1">
                                    {product.name}
                                </h3>
                                <p className="text-blue text-sm font-black font-mono">
                                    {formatCurrency(product.price)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        product.stock === 0
                                            ? "bg-red/5 text-red border-red/10"
                                            : product.stock < 5
                                                ? "bg-amber/5 text-amber border-amber/10"
                                                : "bg-green/5 text-green border-green/10"
                                    )}>
                                        {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Trigger */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                <MoreVertical size={18} />
                            </div>

                            {/* Interaction Overlay */}
                            <Link href={`/dashboard/products/${product.id}`} className="absolute inset-0 rounded-[24px]" />
                        </div>
                    ))
                )}
            </div>

            {/* ── Secondary CTA community ── */}
            <div className="bg-gradient-to-br from-blue-dim to-transparent p-6 rounded-[28px] border border-blue/10 mt-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue">
                        <Upload size={20} />
                    </div>
                    <h4 className="text-t1 text-sm font-bold tracking-tight">Bulk Import</h4>
                </div>
                <p className="text-t3 text-xs font-medium leading-relaxed mb-4 pr-10">
                    Import your existing product list via CSV or Excel to get started instantly.
                </p>
                <button className="text-blue text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    Upload Spreadsheet <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
