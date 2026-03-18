"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Instagram, MessageCircle, ArrowRight, Check, X, Loader2,
    RefreshCw, Package, Sparkles, Link2, Unlink, AlertCircle,
    Camera, ShoppingBag, ChevronRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTenant } from "@/context/TenantContext";
import { SocialImportService, SocialAccount, ImportedProduct } from "@/services/socialImportService";
import { OnboardingService } from "@/services/onboardingService";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { PageLoading } from "@/components/ui/LoadingIndicator";

type ImportStep = 'connect' | 'scanning' | 'review' | 'importing' | 'complete';

export default function SocialImportPage() {
    const { tenantId, tenant } = useTenant();
    const router = useRouter();

    const [step, setStep] = useState<ImportStep>('connect');
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [products, setProducts] = useState<ImportedProduct[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importSource, setImportSource] = useState<'instagram' | 'whatsapp_business' | 'url'>('url');
    const [socialUrl, setSocialUrl] = useState('');
    const [scanProgress, setScanProgress] = useState(0);
    const [importResult, setImportResult] = useState<{ saved: number; skipped: number } | null>(null);

    // Load connected accounts
    useEffect(() => {
        async function loadAccounts() {
            if (!tenantId) return;
            setLoading(true);
            const connected = await SocialImportService.getConnectedAccounts(tenantId);
            setAccounts(connected);
            setLoading(false);
        }
        loadAccounts();
    }, [tenantId]);

    // Handle Instagram OAuth connect
    const connectInstagram = () => {
        const authUrl = SocialImportService.getInstagramAuthUrl(tenantId);
        window.location.href = authUrl;
    };

    // Handle WhatsApp Business OAuth connect
    const connectWhatsApp = () => {
        const authUrl = SocialImportService.getWhatsAppBusinessAuthUrl(tenantId);
        window.location.href = authUrl;
    };

    // Handle URL-based AI import (existing flow, enhanced)
    const handleUrlImport = async () => {
        if (!socialUrl) return;

        setStep('scanning');
        setScanProgress(0);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + Math.random() * 15, 85));
        }, 500);

        try {
            const data = await OnboardingService.importFromSocial(socialUrl);
            clearInterval(progressInterval);
            setScanProgress(100);

            if (data.products?.length > 0) {
                setProducts(data.products.map(p => ({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    image_url: p.image,
                    stock: p.stock,
                    source: 'ai_generated' as const,
                })));
                setSelectedProducts(new Set(data.products.map((_, i) => i)));
                setTimeout(() => setStep('review'), 500);
            } else {
                toast.error('No products could be extracted from this link');
                setStep('connect');
            }
        } catch (err) {
            clearInterval(progressInterval);
            toast.error('Import failed. Please try again.');
            setStep('connect');
        }
    };

    // Handle connected account import
    const handleAccountImport = async (platform: 'instagram' | 'whatsapp_business') => {
        setStep('scanning');
        setImportSource(platform);
        setScanProgress(0);

        const progressInterval = setInterval(() => {
            setScanProgress(prev => Math.min(prev + Math.random() * 12, 85));
        }, 600);

        try {
            let result;
            if (platform === 'instagram') {
                result = await SocialImportService.importFromInstagram(tenantId);
            } else {
                result = await SocialImportService.importFromWhatsAppCatalog(tenantId);
            }

            clearInterval(progressInterval);
            setScanProgress(100);

            if (result.products.length > 0) {
                setProducts(result.products);
                setSelectedProducts(new Set(result.products.map((_, i) => i)));
                setTimeout(() => setStep('review'), 500);
            } else {
                const errorMsg = result.errors.length > 0
                    ? result.errors[0]
                    : 'No products found. Try the AI import instead.';
                toast.error(errorMsg);
                setStep('connect');
            }
        } catch (err) {
            clearInterval(progressInterval);
            toast.error('Sync failed. Please reconnect your account.');
            setStep('connect');
        }
    };

    // Toggle product selection
    const toggleProduct = (index: number) => {
        const next = new Set(selectedProducts);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        setSelectedProducts(next);
    };

    // Select/deselect all
    const toggleAll = () => {
        if (selectedProducts.size === products.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(products.map((_, i) => i)));
        }
    };

    // Update product in review
    const updateProduct = (index: number, field: keyof ImportedProduct, value: string | number) => {
        setProducts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Finalize import
    const handleFinalize = async () => {
        const selected = products.filter((_, i) => selectedProducts.has(i));
        if (selected.length === 0) {
            toast.error('Select at least one product to import');
            return;
        }

        setStep('importing');
        setImporting(true);

        try {
            const result = await SocialImportService.finalizeImport(tenantId, selected);
            setImportResult(result);
            setStep('complete');
            toast.success(`${result.saved} products imported successfully!`);
        } catch (err) {
            toast.error('Import failed. Please try again.');
            setStep('review');
        } finally {
            setImporting(false);
        }
    };

    // Handle disconnect
    const handleDisconnect = async (accountId: string) => {
        const success = await SocialImportService.disconnectAccount(accountId, tenantId);
        if (success) {
            setAccounts(prev => prev.filter(a => a.id !== accountId));
            toast.success('Account disconnected');
        }
    };

    if (loading) return <PageLoading />;

    const igAccount = accounts.find(a => a.platform === 'instagram');
    const waAccount = accounts.find(a => a.platform === 'whatsapp_business');

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 lg:pb-12 px-2 md:px-0">

            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-display">Social Import</h1>
                        <p className="text-sm font-bold text-slate-400">
                            Import products from Instagram, WhatsApp Business, or any social link
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2">
                {(['connect', 'scanning', 'review', 'complete'] as const).map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                            step === s ? "bg-slate-950 text-white scale-110 shadow-lg" :
                                (['connect', 'scanning', 'review', 'complete'].indexOf(step) > i)
                                    ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        )}>
                            {(['connect', 'scanning', 'review', 'complete'].indexOf(step) > i) ? <Check size={14} /> : i + 1}
                        </div>
                        {i < 3 && <div className={cn(
                            "flex-1 h-0.5 rounded transition-colors duration-500",
                            (['connect', 'scanning', 'review', 'complete'].indexOf(step) > i) ? "bg-emerald-500" : "bg-slate-100"
                        )} />}
                    </div>
                ))}
            </div>

            {/* ── STEP 1: Connect ── */}
            {step === 'connect' && (
                <div className="space-y-6 animate-entrance">

                    {/* Connected Accounts */}
                    {accounts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-extrabold text-slate-950 font-display">Connected Accounts</h3>
                            <div className="grid gap-4">
                                {accounts.map(account => (
                                    <div key={account.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 shadow-soft-sm">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                                            account.platform === 'instagram' ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-emerald-500"
                                        )}>
                                            {account.platform === 'instagram' ? <Instagram size={22} /> : <MessageCircle size={22} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-950">{account.account_name}</p>
                                            <p className="text-xs text-slate-400 font-semibold">
                                                {account.platform === 'instagram' ? 'Instagram Business' : 'WhatsApp Business'}
                                                {account.followers_count ? ` | ${account.followers_count.toLocaleString()} followers` : ''}
                                                {account.last_synced_at ? ` | Last sync: ${new Date(account.last_synced_at).toLocaleDateString()}` : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAccountImport(account.platform as 'instagram' | 'whatsapp_business')}
                                            className="h-10 px-5 rounded-xl bg-slate-950 text-white text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                                        >
                                            <RefreshCw size={14} />
                                            Sync Products
                                        </button>
                                        <button
                                            onClick={() => handleDisconnect(account.id)}
                                            className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
                                        >
                                            <Unlink size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Import Options */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-extrabold text-slate-950 font-display">
                            {accounts.length > 0 ? 'Add Another Source' : 'Choose Import Source'}
                        </h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            {/* Instagram Connect */}
                            <button
                                onClick={igAccount ? () => handleAccountImport('instagram') : connectInstagram}
                                className="group bg-white border border-slate-100 rounded-[24px] p-6 text-left hover:shadow-premium transition-all duration-300 hover:border-pink-200 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <Instagram size={26} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-950 font-display">Instagram Business</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                                            Connect your Instagram Business account to auto-import products from your posts
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-pink-500">
                                        {igAccount ? 'Sync Now' : 'Connect Account'} <ArrowRight size={12} />
                                    </div>
                                </div>
                            </button>

                            {/* WhatsApp Business */}
                            <button
                                onClick={waAccount ? () => handleAccountImport('whatsapp_business') : connectWhatsApp}
                                className="group bg-white border border-slate-100 rounded-[24px] p-6 text-left hover:shadow-premium transition-all duration-300 hover:border-emerald-200 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <MessageCircle size={26} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-950 font-display">WhatsApp Business</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                                            Import your WhatsApp Business catalog with pricing and descriptions
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                                        {waAccount ? 'Sync Now' : 'Connect Account'} <ArrowRight size={12} />
                                    </div>
                                </div>
                            </button>

                            {/* AI Link Import */}
                            <div className="bg-white border border-slate-100 rounded-[24px] p-6 text-left hover:shadow-premium transition-all duration-300 hover:border-blue-200 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10 space-y-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <Zap size={26} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-950 font-display">AI Magic Import</h4>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                                            Paste any social media link and our AI builds your catalog instantly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-soft-sm space-y-4">
                            <h4 className="font-extrabold text-slate-950 text-sm flex items-center gap-2">
                                <Zap size={16} className="text-blue-500" />
                                AI Quick Import - Paste Any Link
                            </h4>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="url"
                                        value={socialUrl}
                                        onChange={(e) => setSocialUrl(e.target.value)}
                                        placeholder="https://instagram.com/your-brand or any social link..."
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all font-semibold text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleUrlImport}
                                    disabled={!socialUrl}
                                    className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-premium"
                                >
                                    <Sparkles size={16} />
                                    Import
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold">
                                Works with Instagram, Facebook, TikTok, Twitter/X profiles, or any website with product listings
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Scanning ── */}
            {step === 'scanning' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-entrance">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-slate-950 to-slate-700 flex items-center justify-center text-white shadow-2xl animate-float">
                            <Sparkles size={40} className="animate-pulse" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-bounce">
                            AI
                        </div>
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-extrabold text-slate-950 font-display">
                            Scanning Your Store
                        </h2>
                        <p className="text-sm text-slate-400 font-semibold max-w-md">
                            Our AI is analyzing your social media posts, extracting products, prices, and descriptions...
                        </p>
                    </div>

                    <div className="w-80 space-y-2">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${scanProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400 font-bold text-center">{Math.round(scanProgress)}% complete</p>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-xs text-slate-400 font-semibold">
                        <div className="flex items-center gap-2"><Camera size={14} /> Analyzing post images...</div>
                        <div className="flex items-center gap-2"><Package size={14} /> Extracting product details...</div>
                        <div className="flex items-center gap-2"><ShoppingBag size={14} /> Matching categories...</div>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === 'review' && (
                <div className="space-y-6 animate-entrance">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-950 font-display">Review Products</h2>
                            <p className="text-sm text-slate-400 font-semibold">
                                {products.length} products found. Select the ones you want to import.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleAll}
                                className="text-xs font-bold text-slate-500 hover:text-slate-950 transition-colors"
                            >
                                {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-xs font-extrabold text-slate-950 bg-slate-100 px-3 py-1.5 rounded-lg">
                                {selectedProducts.size} selected
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                        {products.map((product, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "bg-white border rounded-2xl p-5 transition-all duration-300 cursor-pointer group",
                                    selectedProducts.has(index)
                                        ? "border-slate-950 shadow-premium ring-1 ring-slate-950/5"
                                        : "border-slate-100 shadow-soft-sm opacity-60 hover:opacity-80"
                                )}
                                onClick={() => toggleProduct(index)}
                            >
                                <div className="flex gap-4">
                                    {/* Checkbox */}
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-all",
                                        selectedProducts.has(index)
                                            ? "bg-slate-950 border-slate-950 text-white"
                                            : "border-slate-200"
                                    )}>
                                        {selectedProducts.has(index) && <Check size={14} />}
                                    </div>

                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Package size={28} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <input
                                            type="text"
                                            value={product.name}
                                            onChange={(e) => { e.stopPropagation(); updateProduct(index, 'name', e.target.value); }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full font-bold text-slate-950 text-sm bg-transparent border-none outline-none focus:bg-slate-50 rounded-lg px-2 py-1 -ml-2 transition-colors"
                                        />
                                        <p className="text-xs text-slate-400 font-semibold line-clamp-2 px-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center gap-3 px-2">
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">
                                                {product.category}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                {product.source === 'instagram' ? 'IG' : product.source === 'whatsapp_catalog' ? 'WA' : 'AI'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right shrink-0">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₦</span>
                                            <input
                                                type="number"
                                                value={product.price}
                                                onChange={(e) => { e.stopPropagation(); updateProduct(index, 'price', parseInt(e.target.value) || 0); }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-28 text-right font-extrabold text-slate-950 text-lg bg-transparent border-none outline-none focus:bg-slate-50 rounded-lg px-2 py-1 transition-colors font-display"
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1">Stock: {product.stock}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => { setStep('connect'); setProducts([]); }}
                            className="h-14 px-6 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Start Over
                        </button>
                        <button
                            onClick={handleFinalize}
                            disabled={selectedProducts.size === 0 || importing}
                            className="flex-1 h-14 rounded-2xl bg-slate-950 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-40 transition-all active:scale-[0.98] shadow-premium"
                        >
                            {importing ? (
                                <><Loader2 size={18} className="animate-spin" /> Importing...</>
                            ) : (
                                <>
                                    <Package size={18} />
                                    Import {selectedProducts.size} Products to Store
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 4: Importing ── */}
            {step === 'importing' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-entrance">
                    <div className="w-20 h-20 rounded-[24px] bg-slate-950 flex items-center justify-center text-white shadow-2xl">
                        <Loader2 size={36} className="animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-extrabold text-slate-950 font-display">Importing Products</h2>
                        <p className="text-sm text-slate-400 font-semibold">
                            Adding {selectedProducts.size} products to your store catalog...
                        </p>
                    </div>
                </div>
            )}

            {/* ── STEP 5: Complete ── */}
            {step === 'complete' && (
                <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-entrance">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[32px] bg-emerald-500 flex items-center justify-center text-white shadow-2xl">
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <div className="absolute -inset-4 rounded-[40px] border-2 border-emerald-200 animate-ping opacity-30" />
                    </div>

                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-extrabold text-slate-950 font-display">Import Complete!</h2>
                        <p className="text-sm text-slate-400 font-semibold max-w-md">
                            {importResult?.saved} products have been added to your store.
                            {importResult?.skipped ? ` ${importResult.skipped} duplicates were skipped.` : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setStep('connect'); setProducts([]); setImportResult(null); }}
                            className="h-14 px-6 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Import More
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/products')}
                            className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-premium"
                        >
                            View Products <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
