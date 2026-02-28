import { TenantService } from '@/services/tenantService';
import { BrandingService } from '@/services/brandingService';
import { CartProvider } from '@/context/CartContext';
import { notFound } from 'next/navigation';
import styles from './store.module.css';

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
    const tenant = await TenantService.getTenantBySubdomain(subdomain);

    if (!tenant) {
        notFound();
    }

    const brandingStyles = BrandingService.getBrandingStyles(tenant);
    const logoUrl = (tenant as any).branding_config?.logoUrl;

    return (
        <CartProvider>
            <div className={styles.storeWrapper} style={brandingStyles}>
                <StoreHeader subdomain={subdomain} tenantName={tenant.name} logoUrl={logoUrl} />

                <main className={styles.storeMain}>
                    {children}
                </main>

                <footer className={styles.storeFooter}>
                    <p>© {new Date().getFullYear()} {tenant.name}. Powered by <span className="gradient-text" style={{ fontWeight: 700 }}>SOLO</span></p>
                </footer>

                <SalesAssistant businessName={tenant.name} />
            </div>
        </CartProvider>
    );
}
