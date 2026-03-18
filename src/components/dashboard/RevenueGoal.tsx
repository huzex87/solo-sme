'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { Target, Trophy, Star, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { useTenant } from '@/context/TenantContext';

interface RevenueGoalProps {
    currentRevenue: number;
    currency?: string;
}

interface Milestone {
    amount: number;
    label: string;
    emoji: string;
    achieved: boolean;
}

const DEFAULT_MILESTONES = [
    { amount: 10000, label: 'First Sale', emoji: '🎉' },
    { amount: 50000, label: 'Rising Star', emoji: '⭐' },
    { amount: 100000, label: '100K Club', emoji: '🔥' },
    { amount: 500000, label: 'Half Million', emoji: '💎' },
    { amount: 1000000, label: 'Millionaire', emoji: '👑' },
    { amount: 5000000, label: 'Empire Builder', emoji: '🏆' },
    { amount: 10000000, label: 'Legend', emoji: '🌟' },
];

export function RevenueGoal({ currentRevenue, currency }: RevenueGoalProps) {
    const { tenant } = useTenant();
    const [showCelebration, setShowCelebration] = useState(false);
    const [goalAmount, setGoalAmount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    // Calculate milestones
    const milestones: Milestone[] = useMemo(() =>
        DEFAULT_MILESTONES.map(m => ({
            ...m,
            achieved: currentRevenue >= m.amount,
        })),
        [currentRevenue]
    );

    // Determine the next goal (first unachieved milestone or custom goal)
    useEffect(() => {
        // Try to load saved goal from localStorage
        const savedGoal = localStorage.getItem(`solo_revenue_goal_${tenant?.id}`);
        if (savedGoal) {
            setGoalAmount(parseInt(savedGoal));
        } else {
            // Auto-set to next milestone
            const nextMilestone = milestones.find(m => !m.achieved);
            setGoalAmount(nextMilestone?.amount || currentRevenue * 2 || 100000);
        }
    }, [tenant?.id, milestones, currentRevenue]);

    // Check for newly achieved milestones
    useEffect(() => {
        const lastCelebrated = localStorage.getItem(`solo_last_milestone_${tenant?.id}`);
        const lastAmount = lastCelebrated ? parseInt(lastCelebrated) : 0;

        const newlyAchieved = milestones.find(m => m.achieved && m.amount > lastAmount);
        if (newlyAchieved) {
            setShowCelebration(true);
            localStorage.setItem(`solo_last_milestone_${tenant?.id}`, String(newlyAchieved.amount));
            setTimeout(() => setShowCelebration(false), 5000);
        }
    }, [milestones, tenant?.id]);

    const saveGoal = (amount: number) => {
        setGoalAmount(amount);
        localStorage.setItem(`solo_revenue_goal_${tenant?.id}`, String(amount));
        setIsEditing(false);
    };

    const progress = goalAmount > 0 ? Math.min((currentRevenue / goalAmount) * 100, 100) : 0;
    const remaining = Math.max(goalAmount - currentRevenue, 0);

    // Find the current and next milestone
    const achievedMilestones = milestones.filter(m => m.achieved);
    const currentMilestone = achievedMilestones[achievedMilestones.length - 1];
    const nextMilestone = milestones.find(m => !m.achieved);

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-soft-sm hover:shadow-premium transition-all duration-500 space-y-5 relative overflow-hidden">
            {/* Celebration overlay */}
            {showCelebration && (
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-amber-500/90 to-orange-500/90 rounded-[32px] flex flex-col items-center justify-center text-white animate-entrance">
                    <div className="text-5xl animate-bounce mb-3">{currentMilestone?.emoji || '🎉'}</div>
                    <h3 className="text-xl font-black font-display">Milestone Reached!</h3>
                    <p className="text-sm font-semibold opacity-80 mt-1">{currentMilestone?.label}</p>
                    <p className="text-xs font-bold opacity-60 mt-3">
                        {formatCurrency(currentMilestone?.amount || 0, currency)}
                    </p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-extrabold text-slate-950 font-display">Revenue Goal</h3>
                        <p className="text-[10px] text-slate-400 font-bold">
                            {progress >= 100 ? 'Goal reached! Set a new one.' : `${remaining > 0 ? formatCurrency(remaining, currency) : ''} to go`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[10px] font-bold text-primary hover:underline"
                >
                    {isEditing ? 'Cancel' : 'Edit Goal'}
                </button>
            </div>

            {/* Goal Editor */}
            {isEditing && (
                <div className="flex gap-2 animate-entrance">
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₦</span>
                        <input
                            type="number"
                            defaultValue={goalAmount}
                            className="w-full pl-8 pr-3 h-10 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    saveGoal(parseInt((e.target as HTMLInputElement).value) || 100000);
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-1">
                        {[100000, 500000, 1000000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => saveGoal(amt)}
                                className="px-3 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-950 font-display">{formatCurrency(currentRevenue, currency)}</span>
                    <span className="text-slate-400">{formatCurrency(goalAmount, currency)}</span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden relative">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out relative",
                            progress >= 100 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                                progress >= 60 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
                                    "bg-gradient-to-r from-blue-400 to-blue-500"
                        )}
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 10 && (
                            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/30 rounded-full animate-pulse" />
                        )}
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold text-center">{progress.toFixed(0)}% complete</p>
            </div>

            {/* Milestone Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {milestones.slice(0, 5).map((milestone) => (
                    <div
                        key={milestone.amount}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap transition-all shrink-0",
                            milestone.achieved
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                        )}
                        title={milestone.label}
                    >
                        <span>{milestone.emoji}</span>
                        <span>{milestone.achieved ? milestone.label : formatCurrency(milestone.amount, currency)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
