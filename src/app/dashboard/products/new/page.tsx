'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, ArrowLeft, Upload, Loader2, Sparkles, CheckCircle2, Eye, RotateCcw, LayoutGrid, ChevronDown } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';
import { ProductService } from '@/services/productService';
import { StorageService } from '@/services/storageService';
import { productSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getBaseUrl } from '@/lib/baseUrl';
import { CurrencyService } from '@/services/currencyService';
import { z } from 'zod';

type ProductFormData = z.infer<typeof productSchema>;

interface CreatedProduct {
    id: string;
    name: string;
    imageUrl: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const { tenantId, subdomain } = useTenant();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [createdProduct, setCreatedProduct] = useState<CreatedProduct | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            stock_quantity: 0,
            category: 'General',
            sku: '',
            barcode: '',
            weight: 0,
            cost_price: 0,
            is_active: true,
            is_featured: false
        }
    });

    const productName = watch('name');
    const productCategory = watch('category');
    const isFeatured = watch('is_featured');

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data: ProductFormData) => {
        if (!tenantId) {
            toast.error('Store context not loaded');
            return;
        }
        setLoading(true);

        console.log('[NewProduct] Initiating upload with data:', { 
            ...data, 
            tenant_id: tenantId 
        });

        try {
            let imageUrl = '';
            if (imageFile) {
                console.log('[NewProduct] Uploading image...');
                const { url, error: uploadErr } = await StorageService.uploadProductImage(imageFile, tenantId);
                if (uploadErr) {
                    console.error('[NewProduct] Image upload failed:', uploadErr);
                    toast.error(`Upload failed: ${uploadErr}`);
                    setLoading(false);
                    return;
                }
                imageUrl = url || '';
                console.log('[NewProduct] Image uploaded successfully:', imageUrl);
            }

            // Defensive sanitization: Ensure no NaNs leak into the database
            const sanitizedData = {
                ...data,
                tenant_id: tenantId,
                image_url: imageUrl,
                weight: (data.weight === null || isNaN(Number(data.weight))) ? 0 : Number(data.weight),
                price: isNaN(Number(data.price)) ? 0 : Number(data.price),
                stock_quantity: isNaN(Number(data.stock_quantity)) ? 0 : Number(data.stock_quantity),
                cost_price: (data.cost_price === null || isNaN(Number(data.cost_price))) ? 0 : Number(data.cost_price),
            };

            console.log('[NewProduct] Creating product record...', sanitizedData);
            const product = await ProductService.createProduct(sanitizedData);

            if (product) {
                console.log('[NewProduct] Product created successfully:', product.id);
                setCreatedProduct({ id: product.id, name: product.name, imageUrl: imageUrl });
            } else {
                console.error('[NewProduct] ProductService.createProduct returned null');
                toast.error('Failed to create product. Check database columns.');
            }
        } catch (err) {
            console.error('[NewProduct] Fatal Error:', err);
            toast.error('An unexpected error occurred during launch');
        } finally {
            setLoading(false);
        }
    };

    const handleAICopy = async () => {
        if (!productName) {
            toast.error('Enter a product name first');
            return;
        }
        setIsGenerating(true);
        try {
            const url = `${getBaseUrl()}/api/ai/copywriter`;
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'product-description',
                    name: productName,
                    category: productCategory,
                })
            });
            const data = await res.json();
            if (data.content) {
                setValue('description', data.content);
                toast.success('AI description generated');
            }
        } catch (e) {
            toast.error('AI generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddAnother = () => {
        setCreatedProduct(null);
        setImageFile(null);
        setImagePreview('');
        reset();
    };

    if (createdProduct) {
        return (
            <div className="max-w-lg mx-auto pt-20 px-4 flex flex-col items-center text-center space-y-8">
                {/* Success icon */}
                <div className="w-24 h-24 rounded-[32px] bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="text-emerald-500" size={44} strokeWidth={1.5} />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-950 tracking-tighter font-display">Product Launched!</h1>
                    <p className="text-slate-500 font-semibold">
                        <span className="text-slate-950 font-black">&ldquo;{createdProduct.name}&rdquo;</span> is now live in your catalog.
                    </p>
                </div>

                {/* Product thumbnail if image was uploaded */}
                {createdProduct.imageUrl && (
                    <div className="w-40 h-40 rounded-[24px] overflow-hidden border border-slate-100 shadow-premium">
                        <img src={createdProduct.imageUrl} alt={createdProduct.name} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Actions */}
                <div className="w-full space-y-3 pt-2">
                    <a
                        href={`/store/${subdomain}/product/${createdProduct.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-14 rounded-[20px] bg-slate-950 text-white font-black uppercase tracking-[0.12em] text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-premium"
                    >
                        <Eye size={18} />
                        Preview on Storefront
                    </a>

                    <button
                        type="button"
                        onClick={handleAddAnother}
                        className="w-full h-14 rounded-[20px] bg-white border border-slate-200 text-slate-950 font-black uppercase tracking-[0.12em] text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                    >
                        <RotateCcw size={16} />
                        Add Another Product
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/products')}
                        className="w-full h-11 rounded-[16px] text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:text-slate-700 transition-all"
                    >
                        <LayoutGrid size={15} />
                        View All Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 space-y-8">
            {/* Minimal Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all shadow-soft-sm"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Draft Mode · Auto-saving</span>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-950 tracking-tighter font-display">Launch Product</h1>
                <p className="text-slate-500 font-semibold tracking-tight">Expansion of your catalog starts here. Every field is synced to Amina AI.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                            <input
                                {...register('name')}
                                placeholder="e.g. Classic Silk Kimono"
                                className={cn(
                                    "w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950",
                                    errors.name && "border-rose-200 bg-rose-50/30"
                                )}
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.name.message}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    Description <span className="text-slate-300 normal-case font-semibold tracking-normal">· optional</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAICopy}
                                    disabled={isGenerating}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter hover:bg-primary/10 transition-all disabled:opacity-50"
                                >
                                    <Sparkles size={12} />
                                    {isGenerating ? 'Generating...' : 'Write with AI'}
                                </button>
                            </div>
                            <textarea
                                {...register('description')}
                                placeholder="What makes this product special?"
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 resize-none"
                            />
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ({CurrencyService.getSymbol('NGN')})</label>
                                <input
                                    type="number"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="0"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                                {errors.price && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Qty</label>
                                <input
                                    type="number"
                                    {...register('stock_quantity', { valueAsNumber: true })}
                                    placeholder="0"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                                {errors.stock_quantity && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.stock_quantity.message}</p>}
                            </div>
                        </div>

                        {/* Advanced toggle */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(v => !v)}
                            className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            <ChevronDown size={14} className={cn("transition-transform", showAdvanced && "rotate-180")} />
                            Advanced Fields
                            <span className="text-slate-300 normal-case font-semibold tracking-normal">· SKU, cost, weight, barcode</span>
                        </button>

                        {/* Advanced fields */}
                        {showAdvanced && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU</label>
                                    <input
                                        {...register('sku')}
                                        placeholder="e.g. PROD-001"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price ({CurrencyService.getSymbol('NGN')})</label>
                                    <input
                                        type="number"
                                        {...register('cost_price', { valueAsNumber: true })}
                                        placeholder="0"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('weight', { valueAsNumber: true })}
                                        placeholder="0.0"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode / UPC</label>
                                    <input
                                        {...register('barcode')}
                                        placeholder="e.g. 123456789012"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Image upload */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-premium space-y-4">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Photo <span className="text-slate-300 normal-case font-semibold tracking-normal">· optional</span></h4>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-[20px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 hover:border-primary/30 transition-all group overflow-hidden"
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-soft-sm flex items-center justify-center text-slate-400 mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={18} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to upload</p>
                                    <p className="text-[9px] font-bold text-slate-300 mt-1">Max 5MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Category & Featured */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-premium space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                {...register('category')}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:border-primary/20 font-bold text-sm text-slate-950"
                            >
                                <option value="General">General</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home">Home & Decor</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Cosmetics">Cosmetics</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div>
                                <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-tighter">Featured</h5>
                                <p className="text-[10px] font-bold text-slate-400">Pin to top of store</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setValue('is_featured', !isFeatured)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                                    isFeatured ? "bg-slate-950" : "bg-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                    isFeatured ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-[24px] bg-slate-950 text-white font-black uppercase tracking-[0.15em] text-sm shadow-premium hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>{imageFile ? 'Uploading...' : 'Saving...'}</span>
                            </>
                        ) : (
                            <>
                                <span>Launch Product</span>
                                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
