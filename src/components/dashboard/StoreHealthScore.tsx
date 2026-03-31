'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { StoreHealthService, HealthCheck } from '@/services/storeHealthService';
import { Tenant } from '@/types';
import { AnalyticsSummary } from '@/services/analyticsService';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface StoreHealthScoreProps {
    tenant: Tenant | null;
    stats: AnalyticsSummary | null;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
    'A+': { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-200', glow: 'shadow-emerald-200/50' },
    'A': { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-200', glow: 'shadow-emerald-200/50' },
    'B': { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-200', glow: 'shadow-blue-200/50' },
    'C': { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-200', glow: 'shadow-amber-200/50' },
    'D': { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-200', glow: 'shadow-orange-200/50' },
    'F': { bg: 'bg-rose-500', text: 'text-rose-500', ring: 'ring-rose-200', glow: 'shadow-rose-200/50' },
};

export function StoreHealthScore({ tenant, stats }: StoreHealthScoreProps) {
    const health = useMemo(() => StoreHealthService.calculate(tenant, stats), [tenant, stats]);
    const colors = GRADE_COLORS[health.grade] || GRADE_COLORS['C'];

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm hover:shadow-premium transition-all duration-500 space-y-5">
            {/* Header with Score */}
            <div className="flex items-center gap-4">
                <div className={cn(
                    "relative w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-black text-2xl shadow-lg",
                    colors.bg, colors.glow
                )}>
                    {health.grade}
                    {/* Animated ring */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${health.overallScore * 1.76} 176`}
                            strokeLinecap="round"
                            className={cn("transition-all duration-1000 ease-out", colors.text)}
                            transform="rotate(-90 32 32)"
                            opacity={0.3}
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-950 font-display">Store Health</h3>
                        <span className={cn("text-xs font-extrabold px-2 py-0.5 rounded-lg", colors.bg, "text-white")}>
                            {health.overallScore}/100
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{health.summary}</p>
                </div>
            </div>

            {/* Mini progress bar */}
            <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", colors.bg)}
                    style={{ width: `${health.overallScore}%` }}
                />
            </div>

            {/* Check List (condensed) */}
            <div className="space-y-2">
                {health.checks.slice(0, 5).map((check) => (
                    <HealthCheckRow key={check.id} check={check} />
                ))}
            </div>

            {/* Top Priority Action */}
            {health.topPriority?.action && (
                <Link
                    href={health.topPriority.action.href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <TrendingUp size={16} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-950">Priority: {health.topPriority.action.label}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Biggest impact on your score</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
            )}
        </div>
    );
}

function HealthCheckRow({ check }: { check: HealthCheck }) {
    const icon = check.status === 'pass' ? <CheckCircle2 size={14} /> :
        check.status === 'warn' ? <AlertTriangle size={14} /> : <XCircle size={14} />;

    const iconColor = check.status === 'pass' ? 'text-emerald-500' :
        check.status === 'warn' ? 'text-amber-500' : 'text-rose-500';

    return (
        <div className="flex items-center gap-3 py-1">
            <span className={cn("shrink-0", iconColor)}>{icon}</span>
            <span className="flex-1 text-xs font-semibold text-slate-600 truncate">{check.label}</span>
            {check.action ? (
                <Link
                    href={check.action.href}
                    className="text-[11px] font-bold text-primary hover:underline shrink-0"
                >
                    Fix
                </Link>
            ) : (
                <span className="text-[11px] font-semibold text-emerald-500 shrink-0">Done</span>
            )}
        </div>
    );
}
