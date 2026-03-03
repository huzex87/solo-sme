'use client';

import { useEffect, useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { MarketplaceService, MarketplaceChannel } from '@/services/marketplaceService';
import {
    Instagram,
    Facebook,
    Share2,
    RefreshCw,
    ExternalLink,
    ShieldCheck,
    ArrowUpRight,
    ShoppingBag
} from 'lucide-react';
import styles from './marketplace.module.css';

export default function MarketplacePage() {
    const { tenantId, isLoading: isTenantLoading } = useTenant();
    const [channels, setChannels] = useState<MarketplaceChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    useEffect(() => {
        if (isTenantLoading) return;
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetchChannels = async () => {
            const data = await MarketplaceService.getChannels(tenantId);
            setChannels(data);
            setLoading(false);
        };
        fetchChannels();
    }, [tenantId, isTenantLoading]);

    const handleSync = async (id: string) => {
        setSyncingId(id);
        const success = await MarketplaceService.syncChannel(id);
        if (success) {
            const data = await MarketplaceService.getChannels(tenantId!);
            setChannels(data);
        }
        setSyncingId(null);
    };

    const handleConnect = async (type: string) => {
        if (!tenantId) return;
        const success = await MarketplaceService.connectChannel(tenantId, type);
        if (success) {
            const data = await MarketplaceService.getChannels(tenantId);
            setChannels(data);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'instagram': return <Instagram size={24} color="#E4405F" />;
            case 'facebook': return <Facebook size={24} color="#1877F2" />;
            case 'jumia': return <ShoppingBag size={24} color="#f68b1e" />;
            case 'konga': return <ShoppingBag size={24} color="#ed017f" />;
            default: return <Share2 size={24} />;
        }
    };

    if (loading) return <div className="loading">Initializing Growth Hub...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Omnichannel Marketplace</h1>
                    <p className={styles.subtitle}>Synchronize your SOLO catalog with external social and marketplace channels.</p>
                </div>
                <div className={styles.trustBadge}>
                    <ShieldCheck size={16} />
                    <span>SSL Encrypted Sync</span>
                </div>
            </div>

            <div className={styles.grid}>
                {channels.map((channel) => (
                    <div key={channel.id} className={`card ${styles.channelCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.iconContainer}>
                                {getIcon(channel.type)}
                            </div>
                            <div className={styles.statusBadge}>
                                <span className={`${styles.statusDot} ${channel.status === 'connected' ? styles.online : styles.offline}`} />
                                {channel.status}
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <h3 className={styles.channelName}>{channel.name}</h3>
                            <p className={styles.channelDesc}>
                                Automatically sync inventory, prices, and orders with your {channel.name} account.
                            </p>
                        </div>

                        <div className={styles.cardFooter}>
                            {channel.status === 'connected' ? (
                                <>
                                    <div className={styles.syncInfo}>
                                        <span className={styles.syncLabel}>Last Synced</span>
                                        <span className={styles.syncTime}>
                                            {channel.last_sync ? new Date(channel.last_sync).toLocaleTimeString() : 'Never'}
                                        </span>
                                    </div>
                                    <button
                                        className={`btn btn-secondary btn-sm ${syncingId === channel.id ? styles.spinning : ''}`}
                                        onClick={() => handleSync(channel.id)}
                                        disabled={!!syncingId}
                                    >
                                        <RefreshCw size={14} />
                                        <span>Sync Now</span>
                                    </button>
                                </>
                            ) : (
                                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleConnect(channel.type)}>
                                    Connect Account
                                    <ArrowUpRight size={14} style={{ marginLeft: '4px' }} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className={`card ${styles.infoSection}`}>
                <div className={styles.infoHeader}>
                    <Sparkles size={20} color="var(--accent-primary)" />
                    <h3>Coming Soon: AI Content Generation for Channels</h3>
                </div>
                <p>We're building an AI tool to automatically write Instagram captions and Facebook product descriptions based on your SOLO catalog.</p>
            </div>
        </div>
    );
}

import { Sparkles } from 'lucide-react';
