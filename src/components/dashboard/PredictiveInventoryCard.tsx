"use client";

import {
    CheckCircle2,
    TrendingUp,
    ArrowRight,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictiveItem {
    id: string;
    name: string;
    stock: number;
    runwayDays: number;
    dailyVelocity: number;
    status: 'CRITICAL' | 'LOW' | 'STABLE';
}

interface PredictiveInventoryCardProps {
    items: PredictiveItem[];
}

export function PredictiveInventoryCard({ items }: PredictiveInventoryCardProps) {
    const criticalItems = items.filter(i => i.status === 'CRITICAL' || i.status === 'LOW');

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp size={80} />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20">
                    <Clock size={24} />
                </div>
                <div>
                    <h4 className="font-extrabold text-slate-950">Stock Predictions</h4>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Growth Forecast Engine</p>
                </div>
            </div>

            <div className="space-y-4">
                {criticalItems.length > 0 ? (
                    criticalItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-accent-border transition-all">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    item.status === 'CRITICAL' ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                                )} />
                                <div>
                                    <p className="text-[11px] font-black text-slate-900 truncate max-w-[120px]">{item.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                        Runway: <span className={cn(
                                            item.status === 'CRITICAL' ? "text-rose-500" : "text-amber-500"
                                        )}>{item.runwayDays} days left</span>
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-900 leading-none">{item.stock}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">In Stock</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-6 text-center space-y-3">
                        <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Inventory Stable<br />
                            <span className="text-[10px] opacity-60">High runway across all SKUs</span>
                        </p>
                    </div>
                )}

                <button className="w-full h-12 rounded-2xl border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-all flex items-center justify-center gap-2">
                    View Full Runway Analysis
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
