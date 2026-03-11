'use client';

import { cn } from "@/lib/utils";

interface SalesTrend {
    date: string;
    amount: number;
}

export default function SalesChart({ data }: { data: SalesTrend[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                No sales activity recorded in this period
            </div>
        );
    }

    const maxAmount = Math.max(...data.map(d => d.amount), 1);

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between h-48 gap-2 px-1">
                {data.map((item, index) => {
                    const height = (item.amount / maxAmount) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full">
                            <div className="flex-1 w-full flex items-end justify-center">
                                <div
                                    className="w-full max-w-[32px] bg-primary-light group-hover:bg-primary rounded-t-sm transition-all duration-500 ease-out relative group/bar"
                                    style={{
                                        height: `${height}%`,
                                        animationDelay: `${index * 0.05}s`
                                    }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                        ₦{item.amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                                {item.date}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Legend/Axis */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <span>0</span>
                <span>₦{(maxAmount / 2).toLocaleString()}</span>
                <span>₦{maxAmount.toLocaleString()}</span>
            </div>
        </div>
    );
}
