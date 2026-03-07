'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { supabase } from '@/lib/supabase';
import { LoyaltyService, LoyaltyAccount } from '@/services/loyaltyService';
import { CustomerService, Customer } from '@/services/customerService';
import { Gift, Users, TrendingUp, Award, ArrowRight, Star } from 'lucide-react';
import styles from '../customers.module.css';

export default function LoyaltyDashboard() {
    const { tenantId } = useTenant();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);
    const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]);
    const [stats, setStats] = useState({
        totalPoints: 0,
        activePrograms: 4,
        topTierCustomers: 0
    });

    useEffect(() => {
        // In a real app, we'd fetch all loyalty accounts for the tenant
        // For now, we simulate with a mock list
        const mockAccounts: LoyaltyAccount[] = [
            { id: '1', customerId: 'cust_1', points: 4500, tier: 'Gold', history: [] },
            { id: '2', customerId: 'cust_2', points: 1200, tier: 'Silver', history: [] },
            { id: '3', customerId: 'cust_3', points: 6000, tier: 'Platinum', history: [] },
            { id: '4', customerId: 'cust_4', points: 350, tier: 'Bronze', history: [] },
        ];
        setAccounts(mockAccounts);

        const total = mockAccounts.reduce((sum, acc) => sum + acc.points, 0);
        const topTier = mockAccounts.filter(acc => acc.tier === 'Platinum' || acc.tier === 'Gold').length;

        setStats({
            totalPoints: total,
            activePrograms: 4,
            topTierCustomers: topTier
        });
    }, [user]);

    return (
        <div className="animate-entrance">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="gradient-text">Loyalty & Retention</h1>
                    <p style={{ opacity: 0.7 }}>Turn one-time buyers into lifelong fans.</p>
                </div>
                <button className="btn btn-primary">
                    <Gift size={18} /> Create Reward
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Star size={20} />
                        </div>
                        <span className="text-sm font-medium opacity-70">Total Points Issued</span>
                    </div>
                    <div className="text-3xl font-bold font-mono">{stats.totalPoints.toLocaleString()}</div>
                    <div className="text-xs text-success mt-1 font-mono">↑ 12% from last month</div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-success/10 text-success">
                            <Award size={20} />
                        </div>
                        <span className="text-sm font-medium opacity-70">Top Tier Customers</span>
                    </div>
                    <div className="text-3xl font-bold font-mono">{stats.topTierCustomers}</div>
                    <div className="text-xs opacity-50 mt-1">Gold & Platinum members</div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-warning/10 text-warning">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-sm font-medium opacity-70">Retention Rate</span>
                    </div>
                    <div className="text-3xl font-bold font-mono">68%</div>
                    <div className="text-xs text-success mt-1 font-mono">↑ 5% boost from AI campaigns</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="card">
                    <h3 className="mb-6 flex items-center gap-2">
                        <Users size={18} /> Top Loyalty Members
                    </h3>
                    <div className="space-y-4">
                        {accounts.sort((a, b) => b.points - a.points).map(account => (
                            <div key={account.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white">
                                        {account.customerId.charAt(5).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold">Customer #{account.customerId.split('_')[1]}</div>
                                        <div className="text-xs opacity-50">{account.tier} Tier</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary font-mono">{account.points} pts</div>
                                    <div className="text-xs opacity-50 font-mono">Last earned 2 days ago</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-ghost w-full mt-6 text-sm">View All Members <ArrowRight size={14} /></button>
                </div>

                <div className="card">
                    <h3 className="mb-6 flex items-center gap-2">
                        <Gift size={18} /> Active Rewards
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold">10% Off Next Purchase</h4>
                                <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider font-mono">500 PTS</span>
                            </div>
                            <p className="text-xs opacity-70 mb-4">Applied automatically at checkout when points are redeemed.</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] opacity-40">Used by 142 customers</span>
                                <button className="text-xs font-bold text-primary">Edit Rules</button>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold">Free Delivery (Silver+)</h4>
                                <span className="px-2 py-1 rounded-md bg-success/20 text-success text-[10px] uppercase font-bold tracking-wider">TIER REWARD</span>
                            </div>
                            <p className="text-xs opacity-70 mb-4">Exclusive benefit for Silver tier and above.</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] opacity-40">24 active members in tier</span>
                                <button className="text-xs font-bold text-primary">Edit Rules</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
