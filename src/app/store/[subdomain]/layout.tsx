import { TenantService } from '@/services/tenantService';
import { BrandingService } from '@/services/brandingService';
import { CartProvider } from '@/context/CartContext';
import { notFound } from 'next/navigation';
import styles from './store.module.css';

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

    return (
        <CartProvider>
            <div className={styles.storeWrapper} style={brandingStyles}>
                <header className={styles.storeHeader}>
                    <div className={styles.storeNav}>
                        <a href={`/store/${subdomain}`} className={styles.storeBrand}>
                            {tenant.name}
                        </a>
                        <nav className={styles.storeLinks}>
                            <a href={`/store/${subdomain}`}>Shop</a>
                            <a href={`/store/${subdomain}/cart`} className={styles.cartLink}>
                                🛒 Cart
                            </a>
                        </nav>
                    </div>
                </header>

                <main className={styles.storeMain}>
                    {children}
                </main>

                <footer className={styles.storeFooter}>
                    <p>© {new Date().getFullYear()} {tenant.name}. Powered by <span className="gradient-text" style={{ fontWeight: 700 }}>SOLO</span></p>
                </footer>
            </div>
        </CartProvider>
    );
}
