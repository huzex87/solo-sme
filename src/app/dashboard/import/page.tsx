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
            try {
                const connected = await SocialImportService.getConnectedAccounts(tenantId);
                setAccounts(connected);
            } catch (err) {
                console.error("Failed to load accounts", err);
            } finally {
                setLoading(false);
            }
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

    // Handle URL-based AI import
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

    // Breadcrumb and search component (matching the image)
    const TopNav = () => (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-950 font-extrabold">Dashboard</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 font-semibold">Dashboard/import</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Search or jump..." 
                        className="w-64 h-10 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-200 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-100 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-bold group-focus-within:hidden">
                        ⌘ K
                    </div>
                </div>
                <button className="h-10 px-4 rounded-xl border border-slate-100 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    View Store <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <TopNav />

                <div className="max-w-5xl mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#FF4D95] via-[#FF705B] to-[#FF931F] flex items-center justify-center text-white shadow-xl shadow-pink-500/20">
                            <Sparkles size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight font-display mb-1">Social Import</h1>
                            <p className="text-sm font-bold text-slate-400">
                                Import products from Instagram, WhatsApp Business, or any social link
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center mb-12 relative px-4">
                        {[1, 2, 3, 4].map((s, i) => (
                            <div key={s} className="flex items-center flex-1 last:flex-none">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 z-10",
                                    (i + 1 === 1 && step === 'connect') || (i + 1 === 2 && step === 'scanning') || (i + 1 === 3 && step === 'review') || (i + 1 === 4 && step === 'complete')
                                        ? "bg-slate-950 text-white shadow-lg ring-4 ring-slate-950/5 scale-110" 
                                        : "bg-slate-50 text-slate-300"
                                )}>
                                    {s}
                                </div>
                                {i < 3 && (
                                    <div className="flex-1 h-0.5 bg-slate-50 mx-2" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="relative min-h-[400px]">
                        {/* ── STEP 1: Connect ── */}
                        {step === 'connect' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <h2 className="text-xl font-extrabold text-slate-950 font-display">Choose Import Source</h2>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Instagram */}
                                    <button
                                        onClick={connectInstagram}
                                        className="group bg-white border border-slate-100 rounded-[32px] p-8 text-left hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                <Instagram size={30} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-extrabold text-slate-950 font-display mb-2">Instagram Business</h4>
                                                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                                    Connect your Instagram Business account to auto-import products from your posts
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#FD1D1D] group-hover:gap-3 transition-all">
                                                Connect Account <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* WhatsApp */}
                                    <button
                                        onClick={connectWhatsApp}
                                        className="group bg-white border border-slate-100 rounded-[32px] p-8 text-left hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
                                    >
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-16 h-16 rounded-[22px] bg-[#25D366] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                <MessageCircle size={30} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-extrabold text-slate-950 font-display mb-2">WhatsApp Business</h4>
                                                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                                    Import your WhatsApp Business catalog with pricing and descriptions
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#25D366] group-hover:gap-3 transition-all">
                                                Connect Account <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </button>

                                    {/* AI Magic */}
                                    <div className="group bg-white border border-slate-100 rounded-[32px] p-8 text-left hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                                        <div className="relative z-10 space-y-6">
                                            <div className="w-16 h-16 rounded-[22px] bg-[#4B6FFF] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                <Zap size={30} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-extrabold text-slate-950 font-display mb-2">AI Magic Import</h4>
                                                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                                    Paste any social media link and our AI builds your catalog instantly
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Import Section */}
                                <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Zap size={20} className="text-[#4B6FFF]" />
                                        <h4 className="text-lg font-extrabold text-slate-950 font-display">AI Quick Import - Paste Any Link</h4>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-950 transition-colors">
                                                <Link2 size={20} />
                                            </div>
                                            <input
                                                type="url"
                                                value={socialUrl}
                                                onChange={(e) => setSocialUrl(e.target.value)}
                                                placeholder="https://instagram.com/your-brand or any social link..."
                                                className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 outline-none focus:ring-4 focus:ring-slate-950/5 focus:border-slate-200 transition-all font-bold text-slate-950"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUrlImport}
                                            disabled={!socialUrl}
                                            className="h-16 px-10 rounded-2xl bg-slate-400 text-white font-extrabold flex items-center gap-2 hover:bg-slate-950 disabled:bg-slate-400 transition-all duration-300 shadow-lg shadow-slate-200"
                                        >
                                            <Sparkles size={20} />
                                            Import
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold mt-4 px-1">
                                        Works with Instagram, Facebook, TikTok, Twitter/X profiles, or any website with product listings
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Scanning ── */}
                        {step === 'scanning' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center py-20 space-y-8">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-[32px] bg-slate-950 flex items-center justify-center text-white shadow-2xl">
                                        <Sparkles size={40} className="animate-pulse text-[#4B6FFF]" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#4B6FFF] border-4 border-white flex items-center justify-center text-white text-xs font-black shadow-lg">
                                        AI
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-950 font-display">Scanning Your Store</h2>
                                    <p className="text-sm text-slate-400 font-bold max-w-md">
                                        Our AI is analyzing posts, extracting products, and matching categories...
                                    </p>
                                </div>

                                <div className="w-80 space-y-3">
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                        <div
                                            className="h-full bg-slate-950 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${scanProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black text-center uppercase tracking-widest">{Math.round(scanProgress)}% COMPLETE</p>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Review ── */}
                        {step === 'review' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-950 font-display">Review Results</h2>
                                        <p className="text-sm text-slate-400 font-bold">
                                            We found {products.length} products. Select what to import.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={toggleAll} className="text-xs font-black text-slate-400 hover:text-slate-950 uppercase tracking-wider">
                                            {selectedProducts.size === products.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                        <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-black text-slate-950">
                                            {selectedProducts.size} SELECTED
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    {products.map((product, index) => (
                                        <div
                                            key={index}
                                            onClick={() => toggleProduct(index)}
                                            className={cn(
                                                "p-4 bg-white border-2 rounded-[28px] transition-all duration-300 cursor-pointer group flex items-center gap-6",
                                                selectedProducts.has(index) 
                                                    ? "border-slate-950 shadow-xl shadow-slate-200" 
                                                    : "border-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="w-24 h-24 bg-slate-50 rounded-[20px] overflow-hidden border border-slate-100 shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200"><Package size={32} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="font-black text-slate-950">{product.name}</h4>
                                                    <span className="text-[10px] font-black bg-slate-50 px-2 py-0.5 rounded text-slate-400 uppercase">{product.category}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold line-clamp-2">{product.description}</p>
                                            </div>
                                            <div className="text-right pr-4">
                                                <div className="text-xl font-black text-slate-950 font-display">{formatCurrency(product.price)}</div>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 mx-auto mt-2 flex items-center justify-center transition-all",
                                                    selectedProducts.has(index) ? "bg-slate-950 border-slate-950 text-white" : "border-slate-200"
                                                )}>
                                                    {selectedProducts.has(index) && <Check size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button onClick={() => setStep('connect')} className="h-16 px-8 rounded-2xl border-2 border-slate-100 text-sm font-black text-slate-400 hover:bg-slate-50 transition-all">
                                        GO BACK
                                    </button>
                                    <button
                                        onClick={handleFinalize}
                                        className="flex-1 h-16 rounded-2xl bg-slate-950 text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                    >
                                        IMPORT {selectedProducts.size} PRODUCTS
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4: Importing ── */}
                        {step === 'importing' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin mb-8" />
                                <h2 className="text-2xl font-black text-slate-950 font-display">Finalizing Import</h2>
                                <p className="text-sm text-slate-400 font-bold">Saving products to your permanent inventory...</p>
                            </div>
                        )}

                        {/* ── STEP 5: Complete ── */}
                        {step === 'complete' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-20 space-y-8">
                                <div className="w-24 h-24 rounded-[32px] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
                                    <Check size={48} strokeWidth={4} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-3xl font-black text-slate-950 font-display">Import Successful!</h2>
                                    <p className="text-sm text-slate-400 font-bold">
                                        {importResult?.saved} products have been added to your inventory.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep('connect')} className="h-16 px-8 rounded-2xl border-2 border-slate-100 font-black text-slate-400">IMPORT MORE</button>
                                    <button onClick={() => router.push('/dashboard/products')} className="h-16 px-10 rounded-2xl bg-slate-950 text-white font-black">VIEW INVENTORY</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
