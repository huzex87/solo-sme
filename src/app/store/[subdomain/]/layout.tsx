import { TenantService } from '@/services/tenantService';
import { BrandingService } from '@/services/brandingService';
import { notFound } from 'next/navigation';
import styles from './store.module.css';

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { subdomain: string };
}) {
    const tenant = await TenantService.getTenantBySubdomain(params.subdomain);

    if (!tenant) {
        notFound();
    }

    const brandingStyles = BrandingService.getBrandingStyles(tenant);

    return (
        <div className={styles.container} style={brandingStyles}>
            <header className={styles.header}>
                <div className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="glow-text" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {tenant.name}
                    </h1>
                    <nav>
                        <ul style={{ display: 'flex', gap: '1.5rem', fontWeight: 500 }}>
                            <li>Shop</li>
                            <li>About</li>
                            <li>Contact</li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className={styles.mainContent}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} {tenant.name}. Powered by SOLO.</p>
            </footer>
        </div>
    );
}
