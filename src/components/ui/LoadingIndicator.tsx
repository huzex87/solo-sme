"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    text?: string;
}

export function LoadingIndicator({
    className,
    size = "md",
    text = "Loading..."
}: LoadingIndicatorProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
            {text && <p className="text-sm font-medium text-muted-foreground animate-pulse">{text}</p>}
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <LoadingIndicator size="lg" text="Preparing your dashboard..." />
        </div>
    );
}

export function SectionLoading() {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-border p-12 flex items-center justify-center shadow-sm">
            <LoadingIndicator size="md" text="Loading section..." />
        </div>
    );
}
