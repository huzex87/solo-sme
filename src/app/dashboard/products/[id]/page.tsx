import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProductService } from '@/services/productService';
import { Package, ArrowLeft, Save, Trash2, ChevronRight, Info } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { CurrencyService } from '@/services/currencyService';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await ProductService.getProduct(id);

    if (!product) notFound();

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 space-y-8">
            {/* Minimal Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/products"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all shadow-soft-sm"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Live Syncing · Active Inventory</span>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-950 tracking-tighter font-display">Manage Product</h1>
                <p className="text-slate-500 font-semibold tracking-tight">Updating &quot;{product.name}&quot;. Every change is immediately pushed to your channels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-8">
                        {/* Name & Basic Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                                <input
                                    defaultValue={product.name}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    defaultValue={product.description || ''}
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 resize-none"
                                />
                            </div>
                        </div>

                        {/* Inventory & Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ({CurrencyService.getSymbol('NGN')})</label>
                                <input
                                    type="number"
                                    defaultValue={product.price}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                                <input
                                    type="number"
                                    defaultValue={product.stock_quantity}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU</label>
                                <input
                                    defaultValue={product.sku || ''}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 lowercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    defaultValue={product.category || 'General'}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                >
                                    <option>Apparel</option>
                                    <option>Electronics</option>
                                    <option>Home & Decor</option>
                                    <option>Accessories</option>
                                    <option>Cosmetics</option>
                                    <option>General</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Visual Preview */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Media Preview</h4>
                        <div className="aspect-square rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden relative shadow-inner">
                            {product.image_url ? (
                                <Image src={product.image_url} fill className="object-cover" alt={product.name} sizes="(max-width: 768px) 100vw, 33vw" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <Package size={48} />
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-4">No Image Set</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full h-12 rounded-xl bg-slate-50 text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all border border-slate-100">
                            Change Images
                        </button>
                    </div>

                    {/* Status Actions */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-4">
                        <button className="w-full h-16 rounded-[24px] bg-slate-950 text-white font-black uppercase tracking-[0.15em] text-sm shadow-premium hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <Save size={20} />
                            Save Changes
                        </button>
                        <button className="w-full h-14 rounded-[20px] bg-white text-rose-600 font-extrabold text-sm border border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center gap-2">
                            <Trash2 size={18} />
                            Archive Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
