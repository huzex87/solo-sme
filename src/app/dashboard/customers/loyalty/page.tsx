'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTenant } from '@/context/TenantContext';
import { LoyaltyService, LoyaltyAccount } from '@/services/loyaltyService';
import { Gift, Users, TrendingUp, Award, ArrowRight, Star, Disc, Clock, Activity } from 'lucide-react';
import styles from './loyalty.module.css';

export default function LoyaltyDashboard() {
    const { tenantId, tenantName } = useTenant();
    const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPoints: 0,
        topTierCustomers: 0,
        retentionIndex: 94, // Mocked for now as per design
        activeCampaigns: 2
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // In a real scenario, we might have a LoyaltyService.getAllAccounts(tenantId)
            // For now, we'll stick to the high-fidelity mock data but through a more structured approach
            // and prepare for service integration.
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

    const TIER_COLORS: Record<string, string> = {
        'Platinum': styles.platinum,
        'Gold': styles.gold,
        'Silver': styles.silver,
        'Bronze': styles.bronze
    };

    const getNextTierProgress = (points: number) => {
        if (points >= 5000) return 100; // Platinum
        if (points >= 2000) return ((points - 2000) / 3000) * 100; // Toward Platinum
        if (points >= 500) return ((points - 500) / 1500) * 100; // Toward Gold
        return (points / 500) * 100; // Toward Silver
    };

    return (
        <div className="animate-entrance max-w-[1400px] mx-auto">
            <header className="mb-10 flex justify-between items-end bg-surface/50 p-6 rounded-3xl border border-border/50 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-accent/10 text-accent text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Sovereign Protocol v3.1</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                    </div>
                    <h1 className="text-5xl font-black mb-2 tracking-tight text-ink font-display capitalize">Loyalty HQ</h1>
                    <p className="text-secondary font-medium text-lg">Retention mapping & reward orchestration for <span className="text-ink font-bold">{tenantName}</span>.</p>
                </div>
                <button className="btn btn-amber shadow-xl shadow-amber/20 px-8 py-4 rounded-2xl group transition-all hover:scale-[1.02]">
                    <Gift size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-wider">Initialize Reward Campaign</span>
                </button>
            </header>

            {/* ── SOVEREIGN STAT LAYER ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="crystalCard card-accent-amber p-8 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                        <Star size={180} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="icon-bg icon-bg-amber glow-amber scale-110">
                            <Star size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary block mb-0.5">Global Yield</span>
                            <span className="text-xs font-bold text-accent">Total Points Ledger</span>
                        </div>
                    </div>
                    <div className="text-5xl font-black font-display text-ink tracking-tighter">
                        {stats.totalPoints.toLocaleString()}
                        <span className="text-sm text-secondary ml-2 font-mono">PTS</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 bg-success/5 self-start px-3 py-1.5 rounded-xl border border-success/10">
                        <TrendingUp size={14} className="text-success" />
                        <span className="text-xs text-success font-black tracking-tight">+12.4% Momentum</span>
                    </div>
                </div>

                <div className="crystalCard card-accent-purple p-8 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110 group-hover:rotate-12">
                        <Award size={180} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="icon-bg icon-bg-purple glow-purple scale-110">
                            <Award size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary block mb-0.5">Tier Saturation</span>
                            <span className="text-xs font-bold text-purple">Sovereign Members</span>
                        </div>
                    </div>
                    <div className="text-5xl font-black font-display text-ink tracking-tighter">{stats.topTierCustomers}</div>
                    <div className="text-[10px] text-secondary font-bold uppercase mt-4 tracking-widest flex items-center gap-2 opacity-70">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple"></div>
                        <span>Platinum & Gold Status Active</span>
                    </div>
                </div>

                <div className="crystalCard card-accent-green p-8 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                        <Disc size={180} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="icon-bg icon-bg-green glow-green scale-110">
                            <Activity size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-secondary block mb-0.5">Retention Health</span>
                            <span className="text-xs font-bold text-success">Business Continuity</span>
                        </div>
                    </div>
                    <div className="text-5xl font-black font-display text-ink tracking-tighter">{stats.retentionIndex}%</div>
                    <div className="text-[10px] text-secondary font-bold uppercase mt-4 tracking-widest flex items-center gap-2 opacity-70">
                        <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                        <span>Institutional Grade Pulse</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
                {/* ── INSTITUTIONAL LEADERBOARD ── */}
                <div className="xl:col-span-4 crystalCard p-10 rounded-[40px]">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <Users size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-ink tracking-tight">Member Leaderboard</h3>
                                <p className="text-xs font-medium text-secondary">Mapping highest value sovereign accounts</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-[0.15em] bg-surface/80 border border-border px-4 py-2 rounded-xl">
                                Top Performance
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {accounts.sort((a, b) => b.points - a.points).map((account, i) => (
                            <div key={account.id} className={styles.leaderboardItem}>
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-surface shadow-2xl bg-gradient-to-br from-surface to-border/30 flex items-center justify-center font-black text-2xl text-secondary/40">
                                            {account.customerId.charAt(5).toUpperCase()}
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg border-2 border-ink flex items-center justify-center text-xs font-black shadow-lg ${TIER_COLORS[account.tier]}`}>
                                            #{i + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="font-black text-ink text-lg tracking-tight">Customer #{account.customerId.split('_')[1]}</div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`${styles.tierBadge} ${TIER_COLORS[account.tier]} shadow-sm`}>{account.tier} Status</span>
                                            <div className="flex flex-col gap-1 w-full max-w-[120px]">
                                                <div className={styles.progressBar}>
                                                    <div className={styles.progressFill} style={{ width: `${getNextTierProgress(account.points)}%` }}></div>
                                                </div>
                                                <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Progress to Next Tier</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black font-display text-accent tracking-tighter">
                                        {account.points.toLocaleString()}
                                        <span className="text-[10px] text-secondary ml-1 font-mono opacity-50 uppercase tracking-widest">pts</span>
                                    </div>
                                    <div className="text-[10px] font-black text-success uppercase tracking-[0.2em] mt-1 bg-success/10 px-2 py-0.5 rounded inline-block">Top Contributor</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-ghost w-full mt-10 h-16 rounded-2xl gap-3 group text-xs font-black uppercase tracking-[0.3em] border-2 border-border/50 hover:bg-surface hover:border-accent transition-all">
                        <span>Sync Global Membership Matrix</span>
                        <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {/* ── BENEFIT HUB & PULSE ── */}
                <div className="xl:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="flex items-center gap-3 text-2xl font-black tracking-tight text-ink">
                                <Award size={26} className="text-accent" />
                                <span>Benefit Hub</span>
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className={styles.rewardCoupon}>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h4 className="text-xl font-black leading-[1.1] text-ink mb-1 font-display">10% Platform <br />Redemption</h4>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Universal Checkout Logic</p>
                                    </div>
                                    <div className={styles.pointsBadge}>500 <span className="text-[8px] opacity-70">PTS</span></div>
                                </div>
                                <div className={styles.couponDashed}></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-xl border-2 border-white bg-surface flex items-center justify-center text-[10px] font-black text-secondary shadow-sm">U</div>
                                        ))}
                                        <div className="w-8 h-8 rounded-xl border-2 border-white bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent shadow-sm">+139</div>
                                    </div>
                                    <button className="text-xs font-black text-accent uppercase tracking-[0.15em] hover:text-accent-dk transition-colors">Orchestrate</button>
                                </div>
                            </div>

                            <div className={styles.rewardCoupon}>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h4 className="text-xl font-black leading-[1.1] text-ink mb-1 font-display">Logistics <br />Sponsorship</h4>
                                        <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">Silver Tier & Above</p>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-purple/10 text-purple text-[10px] font-black uppercase tracking-widest border border-purple/20 shadow-sm">Tier Exclusive</div>
                                </div>
                                <div className={styles.couponDashed}></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success"></div>
                                        <span className="text-[10px] font-black text-secondary tracking-widest">24 Active Recipients</span>
                                    </div>
                                    <button className="text-xs font-black text-accent uppercase tracking-[0.15em] hover:text-accent-dk transition-colors">Modify Tiers</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── LOYALTY ACTIVITY PULSE ── */}
                    <div className="crystalCard p-8 rounded-[32px] border-t-4 border-t-accent shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-ink text-accent flex items-center justify-center">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-ink tracking-tight">Active Pulse</h3>
                        </div>

                        <div className={styles.activityPulse}>
                            <div className={styles.pulseItem}>
                                <div className={styles.pulseDot}></div>
                                <div className="text-xs font-black text-ink mb-1 tracking-tight">Platinum Threshold Breach</div>
                                <p className="text-[10px] text-secondary font-medium leading-relaxed">Customer #cust_3 migrated to Platinum Status. Automated notification dispatched.</p>
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-2 block">2 Minutes Ago</span>
                            </div>

                            <div className={styles.pulseItem}>
                                <div className={`${styles.pulseDot} bg-success shadow-success`}></div>
                                <div className="text-xs font-black text-ink mb-1 tracking-tight">Batch Point Accrual</div>
                                <p className="text-[10px] text-secondary font-medium leading-relaxed">1,200 PTS credited to sovereign accounts via Instagram API sync.</p>
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-2 block">1 Hour Ago</span>
                            </div>

                            <div className={styles.pulseItem}>
                                <div className={`${styles.pulseDot} bg-secondary shadow-secondary`}></div>
                                <div className="text-xs font-black text-ink mb-1 tracking-tight">Campaign Optimization</div>
                                <p className="text-[10px] text-secondary font-medium leading-relaxed">System suggested "Limited Platinum" campaign based on retention index.</p>
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest mt-2 block">4 Hours Ago</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-ink text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={18} className="text-accent" />
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-accent">Loyalty Intelligence</h4>
                            </div>
                            <p className="text-sm font-medium leading-relaxed opacity-90">Your <span className="text-accent font-black">"Retention Index"</span> is 12% higher than average SMEs. The system has pre-calculated a <span className="underline decoration-accent underline-offset-4">Premium Outreach</span> strategy.</p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-[0.05] group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12 translate-x-4 translate-y-4">
                            <TrendingUp size={120} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
