'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { LoyaltyAccount } from '@/services/loyaltyService';
import { Gift, Users, TrendingUp, Award, Star, Disc, Clock, Activity, Plus, ChevronRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function LoyaltyDashboard() {
    const { tenantId, tenantName } = useTenant();
    const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPoints: 0,
        topTierCustomers: 0,
        retentionIndex: 94,
        activeCampaigns: 2
    });
    const [thresholds, setThresholds] = useState({
        Silver: 500,
        Gold: 2000,
        Platinum: 5000
    });
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [orchestratedReward, setOrchestratedReward] = useState<string | null>(null);

    const handleOrchestrate = (name: string) => {
        setOrchestratedReward(name);
        setTimeout(() => setOrchestratedReward(null), 3000);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const mockAccounts: LoyaltyAccount[] = [
                {
                    id: '1', customerId: 'cust_1', points: 4500, tier: 'Gold', history: [
                        { id: 'h1', type: 'earn', points: 500, description: 'Direct Purchase', date: new Date().toISOString() }
                    ]
                },
                { id: '2', customerId: 'cust_2', points: 1200, tier: 'Silver', history: [] },
                {
                    id: '3', customerId: 'cust_3', points: 8200, tier: 'Platinum', history: [
                        { id: 'h2', type: 'earn', points: 1200, description: 'Bulk Order Bonus', date: new Date().toISOString() }
                    ]
                },
                { id: '4', customerId: 'cust_4', points: 350, tier: 'Bronze', history: [] },
                { id: '5', customerId: 'cust_5', points: 2100, tier: 'Gold', history: [] },
            ];

            setAccounts(mockAccounts);

            const total = mockAccounts.reduce((sum, acc) => sum + acc.points, 0);
            const topTier = mockAccounts.filter(acc => acc.tier === 'Platinum' || acc.tier === 'Gold').length;

            setStats(prev => ({
                ...prev,
                totalPoints: total,
                topTierCustomers: topTier,
            }));
        } catch (error) {
            console.error('Error fetching loyalty data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const TIER_STYLES: Record<string, string> = {
        'Platinum': 'bg-slate-900 text-white',
        'Gold': 'bg-amber-100 text-amber-700 border-amber-200',
        'Silver': 'bg-slate-100 text-slate-700 border-slate-200',
        'Bronze': 'bg-orange-50 text-orange-700 border-orange-100'
    };

    const getNextTierProgress = (points: number) => {
        if (points >= thresholds.Platinum) return 100;
        if (points >= thresholds.Gold) return ((points - thresholds.Gold) / (thresholds.Platinum - thresholds.Gold)) * 100;
        if (points >= thresholds.Silver) return ((points - thresholds.Silver) / (thresholds.Gold - thresholds.Silver)) * 100;
        return (points / thresholds.Silver) * 100;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                <p className="text-slate-500 text-xs font-medium">Loading Loyalty Systems...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Loyalty Rewards</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage customer retention and reward programs for <span className="text-slate-900 font-semibold">{tenantName}</span>.</p>
                </div>
                <button className="btn btn-primary px-6 py-2.5 rounded-xl shadow-sm self-start flex items-center gap-2">
                    <Plus size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">New Campaign</span>
                </button>
            </header>

            {/* Stats Layer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Points', value: stats.totalPoints.toLocaleString(), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', trend: '+12.4% Momentum' },
                    { label: 'Elite Members', value: stats.topTierCustomers, icon: Award, color: 'text-purple-500', bg: 'bg-purple-50', hint: 'Platinum & Gold' },
                    { label: 'Retention Rate', value: `${stats.retentionIndex}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50', hint: 'High Stability' }
                ].map((stat, i) => (
                    <div key={i} className="card p-6 bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                            {stat.trend ? (
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-2 inline-block">
                                    {stat.trend}
                                </span>
                            ) : (
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-2 inline-block">
                                    {stat.hint}
                                </span>
                            )}
                        </div>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Leaderboard */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Members</h3>
                            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {accounts.sort((a, b) => b.points - a.points).map((account, i) => (
                                <div key={account.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                            {account.customerId.charAt(5).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Customer #{account.customerId.split('_')[1]}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", TIER_STYLES[account.tier])}>
                                                    {account.tier}
                                                </span>
                                                <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${getNextTierProgress(account.points)}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-900 leading-none">
                                            {account.points.toLocaleString()}
                                            <span className="text-[9px] text-slate-400 ml-1 font-medium uppercase">pts</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter self-end">Top 1%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Config</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                {Object.entries(thresholds).map(([tier, value]) => (
                                    <div key={tier} className="text-right">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">{tier}</p>
                                        <p className="text-[10px] font-bold text-slate-900">₦{(value * 10).toLocaleString()}</p>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setIsConfiguring(!isConfiguring)}
                                    className="ml-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
                                >
                                    {isConfiguring ? 'Save' : 'Tune'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits & Pulse */}
                <div className="space-y-6">
                    <div className="card p-6 bg-white border border-slate-100 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Benefits</h4>
                        <div className="space-y-4">
                            {[
                                { title: '10% Platform Credit', cost: '500 PTS', desc: 'Universal Redemption', color: 'text-primary' },
                                { title: 'Free Express Logistics', cost: 'Silver Tier', desc: 'Auto-applied', color: 'text-purple-600' }
                            ].map((benefit, i) => (
                                <div key={i} className="p-4 rounded-xl border border-dashed border-slate-200 hover:border-primary transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="text-sm font-bold text-slate-900 leading-tight">{benefit.title}</h5>
                                        <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100", benefit.color)}>{benefit.cost}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mb-3">{benefit.desc}</p>
                                    <button
                                        onClick={() => handleOrchestrate(benefit.title)}
                                        className="w-full py-2 rounded-lg bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                                    >
                                        {orchestratedReward === benefit.title ? 'Applied ✓' : 'Apply to Store'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6 bg-slate-900 border-none shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-primary" />
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Activity Pulse</h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { text: 'Elite Threshold Breach', time: '2m ago', sub: 'Customer #003 migrated to Platinum.' },
                                    { text: 'Batch Accrual Sync', time: '1h ago', sub: '1,200 points synced via API.' }
                                ].map((pulse, i) => (
                                    <div key={i} className="border-l border-white/10 pl-3 py-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[11px] font-bold text-white">{pulse.text}</span>
                                            <span className="text-[8px] text-white/40 uppercase">{pulse.time}</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 leading-relaxed">{pulse.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
