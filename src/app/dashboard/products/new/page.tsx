'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, ArrowLeft, Upload, X, Loader2, Sparkles, Package, Info, CheckCircle2 } from 'lucide-react';
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

export default function NewProductPage() {
    const router = useRouter();
    const { tenantId } = useTenant();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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
                toast.success('Product launched successfully');
                router.push('/dashboard/products');
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
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-8">
                        {/* Name & Basic Info */}
                        <div className="space-y-6">
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

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <button
                                        type="button"
                                        onClick={handleAICopy}
                                        disabled={isGenerating}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter hover:bg-primary/10 transition-all disabled:opacity-50"
                                    >
                                        <Sparkles size={12} />
                                        {isGenerating ? 'Generating...' : 'Enhance with AI'}
                                    </button>
                                </div>
                                <textarea
                                    {...register('description')}
                                    placeholder="Describe the craft, the material, and the soul of this product..."
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 resize-none"
                                />
                            </div>
                        </div>

                        {/* Inventory & Pricing Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price ({CurrencyService.getSymbol('NGN')})</label>
                                <input
                                    type="number"
                                    {...register('price', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                                {errors.price && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.price.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Level</label>
                                <input
                                    type="number"
                                    {...register('stock_quantity', { valueAsNumber: true })}
                                    placeholder="0"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                                {errors.stock_quantity && <p className="text-rose-500 text-[10px] font-bold ml-1 uppercase">{errors.stock_quantity.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU (Stock Keeping Unit)</label>
                                <input
                                    {...register('sku')}
                                    placeholder="e.g. KIMONO-001"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950 lowercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price ({CurrencyService.getSymbol('NGN')})</label>
                                <input
                                    type="number"
                                    {...register('cost_price', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Weight (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('weight', { valueAsNumber: true })}
                                    placeholder="0.5"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Barcode / UPC</label>
                                <input
                                    {...register('barcode')}
                                    placeholder="e.g. 123456789012"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-500" size={20} />
                            <h4 className="font-extrabold text-slate-950 tracking-tight">Marketplace Optimization</h4>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700/70 leading-relaxed">
                            Amina AI will automatically generate SEO keywords and Instagram tags based on these details once you launch.
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Media Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Media</h4>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 hover:border-primary/30 transition-all group overflow-hidden relative"
                        >
                            <input ref={fileInputRef} type="file" onChange={handleImageSelect} className="hidden" />
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center text-slate-400 mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Shot</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Taxonomy Card */}
                    <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium space-y-6">
                        <h4 className="text-sm font-black text-slate-950 uppercase tracking-widest">Organization</h4>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                {...register('category')}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:border-primary/20 font-bold text-xs"
                            >
                                <option value="Apparel">Apparel</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home">Home & Decor</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Cosmetics">Cosmetics</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-tighter">Featured Product</h5>
                                <p className="text-[10px] font-bold text-slate-400">Display at the top of your shop</p>
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

                    {/* Launch Action */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-[24px] bg-slate-950 text-white font-black uppercase tracking-[0.15em] text-sm shadow-premium hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                <span>Launch Product</span>
                                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
