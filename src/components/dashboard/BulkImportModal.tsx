'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { CSVParser, CSVParseResult } from '@/lib/csvParser';
import { ProductService } from '@/services/productService';
import { productSchema } from '@/lib/validations';
import { z } from 'zod';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const { tenantId } = useTenant();
    const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
    const [fileName, setFileName] = useState<string>('');
    const [results, setResults] = useState<CSVParseResult<z.infer<typeof productSchema>> | null>(null);
    const [, setIsImporting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const processFile = (file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const parsed = CSVParser.parseProducts(text);
            setResults(parsed);
            setStep('preview');
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!results || !tenantId) return;
        setIsImporting(true);
        setStep('importing');

        let successCount = 0;
        let failCount = 0;

        // Batch processing (simple sequential for now, can be optimized)
        for (const productData of results.data) {
            try {
                await ProductService.createProduct({
                    ...productData,
                    tenant_id: tenantId,
                });
                successCount++;
            } catch {
                failCount++;
            }
        }

        toast.success(`Import complete: ${successCount} added, ${failCount} failed`);
        setIsImporting(false);
        onSuccess();
        onClose();
        reset();
    };

    const reset = () => {
        setStep('upload');
        setFileName('');
        setResults(null);
        setIsImporting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-950 font-display uppercase tracking-tight">Bulk Catalog Upload</h3>
                        <p className="text-xs font-bold text-slate-400">Migrate your entire inventory using CSV precision.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-950 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'upload' && (
                        <div
                            className="group border-2 border-dashed border-slate-100 rounded-[32px] p-16 text-center hover:border-primary/30 hover:bg-slate-50/50 transition-all relative overflow-hidden"
                        >
                            <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-50 shadow-soft-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-lg font-black text-slate-950 font-display">Drop your CSV file here</h4>
                            <p className="text-sm font-semibold text-slate-400 mt-2">or click to browse your system files</p>
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">UTF-8 Encoded</span>
                                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Max 10MB</span>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && results && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary" />
                                    <div>
                                        <p className="text-xs font-black text-slate-900">{fileName}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{results.data.length} Valid Rows Detected</p>
                                    </div>
                                </div>
                                <button onClick={reset} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600">Change File</button>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {results.errors.map((err, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                                        <AlertCircle className="text-rose-500 shrink-0" size={14} />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-rose-600 uppercase">Row {err.row} Error</p>
                                            <p className="text-[11px] font-bold text-rose-900/60 leading-tight">{err.error}</p>
                                        </div>
                                    </div>
                                ))}
                                {results.data.slice(0, 5).map((prod, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
                                        <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase">Valid Product</p>
                                            <p className="text-[11px] font-bold text-slate-900/60 leading-tight">{prod.name} · {formatCurrency(prod.price)}</p>
                                        </div>
                                    </div>
                                ))}
                                {results.data.length > 5 && (
                                    <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">+{results.data.length - 5} More Rows</p>
                                )}
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={results.data.length === 0}
                                className="w-full h-16 rounded-[24px] bg-slate-950 text-white font-black uppercase tracking-widest text-sm shadow-premium hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <span>Start Ingestion</span>
                                <CheckCircle2 size={20} />
                            </button>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="py-12 text-center space-y-6">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 rounded-[32px] border-4 border-slate-100" />
                                <div className="absolute inset-0 rounded-[32px] border-4 border-primary border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="text-primary" size={32} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-950 font-display">Ingesting Catalog...</h4>
                                <p className="text-xs font-bold text-slate-400">Processing merchant data via institutional API. Do not refresh.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center gap-3">
                    <Sparkles size={14} className="text-primary" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Amina Data Optimization</p>
                </div>
            </div>
        </div>
    );
}
