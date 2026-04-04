import React, { useEffect, useState } from 'react';
import {
    Sparkles,
    TrendingUp,
    ShoppingBag,
    MessageSquare,
    CreditCard,
    ArrowRight,
    Loader2,
    Zap,
    Shield,
    Lock
} from 'lucide-react';
import { logger } from '@/lib/logger';
import styles from './PulseFeed.module.css';
import Link from 'next/link';

interface PulseAction {
    id: string;
    type: 'inventory' | 'sales' | 'marketing' | 'support' | 'finance' | 'admin' | 'security';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: React.ElementType;
    actionLabel: string;
    actionHref?: string;
    actionFn?: () => void;
    metadata?: Record<string, unknown>;
}

export default function PulseFeed({ tenantId }: { tenantId: string }) {
    const [actions, setActions] = useState<PulseAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function generatePulse() {
            setLoading(true);
            try {
                const response = await fetch(`/api/ai/pulse?tenantId=${tenantId}`);
                const data = await response.json();
                
                if (data.pulse) {
                    const iconMap: Record<string, React.ElementType> = {
                        inventory: ShoppingBag,
                        sales: TrendingUp,
                        marketing: Sparkles,
                        support: MessageSquare,
                        finance: CreditCard,
                        admin: Shield,
                        security: Lock
                    };

                    const realActions: PulseAction[] = data.pulse.map((item: any) => ({
                        ...item,
                        icon: iconMap[item.type] || Zap
                    }));

                    setActions(realActions);
                }
            } catch (err) {
                logger.error('Pulse Feed generation failed', err);
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
                <span>Updating Intelligence...</span>
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
                {actions.length > 0 ? (
                    actions.map((action) => (
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
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
                         <Sparkles size={32} className="mb-2" />
                         <p className="text-xs font-bold uppercase tracking-widest">Awaiting Pulse...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
