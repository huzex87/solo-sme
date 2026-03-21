'use client';

import { QRCodeDisplay } from '@/components/storefront/QRCodeDisplay';
import styles from '../store.module.css';

interface QRPageClientProps {
    storeName: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor?: string;
    whatsappNumber?: string;
}

export function QRPageClient({ storeName, subdomain, logoUrl, primaryColor, whatsappNumber }: QRPageClientProps) {
    const storeUrl = `https://${subdomain}.solosme.ng`;
    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent("Hi, I'd like to place an order")}`
        : null;

    return (
        <div className={styles.qrPageContent}>
            {/* Store QR Section */}
            <div className={styles.qrSection}>
                <div className={styles.qrSectionHeader}>
                    <div className={styles.qrSectionBadge}>Store QR Code</div>
                    <h2 className={styles.qrSectionTitle}>Visit Our Store</h2>
                    <p className={styles.qrSectionDesc}>
                        Scan this code to open our online store instantly
                    </p>
                </div>

                <QRCodeDisplay
                    url={storeUrl}
                    size={280}
                    logoUrl={logoUrl}
                    color={primaryColor}
                    title={storeName}
                    subtitle={storeUrl}
                />
            </div>

            {/* WhatsApp QR Section */}
            {whatsappUrl && (
                <div className={styles.qrSection}>
                    <div className={styles.qrSectionHeader}>
                        <div className={styles.qrSectionBadgeWhatsapp}>WhatsApp Order</div>
                        <h2 className={styles.qrSectionTitle}>Order via WhatsApp</h2>
                        <p className={styles.qrSectionDesc}>
                            Scan to start a conversation and place your order directly
                        </p>
                    </div>

                    <QRCodeDisplay
                        url={whatsappUrl}
                        size={280}
                        logoUrl={logoUrl}
                        color={primaryColor}
                        title="Chat with us"
                        subtitle={`WhatsApp: ${whatsappNumber}`}
                    />
                </div>
            )}

            {/* Usage Tips */}
            <div className={styles.qrTips}>
                <h3 className={styles.qrTipsTitle}>Where to use these QR codes</h3>
                <div className={styles.qrTipsGrid}>
                    <div className={styles.qrTipItem}>
                        <span className={styles.qrTipIcon}>&#x1F4E6;</span>
                        <div>
                            <strong>Product Packaging</strong>
                            <p>Add to bags, boxes, and wrapping for repeat customers</p>
                        </div>
                    </div>
                    <div className={styles.qrTipItem}>
                        <span className={styles.qrTipIcon}>&#x1F9FE;</span>
                        <div>
                            <strong>Receipts</strong>
                            <p>Print on receipts so customers can reorder easily</p>
                        </div>
                    </div>
                    <div className={styles.qrTipItem}>
                        <span className={styles.qrTipIcon}>&#x1FA77;</span>
                        <div>
                            <strong>Store Signage</strong>
                            <p>Display at your physical store for walk-in customers</p>
                        </div>
                    </div>
                    <div className={styles.qrTipItem}>
                        <span className={styles.qrTipIcon}>&#x1F4F1;</span>
                        <div>
                            <strong>Social Media</strong>
                            <p>Share on Instagram, WhatsApp Status, and stories</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
