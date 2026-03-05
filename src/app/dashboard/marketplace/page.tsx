'use client';

import { useEffect, useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { MarketplaceService, MarketplaceChannel } from '@/services/marketplaceService';
import { ProductService } from '@/services/productService';
import { AIContentService, SocialCaptions } from '@/services/aiContentService';
import {
    Instagram,
    Facebook,
    Share2,
    RefreshCw,
    ExternalLink,
    ShieldCheck,
    ArrowUpRight,
    ShoppingBag,
    Sparkles,
    Copy,
    Check,
    X,
    Loader2,
    Globe
} from 'lucide-react';
import styles from './marketplace.module.css';
import { Product } from '@/types';

export default function MarketplacePage() {
    const { tenantId, isLoading: isTenantLoading, requiresOnboarding } = useTenant();
    const [channels, setChannels] = useState<MarketplaceChannel[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);

    // AI Generator State
    const [showAIGen, setShowAIGen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCaptions, setGeneratedCaptions] = useState<SocialCaptions | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        if (isTenantLoading) return;
        if (!tenantId) {
            if (!isTenantLoading) setLoading(false);
            return;
        }

        const fetchData = async () => {
            const [channelData, productData] = await Promise.all([
                MarketplaceService.getChannels(tenantId),
                ProductService.getProducts(tenantId)
            ]);
            setChannels(channelData);
            setProducts(productData);
            setLoading(false);
        };
        fetchData();
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

    const generateCaptions = async () => {
        if (!selectedProduct) return;
        setIsGenerating(true);
        try {
            const captions = await AIContentService.generateSocialCaptions(
                selectedProduct.name,
                selectedProduct.price
            );
            setGeneratedCaptions(captions);
        } catch (err) {
            console.error('AI Generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="mt-4 text-xs font-bold tracking-widest uppercase text-muted">Synchronizing Global Channels...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Omnichannel Marketplace</h1>
                    <p className={styles.subtitle}>Synchronize your SOLO catalog with external social and marketplace channels.</p>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAIGen(true)}>
                        <Sparkles size={16} className="mr-2" />
                        AI Copywriter
                    </button>
                    <div className={styles.trustBadge}>
                        <ShieldCheck size={16} />
                        <span>SSL Encrypted Sync</span>
                    </div>
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

            {(channels.length === 0 || requiresOnboarding) && (
                <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-glass)' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Globe size={32} className="text-primary" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        {requiresOnboarding ? 'Finish Shop Setup' : 'No Channels Connected'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '14px' }}>
                        {requiresOnboarding
                            ? 'You need to finalize your business details in the Settings page before you can synchronize with global marketplaces.'
                            : 'Synchronize your SOLO catalog with Instagram, Facebook, and Marketplace giants to sell everywhere at once.'}
                    </p>
                    {requiresOnboarding ? (
                        <a href="/dashboard/settings" className="btn btn-primary">Go to Settings</a>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleConnect('instagram')}>Connect Instagram</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleConnect('jumia')}>Connect Jumia</button>
                        </div>
                    )}
                </div>
            )}

            {/* AI Generator Overlay */}
            {showAIGen && (
                <div className={styles.overlay}>
                    <div className={styles.aiGenCard}>
                        <div className={styles.genHeader}>
                            <h3><Sparkles size={20} className="text-primary mr-2" /> AI Social Copywriter</h3>
                            <button className={styles.closeBtn} onClick={() => { setShowAIGen(false); setGeneratedCaptions(null); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.genContent}>
                            <div className={styles.productSelectArea}>
                                <label className="text-xs font-bold uppercase text-muted mb-2 block">1. Select Product from Catalog</label>
                                <select
                                    className="input-field"
                                    value={selectedProduct?.id || ''}
                                    onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value) || null)}
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} — ₦{p.price.toLocaleString()}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-primary btn-block mt-4"
                                onClick={generateCaptions}
                                disabled={!selectedProduct || isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Generating Content...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2" size={18} />
                                        Generate Social Copy
                                    </>
                                )}
                            </button>

                            {generatedCaptions && (
                                <div className={styles.captionsGrid}>
                                    <div className={styles.captionBox}>
                                        <div className={styles.captionHeader}>
                                            <span>Instagram</span>
                                            <button onClick={() => copyToClipboard(generatedCaptions.instagram, 'ig')}>
                                                {copiedField === 'ig' ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <p>{generatedCaptions.instagram}</p>
                                    </div>
                                    <div className={styles.captionBox}>
                                        <div className={styles.captionHeader}>
                                            <span>WhatsApp</span>
                                            <button onClick={() => copyToClipboard(generatedCaptions.whatsapp, 'wa')}>
                                                {copiedField === 'wa' ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <p>{generatedCaptions.whatsapp}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.institutionalBanner}>
                <div className={styles.bannerInfo}>
                    <ShieldCheck size={24} className="text-primary" />
                    <div>
                        <h4>Enterprise Hub Active</h4>
                        <p>All marketplace synchronizations are verified and secure.</p>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm">Audit Connections</button>
            </div>
        </div>
    );
}
