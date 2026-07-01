'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, ArrowLeft, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
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
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isSimpleMode, setIsSimpleMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('product-add-mode');
            return savedMode !== 'advanced';
        }
        return true;
    });
    const [aiInputText, setAiInputText] = useState('');
    const [isParsing, setIsParsing] = useState(false);



    const toggleMode = () => {
        setIsSimpleMode(prev => {
            const next = !prev;
            localStorage.setItem('product-add-mode', next ? 'simple' : 'advanced');
            return next;
        });
    };

    const handleAIAutoFill = async () => {
        if (!aiInputText.trim()) return;
        setIsParsing(true);
        try {
            const url = `${getBaseUrl()}/api/ai/social-product-extract`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caption: aiInputText })
            });
            if (res.ok) {
                const result = await res.json();
                if (result.isProduct) {
                    if (result.name) setValue('name', result.name);
                    if (result.description) setValue('description', result.description);
                    if (result.price) setValue('price', result.price);
                    if (result.category) {
                        const standardCats = ['Apparel', 'Electronics', 'Home', 'Accessories', 'Cosmetics', 'General'];
                        if (standardCats.includes(result.category)) {
                            setValue('category', result.category);
                        } else if (result.category === 'Fashion') {
                            setValue('category', 'Apparel');
                        } else if (result.category === 'Beauty') {
                            setValue('category', 'Cosmetics');
                        } else {
                            setValue('category', 'General');
                        }
                    }
                    if (result.stock) setValue('stock_quantity', result.stock);
                    toast.success('Form filled by Amina AI successfully!');
                    setAiInputText('');
                } else {
                    toast.error('AI could not identify product details. Try typing more details.');
                }
            } else {
                toast.error('Failed to parse text.');
            }
        } catch (err) {
            console.error(err);
            toast.error('AI parsing failed.');
        } finally {
            setIsParsing(false);
        }
    };

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

    const formValues = watch();

    // Auto-save form draft
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('product-draft-form', JSON.stringify(formValues));
        }
    }, [formValues]);

    // Restore form draft on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem('product-draft-form');
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    Object.entries(parsed).forEach(([key, val]) => {
                        setValue(key as keyof ProductFormData, val as any);
                    });
                } catch (e) {
                    console.error('[NewProduct] Failed to restore draft:', e);
                }
            }
        }
    }, [setValue]);

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
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('product-draft-form');
                }
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
        } catch {
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

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-950 tracking-tighter font-display">Launch Product</h1>
                    <p className="text-slate-500 font-semibold tracking-tight text-xs">Expansion of your catalog starts here. Every field is synced to Amina AI.</p>
                </div>
                
                {/* Simple / Advanced Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/60 rounded-2xl p-1 shadow-soft-sm">
                    <button
                        type="button"
                        onClick={() => !isSimpleMode && toggleMode()}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            isSimpleMode ? "bg-slate-950 text-white shadow-sm" : "text-slate-400 hover:text-slate-900"
                        )}
                    >
                        Simple
                    </button>
                    <button
                        type="button"
                        onClick={() => isSimpleMode && toggleMode()}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                            !isSimpleMode ? "bg-slate-950 text-white shadow-sm" : "text-slate-400 hover:text-slate-900"
                        )}
                    >
                        Advanced
                    </button>
                </div>
            </div>

            {/* AI Auto-Fill Bar */}
            <div className="bg-gradient-to-r from-primary/5 via-violet-500/[0.03] to-slate-50 border border-primary/20 rounded-3xl p-6 shadow-soft-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-950 tracking-tight">Amina AI Smart Launch</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Paste a social media post, WhatsApp message, or raw specs below</p>
                        </div>
                    </div>
                    {isParsing && (
                        <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-wider animate-pulse">
                            <Loader2 size={12} className="animate-spin" /> Analyzing...
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <textarea
                        value={aiInputText}
                        onChange={(e) => setAiInputText(e.target.value)}
                        placeholder="e.g. Vintage leather boots, selling for N35,000. 15 pieces in stock. Perfect for casual wear..."
                        className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-900 placeholder-slate-300 outline-none focus:border-primary/40 transition-all min-h-[60px] resize-none"
                    />
                    <button
                        type="button"
                        onClick={handleAIAutoFill}
                        disabled={isParsing || !aiInputText.trim()}
                        className="px-6 rounded-2xl bg-primary text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
                    >
                        Auto-fill
                    </button>
                </div>
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

                        {!isSimpleMode && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU (Stock Keeping Unit)</label>
                                        <div className="relative flex items-center">
                                            <input
                                                {...register('sku')}
                                                placeholder="e.g. KIMONO-001"
                                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 pr-24 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (productName) {
                                                        const cleanName = productName.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 12);
                                                        setValue('sku', `${cleanName}-${Math.floor(100 + Math.random() * 900)}`);
                                                    } else {
                                                        setValue('sku', `PROD-${Math.floor(1000 + Math.random() * 9000)}`);
                                                    }
                                                    toast.success('SKU generated');
                                                }}
                                                className="absolute right-3 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider transition-all"
                                            >
                                                Generate
                                            </button>
                                        </div>
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
                                        <div className="relative flex items-center">
                                            <input
                                                {...register('barcode')}
                                                placeholder="e.g. 123456789012"
                                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 pr-24 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-slate-950"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    let barcode = '20';
                                                    for (let i = 0; i < 10; i++) {
                                                        barcode += Math.floor(Math.random() * 10);
                                                    }
                                                    let sum = 0;
                                                    for (let i = 0; i < 12; i++) {
                                                        sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
                                                    }
                                                    const checkDigit = (10 - (sum % 10)) % 10;
                                                    setValue('barcode', barcode + checkDigit);
                                                    toast.success('Barcode generated');
                                                }}
                                                className="absolute right-3 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider transition-all"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
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
                            className="aspect-square rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:bg-slate-100/50 hover:border-primary/30 transition-all group overflow-hidden relative"
                        >
                            <input type="file" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {/* eslint-disable @next/next/no-img-element */}
                            {imagePreview ? (
                            <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
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
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            
                            {/* Visual Category Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {['Apparel', 'Cosmetics', 'Electronics', 'Home', 'Accessories', 'General'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setValue('category', cat)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95",
                                            productCategory === cat
                                                ? "bg-primary/5 text-primary border-primary/20 font-extrabold"
                                                : "bg-slate-50 text-slate-500 border-slate-200/60 hover:border-slate-300"
                                        )}
                                    >
                                        {cat === 'Home' ? 'Home & Decor' : cat === 'Cosmetics' ? 'Beauty' : cat}
                                    </button>
                                ))}
                            </div>

                            <select
                                {...register('category')}
                                className="hidden"
                            >
                                <option value="Apparel">Apparel</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home">Home & Decor</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Cosmetics">Cosmetics</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        {!isSimpleMode && (
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
                        )}
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
