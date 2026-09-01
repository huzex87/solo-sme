import { TenantService } from '@/services/tenantService';
import { ProductService } from '@/services/productService';
import { BrandingService } from '@/services/brandingService';
import { CartProvider } from '@/context/CartContext';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './store.module.css';
import { createClient } from '@/lib/supabase/server';
import { WhatsAppUtils } from '@/lib/whatsapp';

import SalesAssistant from '@/components/storefront/SalesAssistant';
import StoreHeader from '@/components/storefront/StoreHeader';

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}) {
    const { subdomain } = await params;
    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) {
        notFound();
    }

    const brandingStyles = BrandingService.getBrandingStyles(tenant);
    const tenantData = tenant as unknown as { branding_config?: { logoUrl?: string } };
    const logoUrl = tenantData.branding_config?.logoUrl || tenant.logo_url;

    // Fetch products for the AI Sales Assistant context
    const products = await ProductService.getProducts(tenant.id, supabase);
    const productCatalog = products.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
    }));

    return (
        <CartProvider>
            <div className={styles.storeWrapper} style={brandingStyles}>
                <StoreHeader subdomain={subdomain} tenantName={tenant.name} logoUrl={logoUrl} />

                <main className={styles.storeMain}>
                    {children}
                </main>

                <footer className={styles.storeFooter}>
                    {/* Quick Links */}
                    <div className={styles.footerQuickLinks}>
                        <Link href={`/store/${subdomain}`}>Shop</Link>
                        <Link href={`/store/${subdomain}/about`}>About</Link>
                        <Link href={`/store/${subdomain}/blog`}>Blog</Link>
                    </div>

                    {/* Contact Summary */}
                    {(tenant.business_config?.email || tenant.business_config?.phone) && (
                        <div className={styles.footerContact}>
                            {tenant.business_config?.email && (
                                <a href={`mailto:${tenant.business_config.email}`}>
                                    {tenant.business_config.email}
                                </a>
                            )}
                            {tenant.business_config?.email && tenant.business_config?.phone && (
                                <span className={styles.footerDivider}>|</span>
                            )}
                            {tenant.business_config?.phone && (
                                <a href={`tel:${tenant.business_config.phone}`}>
                                    {tenant.business_config.phone}
                                </a>
                            )}
                        </div>
                    )}

                    {/* Social Links */}
                    {(tenant.business_config?.whatsapp_number || tenant.business_config?.instagram_url || tenant.business_config?.facebook_url || tenant.business_config?.twitter_url || tenant.business_config?.tiktok_url) && (
                        <div className={styles.socialLinks}>
                            {tenant.business_config?.whatsapp_number && (
                                <a href={`https://wa.me/${WhatsAppUtils.normalizeWhatsAppNumber(tenant.business_config.whatsapp_number)}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                            )}
                            {tenant.business_config?.instagram_url && (
                                <a href={tenant.business_config.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                                </a>
                            )}
                            {tenant.business_config?.facebook_url && (
                                <a href={tenant.business_config.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                            )}
                            {tenant.business_config?.twitter_url && (
                                <a href={tenant.business_config.twitter_url} target="_blank" rel="noopener noreferrer" title="X / Twitter">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </a>
                            )}
                            {tenant.business_config?.tiktok_url && (
                                <a href={tenant.business_config.tiktok_url} target="_blank" rel="noopener noreferrer" title="TikTok">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.62a8.16 8.16 0 004.76 1.52V6.69h-1z"/></svg>
                                </a>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                        &copy; {new Date().getFullYear()} {tenant.name}. Powered by
                        <span className="flex items-center gap-1.5 font-bold gradient-text">
                            <BrandLogo size={16} showText={false} variant="light" />
                            SOLO
                        </span>
                    </div>
                </footer>

                <SalesAssistant tenantId={tenant.id} businessName={tenant.name} products={productCatalog} />
            </div>
        </CartProvider>
    );
}
