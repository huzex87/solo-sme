"use client";

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data for this section. This might be a temporary connection issue.",
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <div className={cn("bg-white border border-rose-100 rounded-[32px] p-12 md:p-24 text-center shadow-premium relative overflow-hidden group", className)}>
            <div className="absolute inset-0 bg-rose-50/30 opacity-50" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-[24px] bg-rose-50 flex items-center justify-center mb-8 border border-rose-100 text-rose-500">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950 font-display">{title}</h3>
                <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                    {message}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="h-14 px-8 rounded-2xl bg-slate-950 text-white flex items-center gap-2 text-sm font-bold shadow-premium hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                    )}
                    <Link
                        href="/dashboard"
                        className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center gap-2 text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

interface EmptyStateProps {
    icon: any;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("bg-white border border-slate-100 rounded-[32px] p-12 md:p-24 text-center shadow-premium relative overflow-hidden group", className)}>
            <div className="absolute inset-0 bg-mesh opacity-5 scale-150" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8 mx-auto border border-slate-100 group-hover:rotate-12 transition-transform duration-700">
                    <Icon size={48} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-950 font-display">{title}</h3>
                <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto font-semibold leading-relaxed">
                    {description}
                </p>

                {action && (
                    <div className="mt-10">
                        {action.href ? (
                            <Link
                                href={action.href}
                                className="inline-flex h-14 px-10 rounded-2xl bg-slate-950 text-white items-center gap-2 text-sm font-bold shadow-xl shadow-slate-950/20 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                {action.label}
                            </Link>
                        ) : (
                            <button
                                onClick={action.onClick}
                                className="h-14 px-10 rounded-2xl bg-slate-950 text-white flex items-center gap-2 text-sm font-bold shadow-xl shadow-slate-950/20 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                {action.label}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
