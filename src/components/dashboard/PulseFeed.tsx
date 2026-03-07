import React, { useEffect, useState } from 'react';
import {
    Sparkles,
    AlertCircle,
    TrendingUp,
    ShoppingBag,
    MessageSquare,
    CreditCard,
    ArrowRight,
    Loader2,
    Zap
} from 'lucide-react';
import { formatNaira } from '@/lib/formatNaira';
import styles from './PulseFeed.module.css';
import Link from 'next/link';

interface PulseAction {
    id: string;
    type: 'inventory' | 'sales' | 'marketing' | 'support' | 'finance';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: React.ElementType;
    actionLabel: string;
    actionHref?: string;
    actionFn?: () => void;
    metadata?: any;
}

export default function PulseFeed({ tenantId }: { tenantId: string }) {
    const [actions, setActions] = useState<PulseAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generatePulse() {
            setLoading(true);
            try {
                // In a real app, this would be an AI-driven service aggregation
                // Simulating intelligence logic here
                const mockActions: PulseAction[] = [
                    {
                        id: 'low-stock-1',
                        type: 'inventory',
                        priority: 'high',
                        title: 'Low Stock Alert: Chicken Pie',
                        description: 'Based on current sales, you will run out of "Chicken Pie" in 2 days. Restock now to maintain momentum.',
                        icon: AlertCircle,
                        actionLabel: 'Restock Now',
                        actionHref: '/dashboard/products'
                    },
                    {
                        id: 'sales-recovery-1',
                        type: 'sales',
                        priority: 'medium',
                        title: 'Abandoned Cart: ₦12,500',
                        description: 'A customer left items in their cart 2 hours ago. Send a friendly reminder or discount code via WhatsApp.',
                        icon: ShoppingBag,
                        actionLabel: 'Recovery Options',
                        actionHref: '/dashboard/orders'
                    },
                    {
                        id: 'marketing-insight-1',
                        type: 'marketing',
                        priority: 'medium',
                        title: 'Trending Insight',
                        description: 'Morning sales for "Iced Coffee" are up 40% this week. We\'ve drafted a social post for your morning promo.',
                        icon: TrendingUp,
                        actionLabel: 'Review & Post',
                        actionHref: '/dashboard/marketing'
                    },
                    {
                        id: 'payout-ready-1',
                        type: 'finance',
                        priority: 'low',
                        title: 'Payout Available: ₦45,200',
                        description: 'Your cleared balance from weekend sales is ready for withdrawal.',
                        icon: CreditCard,
                        actionLabel: 'Withdraw Funds',
                        actionHref: '/dashboard/payouts'
                    }
                ];

                setActions(mockActions);
            } catch (err) {
                console.error('Pulse Feed error:', err);
            } finally {
                setLoading(false);
            }
        }

        if (tenantId) generatePulse();
    }, [tenantId]);

    if (loading) {
        return (
            <div className={styles.loadingPulse}>
                <Loader2 className="animate-spin" size={24} />
                <span>Syncing Pulse...</span>
            </div>
        );
    }

    return (
        <div className={styles.pulseContainer}>
            <div className={styles.pulseHeader}>
                <div className={styles.pulseTitleWrapper}>
                    <div className={styles.pulseIndicator}>
                        <Zap size={14} fill="currentColor" />
                    </div>
                    <h3 className={styles.pulseTitle}>The Pulse</h3>
                </div>
                <div className={styles.pulseStatus}>Live Intelligence</div>
            </div>

            <div className={styles.actionsList}>
                {actions.map((action) => (
                    <div key={action.id} className={`${styles.actionCard} ${styles[action.priority]}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconWrapper}>
                                <action.icon size={18} />
                            </div>
                            <div className={styles.priorityBadge}>
                                <div className={styles.dot}></div>
                                {action.priority} priority
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <h4 className={styles.actionTitle}>{action.title}</h4>
                            <p className={styles.actionDesc}>{action.description}</p>
                        </div>

                        <div className={styles.cardFooter}>
                            {action.actionHref ? (
                                <Link href={action.actionHref} className={styles.actionBtn}>
                                    <span>{action.actionLabel}</span>
                                    <ArrowRight size={14} />
                                </Link>
                            ) : (
                                <button className={styles.actionBtn} onClick={action.actionFn}>
                                    <span>{action.actionLabel}</span>
                                    <ArrowRight size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
