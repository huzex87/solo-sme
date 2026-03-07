'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Megaphone, Target, Share2, MessageSquare, Sparkles, Loader2, Zap } from 'lucide-react';
import styles from './marketing.module.css';
import { AutomationService, AutomationSequence } from '@/services/automationService';
import { useTenant } from '@/context/TenantContext';
import CampaignStudio from '../../../components/dashboard/marketing/CampaignStudio';
import EmptyState from '@/components/shared/EmptyState';
import { formatNaira } from '@/lib/formatNaira';

export default function MarketingPage() {
    const { tenantId } = useTenant();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showStudio, setShowStudio] = useState(false);

    interface AutomationDisplay {
        id: string;
        name: string;
        description: string;
        active: boolean;
        revenue: number;
    }

    const [automations, setAutomations] = useState<AutomationDisplay[]>([]);

    useEffect(() => {
        if (!tenantId) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const data = await AutomationService.getSequences(tenantId);
                // If no sequences exist, we'll initialize with defaults for the UI
                if (data.length === 0) {
                    setAutomations([
                        { id: 'cart', name: 'Abandoned Cart Recovery', description: 'Recover lost sales with AI-powered reminders', active: true, revenue: 45000 },
                        { id: 'welcome', name: 'New Customer Welcome', description: 'Auto-send discount to first-time visitors', active: true, revenue: 12000 },
                        { id: 'winback', name: 'Dormant Customer Win-back', description: 'Re-engage customers who haven\'t bought in 30 days', active: false, revenue: 0 },
                        { id: 'loyalty', name: 'VIP Loyalty Rewards', description: 'Reward top 5% of customers automatically', active: true, revenue: 8500 }
                    ]);
                } else {
                    setAutomations(data.map((d: AutomationSequence) => ({
                        id: d.id,
                        name: d.trigger_type.replace('_', ' ').toUpperCase(),
                        description: d.trigger_type === 'abandoned_cart' ? 'Recover lost sales' : 'Automated retention',
                        active: d.status === 'active',
                        revenue: d.conversions * 5000 // Placeholder multiplier for demo
                    })));
                }
            } catch (err: unknown) {
                console.error('[Marketing] Init failed:', err);
                setError('Unable to sync automation sequences. Please check your connection.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [tenantId]);

    const toggleAutomation = async (id: string, currentStatus: string) => {
        // Optimistic update
        setAutomations(prev => prev.map(a =>
            a.id === id ? { ...a, active: !a.active } : a
        ));

        await AutomationService.toggleSequence(id, currentStatus);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem', gap: '1.5rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Initializing Growth Engine...</p>
            </div>
        );
    }

    if (error) {
        return (
            <EmptyState
                icon={TrendingUp}
                title="Marketing Hub Still Growing"
                description="We're building automated campaigns and AI-driven growth tools to help your shop scale automatically."
                action={
                    <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={() => {
                            const caption = "🚀 New drop alert! Our latest collection is now live. Quality you can trust at prices you'll love. Click the link in bio to shop now! #SOLOSME #QualityMerchant";
                            navigator.clipboard.writeText(caption);
                            alert("AI Suggestion Copied: \n\n" + caption);
                        }}>
                            <Sparkles size={16} />
                            Copy Magic Caption
                        </button>
                    </div>
                }
            />
        );
    }

    const totalAutomatedRevenue = automations.reduce((sum, a) => sum + (a.active ? a.revenue : 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Marketing Hub</h1>
                    <p className={styles.subtitle}>Supercharge your growth with AI-driven automation.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowStudio(true)}>
                    <Sparkles size={18} style={{ marginRight: '8px' }} />
                    AI Campaign Studio
                </button>
            </div>

            <div className={styles.metricsGrid}>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Automated Revenue</span>
                    <h2 className={styles.metricValue}>{formatNaira(totalAutomatedRevenue)}</h2>
                    <span className={styles.metricSub}>✨ Powered by SOLO AI</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Conversion Uplift</span>
                    <h2 className={styles.metricValue}>+14.2%</h2>
                    <span className={styles.metricSub}>From recovery flows</span>
                </div>
                <div className={`card ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Active Sequences</span>
                    <h2 className={styles.metricValue}>{automations.filter(a => a.active).length}</h2>
                    <span className={styles.metricSub}>Running autonomously</span>
                </div>
            </div>

            <div className={styles.automationGrid}>
                <div className={`card ${styles.sectionCard}`}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Retention Automations</h3>
                        <Target size={20} color="var(--text-tertiary)" />
                    </div>

                    {automations.map(a => (
                        <div key={a.id} className={styles.automationCard}>
                            <div className={styles.automationInfo}>
                                <h4>{a.name}</h4>
                                <p>{a.description}</p>
                                {a.active && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
                                        <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Generated {formatNaira(a.revenue)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={a.active}
                                    onChange={() => toggleAutomation(a.id, a.active ? 'paused' : 'active')}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    ))}
                </div>

                <div className={`card ${styles.campaignCard}`}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Campaign Studio</h3>
                        <Zap size={20} color="var(--accent-primary)" />
                    </div>

                    <div className={styles.aiFeature}>
                        <div className={styles.aiIcon}>
                            <Sparkles size={24} color="var(--accent-primary)" />
                        </div>
                        <div className={styles.aiText}>
                            <h4>Intelligent Email/SMS</h4>
                            <p>Generate high-converting copy in seconds using product data.</p>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            &quot;Launch an Independence Day Sale campaign targeting your most loyal customers with a 15% discount.&quot;
                        </p>
                    </div>

                    <button className="btn btn-primary btn-block" onClick={() => setShowStudio(true)}>
                        Open AI Studio
                    </button>
                </div>
            </div>

            {showStudio && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <CampaignStudio onClose={() => setShowStudio(false)} />
                </div>
            )}
        </div>
    );
}
